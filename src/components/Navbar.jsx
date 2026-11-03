/* src/components/Navbar.jsx
   Bootstrap 5 Responsive Navbar – dành cho trang public (HomePage)
   Sử dụng data-bs-toggle="collapse" → yêu cầu bootstrap.bundle.min.js đã import.
   ─────────────────────────────────────────────────────────────────────────────── */

import { NavLink, Link } from 'react-router-dom';
import { Cross, LogIn, Phone, Menu } from 'lucide-react';

/* Nav links data */
const NAV_LINKS = [
  { label: 'Trang chủ',         to: '/' },
  { label: 'Đặt lịch khám',     to: '/booking' },
  { label: 'Quản lý thiết bị',  to: '/equipment' },
  { label: 'Dashboard Quản trị',to: '/admin' },
];

export default function Navbar() {
  return (
    <nav
      id="main-navbar"
      className="navbar navbar-expand-lg sticky-top shadow-sm"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
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
          <div
            style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #1a6fdb, #0fa37f)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Cross size={20} color="#fff" strokeWidth={2.5} />
          </div>

          {/* Brand text */}
          <div style={{ lineHeight: 1.15 }}>
            <div
              style={{
                fontWeight: 800, fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #1a6fdb, #0fa37f)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
              }}
            >
              MediCare
            </div>
            <div style={{ fontSize: '0.62rem', color: '#6c757d', fontWeight: 500, letterSpacing: '0.3px' }}>
              HOSPITAL MANAGEMENT
            </div>
          </div>
        </Link>

        {/* ─── Hotline (hidden on mobile) ─── */}
        <div
          className="d-none d-xl-flex align-items-center gap-2 ms-auto me-4"
          style={{ fontSize: '0.8rem', color: '#6c757d' }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#e8f1fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Phone size={14} color="#1a6fdb" />
          </div>
          <div>
            <div style={{ fontSize: '0.67rem', color: '#9ca3af' }}>Hotline 24/7</div>
            <div style={{ fontWeight: 700, color: '#1a6fdb', fontSize: '0.85rem' }}>1900 6868</div>
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
            background: '#f0f4ff',
            borderRadius: 8,
          }}
        >
          <Menu size={20} color="#1a6fdb" />
        </button>

        {/* ─── Collapsible Menu ─── */}
        <div
          id="navbarCollapse"
          className="collapse navbar-collapse"
        >
          {/* Nav Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to} className="nav-item">
                <NavLink
                  id={`nav-${link.label.replace(/\s+/g, '-').toLowerCase()}-link`}
                  to={link.to}
                  end={link.to === '/'}
                  className="nav-link px-3 py-2 rounded-2 fw-500"
                  style={({ isActive }) => ({
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#1a6fdb' : '#374151',
                    background: isActive ? '#e8f1fd' : 'transparent',
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
              <Phone size={14} color="#1a6fdb" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a6fdb' }}>
                Hotline: 1900 6868
              </span>
            </div>

            {/* Login button */}
            <Link
              id="navbar-login-btn"
              to="/admin"
              className="btn d-flex align-items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1a6fdb, #1355b0)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(26,111,219,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(26,111,219,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,111,219,0.3)';
              }}
            >
              <LogIn size={16} />
              Đăng nhập
            </Link>
          </div>
        </div>
        {/* /Collapsible */}

      </div>
    </nav>
  );
}
