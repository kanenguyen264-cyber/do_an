import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, UserPlus, Edit, Lock, Users as UsersIcon } from 'lucide-react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  userType: 'STUDENT' | 'TEACHER' | 'STAFF';
  role: 'READER' | 'LIBRARIAN' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  phone?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: { search: searchTerm },
      });
      return res.data;
    },
  });

  const users = usersData?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/users/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('Cập nhật trạng thái thành công!');
    },
  });

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (confirm(`Bạn có chắc muốn ${newStatus === 'SUSPENDED' ? 'khóa' : 'mở khóa'} tài khoản "${user.fullName}"?`)) {
      updateStatusMutation.mutate({ id: user.id, status: newStatus });
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      LIBRARIAN: 'bg-blue-100 text-blue-800',
      READER: 'bg-green-100 text-green-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email, mã người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : users?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Chưa có người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Mã</th>
                    <th className="text-left py-3 px-4">Họ tên</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Loại</th>
                    <th className="text-left py-3 px-4">Vai trò</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">SĐT</th>
                    <th className="text-right py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{user.userCode}</td>
                      <td className="py-3 px-4 font-medium">{user.fullName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm">{user.userType}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setShowModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                          >
                            <Lock className={`h-4 w-4 ${user.status === 'ACTIVE' ? 'text-red-500' : 'text-green-500'}`} />
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
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h2>
            <p className="text-gray-600 mb-4">Chức năng đang phát triển...</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
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
