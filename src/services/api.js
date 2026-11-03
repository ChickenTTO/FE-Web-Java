// ============================================================
// api.js - Lớp giả lập REST API với Promise delay 300ms
// Để thay bằng Axios kết nối Spring Boot:
//   import axios from 'axios';
//   const API_BASE = 'http://localhost:8080/api';
//   export const getEquipments = () => axios.get(`${API_BASE}/equipment`).then(r => r.data);
// ============================================================

import {
  equipmentList,
  clinicRoomList,
  bookingList,
  dashboardStats,
} from "./mockData";

/** Utility: giả lập độ trễ mạng */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== THIẾT BỊ Y TẾ ====================

/**
 * Lấy toàn bộ danh sách thiết bị y tế
 * Spring Boot: GET /api/equipment
 */
export const getEquipments = async () => {
  await delay();
  return [...equipmentList];
};

/**
 * Lấy thiết bị theo ID
 * Spring Boot: GET /api/equipment/{id}
 */
export const getEquipmentById = async (id) => {
  await delay();
  const item = equipmentList.find((e) => e.id === Number(id));
  if (!item) throw new Error(`Không tìm thấy thiết bị với ID: ${id}`);
  return { ...item };
};

/**
 * Thêm thiết bị mới
 * Spring Boot: POST /api/equipment
 */
export const createEquipment = async (equipmentData) => {
  await delay();
  const newItem = {
    ...equipmentData,
    id: Date.now(),
  };
  equipmentList.push(newItem);
  return { ...newItem };
};

/**
 * Cập nhật thông tin thiết bị
 * Spring Boot: PUT /api/equipment/{id}
 */
export const updateEquipment = async (id, equipmentData) => {
  await delay();
  const index = equipmentList.findIndex((e) => e.id === Number(id));
  if (index === -1) throw new Error(`Không tìm thấy thiết bị với ID: ${id}`);
  equipmentList[index] = { ...equipmentList[index], ...equipmentData };
  return { ...equipmentList[index] };
};

/**
 * Xóa thiết bị
 * Spring Boot: DELETE /api/equipment/{id}
 */
export const deleteEquipment = async (id) => {
  await delay();
  const index = equipmentList.findIndex((e) => e.id === Number(id));
  if (index === -1) throw new Error(`Không tìm thấy thiết bị với ID: ${id}`);
  const deleted = equipmentList.splice(index, 1)[0];
  return { message: "Xóa thành công", data: deleted };
};

/**
 * Cập nhật trạng thái thiết bị (Active / Maintenance)
 * Spring Boot: PATCH /api/equipment/{id}/status
 */
export const updateEquipmentStatus = async (id, status) => {
  await delay();
  return updateEquipment(id, { status });
};

// ==================== PHÒNG KHÁM ====================

/**
 * Lấy toàn bộ danh sách phòng khám
 * Spring Boot: GET /api/clinic-rooms
 */
export const getClinicRooms = async () => {
  await delay();
  return [...clinicRoomList];
};

/**
 * Lấy phòng khám theo ID
 * Spring Boot: GET /api/clinic-rooms/{id}
 */
export const getClinicRoomById = async (id) => {
  await delay();
  const room = clinicRoomList.find((r) => r.id === Number(id));
  if (!room) throw new Error(`Không tìm thấy phòng khám với ID: ${id}`);
  return { ...room };
};

/**
 * Cập nhật trạng thái phòng khám
 * Spring Boot: PATCH /api/clinic-rooms/{id}/status
 */
export const updateClinicRoomStatus = async (id, status) => {
  await delay();
  const index = clinicRoomList.findIndex((r) => r.id === Number(id));
  if (index === -1) throw new Error(`Không tìm thấy phòng khám với ID: ${id}`);
  clinicRoomList[index] = { ...clinicRoomList[index], status };
  return { ...clinicRoomList[index] };
};

// ==================== LỊCH ĐẶT KHÁM ====================

/**
 * Lấy toàn bộ danh sách phiếu đặt lịch
 * Spring Boot: GET /api/bookings
 */
export const getBookings = async () => {
  await delay();
  return [...bookingList];
};

/**
 * Lấy phiếu đặt lịch theo ID
 * Spring Boot: GET /api/bookings/{id}
 */
export const getBookingById = async (id) => {
  await delay();
  const booking = bookingList.find((b) => b.id === Number(id));
  if (!booking) throw new Error(`Không tìm thấy phiếu đặt lịch với ID: ${id}`);
  return { ...booking };
};

/**
 * Tạo phiếu đặt lịch khám mới
 * Spring Boot: POST /api/bookings
 */
export const createBooking = async (bookingData) => {
  await delay();
  const newBooking = {
    ...bookingData,
    id: Date.now(),
    status: "Pending",
  };
  bookingList.push(newBooking);
  return { ...newBooking };
};

/**
 * Cập nhật trạng thái phiếu đặt lịch
 * Spring Boot: PATCH /api/bookings/{id}/status
 */
export const updateBookingStatus = async (id, status) => {
  await delay();
  const index = bookingList.findIndex((b) => b.id === Number(id));
  if (index === -1) throw new Error(`Không tìm thấy phiếu đặt lịch với ID: ${id}`);
  bookingList[index] = { ...bookingList[index], status };
  return { ...bookingList[index] };
};

/**
 * Hủy phiếu đặt lịch
 * Spring Boot: DELETE /api/bookings/{id}
 */
export const cancelBooking = async (id) => {
  await delay();
  return updateBookingStatus(id, "Cancelled");
};

// ==================== DASHBOARD ====================

/**
 * Lấy thống kê tổng quan dashboard
 * Spring Boot: GET /api/dashboard/stats
 */
export const getDashboardStats = async () => {
  await delay();
  // Tính lại realtime từ dữ liệu hiện tại
  return {
    totalEquipment: equipmentList.length,
    activeEquipment: equipmentList.filter((e) => e.status === "Active").length,
    maintenanceEquipment: equipmentList.filter((e) => e.status === "Maintenance").length,
    totalRooms: clinicRoomList.length,
    availableRooms: clinicRoomList.filter((r) => r.status === "Available").length,
    totalBookings: bookingList.length,
    confirmedBookings: bookingList.filter((b) => b.status === "Confirmed").length,
    pendingBookings: bookingList.filter((b) => b.status === "Pending").length,
    cancelledBookings: bookingList.filter((b) => b.status === "Cancelled").length,
  };
};
