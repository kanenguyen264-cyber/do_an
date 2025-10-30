import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Lock, Camera } from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch('/users/profile', formData);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          Hồ Sơ Cá Nhân
        </h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thông Tin Cá Nhân</CardTitle>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Chỉnh Sửa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-primary" />
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                <Camera className="w-3 h-3 mr-1" />
                Đổi ảnh
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="Nguyễn Văn"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Họ</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!editing}
                    placeholder="A"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.email}
                    disabled
                    className="pl-10 bg-secondary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                    placeholder="Địa chỉ của bạn"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setMessage({ type: '', text: '' });
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Đổi Mật Khẩu</CardTitle>
            {!changingPassword && (
              <Button variant="outline" onClick={() => setChangingPassword(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Đổi Mật Khẩu
              </Button>
            )}
          </div>
        </CardHeader>
        {changingPassword && (
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="pl-10"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="pl-10"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Đổi Mật Khẩu'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setMessage({ type: '', text: '' });
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Tài Khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Vai trò</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                Hoạt động
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
