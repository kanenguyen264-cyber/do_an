import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, FileText, Shield, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-16 bg-gradient-to-b from-primary/5 to-background rounded-lg">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <BookOpen className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Hệ Thống Quản Lý Thư Viện
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Quản lý sách, độc giả và phiếu mượn/trả hiệu quả cho thư viện trường đại học
        </p>
        {!user ? (
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/books">
              <Button size="lg" variant="outline">
                <Search className="mr-2 w-4 h-4" />
                Xem Sách
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg">
                Đăng Nhập <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/books">
              <Button size="lg">
                <BookOpen className="mr-2 w-4 h-4" />
                Khám Phá Sách
              </Button>
            </Link>
            <Link to="/my-borrowings">
              <Button size="lg" variant="outline">
                <FileText className="mr-2 w-4 h-4" />
                Sách Của Tôi
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Quản Lý Sách</CardTitle>
            <CardDescription>
              Quản lý thông tin sách, tác giả, nhà xuất bản và thể loại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Thêm, sửa, xóa sách</li>
              <li>✓ Tìm kiếm nâng cao</li>
              <li>✓ Phân loại theo thể loại</li>
              <li>✓ Quản lý số lượng</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Quản Lý Độc Giả</CardTitle>
            <CardDescription>
              Quản lý thông tin người dùng và phân quyền
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Đăng ký tài khoản</li>
              <li>✓ Phân quyền 3 cấp</li>
              <li>✓ Quản lý hồ sơ</li>
              <li>✓ Lịch sử hoạt động</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Mượn & Trả Sách</CardTitle>
            <CardDescription>
              Quản lý phiếu mượn, trả và đặt trước sách
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Tạo phiếu mượn/trả</li>
              <li>✓ Gia hạn sách</li>
              <li>✓ Đặt trước sách</li>
              <li>✓ Tính phạt tự động</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Roles Section */}
      <section className="bg-secondary/30 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Phân Quyền Người Dùng</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold">Quản Trị Viên</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý toàn bộ hệ thống, người dùng và dữ liệu
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-block p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Users className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold">Thủ Thư</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý sách, mượn/trả và hỗ trợ độc giả
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold">Độc Giả</h3>
            <p className="text-sm text-muted-foreground">
              Tìm kiếm, mượn sách và quản lý sách của mình
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {user && (
        <section className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">Đầu sách</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Độc giả</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-muted-foreground">Lượt mượn/tháng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Hỗ trợ trực tuyến</div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
