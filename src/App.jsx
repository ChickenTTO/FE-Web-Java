// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar      from './components/Navbar';   // Navbar công khai
import AdminNavbar from './components/AdminNavbar'; // Thanh topbar quản trị
import Sidebar     from './components/Sidebar';
import Footer      from './components/Footer';
import PageTransition from './components/PageTransition';

import HomePage            from './pages/HomePage';
import BookingPage         from './pages/Booking';
import AdminDashboard      from './pages/AdminDashboard';
import EquipmentManagement from './pages/EquipmentManagement';
import LoginPage           from './pages/LoginPage';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';

/* ── Public layout: Dành cho Bệnh nhân (Có Header & Footer công khai) ── */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="public-content">
        <PageTransition />
      </main>
      <Footer />
    </>
  );
}

/* ── Admin layout: Dành cho Bác sĩ / Quản trị viên (Có Sidebar) ── */
function AdminLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <AdminNavbar />
        <main className="page-wrapper">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Trang Đăng nhập ─── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ─── Các trang Công khai (Bệnh nhân) ─── */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
          </Route>

          {/* ─── Các trang Quản trị (Cần đăng nhập) ─── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/equipment" element={<EquipmentManagement />} />
            </Route>
          </Route>

          {/* Điều hướng mặc định nếu gõ sai URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
