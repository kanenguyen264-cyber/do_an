import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function BookDetailPage() {
  const { id } = useParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const res = await api.get(`/books/${id}`);
      return res.data;
    },
  });

  const handleBorrow = async () => {
    try {
      await api.post('/borrowing', { bookId: id });
      toast.success('Gửi yêu cầu mượn sách thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (!book) return <div>Không tìm thấy sách</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <BookOpen className="h-24 w-24 text-gray-400" />
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <div className="space-y-2">
                <p><strong>Tác giả:</strong> {book.authors?.map((a: any) => a.author.name).join(', ')}</p>
                <p><strong>Thể loại:</strong> {book.category?.name}</p>
                <p><strong>Nhà xuất bản:</strong> {book.publisher?.name}</p>
                <p><strong>Năm xuất bản:</strong> {book.publishYear}</p>
                <p><strong>ISBN:</strong> {book.isbn}</p>
                <p><strong>Vị trí:</strong> {book.shelfLocation}</p>
                <p><strong>Số lượng:</strong> {book.availableCopies}/{book.totalCopies}</p>
              </div>
              {book.description && (
                <div>
                  <h3 className="font-semibold mb-2">Mô tả:</h3>
                  <p className="text-gray-700">{book.description}</p>
                </div>
              )}
              {isAuthenticated && book.availableCopies > 0 && (
                <Button onClick={handleBorrow} className="w-full md:w-auto">
                  Mượn sách
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
