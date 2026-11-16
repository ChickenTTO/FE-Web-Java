import { NavLink, useNavigate } from "react-router-dom";
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
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Package,
  Layers,
  Truck,
  Receipt,
  ShieldCheck,
  Monitor,
  HeartPulse,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { roleOf } from "../services/clinicStore";
const A = ["ADMIN"],
  AS = ["ADMIN", "STAFF"],
  ALL = ["ADMIN", "STAFF", "DOCTOR", "PATIENT"];
export const workspaceNav = [
  ["Chăm sóc", "Trang chủ", "/", Home, ALL],
  ["Chăm sóc", "Đặt lịch khám", "/booking", CalendarPlus, ["PATIENT", "STAFF"]],
  ["Chăm sóc", "Hồ sơ của tôi", "/profiles", Users, ["PATIENT"]],
  [
    "Chăm sóc",
    "Lịch hẹn của tôi",
    "/my-appointments",
    CalendarDays,
    ["PATIENT"],
  ],
  ["Phòng khám", "Tổng quan", "/admin", LayoutDashboard, A],
  ["Phòng khám", "Lịch hẹn & Tiếp nhận", "/appointments", CalendarDays, AS],
  ["Phòng khám", "Khám bệnh", "/consultations", Stethoscope, ["DOCTOR"]],
  ["Phòng khám", "Hồ sơ bệnh nhân", "/patients", Users, AS],
  [
    "Phòng khám",
    "Lịch trực bác sĩ",
    "/schedules",
    CalendarDays,
    ["ADMIN", "STAFF", "DOCTOR"],
  ],
  [
    "Phòng khám",
    "Thanh toán",
    "/payments",
    Receipt,
    ["ADMIN", "STAFF", "PATIENT"],
  ],
  ["Phòng khám", "Báo cáo doanh thu", "/reports", LayoutDashboard, A],
  ["Danh mục", "Chuyên khoa", "/catalog/specialties", HeartPulse, AS],
  ["Danh mục", "Phòng khám", "/catalog/rooms", Home, AS],
  ["Danh mục", "Bác sĩ", "/catalog/doctors", Stethoscope, AS],
  ["Danh mục", "Dịch vụ y tế", "/catalog/services", ClipboardList, AS],
  ["Danh mục", "Khung giờ", "/catalog/timeSlots", CalendarDays, AS],
  ["Danh mục", "Thiết bị y tế", "/equipment", Wrench, AS],
  [
    "Kho vật tư",
    "Tồn kho",
    "/inventory",
    Package,
    ["ADMIN", "STAFF", "DOCTOR"],
  ],
  ["Kho vật tư", "Lô hàng & Hạn dùng", "/inventory/batches", Layers, AS],
  ["Kho vật tư", "Thẻ kho", "/inventory/transactions", ClipboardList, AS],
  ["Kho vật tư", "Danh mục vật tư", "/inventory/supplies", Package, AS],
  ["Kho vật tư", "Nhóm vật tư", "/inventory/categories", Layers, AS],
  ["Kho vật tư", "Nhà cung cấp", "/inventory/suppliers", Truck, AS],
  ["Kho vật tư", "Định mức tiêu hao", "/inventory/norms", ClipboardList, A],
  ["Hệ thống", "Người dùng", "/users", Users, A],
  ["Hệ thống", "Nhật ký bảo mật", "/audit-logs", ShieldCheck, A],
  ["Hệ thống", "Thiết bị đăng nhập", "/sessions", Monitor, ALL],
  ["Hệ thống", "Tài khoản & Cài đặt", "/settings", Settings, ALL],
  ["Hệ thống", "Hướng dẫn", "/help", HelpCircle, ALL],
];
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = workspaceNav.filter((i) => i[4].includes(roleOf(user)));
  return (
    <aside className={`app-sidebar${open ? " open" : ""}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Cross size={20} />
        </div>
        <div>
          <div className="sidebar-logo-text">MediCare</div>
          <div className="sidebar-logo-sub">CLINIC WORKSPACE</div>
        </div>
        <button
          className="clinic-mobile-close"
          aria-label="Đóng menu"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {[...new Set(items.map((i) => i[0]))].map((section) => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {items
              .filter((i) => i[0] === section)
              .map(([, label, to, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? " active" : ""}`
                  }
                >
                  <span className="nav-icon">
                    <Icon size={18} />
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-nav-item w-100"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
