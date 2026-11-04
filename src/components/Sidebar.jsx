// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Wrench,
  Home,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Cross,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Tổng quan', to: '/', icon: <Home size={18} />, section: 'Trang chính' },
  { label: 'Đặt lịch khám', to: '/booking', icon: <CalendarPlus size={18} />, section: 'Trang chính' },
  { label: 'Dashboard Admin', to: '/admin', icon: <LayoutDashboard size={18} />, section: 'Quản trị' },
  { label: 'Thiết bị y tế', to: '/equipment', icon: <Wrench size={18} />, section: 'Quản trị' },
];

const sections = ['Trang chính', 'Quản trị'];

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Cross size={20} />
        </div>
        <div>
          <div className="sidebar-logo-text">MediCare</div>
          <div className="sidebar-logo-sub">Hospital Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </div>
        ))}

        <div className="divider" style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '1rem 0' }} />

        <div className="sidebar-section-label">Hệ thống</div>
        <button className="sidebar-nav-item">
          <span className="nav-icon"><Users size={18} /></span>
          <span>Người dùng</span>
        </button>
        <button className="sidebar-nav-item">
          <span className="nav-icon"><Settings size={18} /></span>
          <span>Cài đặt</span>
        </button>
        <button className="sidebar-nav-item">
          <span className="nav-icon"><HelpCircle size={18} /></span>
          <span>Hỗ trợ</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ color: '#ff6b6b', background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
        >
          <span className="nav-icon"><LogOut size={18} /></span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
