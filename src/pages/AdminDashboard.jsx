// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  Wrench, AlertTriangle, Stethoscope, Calendar, 
  Clock, CheckCircle, XCircle, Activity, ArrowUpRight 
} from 'lucide-react';
import { getDashboardStats, getBookings, getEquipments } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getBookings(), getEquipments()])
      .then(([s, b, e]) => {
        setStats(s);
        setBookings(b.slice(0, 5)); // Lấy 5 lịch hẹn gần nhất
        setEquipments(e.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary me-2" role="status" />
        <span className="fw-semibold text-muted">Đang tải dữ liệu Dashboard...</span>
      </div>
    );
  }

  // 4 Thẻ thống kê chuẩn Bootstrap Responsive Grid
  const statCards = [
    {
      title: 'Tổng thiết bị',
      value: stats?.totalEquipment || 0,
      sub: `${stats?.activeEquipment || 0} đang hoạt động`,
      icon: <Wrench size={24} />,
      bgClass: 'primary',
      textClass: 'text-primary'
    },
    {
      title: 'Thiết bị đang bảo trì',
      value: stats?.maintenanceEquipment || 0,
      sub: 'Cần kiểm tra kỹ thuật',
      icon: <AlertTriangle size={24} />,
      bgClass: 'warning',
      textClass: 'text-warning'
    },
    {
      title: 'Phòng khám đang mở',
      value: stats?.availableRooms || 0,
      sub: `Trên tổng số ${stats?.totalRooms || 0} phòng`,
      icon: <Stethoscope size={24} />,
      bgClass: 'success',
      textClass: 'text-success'
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: stats?.totalBookings || 0,
      sub: `${stats?.pendingBookings || 0} lịch hẹn chờ duyệt`,
      icon: <Calendar size={24} />,
      bgClass: 'danger',
      textClass: 'text-info'
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Title Header */}
      <div className="mb-4">
        <h3 className="heading-title mb-1" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--color-carbon-black)' }}>Dashboard Thống Kê Quản Trị</h3>
        <p className="fs-7 mb-0" style={{ fontSize: 16, color: 'var(--color-slate)' }}>Tổng quan tình hình hoạt động thiết bị và đặt lịch khám trong bệnh viện</p>
      </div>

      {/* 1. Thống kê tổng quan (4 Stats Cards dạng Bootstrap Grid Responsive) */}
      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card h-100">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="mono-label" style={{ color: 'var(--color-slate)', textTransform: 'uppercase' }}>{card.title}</span>
                  <div className={`stat-card-icon ${card.bgClass}`} style={{ marginBottom: 0 }}>
                    {card.icon}
                  </div>
                </div>
                <h2 className="stat-card-value mb-1">{card.value}</h2>
                <div className="fs-7" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-slate)' }}>{card.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Nội dung bảng quản lý nhanh */}
      <div className="row g-4">
        {/* Lịch hẹn gần đây */}
        <div className="col-12 col-lg-7">
          <div className="card-custom h-100">
            <div className="card-custom-header" style={{ borderBottom: 0 }}>
              <h5 className="heading-title mb-0" style={{ fontSize: 18, fontWeight: 450 }}>Lịch Hẹn Khám Gần Đây</h5>
              <span className="mint-tag" style={{ padding: '4px 12px' }}>
                Cập nhật tự động
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table-custom align-middle mb-0">
                  <thead className="fs-7 text-uppercase">
                    <tr>
                      <th className="ps-4">Bệnh nhân</th>
                      <th>Ngày & Giờ</th>
                      <th>Phòng khám</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="ps-4">
                          <div style={{ fontWeight: 500, color: 'var(--color-carbon-black)' }}>{b.patientName}</div>
                          <div className="mono-label" style={{ color: 'var(--color-smoke)' }}>{b.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--color-carbon-black)' }}>{b.date}</div>
                          <div className="mono-label d-flex align-items-center gap-1" style={{ color: 'var(--color-slate)' }}>
                            <Clock size={12} /> {b.time}
                          </div>
                        </td>
                        <td className="fs-7 fw-medium">{b.room}</td>
                        <td>
                          {b.status === 'Confirmed' && (
                            <span className="badge-custom badge-confirmed">
                              <CheckCircle size={12} className="me-1" /> Đã xác nhận
                            </span>
                          )}
                          {b.status === 'Pending' && (
                            <span className="badge-custom badge-pending">
                              <Clock size={12} className="me-1" /> Chờ duyệt
                            </span>
                          )}
                          {b.status === 'Cancelled' && (
                            <span className="badge-custom badge-cancelled">
                              <XCircle size={12} className="me-1" /> Đã hủy
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Trạng thái thiết bị y tế */}
        <div className="col-12 col-lg-5">
          <div className="card-custom h-100">
            <div className="card-custom-header" style={{ borderBottom: 0 }}>
              <h5 className="heading-title mb-0" style={{ fontSize: 18, fontWeight: 450 }}>Thiết Bị Cần Lưu Ý</h5>
            </div>
            <div className="card-body px-4 pt-0">
              <div className="list-group list-group-flush">
                {equipments.map((eq) => (
                  <div key={eq.id} className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between border-bottom">
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--color-carbon-black)' }}>{eq.name}</div>
                      <div className="fs-7" style={{ fontSize: 14, color: 'var(--color-slate)' }}>Mã: <code className="mono-label" style={{ color: 'var(--color-carbon-black)' }}>{eq.code}</code> | Vị trí: {eq.room}</div>
                    </div>
                    <div>
                      {eq.status === 'Active' ? (
                        <span className="badge-custom badge-active">Hoạt động</span>
                      ) : (
                        <span className="badge-custom badge-maintenance">Đang bảo trì</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}