// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Navbar      from './components/Navbar';   // Navbar công khai
import AdminNavbar from './components/AdminNavbar'; // Thanh topbar quản trị
import Sidebar     from './components/Sidebar';
import Footer      from './components/Footer';

import HomePage            from './pages/HomePage';
import BookingPage         from './pages/Booking'; // Hoặc BookingPage tùy tên file của bạn
import AdminDashboard      from './pages/AdminDashboard';
import EquipmentManagement from './pages/EquipmentManagement';

/* ── Public layout: Dành cho Bệnh nhân (Có Header & Footer công khai) ── */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="public-content">
        <Outlet />
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Các trang Công khai (Bệnh nhân) ─── */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Route>

        {/* ─── Các trang Quản trị (Admin / Quản lý thiết bị) ─── */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/equipment" element={<EquipmentManagement />} />
        </Route>

        {/* Điều hướng mặc định nếu gõ sai URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;