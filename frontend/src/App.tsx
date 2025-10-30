import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import MyBorrowingsPage from './pages/MyBorrowingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import FinesPage from './pages/FinesPage';
import ReservationsPage from './pages/ReservationsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ManageBooksPage from './pages/admin/ManageBooksPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageBorrowingsPage from './pages/admin/ManageBorrowingsPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import OCRPage from './pages/admin/OCRPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Books */}
            <Route path="books" element={<BooksPage />} />
            <Route path="books/:id" element={<BookDetailPage />} />
            
            {/* User Routes (Protected) */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-borrowings" element={<MyBorrowingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="fines" element={<FinesPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            
            {/* Admin Routes (Protected) */}
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/books" element={<ManageBooksPage />} />
            <Route path="admin/users" element={<ManageUsersPage />} />
            <Route path="admin/borrowings" element={<ManageBorrowingsPage />} />
            <Route path="admin/statistics" element={<StatisticsPage />} />
            <Route path="admin/ocr" element={<OCRPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
