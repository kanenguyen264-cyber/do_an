import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><strong>Họ tên:</strong> {user?.fullName}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Mã người dùng:</strong> {user?.userCode}</div>
          <div><strong>Loại:</strong> {user?.userType}</div>
          <div><strong>Vai trò:</strong> {user?.role}</div>
        </CardContent>
      </Card>
    </div>
  );
}
