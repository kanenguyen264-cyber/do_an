from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
from sklearn.ensemble import IsolationForest

from database import get_db

router = APIRouter()

class AnomalyDetectionResponse(BaseModel):
    user_id: str
    anomaly_score: float
    is_anomaly: bool
    reasons: List[str]
    metrics: dict

class UserActivityMetrics(BaseModel):
    user_id: str
    total_borrowings: int
    active_borrowings: int
    overdue_count: int
    avg_borrow_duration: float
    borrow_frequency: float  # borrowings per month
    fine_amount: float

@router.get("/detect-user-anomalies")
async def detect_user_anomalies(db: Session = Depends(get_db)):
    """
    Detect anomalous user behavior using Isolation Forest
    """
    try:
        # Get user borrowing statistics
        user_stats = db.execute("""
            SELECT 
                u.id as user_id,
                u.email,
                COUNT(DISTINCT br.id) as total_borrowings,
                COUNT(DISTINCT CASE WHEN br.status = 'active' THEN br.id END) as active_borrowings,
                COUNT(DISTINCT CASE WHEN br.status = 'overdue' THEN br.id END) as overdue_count,
                COALESCE(AVG(EXTRACT(EPOCH FROM (br.return_date - br.borrow_date)) / 86400), 0) as avg_duration,
                COALESCE(SUM(f.amount), 0) as total_fines
            FROM users u
            LEFT JOIN borrowings br ON u.id = br.user_id
            LEFT JOIN fines f ON u.id = f.user_id AND f.status = 'pending'
            WHERE u.role = 'reader'
            GROUP BY u.id, u.email
            HAVING COUNT(DISTINCT br.id) > 0
        """).fetchall()

        if len(user_stats) < 2:
            return {
                "message": "Not enough data for anomaly detection",
                "anomalies": []
            }

        # Convert to DataFrame
        df = pd.DataFrame([
            {
                'user_id': row.user_id,
                'email': row.email,
                'total_borrowings': row.total_borrowings,
                'active_borrowings': row.active_borrowings,
                'overdue_count': row.overdue_count,
                'avg_duration': float(row.avg_duration),
                'total_fines': float(row.total_fines)
            }
            for row in user_stats
        ])

        # Prepare features for anomaly detection
        features = df[['total_borrowings', 'active_borrowings', 'overdue_count', 'avg_duration', 'total_fines']]

        # Train Isolation Forest
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        predictions = iso_forest.fit_predict(features)
        scores = iso_forest.score_samples(features)

        # Add predictions to dataframe
        df['anomaly_score'] = scores
        df['is_anomaly'] = predictions == -1

        # Identify reasons for anomalies
        anomalies = []
        for idx, row in df[df['is_anomaly']].iterrows():
            reasons = []
            
            if row['active_borrowings'] > df['active_borrowings'].mean() + 2 * df['active_borrowings'].std():
                reasons.append(f"Unusually high active borrowings: {row['active_borrowings']}")
            
            if row['overdue_count'] > df['overdue_count'].mean() + 2 * df['overdue_count'].std():
                reasons.append(f"High number of overdue books: {row['overdue_count']}")
            
            if row['total_fines'] > df['total_fines'].mean() + 2 * df['total_fines'].std():
                reasons.append(f"High unpaid fines: {row['total_fines']:.0f} VND")
            
            if row['total_borrowings'] > df['total_borrowings'].mean() + 3 * df['total_borrowings'].std():
                reasons.append(f"Excessive borrowing activity: {row['total_borrowings']} books")

            anomalies.append({
                "user_id": row['user_id'],
                "email": row['email'],
                "anomaly_score": float(row['anomaly_score']),
                "is_anomaly": True,
                "reasons": reasons if reasons else ["General unusual pattern detected"],
                "metrics": {
                    "total_borrowings": int(row['total_borrowings']),
                    "active_borrowings": int(row['active_borrowings']),
                    "overdue_count": int(row['overdue_count']),
                    "avg_duration": float(row['avg_duration']),
                    "total_fines": float(row['total_fines'])
                }
            })

        return {
            "total_users_analyzed": len(df),
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")


@router.get("/user-risk-score/{user_id}")
async def get_user_risk_score(user_id: str, db: Session = Depends(get_db)):
    """
    Calculate risk score for a specific user
    """
    try:
        # Get user statistics
        user_stat = db.execute("""
            SELECT 
                u.id,
                u.email,
                u.current_borrow_count,
                COUNT(DISTINCT br.id) as total_borrowings,
                COUNT(DISTINCT CASE WHEN br.status = 'overdue' THEN br.id END) as overdue_count,
                COUNT(DISTINCT CASE WHEN br.status = 'returned' AND br.return_date > br.due_date THEN br.id END) as late_returns,
                COALESCE(SUM(CASE WHEN f.status = 'pending' THEN f.amount ELSE 0 END), 0) as unpaid_fines,
                COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(br.return_date, CURRENT_TIMESTAMP) - br.due_date)) / 86400), 0) as avg_days_late
            FROM users u
            LEFT JOIN borrowings br ON u.id = br.user_id
            LEFT JOIN fines f ON u.id = f.user_id
            WHERE u.id = :user_id
            GROUP BY u.id, u.email, u.current_borrow_count
        """, {"user_id": user_id}).fetchone()

        if not user_stat:
            raise HTTPException(status_code=404, detail="User not found")

        # Calculate risk score (0-100)
        risk_score = 0
        risk_factors = []

        # Factor 1: Overdue books (0-30 points)
        if user_stat.overdue_count > 0:
            overdue_score = min(user_stat.overdue_count * 10, 30)
            risk_score += overdue_score
            risk_factors.append(f"Has {user_stat.overdue_count} overdue book(s) (+{overdue_score} points)")

        # Factor 2: Late return history (0-25 points)
        if user_stat.total_borrowings > 0:
            late_rate = user_stat.late_returns / user_stat.total_borrowings
            late_score = min(late_rate * 50, 25)
            risk_score += late_score
            if late_score > 0:
                risk_factors.append(f"Late return rate: {late_rate:.1%} (+{late_score:.1f} points)")

        # Factor 3: Unpaid fines (0-25 points)
        if user_stat.unpaid_fines > 0:
            fine_score = min(user_stat.unpaid_fines / 10000, 25)  # 10k VND = 1 point
            risk_score += fine_score
            risk_factors.append(f"Unpaid fines: {user_stat.unpaid_fines:.0f} VND (+{fine_score:.1f} points)")

        # Factor 4: Average days late (0-20 points)
        if user_stat.avg_days_late > 0:
            late_days_score = min(user_stat.avg_days_late * 2, 20)
            risk_score += late_days_score
            risk_factors.append(f"Average {user_stat.avg_days_late:.1f} days late (+{late_days_score:.1f} points)")

        # Determine risk level
        if risk_score < 20:
            risk_level = "Low"
        elif risk_score < 50:
            risk_level = "Medium"
        elif risk_score < 75:
            risk_level = "High"
        else:
            risk_level = "Critical"

        return {
            "user_id": user_id,
            "email": user_stat.email,
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "metrics": {
                "total_borrowings": user_stat.total_borrowings,
                "current_borrowings": user_stat.current_borrow_count,
                "overdue_count": user_stat.overdue_count,
                "late_returns": user_stat.late_returns,
                "unpaid_fines": float(user_stat.unpaid_fines),
                "avg_days_late": float(user_stat.avg_days_late)
            },
            "recommendation": get_risk_recommendation(risk_level, risk_score)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating risk score: {str(e)}")


def get_risk_recommendation(risk_level: str, risk_score: float) -> str:
    """Get recommendation based on risk level"""
    if risk_level == "Low":
        return "User is in good standing. No action required."
    elif risk_level == "Medium":
        return "Monitor user activity. Send reminder notifications for due dates."
    elif risk_level == "High":
        return "Restrict new borrowings until overdue books are returned and fines are paid."
    else:
        return "CRITICAL: Suspend account immediately. Contact user to resolve outstanding issues."
