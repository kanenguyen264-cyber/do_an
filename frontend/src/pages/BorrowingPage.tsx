import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function BorrowingPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ['my-borrowings'],
    queryFn: async () => {
      const res = await api.get('/borrowing', { params: { userId: user?.id } });
      return res.data;
    },
  });

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Lịch sử mượn sách</h1>
      <div className="space-y-4">
        {data?.data?.map((borrowing: any) => (
          <Card key={borrowing.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{borrowing.book.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ngày mượn: {borrowing.borrowDate ? formatDate(borrowing.borrowDate) : 'Chưa duyệt'}
                  </p>
                  {borrowing.dueDate && (
                    <p className="text-sm text-gray-600">
                      Hạn trả: {formatDate(borrowing.dueDate)}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  borrowing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  borrowing.status === 'BORROWED' ? 'bg-blue-100 text-blue-700' :
                  borrowing.status === 'RETURNED' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {borrowing.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
