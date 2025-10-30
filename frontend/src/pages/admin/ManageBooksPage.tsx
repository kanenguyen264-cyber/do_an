import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  isbn: string;
  availableCopies: number;
  totalCopies: number;
  category: { name: string };
  authors: { name: string }[];
  status: string;
}

export default function ManageBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/books', { params });
      setBooks(response.data.books || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/books/${id}`);
      alert('Book deleted successfully');
      fetchBooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and manage library books</p>
        </div>
        <Link to="/admin/books/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Book
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, ISBN, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Books ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No books found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">ISBN</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Authors</th>
                    <th className="text-left py-3 px-4 font-medium">Availability</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Link
                          to={`/books/${book.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {book.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {book.isbn}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {book.category.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {book.authors.map((a) => a.name).join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            book.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {book.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/books/${book.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(book.id, book.title)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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
    </div>
  );
}
