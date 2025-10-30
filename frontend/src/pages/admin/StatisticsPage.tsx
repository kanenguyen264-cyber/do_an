import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  Download,
  Calendar,
} from 'lucide-react';

interface Stats {
  totalBooks: number;
  totalUsers: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalBorrowings: number;
  popularBooks: Array<{
    book: { title: string; authors: { name: string }[] };
    count: number;
  }>;
  monthlyStats: Array<{
    month: string;
    borrowed: number;
    returned: number;
  }>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistics', {
        params: dateRange,
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Export logic
    alert('Xuất CSV thành công! (Chức năng demo)');
  };

  const handleExportPDF = () => {
    // Export logic
    alert('Xuất PDF thành công! (Chức năng demo)');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Thống Kê & Báo Cáo
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và xuất báo cáo hoạt động thư viện
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Từ:</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Đến:</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <Button size="sm" onClick={fetchStats}>
              Áp Dụng
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Tổng sách</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.totalBooks || 0}</p>
              </div>
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Người dùng</p>
                <p className="text-3xl font-bold text-green-900">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Đang mượn</p>
                <p className="text-3xl font-bold text-orange-900">
                  {stats?.activeBorrowings || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Quá hạn</p>
                <p className="text-3xl font-bold text-red-900">
                  {stats?.overdueBorrowings || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Borrowing Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Thống Kê Mượn/Trả Theo Tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.monthlyStats && stats.monthlyStats.length > 0 ? (
              <div className="space-y-4">
                {stats.monthlyStats.map((month, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">
                        {month.borrowed + month.returned} lượt
                      </span>
                    </div>
                    <div className="flex gap-1 h-8">
                      <div
                        className="bg-blue-500 rounded flex items-center justify-center text-white text-xs"
                        style={{
                          width: `${(month.borrowed / (month.borrowed + month.returned)) * 100}%`,
                        }}
                      >
                        {month.borrowed > 0 && month.borrowed}
                      </div>
                      <div
                        className="bg-green-500 rounded flex items-center justify-center text-white text-xs"
                        style={{
                          width: `${(month.returned / (month.borrowed + month.returned)) * 100}%`,
                        }}
                      >
                        {month.returned > 0 && month.returned}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 text-xs pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Mượn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Trả</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Không có dữ liệu</p>
            )}
          </CardContent>
        </Card>

        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Sách Mượn Nhiều Nhất</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.popularBooks && stats.popularBooks.length > 0 ? (
              <div className="space-y-4">
                {stats.popularBooks.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.book.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.book.authors.map((a) => a.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 px-3 py-1 bg-primary/10 rounded-full text-sm font-semibold text-primary">
                      {item.count} lượt
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Không có dữ liệu</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Thống Kê Chi Tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng lượt mượn</p>
              <p className="text-2xl font-bold">{stats?.totalBorrowings || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tỷ lệ trả đúng hạn</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.totalBorrowings
                  ? (
                      ((stats.totalBorrowings - (stats.overdueBorrowings || 0)) /
                        stats.totalBorrowings) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trung bình mượn/tháng</p>
              <p className="text-2xl font-bold">
                {stats?.monthlyStats
                  ? Math.round(
                      stats.monthlyStats.reduce((sum, m) => sum + m.borrowed, 0) /
                        stats.monthlyStats.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
