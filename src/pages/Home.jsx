// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, CalendarPlus, Wrench, Users, Clock, MapPin,
  Stethoscope, ChevronRight, Star, Shield, Zap,
} from 'lucide-react';
import { getDashboardStats, getClinicRooms } from '../services/api';

const statusLabel = {
  Available: { label: 'Có sẵn',   cls: 'badge-active' },
  Busy:      { label: 'Đang bận', cls: 'badge-busy' },
  Closed:    { label: 'Đóng cửa', cls: 'badge-closed' },
};

function Home() {
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getClinicRooms()])
      .then(([s, r]) => { setStats(s); setRooms(r.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  const highlights = [
    { icon: <Shield size={20} />, title: 'Thiết bị hiện đại', desc: 'Hơn 100+ thiết bị y tế tiên tiến' },
    { icon: <Star size={20} />,   title: 'Đội ngũ chuyên gia', desc: '50+ bác sĩ đầu ngành' },
    { icon: <Zap size={20} />,    title: 'Đặt lịch nhanh', desc: 'Đặt hẹn trực tuyến trong 2 phút' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-badge">
          <Activity size={13} />
          Hệ thống quản lý thông minh
        </div>
        <h1>Chào mừng đến<br />MediCare Hospital</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem', maxWidth: 480, fontSize: '0.95rem' }}>
          Nền tảng quản lý thiết bị y tế và đặt lịch khám hiện đại, giúp tối ưu hóa
          quy trình vận hành bệnh viện một cách hiệu quả.
        </p>
        <div className="d-flex gap-3 mt-4 flex-wrap">
          <Link to="/booking" className="btn-primary-custom" id="hero-booking-btn">
            <CalendarPlus size={16} />
            Đặt lịch ngay
          </Link>
          <Link to="/admin" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            background: 'rgba(255,255,255,0.12)',
            color: 'white', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none', backdropFilter: 'blur(8px)',
          }} id="hero-admin-btn">
            <Activity size={16} />
            Xem Dashboard
          </Link>
        </div>

        {/* Highlight chips */}
        <div className="d-flex gap-3 mt-4 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
          {highlights.map((h) => (
            <div key={h.title} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '0.5rem 0.875rem',
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)',
            }}>
              <span style={{ color: '#4cc9f0' }}>{h.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{h.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{h.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner-border spinner-border-sm text-primary" />
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {[
            { label: 'Tổng thiết bị',   value: stats?.totalEquipment,      icon: <Wrench size={22} />,       color: 'primary' },
            { label: 'Thiết bị hoạt động', value: stats?.activeEquipment,  icon: <Activity size={22} />,     color: 'success' },
            { label: 'Phòng khám',       value: stats?.totalRooms,          icon: <Stethoscope size={22} />,  color: 'warning' },
            { label: 'Lịch hẹn hôm nay', value: stats?.totalBookings,      icon: <CalendarPlus size={22} />, color: 'danger' },
          ].map((s) => (
            <div key={s.label} className="col-6 col-lg-3">
              <div className={`stat-card ${s.color}`}>
                <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-card-value">{s.value ?? 0}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clinic Rooms */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 style={{ fontWeight: 700, margin: 0 }}>Phòng khám đang hoạt động</h5>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>Danh sách phòng khám và bác sĩ trực</p>
        </div>
        <Link to="/booking" className="btn-primary-custom" id="home-view-all-btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          Xem tất cả <ChevronRight size={14} />
        </Link>
      </div>

      <div className="row g-3">
        {rooms.map((room) => {
          const s = statusLabel[room.status] ?? { label: room.status, cls: 'badge-closed' };
          return (
            <div key={room.id} className="col-12 col-sm-6 col-xl-4">
              <div className="room-card">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="room-card-icon">
                    <Stethoscope size={22} />
                  </div>
                  <span className={`badge-custom ${s.cls}`}>{s.label}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{room.name}</div>
                <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                  <Users size={13} />
                  {room.doctor}
                </div>
                <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                  <MapPin size={13} />
                  {room.floor} – {room.specialty}
                </div>
                {room.status === 'Available' && (
                  <Link to="/booking" state={{ roomId: room.id }}
                    className="btn-primary-custom mt-3"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.45rem' }}
                    id={`book-room-${room.id}-btn`}
                  >
                    <CalendarPlus size={14} /> Đặt lịch
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
