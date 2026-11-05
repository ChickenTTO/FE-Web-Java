/* ============================================================
   src/pages/HomePage.jsx
   Trang chủ công khai – Bootstrap 5 Responsive
   Sections:
     1. HeroSection       – Banner + CTA
     2. StatsBar          – Số liệu nhanh
     3. ClinicSection     – Chuyên khoa & Phòng khám (Cards)
     4. EquipmentSection  – Thiết bị y tế hiện đại
     5. WhyUsSection      – Tại sao chọn chúng tôi
     6. CtaBanner         – Call-to-action đặt lịch
     7. HomeFooter        – Thông tin liên hệ
   ============================================================ */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus, Phone, MapPin, Mail, Clock, ChevronRight,
  Stethoscope, Heart, Brain, Eye, Bone, Baby,
  Microscope, Scan, Radio, Activity, ShieldCheck,
  Star, Users, Award, Zap, ArrowRight, Facebook,
  Youtube, Twitter, CheckCircle,
} from 'lucide-react';
import { getClinicRooms } from '../services/api';
import Reveal from '../components/Reveal';

/* ─────────────────────────────────────────────────────────────
   Data tĩnh
   ───────────────────────────────────────────────────────────── */

const STATS = [
  { value: '20+',  label: 'Năm kinh nghiệm',    icon: <Award size={22} /> },
  { value: '150+', label: 'Bác sĩ chuyên khoa', icon: <Users size={22} /> },
  { value: '50K+', label: 'Bệnh nhân/năm',       icon: <Heart size={22} /> },
  { value: '98%',  label: 'Hài lòng dịch vụ',   icon: <Star size={22} /> },
];

const SPECIALTY_ICONS = {
  'Nội khoa':    <Heart size={28} />,
  'Nhi khoa':    <Baby size={28} />,
  'Tim mạch':    <Activity size={28} />,
  'Da liễu':     <ShieldCheck size={28} />,
  'Cơ – Xương – Khớp': <Bone size={28} />,
  'Thần kinh':   <Brain size={28} />,
  'Nhãn khoa':   <Eye size={28} />,
  'Tai Mũi Họng':<Stethoscope size={28} />,
};

const SPECIALTY_COLORS = [
  { bg: '#e8f4ff', accent: '#1a6fdb' },
  { bg: '#fff0f3', accent: '#e5383b' },
  { bg: '#e6f7f3', accent: '#0fa37f' },
  { bg: '#fff8e8', accent: '#f4a261' },
  { bg: '#f3e8ff', accent: '#7c3aed' },
  { bg: '#e8fff6', accent: '#059669' },
  { bg: '#e8f0ff', accent: '#3b82f6' },
  { bg: '#fff3e8', accent: '#ea580c' },
];

const EQUIPMENT_LIST = [
  {
    icon: <Scan size={32} />,
    title: 'Máy CT Scanner 128 lát',
    desc: 'Chụp cắt lớp vi tính độ phân giải cao, cho kết quả chẩn đoán chính xác nhất.',
    color: '#1a6fdb',
    bg: '#e8f1fd',
    tag: 'Chẩn đoán hình ảnh',
  },
  {
    icon: <Radio size={32} />,
    title: 'Máy MRI 3.0 Tesla',
    desc: 'Cộng hưởng từ thế hệ mới, không bức xạ, hình ảnh sắc nét chi tiết đến từng mm.',
    color: '#0fa37f',
    bg: '#e6f7f3',
    tag: 'Chẩn đoán hình ảnh',
  },
  {
    icon: <Activity size={32} />,
    title: 'Hệ thống Monitor ICU',
    desc: 'Theo dõi liên tục sinh hiệu bệnh nhân nặng, cảnh báo sớm mọi bất thường.',
    color: '#7c3aed',
    bg: '#f3e8ff',
    tag: 'Theo dõi bệnh nhân',
  },
  {
    icon: <Microscope size={32} />,
    title: 'Máy Xét nghiệm tự động',
    desc: 'Phân tích sinh hóa, huyết học tự động cho kết quả nhanh trong 30 phút.',
    color: '#ea580c',
    bg: '#fff3e8',
    tag: 'Xét nghiệm',
  },
  {
    icon: <Stethoscope size={32} />,
    title: 'Robot phẫu thuật Da Vinci',
    desc: 'Phẫu thuật xâm lấn tối thiểu với độ chính xác cao, hồi phục nhanh hơn 60%.',
    color: '#e5383b',
    bg: '#fdecea',
    tag: 'Phẫu thuật',
  },
  {
    icon: <Heart size={32} />,
    title: 'Siêu âm tim 4D',
    desc: 'Đánh giá chức năng tim mạch toàn diện với công nghệ hình ảnh 4 chiều.',
    color: '#059669',
    bg: '#e8fff6',
    tag: 'Tim mạch',
  },
];

const WHY_US = [
  { icon: <ShieldCheck size={24} />, title: 'Đội ngũ chuyên gia hàng đầu', desc: 'Bác sĩ được đào tạo tại các trung tâm y tế hàng đầu trong và ngoài nước.', color: '#1a6fdb' },
  { icon: <Zap size={24} />,         title: 'Công nghệ y tế tiên tiến',    desc: 'Hơn 200 thiết bị hiện đại cùng hệ thống HIS quản lý bệnh viện thông minh.', color: '#0fa37f' },
  { icon: <Clock size={24} />,        title: 'Phục vụ 24/7 không nghỉ',     desc: 'Khoa cấp cứu, ICU và đội ngũ trực hoạt động 24 giờ mỗi ngày, 7 ngày mỗi tuần.', color: '#7c3aed' },
  { icon: <Star size={24} />,         title: 'Trải nghiệm bệnh nhân tốt nhất', desc: 'Môi trường thân thiện, quy trình khám nhanh gọn, đặt lịch trực tuyến tiện lợi.', color: '#f4a261' },
];

const STATUS_MAP = {
  Available: { label: 'Còn chỗ',   cls: 'text-success',  dot: '#0fa37f' },
  Busy:      { label: 'Đang khám', cls: 'text-danger',   dot: '#e5383b' },
  Closed:    { label: 'Đóng cửa',  cls: 'text-secondary',dot: '#9ca3af' },
};

/* ─────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────── */

function SectionHeader({ badge, title, subtitle, center = true }) {
  return (
    <Reveal className={`mb-5 ${center ? 'text-center' : ''}`}>
      {badge && (
        <span
          className="badge mb-3 px-3 py-2"
          style={{
            background: '#e8f1fd', color: '#1a6fdb',
            fontSize: '0.75rem', fontWeight: 700,
            borderRadius: 100, letterSpacing: '0.5px',
          }}
        >
          {badge}
        </span>
      )}
      <h2
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
          fontWeight: 800, color: '#0d1b2a',
          letterSpacing: '-0.5px', lineHeight: 1.25,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2" style={{ color: '#6c757d', fontSize: '0.95rem', maxWidth: 560, margin: '0.5rem auto 0' }}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. HERO SECTION
   ───────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2444 40%, #0f3460 70%, #1a6fdb 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,111,219,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(15,163,127,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div className="container py-5 position-relative">
        <div className="row align-items-center g-5">

          {/* Left column – Text */}
          <div className="col-12 col-lg-6 hero-stagger">
            {/* Badge */}
            <div
              className="d-inline-flex align-items-center gap-2 mb-4"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 100, padding: '6px 16px',
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600,
              }}
            >
              <span style={{ width: 8, height: 8, background: '#0fa37f', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Hệ thống bệnh viện thông minh – Mở cửa 24/7
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 900, color: '#fff',
                lineHeight: 1.15, letterSpacing: '-1px',
              }}
            >
              Chăm sóc sức khoẻ{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #4cc9f0, #0fa37f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                toàn diện
              </span>
              <br />cho gia đình bạn
            </h1>

            <p
              className="mt-3 mb-4"
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 480 }}
            >
              MediCare cung cấp dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên khoa giàu
              kinh nghiệm và hệ thống thiết bị hiện đại hàng đầu Việt Nam.
            </p>

            {/* CTA buttons */}
            <div className="d-flex flex-wrap gap-3 mb-5">
              <Link
                id="hero-book-appointment-btn"
                to="/booking"
                className="d-flex align-items-center gap-2 btn-cta"
                style={{
                  background: 'linear-gradient(135deg, #1a6fdb, #0fa37f)',
                  color: '#fff', fontWeight: 700,
                  fontSize: '0.95rem', padding: '13px 28px',
                  borderRadius: 10, textDecoration: 'none',
                }}
              >
                <CalendarPlus size={18} />
                Đặt lịch khám ngay
              </Link>

              <a
                id="hero-hotline-btn"
                href="tel:19006868"
                className="d-flex align-items-center gap-2 btn-glass"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  color: '#fff', fontWeight: 600,
                  fontSize: '0.95rem', padding: '12px 24px',
                  borderRadius: 10, textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Phone size={18} />
                1900 6868
              </a>
            </div>

            {/* Trust indicators */}
            <div className="d-flex flex-wrap gap-3">
              {[
                'ISO 9001:2015 Certified',
                'Bộ Y tế cấp phép',
                'Chứng nhận JCI',
              ].map((item) => (
                <div
                  key={item}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}
                >
                  <CheckCircle size={14} color="#0fa37f" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right column – Visual card stack */}
          <div className="col-12 col-lg-6 d-none d-lg-block">
            <div style={{ position: 'relative', height: 460 }}>

              {/* Main card */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20, padding: '2rem',
                width: 320, textAlign: 'center',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: 'linear-gradient(135deg, #1a6fdb, #0fa37f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Heart size={36} color="#fff" />
                </div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  Chăm sóc toàn diện
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  Từ khám tổng quát đến điều trị chuyên sâu với công nghệ hàng đầu
                </div>
                <div className="d-flex justify-content-around mt-3">
                  {[['150+', 'Bác sĩ'], ['30+', 'Chuyên khoa'], ['24/7', 'Hỗ trợ']].map(([v, l]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ color: '#4cc9f0', fontWeight: 800, fontSize: '1.1rem' }}>{v}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge – top-left */}
              <div style={{
                position: 'absolute', top: 30, left: 0,
                background: '#fff', borderRadius: 14,
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'float 3s ease-in-out infinite',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#e8f1fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CalendarPlus size={20} color="#1a6fdb" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6c757d', fontWeight: 500 }}>Lịch hẹn mới</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a' }}>Nguyễn Văn A · 9:00</div>
                </div>
              </div>

              {/* Floating badge – bottom-right */}
              <div style={{
                position: 'absolute', bottom: 30, right: 0,
                background: '#fff', borderRadius: 14,
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'float 3s ease-in-out infinite 1.5s',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#e6f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Activity size={20} color="#0fa37f" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6c757d', fontWeight: 500 }}>Thiết bị hoạt động</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a' }}>10 / 12 thiết bị ✓</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-5 d-none d-md-block">
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem',
            animation: 'bounce 2s infinite',
          }}>
            <div>Cuộn xuống để khám phá</div>
            <div style={{
              width: 24, height: 40, border: '2px solid rgba(255,255,255,0.25)',
              borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 6,
            }}>
              <div style={{
                width: 4, height: 8, background: 'rgba(255,255,255,0.5)',
                borderRadius: 2, animation: 'scrollDot 2s infinite',
              }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(6px); opacity: 0.7; }
        }
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. STATS BAR
   ───────────────────────────────────────────────────────────── */

function StatsBar() {
  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #e9ecef' }}>
      <div className="container">
        <div className="row g-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="col-6 col-md-3"
              style={{
                padding: '2rem 1.5rem',
                borderRight: i < 3 ? '1px solid #e9ecef' : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: '#e8f1fd', color: '#1a6fdb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#0d1b2a', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6c757d', fontWeight: 500, marginTop: '0.25rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. CLINIC SECTION – Bootstrap col-12 col-md-6 col-lg-4
   ───────────────────────────────────────────────────────────── */

function ClinicSection({ rooms }) {
  return (
    <section id="clinics" style={{ background: '#f8f9fa', padding: '5rem 0' }}>
      <div className="container">
        <SectionHeader
          badge="🏥 Chuyên khoa & Phòng khám"
          title="Đội ngũ bác sĩ chuyên khoa hàng đầu"
          subtitle="Hơn 30 chuyên khoa với đội ngũ y bác sĩ giàu kinh nghiệm, sẵn sàng phục vụ bạn mỗi ngày."
        />

        <div className="row g-4">
          {rooms.map((room, idx) => {
            const color = SPECIALTY_COLORS[idx % SPECIALTY_COLORS.length];
            const icon  = SPECIALTY_ICONS[room.specialty] ?? <Stethoscope size={28} />;
            const st    = STATUS_MAP[room.status] ?? STATUS_MAP['Closed'];

            return (
              /* Bootstrap responsive grid: 1 col mobile → 2 col tablet → 3 col desktop */
              <Reveal key={room.id} className="col-12 col-md-6 col-lg-4" delay={(idx % 3) * 80}>
                <div
                  className="card h-100 border-0 shadow-sm card-lift"
                  style={{
                    borderRadius: 16,
                    cursor: 'default',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${color.accent}, ${color.accent}88)` }} />

                  <div className="card-body p-4">
                    {/* Icon + Status */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div
                        style={{
                          width: 60, height: 60, borderRadius: 14,
                          background: color.bg, color: color.accent,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </div>

                      {/* Status badge */}
                      <span
                        className="d-inline-flex align-items-center gap-1"
                        style={{
                          fontSize: '0.72rem', fontWeight: 600,
                          padding: '4px 10px', borderRadius: 100,
                          background: room.status === 'Available' ? '#e6f7f3'
                                    : room.status === 'Busy'      ? '#fdecea'
                                    : '#f3f4f6',
                          color: st.dot,
                        }}
                      >
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: st.dot, display: 'inline-block',
                        }} />
                        {st.label}
                      </span>
                    </div>

                    {/* Info */}
                    <h5
                      className="card-title mb-1"
                      style={{ fontWeight: 700, fontSize: '1rem', color: '#0d1b2a' }}
                    >
                      {room.name}
                    </h5>
                    <p style={{ fontSize: '0.82rem', color: '#6c757d', margin: 0 }}>
                      Chuyên khoa {room.specialty}
                    </p>

                    <hr style={{ borderColor: '#f0f0f0', margin: '1rem 0' }} />

                    {/* Doctor */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color.accent}, ${color.accent}99)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                      }}>
                        {room.doctor.split(' ').pop()[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{room.doctor}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Bác sĩ phụ trách</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-3" style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      <MapPin size={13} color={color.accent} />
                      {room.floor}
                    </div>

                    {/* CTA */}
                    {room.status === 'Available' ? (
                      <Link
                        to="/booking"
                        state={{ roomId: room.id }}
                        id={`clinic-book-${room.id}-btn`}
                        className="d-flex align-items-center justify-content-center gap-2 w-100 btn-outline-fill"
                        style={{
                          '--accent': color.accent,
                          '--accent-bg': color.bg,
                          border: `1.5px solid ${color.accent}33`,
                          fontWeight: 700, fontSize: '0.83rem',
                          padding: '9px', borderRadius: 10,
                          textDecoration: 'none',
                        }}
                      >
                        <CalendarPlus size={14} />
                        Đặt lịch khám
                      </Link>
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center gap-2 w-100"
                        style={{
                          background: '#f3f4f6', color: '#9ca3af',
                          fontWeight: 600, fontSize: '0.83rem',
                          padding: '9px', borderRadius: 10,
                        }}
                      >
                        {room.status === 'Busy' ? 'Đang có bệnh nhân' : 'Tạm đóng cửa'}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* View all link */}
        <div className="text-center mt-5">
          <Link
            to="/booking"
            id="clinics-view-all-btn"
            className="d-inline-flex align-items-center gap-2 btn-outline-fill"
            style={{
              '--accent': '#1a6fdb',
              fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', padding: '10px 24px',
              border: '2px solid #1a6fdb', borderRadius: 10,
            }}
          >
            Xem tất cả phòng khám
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. EQUIPMENT SECTION
   ───────────────────────────────────────────────────────────── */

function EquipmentSection() {
  return (
    <section
      id="equipment"
      style={{
        background: 'linear-gradient(180deg, #fff 0%, #f0f7ff 100%)',
        padding: '5rem 0',
      }}
    >
      <div className="container">
        <SectionHeader
          badge="⚕️ Thiết bị y tế"
          title="Trang thiết bị chẩn đoán tiên tiến"
          subtitle="Đầu tư hơn 500 tỷ đồng vào trang thiết bị y tế hiện đại, đảm bảo chẩn đoán chính xác và điều trị hiệu quả."
        />

        <div className="row g-4">
          {EQUIPMENT_LIST.map((eq, i) => (
            <Reveal key={i} className="col-12 col-md-6 col-lg-4" delay={(i % 3) * 80}>
              <div
                className="card border-0 h-100 card-lift card-lift-sm"
                style={{
                  borderRadius: 16,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Colored header */}
                <div
                  style={{
                    background: eq.bg,
                    padding: '1.75rem 1.5rem 1.25rem',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ color: eq.color }}>{eq.icon}</div>
                  <span style={{
                    background: `${eq.color}18`,
                    color: eq.color,
                    fontSize: '0.68rem', fontWeight: 700,
                    padding: '3px 10px', borderRadius: 100,
                    border: `1px solid ${eq.color}30`,
                  }}>
                    {eq.tag}
                  </span>
                </div>

                <div className="card-body p-4 pt-3">
                  <h6
                    className="card-title mb-2"
                    style={{ fontWeight: 800, color: '#0d1b2a', fontSize: '0.95rem' }}
                  >
                    {eq.title}
                  </h6>
                  <p className="card-text" style={{ fontSize: '0.82rem', color: '#6c757d', lineHeight: 1.65 }}>
                    {eq.desc}
                  </p>

                  <div
                    className="d-flex align-items-center gap-1 mt-auto"
                    style={{ fontSize: '0.78rem', color: eq.color, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Tìm hiểu thêm <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom promo banner */}
        <div
          className="mt-5 p-4 p-md-5 rounded-4 text-center text-md-start"
          style={{
            background: 'linear-gradient(135deg, #0d1b2a, #1a6fdb)',
            color: '#fff',
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-8">
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '0.5rem' }}>
                🏆 Được Bộ Y tế công nhận
              </div>
              <h4 style={{ fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
                Trung tâm kỹ thuật y tế chất lượng cao
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                Hệ thống thiết bị được kiểm định và bảo dưỡng định kỳ, đảm bảo kết quả chẩn đoán chính xác tuyệt đối.
              </p>
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <Link
                to="/equipment"
                id="equipment-explore-btn"
                className="d-inline-flex align-items-center gap-2"
                style={{
                  background: '#fff', color: '#1a6fdb',
                  fontWeight: 700, padding: '12px 24px',
                  borderRadius: 10, textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                <Activity size={16} />
                Xem danh sách thiết bị
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. WHY US SECTION
   ───────────────────────────────────────────────────────────── */

function WhyUsSection() {
  return (
    <section style={{ background: '#fff', padding: '5rem 0' }}>
      <div className="container">
        <SectionHeader
          badge="💡 Tại sao chọn chúng tôi"
          title="MediCare – Đồng hành vì sức khoẻ của bạn"
          subtitle="Chúng tôi cam kết mang lại dịch vụ y tế tốt nhất với sự tận tâm và chuyên nghiệp."
        />
        <div className="row g-4">
          {WHY_US.map((item, i) => (
            <Reveal key={i} className="col-12 col-sm-6 col-lg-3" delay={i * 80}>
              <div
                className="text-center p-4 rounded-4 h-100 why-card"
                style={{ border: '1px solid #e9ecef' }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: `${item.color}18`, color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  {item.icon}
                </div>
                <h6 style={{ fontWeight: 700, color: '#0d1b2a', marginBottom: '0.5rem' }}>{item.title}</h6>
                <p style={{ fontSize: '0.82rem', color: '#6c757d', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. CTA BANNER
   ───────────────────────────────────────────────────────────── */

function CtaBanner() {
  return (
    <section style={{ background: '#f0f7ff', padding: '4rem 0' }}>
      <div className="container">
        <div
          className="rounded-4 p-4 p-md-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #1a6fdb 0%, #0fa37f 100%)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: '10%', width: 150, height: 150,
            background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '0.75rem' }}>
              Đặt lịch khám ngay hôm nay
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Nhanh chóng – Tiện lợi – Không cần xếp hàng chờ đợi. Đội ngũ bác sĩ sẵn sàng phục vụ bạn.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link
                to="/booking"
                id="cta-book-btn"
                className="d-flex align-items-center gap-2"
                style={{
                  background: '#fff', color: '#1a6fdb',
                  fontWeight: 700, padding: '13px 28px',
                  borderRadius: 10, textDecoration: 'none', fontSize: '0.95rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                <CalendarPlus size={18} />
                Đặt lịch khám ngay
              </Link>
              <a
                id="cta-hotline-btn"
                href="tel:19006868"
                className="d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  color: '#fff', fontWeight: 600,
                  padding: '12px 24px', borderRadius: 10,
                  textDecoration: 'none', fontSize: '0.95rem',
                }}
              >
                <Phone size={18} />
                Gọi 1900 6868
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. HOME FOOTER
   ───────────────────────────────────────────────────────────── */

function HomeFooter() {
  return (
    <footer style={{ background: '#0a1628', color: 'rgba(255,255,255,0.7)' }}>
      {/* Main footer */}
      <div className="container py-5">
        <div className="row g-5">

          {/* Col 1 – Brand */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #1a6fdb, #0fa37f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Heart size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>MediCare</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>HOSPITAL MANAGEMENT</div>
              </div>
            </div>
            <p style={{ fontSize: '0.83rem', lineHeight: 1.75 }}>
              Hệ thống bệnh viện hàng đầu với đội ngũ bác sĩ chuyên khoa và thiết bị y tế hiện đại, phục vụ hàng triệu bệnh nhân mỗi năm.
            </p>
            {/* Social */}
            <div className="d-flex gap-2 mt-3">
              {[
                { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
                { icon: <Youtube size={16} />,  href: '#', label: 'Youtube' },
                { icon: <Twitter size={16} />,  href: '#', label: 'Twitter' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  id={`footer-${s.label.toLowerCase()}-link`}
                  aria-label={s.label}
                  className="social-link"
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 – Dịch vụ */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Dịch vụ
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Khám tổng quát', 'Khám chuyên khoa', 'Xét nghiệm', 'Chẩn đoán hình ảnh', 'Phẫu thuật', 'Cấp cứu 24/7'].map((item) => (
                <li key={item} style={{ marginBottom: '0.6rem' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.83rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4cc9f0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Liên kết */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Liên kết
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Về chúng tôi', 'Đội ngũ bác sĩ', 'Tin tức y tế', 'Tuyển dụng', 'Liên hệ'].map((item) => (
                <li key={item} style={{ marginBottom: '0.6rem' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.83rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4cc9f0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Liên hệ */}
          <div className="col-12 col-md-6 col-lg-5">
            <h6 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Thông tin liên hệ
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                {
                  icon: <MapPin size={16} />,
                  label: 'Địa chỉ',
                  value: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
                },
                {
                  icon: <Phone size={16} />,
                  label: 'Hotline',
                  value: '1900 6868 (24/7)',
                  href: 'tel:19006868',
                  highlight: true,
                },
                {
                  icon: <Phone size={16} />,
                  label: 'Điện thoại',
                  value: '(028) 3855 4269',
                  href: 'tel:02838554269',
                },
                {
                  icon: <Mail size={16} />,
                  label: 'Email',
                  value: 'info@medicare.com.vn',
                  href: 'mailto:info@medicare.com.vn',
                },
                {
                  icon: <Clock size={16} />,
                  label: 'Giờ làm việc',
                  value: 'T2 – T7: 7:00 – 17:00 | Cấp cứu 24/7',
                },
              ].map((c) => (
                <li key={c.label} className="d-flex gap-3 mb-3">
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(26,111,219,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#4cc9f0',
                  }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} style={{
                        color: c.highlight ? '#4cc9f0' : 'rgba(255,255,255,0.75)',
                        fontWeight: c.highlight ? 700 : 500,
                        fontSize: '0.85rem', textDecoration: 'none',
                      }}>
                        {c.value}
                      </a>
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5 }}>{c.value}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container py-3">
          <div className="row align-items-center g-2">
            <div className="col-12 col-md-6 text-center text-md-start" style={{ fontSize: '0.78rem' }}>
              © {new Date().getFullYear()} MediCare Hospital Management System. Tất cả quyền được bảo lưu.
            </div>
            <div className="col-12 col-md-6 text-center text-md-end" style={{ fontSize: '0.78rem' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginRight: '1rem' }}>Chính sách bảo mật</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Điều khoản sử dụng</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main HomePage Component
   ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinicRooms()
      .then(setRooms)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <HeroSection />
      <StatsBar />

      {loading ? (
        <section style={{ background: '#f8f9fa', padding: '5rem 0' }} aria-busy="true" aria-live="polite">
          <div className="container">
            <div className="row g-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="skeleton-card">
                    <div className="d-flex justify-content-between mb-3">
                      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 14 }} />
                      <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 100 }} />
                    </div>
                    <div className="skeleton mb-2" style={{ width: '70%', height: 16 }} />
                    <div className="skeleton mb-4" style={{ width: '45%', height: 12 }} />
                    <div className="skeleton mb-3" style={{ width: '60%', height: 14 }} />
                    <div className="skeleton" style={{ width: '100%', height: 36, borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="fade-in">
          <ClinicSection rooms={rooms} />
        </div>
      )}

      <EquipmentSection />
      <WhyUsSection />
      <CtaBanner />
      <HomeFooter />
    </>
  );
}
