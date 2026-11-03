/* src/components/AdminNavbar.jsx
   Top navigation bar cho Admin Layout (giữ lại thiết kế cũ với custom CSS)
   ─────────────────────────────────────────────────────────────────────────── */

import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const routeTitles = {
  '/booking':   { title: 'Đặt lịch khám',   subtitle: 'Quản lý lịch hẹn và đặt phòng khám' },
  '/admin':     { title: 'Dashboard Admin',  subtitle: 'Thống kê và báo cáo tổng quan' },
  '/equipment': { title: 'Thiết bị y tế',   subtitle: 'Quản lý thiết bị và trạng thái bảo trì' },
};

export default function AdminNavbar() {
  const location = useLocation();
  const meta = routeTitles[location.pathname] ?? routeTitles['/admin'];

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
          <div className="navbar-avatar">AD</div>
          <div className="d-none d-md-block">
            <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Admin</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>Quản trị viên</div>
          </div>
        </div>
      </div>
    </header>
  );
}
