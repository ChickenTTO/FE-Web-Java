/* src/components/AdminNavbar.jsx
   Top navigation bar cho Admin Layout
   ─────────────────────────────────────────────────────────────────────────── */

import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const routeTitles = {
  '/booking':   { title: 'Đặt lịch khám',   subtitle: 'Quản lý lịch hẹn và đặt phòng khám' },
  '/admin':     { title: 'Dashboard Admin',  subtitle: 'Thống kê và báo cáo tổng quan' },
  '/equipment': { title: 'Thiết bị y tế',   subtitle: 'Quản lý thiết bị và trạng thái bảo trì' },
};

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const meta = routeTitles[location.pathname] ?? routeTitles['/admin'];

  const displayName = user?.fullName || user?.username || 'Admin';
  const displayRole = user?.role || 'Quản trị viên';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <header className="app-navbar">
      <div>
        <div className="navbar-brand-text">{meta.title}</div>
        <div className="navbar-greeting">{meta.subtitle}</div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          id="admin-navbar-notifications-btn"
          className="btn-icon view"
          style={{ width: 38, height: 38, position: 'relative' }}
          aria-label="Thông báo"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#e5383b', border: '2px solid white',
          }} />
        </button>

        <div className="d-flex align-items-center gap-2">
          <div className="navbar-avatar">{initials}</div>
          <div className="d-none d-md-block">
            <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>
              {displayRole}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 ms-1"
          style={{ borderRadius: 8, fontSize: '0.78rem', padding: '6px 10px' }}
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={14} />
          <span className="d-none d-sm-inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
