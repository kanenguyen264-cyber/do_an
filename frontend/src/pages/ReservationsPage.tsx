import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

interface Reservation {
  id: string;
  book: {
    id: string;
    title: string;
    authors: { name: string }[];
    coverImage: string;
  };
  status: 'pending' | 'ready' | 'fulfilled' | 'cancelled' | 'expired';
  queuePosition: number;
  createdAt: string;
  expiresAt: string | null;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my-reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đặt trước này?')) return;

    try {
      await api.patch(`/reservations/${id}/cancel`);
      alert('Hủy đặt trước thành công!');
      fetchReservations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'active') {
      return r.status === 'pending' || r.status === 'ready';
    }
    return r.status === 'fulfilled' || r.status === 'cancelled' || r.status === 'expired';
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Đang chờ',
          color: 'bg-yellow-100 text-yellow-700',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'ready':
        return {
          label: 'Sẵn sàng',
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'fulfilled':
        return {
          label: 'Đã mượn',
          color: 'bg-blue-100 text-blue-700',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'bg-gray-100 text-gray-700',
          icon: <XCircle className="w-4 h-4" />,
        };
      case 'expired':
        return {
          label: 'Hết hạn',
          color: 'bg-red-100 text-red-700',
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700',
          icon: <Clock className="w-4 h-4" />,
        };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          Đặt Trước & Danh Sách Chờ
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý các sách bạn đã đặt trước
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang chờ</p>
                <p className="text-2xl font-bold">
                  {reservations.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sẵn sàng mượn</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter((r) => r.status === 'ready').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đặt trước</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Đang Hoạt Động (
          {reservations.filter((r) => r.status === 'pending' || r.status === 'ready').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Đã Hoàn Thành (
          {
            reservations.filter(
              (r) => r.status === 'fulfilled' || r.status === 'cancelled' || r.status === 'expired'
            ).length
          }
          )
        </button>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không có đặt trước nào</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'active'
                ? 'Bạn chưa đặt trước sách nào'
                : 'Không có đặt trước đã hoàn thành'}
            </p>
            <Link to="/books">
              <Button>Khám Phá Sách</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const statusInfo = getStatusInfo(reservation.status);
            const daysRemaining = reservation.expiresAt
              ? Math.ceil(
                  (new Date(reservation.expiresAt).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Book Cover */}
                    <Link to={`/books/${reservation.book.id}`}>
                      <div className="w-24 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md flex items-center justify-center flex-shrink-0">
                        {reservation.book.coverImage ? (
                          <img
                            src={reservation.book.coverImage}
                            alt={reservation.book.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <BookOpen className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1">
                      <Link
                        to={`/books/${reservation.book.id}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {reservation.book.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reservation.book.authors.map((a) => a.name).join(', ')}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Ngày đặt</p>
                          <p className="text-sm font-medium">
                            {new Date(reservation.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vị trí hàng chờ</p>
                          <p className="text-sm font-medium">
                            {reservation.status === 'pending' ? (
                              <span className="text-yellow-600">#{reservation.queuePosition}</span>
                            ) : (
                              '-'
                            )}
                          </p>
                        </div>
                        {reservation.expiresAt && (
                          <div>
                            <p className="text-xs text-muted-foreground">Hết hạn sau</p>
                            <p className="text-sm font-medium">
                              {daysRemaining && daysRemaining > 0 ? (
                                <span className="text-orange-600">{daysRemaining} ngày</span>
                              ) : (
                                <span className="text-red-600">Đã hết hạn</span>
                              )}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Trạng thái</p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Alerts */}
                      {reservation.status === 'ready' && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900">
                            ✓ Sách đã sẵn sàng! Vui lòng mượn trong vòng {daysRemaining} ngày.
                          </p>
                        </div>
                      )}

                      {reservation.status === 'pending' && reservation.queuePosition === 1 && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-900">
                            Bạn đang ở vị trí đầu hàng chờ. Sẽ sớm được thông báo khi sách sẵn sàng.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {(reservation.status === 'pending' || reservation.status === 'ready') && (
                      <div className="flex flex-col gap-2">
                        {reservation.status === 'ready' && (
                          <Link to={`/books/${reservation.book.id}`}>
                            <Button size="sm">Mượn Ngay</Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Thông tin về đặt trước</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Bạn có thể đặt trước sách đang được mượn bởi người khác</li>
            <li>• Hệ thống sẽ thông báo khi sách sẵn sàng</li>
            <li>• Bạn có 3 ngày để mượn sách sau khi nhận thông báo</li>
            <li>• Đặt trước sẽ tự động hủy nếu quá thời hạn</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
