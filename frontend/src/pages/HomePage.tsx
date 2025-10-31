import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
  });

  const { data: popularBooks } = useQuery({
    queryKey: ['popular-books'],
    queryFn: async () => {
      const res = await api.get('/analytics/popular-books');
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Thư viện</h1>
        <p className="text-xl mb-8">Khám phá kho tàng tri thức với hàng ngàn đầu sách</p>
        <Link to="/books">
          <Button size="lg" variant="secondary">
            Khám phá ngay
          </Button>
        </Link>
      </section>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng số sách</p>
                  <p className="text-3xl font-bold">{stats.totalBooks}</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Người dùng</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đang mượn</p>
                  <p className="text-3xl font-bold">{stats.activeBorrowings}</p>
                </div>
                <BookOpen className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quá hạn</p>
                  <p className="text-3xl font-bold text-red-600">{stats.overdueBorrowings}</p>
                </div>
                <Star className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Books */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Sách phổ biến</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {popularBooks?.slice(0, 5).map((book: any) => (
            <Link key={book.id} to={`/books/${book.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{book.category?.name}</p>
                  <p className="text-xs text-blue-600 mt-2">{book.borrowCount} lượt mượn</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
