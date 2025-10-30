import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Activity, Database } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    apiStatus: 'checking...',
    pythonStatus: 'checking...',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        // Check NestJS API
        const healthResponse = await api.get('/health');
        setStats((prev) => ({
          ...prev,
          apiStatus: healthResponse.data.status === 'ok' ? 'Online' : 'Offline',
        }));

        // Fetch users count
        const usersResponse = await api.get('/users');
        setStats((prev) => ({
          ...prev,
          users: usersResponse.data.length,
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      // Check Python API
      try {
        const pythonUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
        const pythonResponse = await fetch(`${pythonUrl}/health`);
        const pythonData = await pythonResponse.json();
        setStats((prev) => ({
          ...prev,
          pythonStatus: pythonData.status === 'ok' ? 'Online' : 'Offline',
        }));
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          pythonStatus: 'Offline',
        }));
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.firstName || user.email}!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NestJS API</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiStatus}</div>
            <p className="text-xs text-muted-foreground">Backend status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FastAPI Service</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pythonStatus}</div>
            <p className="text-xs text-muted-foreground">Python service status</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            {user.firstName && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">First Name:</dt>
                <dd className="font-medium">{user.firstName}</dd>
              </div>
            )}
            {user.lastName && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Name:</dt>
                <dd className="font-medium">{user.lastName}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User ID:</dt>
              <dd className="font-mono text-sm">{user.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
