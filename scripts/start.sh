#!/bin/bash

echo "🚀 Starting Library Management System..."

# Start backend
echo "🔧 Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start Python service
echo "🐍 Starting Python service..."
cd python-service
uvicorn main:app --reload --port 8000 &
PYTHON_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3000"
echo "🐍 Python API: http://localhost:8000"
echo "📚 API Docs: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID $PYTHON_PID; exit" INT
wait
