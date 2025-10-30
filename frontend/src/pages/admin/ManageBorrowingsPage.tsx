import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

interface Borrowing {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  book: {
    id: string;
    title: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
}

export default function ManageBorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('active');

  useEffect(() => {
    fetchBorrowings();
  }, [filter]);

  const fetchBorrowings = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get('/borrowing', { params });
      setBorrowings(response.data.borrowings || response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (!confirm('Mark this book as returned?')) return;

    try {
      await api.patch(`/borrowing/${id}/return`, {});
      alert('Book returned successfully');
      fetchBorrowings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredBorrowings = borrowings.filter((b) => {
    if (filter === 'active') return b.status === 'active';
    if (filter === 'overdue') return b.status === 'overdue';
    if (filter === 'returned') return b.status === 'returned';
    return true;
  });

  const stats = {
    total: borrowings.length,
    active: borrowings.filter((b) => b.status === 'active').length,
    overdue: borrowings.filter((b) => b.status === 'overdue').length,
    returned: borrowings.filter((b) => b.status === 'returned').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Borrowings</h1>
        <p className="text-muted-foreground mt-1">Track and manage all book borrowings</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Borrowings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.returned}</div>
            <p className="text-sm text-muted-foreground">Returned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 border-b">
        {(['all', 'active', 'overdue', 'returned'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
              filter === f
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f} ({stats[f as keyof typeof stats]})
          </button>
        ))}
      </div>

      {/* Borrowings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Borrowings ({filteredBorrowings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBorrowings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No borrowings found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Book</th>
                    <th className="text-left py-3 px-4 font-medium">Borrowed</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium">Returned</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowings.map((borrowing) => (
                    <tr key={borrowing.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {borrowing.user.firstName} {borrowing.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {borrowing.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/books/${borrowing.book.id}`}
                          className="hover:text-primary"
                        >
                          {borrowing.book.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(borrowing.borrowDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(borrowing.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {borrowing.returnDate
                          ? new Date(borrowing.returnDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            borrowing.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : borrowing.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {borrowing.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {!borrowing.returnDate && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturn(borrowing.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Return
                            </Button>
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
