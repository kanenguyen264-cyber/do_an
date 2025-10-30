import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Borrowing {
  id: string;
  book: {
    id: string;
    title: string;
    authors: { name: string }[];
  };
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
  renewCount: number;
  maxRenewals: number;
}

export default function MyBorrowingsPage() {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('active');

  useEffect(() => {
    if (user) {
      fetchBorrowings();
    }
  }, [user]);

  const fetchBorrowings = async () => {
    try {
      const response = await api.get('/borrowing/my-borrowings');
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await api.patch(`/borrowing/${id}/renew`);
      alert('Book renewed successfully!');
      fetchBorrowings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to renew book');
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredBorrowings = borrowings.filter((b) => {
    if (filter === 'active') return b.status === 'active' || b.status === 'overdue';
    if (filter === 'returned') return b.status === 'returned';
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          Sách Của Tôi
        </h1>
        <p className="text-muted-foreground mt-1">Quản lý sách đang mượn và lịch sử mượn sách</p>
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
          Đang Mượn ({borrowings.filter((b) => b.status === 'active' || b.status === 'overdue').length})
        </button>
        <button
          onClick={() => setFilter('returned')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'returned'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Đã Trả ({borrowings.filter((b) => b.status === 'returned').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Tất Cả ({borrowings.length})
        </button>
      </div>

      {/* Borrowings List */}
      {filteredBorrowings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy phiếu mượn</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'active'
                ? "Bạn chưa có sách đang mượn"
                : filter === 'returned'
                ? "Bạn chưa trả sách nào"
                : "Bạn chưa mượn sách nào"}
            </p>
            <Link to="/books">
              <Button>Khám Phá Sách</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBorrowings.map((borrowing) => {
            const daysRemaining = getDaysRemaining(borrowing.dueDate);
            const isOverdue = borrowing.status === 'overdue';
            const isDueSoon = daysRemaining <= 3 && daysRemaining > 0;

            return (
              <Card key={borrowing.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/books/${borrowing.book.id}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {borrowing.book.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {borrowing.book.authors.map((a) => a.name).join(', ')}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Ngày mượn</p>
                          <p className="text-sm font-medium">
                            {new Date(borrowing.borrowDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Hạn trả</p>
                          <p className="text-sm font-medium">
                            {new Date(borrowing.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        {borrowing.returnDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Đã trả</p>
                            <p className="text-sm font-medium">
                              {new Date(borrowing.returnDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Trạng thái</p>
                          <div className="flex items-center gap-2 mt-1">
                            {isOverdue && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                                Quá hạn
                              </span>
                            )}
                            {isDueSoon && !isOverdue && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
                                Sắp đến hạn
                              </span>
                            )}
                            {borrowing.status === 'active' && !isOverdue && !isDueSoon && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                Đang mượn
                              </span>
                            )}
                            {borrowing.status === 'returned' && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                                Đã trả
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {(isOverdue || isDueSoon) && borrowing.status !== 'returned' && (
                        <div
                          className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                            isOverdue ? 'bg-red-50' : 'bg-yellow-50'
                          }`}
                        >
                          <AlertCircle
                            className={`w-4 h-4 mt-0.5 ${
                              isOverdue ? 'text-red-600' : 'text-yellow-600'
                            }`}
                          />
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                isOverdue ? 'text-red-900' : 'text-yellow-900'
                              }`}
                            >
                              {isOverdue
                                ? `Sách quá hạn ${Math.abs(daysRemaining)} ngày`
                                : `Còn ${daysRemaining} ngày đến hạn trả`}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isOverdue ? 'text-red-700' : 'text-yellow-700'
                              }`}
                            >
                              {isOverdue
                                ? 'Vui lòng trả sách sớm để tránh bị phạt thêm'
                                : 'Vui lòng trả hoặc gia hạn trước hạn'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {borrowing.status !== 'returned' &&
                      borrowing.renewCount < borrowing.maxRenewals && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRenew(borrowing.id)}
                          className="ml-4"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Gia Hạn ({borrowing.renewCount}/{borrowing.maxRenewals})
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
