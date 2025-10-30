import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Bell, User, LogOut, LayoutDashboard, Library, ChevronDown, Sparkles, DollarSign, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-gray-200 bg-white/95 dark:bg-gray-800/95 sticky top-0 z-50 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold hover:scale-105 transition-transform">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-md">
                <Library className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg leading-none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Thư Viện Số</span>
                <span className="text-xs text-muted-foreground font-normal mt-1">Trường Đại Học</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link 
                    to="/books" 
                    className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                      isActive('/books') 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Sách
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        isActive('/my-borrowings') || isActive('/fines') || isActive('/reservations') || isActive('/recommendations')
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Của Tôi
                      <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showUserMenu && (
                      <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[220px] z-50 animate-in fade-in slide-in-from-top-2">
                        <Link
                          to="/my-borrowings"
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BookOpen className="w-4 h-4 inline mr-3 text-blue-600" />
                          Sách Đang Mượn
                        </Link>
                        <Link
                          to="/reservations"
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Clock className="w-4 h-4 inline mr-3 text-orange-600" />
                          Đặt Trước
                        </Link>
                        <Link
                          to="/fines"
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <DollarSign className="w-4 h-4 inline mr-3 text-red-600" />
                          Phạt & Trễ Hạn
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <Link
                          to="/recommendations"
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Sparkles className="w-4 h-4 inline mr-3 text-purple-600" />
                          Gợi Ý Sách AI
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link 
                    to="/notifications" 
                    className={`p-3 rounded-lg transition-all relative ${
                      isActive('/notifications') 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title="Thông báo"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  </Link>
                  {canAccessAdmin && (
                    <Link 
                      to="/admin" 
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                        isActive('/admin') 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 inline mr-2" />
                      Quản Lý
                    </Link>
                  )}
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-2" />
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                    <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold leading-none">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize mt-1 font-medium">{user.role}</span>
                    </div>
                  </Link>
                  <button 
                    onClick={logout} 
                    className="p-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-all"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/books" 
                    className="px-5 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Xem Sách
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-5 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
                  >
                    Đăng Nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-sm"
                  >
                    Đăng Ký Ngay
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
      <footer className="border-t mt-16 py-8 bg-secondary/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Hệ Thống Quản Lý Thư Viện Trường Đại Học. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
