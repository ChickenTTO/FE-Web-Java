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
      bgClass: 'bg-primary',
      textClass: 'text-primary'
    },
    {
      title: 'Thiết bị đang bảo trì',
      value: stats?.maintenanceEquipment || 0,
      sub: 'Cần kiểm tra kỹ thuật',
      icon: <AlertTriangle size={24} />,
      bgClass: 'bg-warning',
      textClass: 'text-warning'
    },
    {
      title: 'Phòng khám đang mở',
      value: stats?.availableRooms || 0,
      sub: `Trên tổng số ${stats?.totalRooms || 0} phòng`,
      icon: <Stethoscope size={24} />,
      bgClass: 'bg-success',
      textClass: 'text-success'
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: stats?.totalBookings || 0,
      sub: `${stats?.pendingBookings || 0} lịch hẹn chờ duyệt`,
      icon: <Calendar size={24} />,
      bgClass: 'bg-info',
      textClass: 'text-info'
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Title Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Dashboard Thống Kê Quản Trị</h3>
        <p className="text-muted fs-7 mb-0">Tổng quan tình hình hoạt động thiết bị và đặt lịch khám trong bệnh viện</p>
      </div>

      {/* 1. Thống kê tổng quan (4 Stats Cards dạng Bootstrap Grid Responsive) */}
      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted fw-semibold fs-7">{card.title}</span>
                  <div className={`p-3 rounded-3 ${card.bgClass} bg-opacity-10 ${card.textClass}`}>
                    {card.icon}
                  </div>
                </div>
                <h2 className="fw-extrabold text-dark mb-1">{card.value}</h2>
                <div className="fs-7 text-muted fw-medium">{card.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Nội dung bảng quản lý nhanh */}
      <div className="row g-4">
        {/* Lịch hẹn gần đây */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 px-4 border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Lịch Hẹn Khám Gần Đây</h5>
              <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill">
                Cập nhật tự động
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-secondary">
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
                          <div className="fw-bold text-dark">{b.patientName}</div>
                          <div className="fs-7 text-muted">{b.phone}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{b.date}</div>
                          <div className="fs-7 text-primary d-flex align-items-center gap-1">
                            <Clock size={12} /> {b.time}
                          </div>
                        </td>
                        <td className="fs-7 fw-medium">{b.room}</td>
                        <td>
                          {b.status === 'Confirmed' && (
                            <span className="badge bg-success-subtle text-success px-2 py-1 rounded-2">
                              <CheckCircle size={12} className="me-1" /> Đã xác nhận
                            </span>
                          )}
                          {b.status === 'Pending' && (
                            <span className="badge bg-warning-subtle text-warning px-2 py-1 rounded-2">
                              <Clock size={12} className="me-1" /> Chờ duyệt
                            </span>
                          )}
                          {b.status === 'Cancelled' && (
                            <span className="badge bg-danger-subtle text-danger px-2 py-1 rounded-2">
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
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 px-4 border-0">
              <h5 className="fw-bold mb-0 text-dark">Thiết Bị Cần Lưu Ý</h5>
            </div>
            <div className="card-body px-4 pt-0">
              <div className="list-group list-group-flush">
                {equipments.map((eq) => (
                  <div key={eq.id} className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between border-bottom">
                    <div>
                      <div className="fw-bold text-dark">{eq.name}</div>
                      <div className="fs-7 text-muted">Mã: <code>{eq.code}</code> | Vị trí: {eq.room}</div>
                    </div>
                    <div>
                      {eq.status === 'Active' ? (
                        <span className="badge bg-success-subtle text-success">Hoạt động</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning">Đang bảo trì</span>
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