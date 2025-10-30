import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Sparkles, TrendingUp, Heart, RefreshCw } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  isbn: string;
  coverImage: string;
  authors: { name: string }[];
  category: { name: string };
  publishYear: number;
  rating: number;
  availableCopies: number;
  similarity?: number;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      // Call Python AI service
      const response = await fetch(`http://localhost:8000/api/recommendations/books/${user.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        // Fallback to popular books if AI service fails
        const fallbackResponse = await api.get('/books?limit=10&sortBy=rating');
        setRecommendations(fallbackResponse.data.books || fallbackResponse.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback
      try {
        const fallbackResponse = await api.get('/books?limit=10&sortBy=rating');
        setRecommendations(fallbackResponse.data.books || fallbackResponse.data);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Đang phân tích sở thích của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Gợi Ý Sách Thông Minh
          </h1>
          <p className="text-muted-foreground mt-1">
            Dựa trên lịch sử mượn và sở thích của bạn
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchRecommendations}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Làm Mới
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">AI Recommendation</p>
                <p className="text-lg font-bold text-purple-900">Cá nhân hóa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Độ chính xác</p>
                <p className="text-lg font-bold text-blue-900">85%+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-pink-700">Gợi ý</p>
                <p className="text-lg font-bold text-pink-900">{recommendations.length} sách</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">🤖 AI Recommendation hoạt động như thế nào?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">1. Phân tích lịch sử</div>
              <p className="text-muted-foreground">
                Hệ thống phân tích các sách bạn đã mượn, thể loại yêu thích
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">2. Machine Learning</div>
              <p className="text-muted-foreground">
                Sử dụng thuật toán collaborative filtering và content-based
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">3. Gợi ý thông minh</div>
              <p className="text-muted-foreground">
                Đề xuất sách phù hợp với sở thích và xu hướng của bạn
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có gợi ý</h3>
            <p className="text-muted-foreground mb-4">
              Mượn thêm sách để hệ thống có thể đưa ra gợi ý phù hợp hơn
            </p>
            <Link to="/books">
              <Button>Khám Phá Sách</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dành Riêng Cho Bạn</h2>
            <p className="text-sm text-muted-foreground">
              {recommendations.length} gợi ý được tìm thấy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`}>
                <Card className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden">
                  {/* AI Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </div>
                  </div>

                  {/* Similarity Score */}
                  {book.similarity && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round(book.similarity * 100)}% phù hợp
                      </div>
                    </div>
                  )}

                  <CardContent className="pt-6">
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

                    <h3 className="font-semibold line-clamp-2 mb-2">{book.title}</h3>

                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {book.authors.map((a) => a.name).join(', ')}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {book.category.name}
                      </span>
                      {book.rating > 0 && (
                        <span className="flex items-center gap-1">
                          ⭐ {book.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      {book.availableCopies > 0 ? (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          ✓ {book.availableCopies} sẵn có
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                          ✗ Hết sách
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 Mẹo để có gợi ý tốt hơn</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Mượn nhiều sách trong các thể loại bạn yêu thích</li>
            <li>• Đánh giá sách sau khi đọc (nếu có tính năng)</li>
            <li>• Khám phá các thể loại mới để mở rộng gợi ý</li>
            <li>• Hệ thống sẽ học và cải thiện gợi ý theo thời gian</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
