import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, CheckCircle, XCircle, Clock, FileText, Check, X } from 'lucide-react';
import api from '@/lib/api';

interface Borrowing {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'PENDING' | 'APPROVED' | 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'REJECTED';
  user: {
    fullName: string;
    userCode: string;
    email: string;
  };
  book: {
    title: string;
    isbn: string;
  };
}

export default function AdminBorrowingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const queryClient = useQueryClient();

  const { data: borrowingsData, isLoading } = useQuery({
    queryKey: ['admin-borrowings', searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get('/borrowing', {
        params: {
          search: searchTerm,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        },
      });
      return res.data;
    },
  });

  const borrowings = borrowingsData?.data || [];

  const returnMutation = useMutation({
    mutationFn: (id: string) => api.put(`/borrowing/${id}/return`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrowings'] });
      alert('Trả sách thành công!');
    },
    onError: () => {
      alert('Có lỗi xảy ra!');
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => api.put(`/borrowing/${id}/renew`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrowings'] });
      alert('Gia hạn thành công!');
    },
    onError: () => {
      alert('Không thể gia hạn!');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/borrowing/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrowings'] });
      alert('Đã duyệt yêu cầu mượn sách!');
    },
    onError: () => {
      alert('Có lỗi xảy ra!');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.put(`/borrowing/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrowings'] });
      alert('Đã từ chối yêu cầu!');
    },
    onError: () => {
      alert('Có lỗi xảy ra!');
    },
  });

  const handleReturn = (id: string) => {
    if (confirm('Xác nhận trả sách?')) {
      returnMutation.mutate(id);
    }
  };

  const handleRenew = (id: string) => {
    if (confirm('Xác nhận gia hạn?')) {
      renewMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (confirm('Xác nhận duyệt yêu cầu mượn sách?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    if (confirm('Xác nhận từ chối yêu cầu?')) {
      rejectMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      BORROWED: 'bg-blue-100 text-blue-800',
      RETURNED: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      REJECTED: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      BORROWED: 'Đang mượn',
      RETURNED: 'Đã trả',
      OVERDUE: 'Quá hạn',
      REJECTED: 'Đã từ chối',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý mượn trả</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên sách, người mượn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="BORROWED">Đang mượn</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="RETURNED">Đã trả</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Borrowings Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : borrowings?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Chưa có giao dịch mượn trả nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Người mượn</th>
                    <th className="text-left py-3 px-4">Mã SV/GV</th>
                    <th className="text-left py-3 px-4">Sách</th>
                    <th className="text-left py-3 px-4">Ngày mượn</th>
                    <th className="text-left py-3 px-4">Hạn trả</th>
                    <th className="text-left py-3 px-4">Ngày trả</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-right py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings?.map((borrowing: Borrowing) => (
                    <tr key={borrowing.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{borrowing.user.fullName}</td>
                      <td className="py-3 px-4 font-mono text-sm">{borrowing.user.userCode}</td>
                      <td className="py-3 px-4 text-sm">{borrowing.book.title}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(borrowing.borrowDate)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(borrowing.dueDate)}</td>
                      <td className="py-3 px-4 text-sm">
                        {borrowing.returnDate ? formatDate(borrowing.returnDate) : '-'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(borrowing.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {borrowing.status === 'PENDING' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(borrowing.id)}
                              >
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(borrowing.id)}
                              >
                                <X className="h-4 w-4 text-red-500 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          ) : borrowing.status === 'BORROWED' || borrowing.status === 'OVERDUE' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(borrowing.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                Trả sách
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRenew(borrowing.id)}
                              >
                                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                                Gia hạn
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              {borrowing.status === 'RETURNED' ? 'Đã hoàn thành' : 'Đã xử lý'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
