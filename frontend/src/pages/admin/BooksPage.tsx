import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface Book {
  id: string;
  title: string;
  isbn: string;
  publishYear: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  category: { name: string };
  publisher: { name: string };
  authors: { author: { name: string } }[];
}

export default function AdminBooksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const queryClient = useQueryClient();

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['admin-books', searchTerm],
    queryFn: async () => {
      const res = await api.get('/books', {
        params: { search: searchTerm },
      });
      return res.data;
    },
  });

  const books = booksData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      alert('Xóa sách thành công!');
    },
    onError: () => {
      alert('Không thể xóa sách này!');
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa sách "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý sách</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sách mới
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm sách theo tên, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : books?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Chưa có sách nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tên sách</th>
                    <th className="text-left py-3 px-4">ISBN</th>
                    <th className="text-left py-3 px-4">Tác giả</th>
                    <th className="text-left py-3 px-4">Danh mục</th>
                    <th className="text-left py-3 px-4">Năm XB</th>
                    <th className="text-left py-3 px-4">Số lượng</th>
                    <th className="text-left py-3 px-4">Vị trí</th>
                    <th className="text-right py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {books?.map((book: Book) => (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{book.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{book.isbn}</td>
                      <td className="py-3 px-4 text-sm">
                        {book.authors.map((a) => a.author.name).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-sm">{book.category.name}</td>
                      <td className="py-3 px-4 text-sm">{book.publishYear}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-green-600 font-medium">{book.availableCopies}</span>
                        /{book.totalCopies}
                      </td>
                      <td className="py-3 px-4 text-sm">{book.shelfLocation}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBook(book);
                              setShowModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(book.id, book.title)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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

      {/* TODO: Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
            </h2>
            <p className="text-gray-600 mb-4">Chức năng đang phát triển...</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingBook(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
