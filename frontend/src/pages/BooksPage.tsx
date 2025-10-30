import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Book {
  id: string;
  title: string;
  isbn: string;
  description: string;
  coverImage: string;
  publishYear: number;
  availableCopies: number;
  totalCopies: number;
  rating: number;
  category: { name: string };
  authors: { name: string }[];
  publisher: { name: string };
}

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [search, selectedCategory]);

  const fetchBooks = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;

      const response = await api.get('/books', { params });
      setBooks(response.data.books || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const canManageBooks = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Thư Viện Sách
          </h1>
          <p className="text-muted-foreground mt-1">Khám phá và tìm kiếm sách trong bộ sưu tập của chúng tôi</p>
        </div>
        {canManageBooks && (
          <Link to="/books/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Sách Mới
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên sách, ISBN, hoặc tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Tất Cả Thể Loại</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải sách...</p>
        </div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy sách</h3>
            <p className="text-muted-foreground">Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{books.length}</span> cuốn sách
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`}>
                <Card className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-md mb-3 flex items-center justify-center overflow-hidden shadow-inner">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <BookOpen className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-base">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <span className="text-xs">✍️</span>
                        {book.authors.map((a) => a.name).join(', ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          {book.category.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          📅 {book.publishYear}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs font-medium">
                          {book.availableCopies > 0 ? (
                            <span className="text-green-600 flex items-center gap-1">
                              ✓ {book.availableCopies} sẵn có
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              ✗ Hết sách
                            </span>
                          )}
                        </span>
                        {book.rating > 0 && (
                          <span className="text-xs">⭐ {book.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
