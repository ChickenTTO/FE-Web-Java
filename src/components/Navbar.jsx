/* src/components/Navbar.jsx
   Bootstrap 5 Responsive Navbar – dành cho trang public (HomePage)
   Sử dụng data-bs-toggle="collapse" → yêu cầu bootstrap.bundle.min.js đã import.
   ─────────────────────────────────────────────────────────────────────────────── */

import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Cross, LogIn, LogOut, Phone, Menu, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { homeFor } from '../services/clinicStore';

/* Nav links data */
const NAV_LINKS = [
  { label: 'Trang chủ',         to: '/' },
  { label: 'Đặt lịch khám',     to: '/booking' },
  { label: 'Chuyên khoa', to: '/specialties' },
  { label: 'Bác sĩ', to: '/doctors' },
  { label: 'Dịch vụ', to: '/services' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <nav
      id="main-navbar"
      className="navbar navbar-expand-lg sticky-top public-navbar"
      style={{
        padding: '0 0',
        zIndex: 1050,
      }}
    >
      <div className="container py-2">

        {/* ─── Brand / Logo ─── */}
        <Link
          to="/"
          id="navbar-brand-logo"
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Logo icon */}
          <div className="public-logo-mark">
            <Cross size={20} color="#fff" strokeWidth={2.5} />
          </div>

          {/* Brand text */}
          <div style={{ lineHeight: 1.15 }}>
            <div className="public-brand-name">
              MediCare
            </div>
            <div className="public-brand-sub">
              HOSPITAL MANAGEMENT
            </div>
          </div>
        </Link>

        {/* ─── Hotline (hidden on mobile) ─── */}
        <div
          className="d-none d-xl-flex align-items-center gap-2 ms-auto me-4 hotline-block"
          style={{ fontSize: '0.8rem', color: '#444444' }}
        >
          <div className="hotline-icon">
            <Phone size={14} color="var(--color-primary-blue)" />
          </div>
          <div>
            <div className="mono-label" style={{ color: '#444444' }}>Hotline 24/7</div>
            <div style={{ fontWeight: 500, color: 'var(--color-primary-blue)', fontSize: '0.95rem' }}>1900 6868</div>
          </div>
        </div>

        {/* ─── Hamburger Toggler ─── */}
        <button
          id="navbar-toggler-btn"
          className="navbar-toggler border-0 shadow-none ms-auto ms-lg-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            padding: '6px 10px',
            background: '#ffffff',
            borderRadius: 8,
          }}
        >
          <Menu size={20} color="var(--color-primary-blue)" />
        </button>

        {/* ─── Collapsible Menu ─── */}
        <div
          id="navbarCollapse"
          className="collapse navbar-collapse"
        >
          {/* Nav Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 nav-pill">
            {NAV_LINKS.map((link) => (
              <li key={link.to} className="nav-item">
                <NavLink
                  id={`nav-${link.label.replace(/\s+/g, '-').toLowerCase()}-link`}
                  to={link.to}
                  end={link.to === '/'}
                  className="nav-link px-3 py-2 rounded-2 fw-500"
                  style={({ isActive }) => ({
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: isActive ? '#ffffff' : '#444444',
                    background: isActive ? 'var(--color-primary-blue)' : 'transparent',
                    transition: 'all 0.18s ease',
                  })}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Action buttons */}
          <div className="d-flex align-items-center gap-2 flex-column flex-lg-row mt-3 mt-lg-0">
            {/* Hotline on mobile */}
            <div className="d-flex d-xl-none align-items-center gap-2 mb-2 mb-lg-0">
              <Phone size={14} color="var(--color-primary-blue)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-primary-blue)' }}>
                Hotline: 1900 6868
              </span>
            </div>

            {/* Auth button state */}
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={homeFor(user)}
                  className="btn btn-light d-flex align-items-center gap-2"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    borderRadius: 8,
                    padding: '12px 20px',
                    background: '#ffffff',
                    border: 'none',
                  }}
                >
                  <LayoutDashboard size={16} color="var(--color-primary-blue)" />
                  <span>{user?.username || user?.fullName || 'Quản trị'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    borderRadius: 8,
                    padding: '12px 18px',
                  }}
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                  <span>Thoát</span>
                </button>
              </div>
            ) : (
              <Link
                id="navbar-login-btn"
                to="/login"
                className="btn d-flex align-items-center gap-2"
                style={{
                  background: 'var(--color-primary-blue)',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '1rem',
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <LogIn size={16} />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
        {/* /Collapsible */}

      </div>
    </nav>
  );
}
