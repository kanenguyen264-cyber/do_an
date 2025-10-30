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
import AdminDashboardPage from './pages/admin/DashboardPage';
import ManageBooksPage from './pages/admin/ManageBooksPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageBorrowingsPage from './pages/admin/ManageBorrowingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Books */}
            <Route path="books" element={<BooksPage />} />
            <Route path="books/:id" element={<BookDetailPage />} />
            
            {/* User */}
            <Route path="my-borrowings" element={<MyBorrowingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Admin */}
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/books" element={<ManageBooksPage />} />
            <Route path="admin/users" element={<ManageUsersPage />} />
            <Route path="admin/borrowings" element={<ManageBorrowingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
