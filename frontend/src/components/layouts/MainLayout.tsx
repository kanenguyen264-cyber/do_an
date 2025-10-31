import { Outlet, Link } from 'react-router-dom';
import { BookOpen, User, LogOut, Home, Library, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

export default function MainLayout() {
  const { user, logout, isAuthenticated, isLibrarian } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Thư Viện</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary flex items-center gap-2">
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>
              <Link
                to="/books"
                className="text-gray-700 hover:text-primary flex items-center gap-2"
              >
                <Library className="h-4 w-4" />
                Sách
              </Link>
              {isAuthenticated() && (
                <>
                  <Link
                    to="/borrowing"
                    className="text-gray-700 hover:text-primary flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Mượn sách
                  </Link>
                  {isLibrarian() && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary flex items-center gap-2"
                    >
                      Quản trị
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Link to="/profile">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user?.fullName}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Đăng nhập</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Đăng ký</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Hệ thống quản lý thư viện. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
