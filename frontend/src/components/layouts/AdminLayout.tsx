import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, FileText, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/books', label: 'Quản lý sách', icon: BookOpen },
  { path: '/admin/users', label: 'Quản lý người dùng', icon: Users },
  { path: '/admin/borrowings', label: 'Quản lý mượn trả', icon: FileText },
  { path: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary">Quản trị</h2>
            <p className="text-sm text-gray-600">{user?.fullName}</p>
          </div>

          <nav className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Về trang chủ
              </Button>
            </Link>
            <Button variant="ghost" className="w-full mt-2" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
