import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Calendar, BookMarked, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`/books/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBorrowing(true);
    try {
      await api.post('/borrowing/borrow', {
        bookId: id,
      });
      alert('Mượn sách thành công!');
      fetchBook();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể mượn sách');
    } finally {
      setBorrowing(false);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setReserving(true);
    try {
      await api.post('/reservations', {
        bookId: id,
      });
      alert('Đặt trước sách thành công!');
      fetchBook();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể đặt trước sách');
    } finally {
      setReserving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await api.delete(`/books/${id}`);
      alert('Book deleted successfully');
      navigate('/books');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!book) {
    return <div className="text-center py-12">Book not found</div>;
  }

  const canManage = user?.role === 'admin' || user?.role === 'librarian';
  const canBorrow = user?.role === 'reader' && book.availableCopies > 0;
  const canReserve = user?.role === 'reader' && book.availableCopies === 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/books">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Books
        </Button>
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Book Cover */}
        <Card>
          <CardContent className="pt-6">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-24 h-24 text-muted-foreground" />
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {canBorrow && (
                <Button
                  className="w-full"
                  onClick={handleBorrow}
                  disabled={borrowing}
                >
                  <BookMarked className="w-4 h-4 mr-2" />
                  {borrowing ? 'Đang mượn...' : 'Mượn Sách'}
                </Button>
              )}

              {canReserve && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleReserve}
                  disabled={reserving}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {reserving ? 'Đang đặt...' : 'Đặt Trước'}
                </Button>
              )}

              {canManage && (
                <>
                  <Link to={`/books/${id}/edit`} className="block">
                    <Button className="w-full" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Book
                    </Button>
                  </Link>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Book
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Book Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{book.title}</CardTitle>
              <p className="text-muted-foreground">
                by {book.authors.map((a: any) => a.name).join(', ')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {book.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publisher</p>
                  <p className="font-medium">{book.publisher.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{book.category.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publish Year</p>
                  <p className="font-medium">{book.publishYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">{book.language || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium">{book.pageCount || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold">{book.totalCopies}</p>
                  <p className="text-sm text-muted-foreground">Total Copies</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {book.availableCopies}
                  </p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {book.borrowCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Times Borrowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
