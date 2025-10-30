import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <BookOpen className="w-6 h-6 text-primary" />
              <span>Library System</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/books" className="hover:text-primary">Books</Link>
                  <Link to="/my-borrowings" className="hover:text-primary">My Books</Link>
                  <Link to="/notifications" className="hover:text-primary">Notifications</Link>
                  <Link to="/admin" className="hover:text-primary">Admin</Link>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <button onClick={logout} className="px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/books" className="hover:text-primary">Browse Books</Link>
                  <Link to="/login" className="px-4 py-2 hover:text-primary">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
