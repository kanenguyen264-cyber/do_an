import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Camera, Upload, BookOpen, CheckCircle, XCircle, Loader } from 'lucide-react';

interface OCRResult {
  isbn: string;
  title?: string;
  authors?: string[];
  publisher?: string;
  publishYear?: number;
  description?: string;
  coverImage?: string;
}

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleOCR = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:8000/api/ocr/extract-isbn', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Không thể nhận dạng ISBN từ ảnh. Vui lòng thử ảnh khác.');
      }
    } catch (err) {
      console.error('OCR error:', err);
      setError('Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = () => {
    if (!result) return;
    // Navigate to add book page with pre-filled data
    alert('Chức năng thêm vào thư viện đang được phát triển!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Camera className="w-8 h-8 text-primary" />
          Nhận Dạng Sách Từ Ảnh (OCR)
        </h1>
        <p className="text-muted-foreground mt-1">
          Tự động trích xuất ISBN và thông tin sách từ ảnh bìa
        </p>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">🤖 Cách sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">1. Tải ảnh lên</div>
              <p className="text-muted-foreground">
                Chọn ảnh bìa sách có chứa mã ISBN rõ ràng
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">2. Nhận dạng</div>
              <p className="text-muted-foreground">
                AI sẽ tự động đọc ISBN và tra cứu thông tin
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">3. Thêm vào thư viện</div>
              <p className="text-muted-foreground">
                Xác nhận và thêm sách vào hệ thống
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tải Ảnh Lên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-96 mx-auto rounded-lg shadow-lg"
                />
                <Button variant="outline" onClick={() => {
                  setPreview('');
                  setSelectedFile(null);
                  setResult(null);
                  setError('');
                }}>
                  Chọn ảnh khác
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium mb-2">Tải ảnh bìa sách lên</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hỗ trợ: JPG, PNG, JPEG (tối đa 10MB)
                  </p>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button">
                      <Camera className="w-4 h-4 mr-2" />
                      Chọn Ảnh
                    </Button>
                  </label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {preview && !result && (
            <Button
              onClick={handleOCR}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Đang nhận dạng...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Nhận Dạng ISBN
                </>
              )}
            </Button>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Lỗi nhận dạng</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Section */}
      {result && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-900">Nhận Dạng Thành Công!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-4">
                {result.coverImage && (
                  <img
                    src={result.coverImage}
                    alt={result.title}
                    className="w-24 h-32 object-cover rounded shadow"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">ISBN</p>
                    <p className="text-lg font-bold text-primary">{result.isbn}</p>
                  </div>
                  {result.title && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tiêu đề</p>
                      <p className="font-semibold">{result.title}</p>
                    </div>
                  )}
                  {result.authors && result.authors.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tác giả</p>
                      <p>{result.authors.join(', ')}</p>
                    </div>
                  )}
                  {result.publisher && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nhà xuất bản</p>
                      <p>{result.publisher}</p>
                    </div>
                  )}
                  {result.publishYear && (
                    <div>
                      <p className="text-sm text-muted-foreground">Năm xuất bản</p>
                      <p>{result.publishYear}</p>
                    </div>
                  )}
                </div>
              </div>

              {result.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
                  <p className="text-sm line-clamp-3">{result.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddToLibrary} className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                Thêm Vào Thư Viện
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPreview('');
                  setSelectedFile(null);
                  setResult(null);
                  setError('');
                }}
              >
                Nhận Dạng Sách Khác
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Mẹo để nhận dạng tốt hơn</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chụp ảnh rõ nét, đủ sáng</li>
            <li>• Đảm bảo mã ISBN không bị che khuất</li>
            <li>• Chụp thẳng góc, tránh bị nghiêng</li>
            <li>• Sử dụng ảnh có độ phân giải cao</li>
            <li>• Nếu không nhận dạng được, thử chụp lại hoặc nhập thủ công</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
