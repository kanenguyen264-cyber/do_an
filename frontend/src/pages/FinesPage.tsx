import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, DollarSign, CheckCircle, Clock } from 'lucide-react';

interface Fine {
  id: string;
  borrowing: {
    book: {
      title: string;
      authors: { name: string }[];
    };
    dueDate: string;
    returnDate: string;
  };
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'paid' | 'partial';
  createdAt: string;
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await api.get('/fines/my-fines');
      setFines(response.data);
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId: string) => {
    try {
      await api.patch(`/fines/${fineId}/pay`);
      alert('Thanh toán phạt thành công!');
      fetchFines();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredFines = fines.filter((fine) => {
    if (filter === 'unpaid') return fine.status === 'unpaid' || fine.status === 'partial';
    if (filter === 'paid') return fine.status === 'paid';
    return true;
  });

  const totalUnpaid = fines
    .filter((f) => f.status !== 'paid')
    .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

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
          <DollarSign className="w-8 h-8 text-primary" />
          Phạt & Trễ Hạn
        </h1>
        <p className="text-muted-foreground mt-1">Quản lý tiền phạt trả sách trễ hạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng phạt chưa thanh toán</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalUnpaid.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Số phạt chưa thanh toán</p>
                <p className="text-2xl font-bold">
                  {fines.filter((f) => f.status !== 'paid').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-600">
                  {fines.filter((f) => f.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'unpaid'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Chưa Thanh Toán ({fines.filter((f) => f.status !== 'paid').length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'paid'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Đã Thanh Toán ({fines.filter((f) => f.status === 'paid').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Tất Cả ({fines.length})
        </button>
      </div>

      {/* Fines List */}
      {filteredFines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không có phạt nào</h3>
            <p className="text-muted-foreground">
              {filter === 'unpaid'
                ? 'Bạn không có phạt chưa thanh toán'
                : filter === 'paid'
                ? 'Bạn chưa thanh toán phạt nào'
                : 'Bạn không có phạt nào'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFines.map((fine) => {
            const daysLate = Math.ceil(
              (new Date(fine.borrowing.returnDate).getTime() -
                new Date(fine.borrowing.dueDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const remaining = fine.amount - fine.paidAmount;

            return (
              <Card key={fine.id} className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {fine.borrowing.book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {fine.borrowing.book.authors.map((a) => a.name).join(', ')}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Hạn trả</p>
                          <p className="text-sm font-medium">
                            {new Date(fine.borrowing.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ngày trả</p>
                          <p className="text-sm font-medium">
                            {new Date(fine.borrowing.returnDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Số ngày trễ</p>
                          <p className="text-sm font-medium text-red-600">{daysLate} ngày</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Trạng thái</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              fine.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : fine.status === 'partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {fine.status === 'paid'
                              ? 'Đã thanh toán'
                              : fine.status === 'partial'
                              ? 'Thanh toán một phần'
                              : 'Chưa thanh toán'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900">
                              Tổng tiền phạt: {fine.amount.toLocaleString('vi-VN')} đ
                            </p>
                            {fine.paidAmount > 0 && (
                              <p className="text-xs text-red-700 mt-1">
                                Đã thanh toán: {fine.paidAmount.toLocaleString('vi-VN')} đ
                              </p>
                            )}
                            {remaining > 0 && (
                              <p className="text-sm font-bold text-red-900 mt-1">
                                Còn lại: {remaining.toLocaleString('vi-VN')} đ
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-red-700">
                            (5,000 đ/ngày × {daysLate} ngày)
                          </p>
                        </div>
                      </div>
                    </div>

                    {fine.status !== 'paid' && (
                      <Button
                        onClick={() => handlePayFine(fine.id)}
                        className="ml-4"
                        size="sm"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Thanh Toán
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Info */}
      {totalUnpaid > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Lưu ý thanh toán</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Vui lòng thanh toán phạt trước khi mượn sách mới. Bạn có thể thanh toán trực
                  tuyến hoặc tại quầy thủ thư.
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  <strong>Tổng cần thanh toán:</strong> {totalUnpaid.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
