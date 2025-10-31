import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import api from '@/lib/api';

interface SystemConfig {
  id: string;
  libraryName: string;
  libraryDescription: string;
  workingHours: string;
  contactEmail: string;
  contactPhone: string;
  maxBooksPerUser: number;
  defaultBorrowDays: number;
  maxRenewalCount: number;
  lateFeePerDay: number;
  damageFeePercentage: number;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SystemConfig | null>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const res = await api.get('/system-config');
      setFormData(res.data);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemConfig>) =>
      api.put('/system-config', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      alert('Cập nhật cài đặt thành công!');
    },
    onError: () => {
      alert('Có lỗi xảy ra!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      updateMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof SystemConfig, value: string | number) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Library Information */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Thông tin thư viện
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên thư viện
                </label>
                <Input
                  type="text"
                  value={formData?.libraryName || ''}
                  onChange={(e) => handleChange('libraryName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Giờ làm việc
                </label>
                <Input
                  type="text"
                  value={formData?.workingHours || ''}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email liên hệ
                </label>
                <Input
                  type="email"
                  value={formData?.contactEmail || ''}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số điện thoại
                </label>
                <Input
                  type="tel"
                  value={formData?.contactPhone || ''}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Mô tả thư viện
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={formData?.libraryDescription || ''}
                  onChange={(e) => handleChange('libraryDescription', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrowing Rules */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Quy định mượn sách</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số sách tối đa mỗi người
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData?.maxBooksPerUser || 0}
                  onChange={(e) => handleChange('maxBooksPerUser', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số ngày mượn mặc định
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData?.defaultBorrowDays || 0}
                  onChange={(e) => handleChange('defaultBorrowDays', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số lần gia hạn tối đa
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData?.maxRenewalCount || 0}
                  onChange={(e) => handleChange('maxRenewalCount', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Phí phạt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phí trễ hạn mỗi ngày (VNĐ)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData?.lateFeePerDay || 0}
                  onChange={(e) => handleChange('lateFeePerDay', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phí hư hỏng (% giá sách)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData?.damageFeePercentage || 0}
                  onChange={(e) => handleChange('damageFeePercentage', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </form>
    </div>
  );
}
