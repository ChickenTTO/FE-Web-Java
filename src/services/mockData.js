// ============================================================
// mockData.js - Dữ liệu mẫu giả lập REST API Spring Boot
// Thay thế bằng Axios gọi thực khi Backend hoàn thiện
// ============================================================

// ------------------------------------
// 1. Danh sách Thiết bị Y tế
// ------------------------------------
export const equipmentList = [
  {
    id: 1,
    name: "Máy siêu âm Toshiba Aplio",
    code: "USG-001",
    category: "Chẩn đoán hình ảnh",
    status: "Active",
    room: "P101 - Phòng Siêu âm",
  },
  {
    id: 2,
    name: "Máy X-quang kỹ thuật số DR",
    code: "XRA-002",
    category: "Chẩn đoán hình ảnh",
    status: "Active",
    room: "P102 - Phòng X-quang",
  },
  {
    id: 3,
    name: "Máy CT Scanner 64 lát cắt",
    code: "CTS-003",
    category: "Chẩn đoán hình ảnh",
    status: "Maintenance",
    room: "P103 - Phòng CT",
  },
  {
    id: 4,
    name: "Máy MRI 1.5 Tesla",
    code: "MRI-004",
    category: "Chẩn đoán hình ảnh",
    status: "Active",
    room: "P104 - Phòng MRI",
  },
  {
    id: 5,
    name: "Monitor theo dõi bệnh nhân",
    code: "MON-005",
    category: "Theo dõi bệnh nhân",
    status: "Active",
    room: "P201 - Phòng Hồi sức",
  },
  {
    id: 6,
    name: "Máy thở ICU Draeger",
    code: "VEN-006",
    category: "Hô hấp",
    status: "Active",
    room: "P201 - Phòng Hồi sức",
  },
  {
    id: 7,
    name: "Máy điện tim 12 chuyển đạo",
    code: "ECG-007",
    category: "Tim mạch",
    status: "Maintenance",
    room: "P301 - Phòng Tim mạch",
  },
  {
    id: 8,
    name: "Máy phá rung tim AED",
    code: "AED-008",
    category: "Tim mạch",
    status: "Active",
    room: "Hành lang A",
  },
  {
    id: 9,
    name: "Bàn mổ điện đa năng",
    code: "ORT-009",
    category: "Phẫu thuật",
    status: "Active",
    room: "P401 - Phòng mổ 1",
  },
  {
    id: 10,
    name: "Máy hút dịch ngoại khoa",
    code: "SUC-010",
    category: "Phẫu thuật",
    status: "Maintenance",
    room: "P402 - Phòng mổ 2",
  },
  {
    id: 11,
    name: "Đèn mổ LED treo trần",
    code: "ORL-011",
    category: "Phẫu thuật",
    status: "Active",
    room: "P401 - Phòng mổ 1",
  },
  {
    id: 12,
    name: "Máy phân tích sinh hóa tự động",
    code: "BIO-012",
    category: "Xét nghiệm",
    status: "Active",
    room: "P501 - Khoa Xét nghiệm",
  },
];

// ------------------------------------
// 2. Danh sách Phòng Khám
// ------------------------------------
export const clinicRoomList = [
  {
    id: 1,
    name: "Phòng Nội tổng quát",
    doctor: "BS. Nguyễn Văn An",
    specialty: "Nội khoa",
    status: "Available",
    floor: "Tầng 1",
  },
  {
    id: 2,
    name: "Phòng Nhi khoa",
    doctor: "BS. Trần Thị Bình",
    specialty: "Nhi khoa",
    status: "Busy",
    floor: "Tầng 1",
  },
  {
    id: 3,
    name: "Phòng Tim mạch",
    doctor: "BS. Lê Minh Cường",
    specialty: "Tim mạch",
    status: "Available",
    floor: "Tầng 2",
  },
  {
    id: 4,
    name: "Phòng Da liễu",
    doctor: "BS. Phạm Thị Dung",
    specialty: "Da liễu",
    status: "Available",
    floor: "Tầng 2",
  },
  {
    id: 5,
    name: "Phòng Chỉnh hình – Xương khớp",
    doctor: "BS. Hoàng Văn Em",
    specialty: "Cơ – Xương – Khớp",
    status: "Busy",
    floor: "Tầng 3",
  },
  {
    id: 6,
    name: "Phòng Thần kinh",
    doctor: "BS. Vũ Thị Phương",
    specialty: "Thần kinh",
    status: "Available",
    floor: "Tầng 3",
  },
  {
    id: 7,
    name: "Phòng Tai – Mũi – Họng",
    doctor: "BS. Đặng Quang Giáp",
    specialty: "Tai Mũi Họng",
    status: "Closed",
    floor: "Tầng 1",
  },
  {
    id: 8,
    name: "Phòng Mắt",
    doctor: "BS. Ngô Thị Hương",
    specialty: "Nhãn khoa",
    status: "Available",
    floor: "Tầng 2",
  },
];

// ------------------------------------
// 3. Danh sách Phiếu Đặt Lịch Khám
// ------------------------------------
export const bookingList = [
  {
    id: 1,
    patientName: "Nguyễn Thị Lan",
    phone: "0901234567",
    date: "2026-11-10",
    time: "08:00",
    room: "Phòng Nội tổng quát",
    doctor: "BS. Nguyễn Văn An",
    status: "Confirmed",
    note: "Đau đầu, chóng mặt kéo dài",
  },
  {
    id: 2,
    patientName: "Trần Văn Bảo",
    phone: "0912345678",
    date: "2026-11-10",
    time: "09:00",
    room: "Phòng Tim mạch",
    doctor: "BS. Lê Minh Cường",
    status: "Pending",
    note: "Kiểm tra tim định kỳ",
  },
  {
    id: 3,
    patientName: "Lê Thị Mai",
    phone: "0923456789",
    date: "2026-11-11",
    time: "10:30",
    room: "Phòng Nhi khoa",
    doctor: "BS. Trần Thị Bình",
    status: "Confirmed",
    note: "Trẻ bị sốt 3 ngày",
  },
  {
    id: 4,
    patientName: "Phạm Quốc Cường",
    phone: "0934567890",
    date: "2026-11-11",
    time: "14:00",
    room: "Phòng Da liễu",
    doctor: "BS. Phạm Thị Dung",
    status: "Pending",
    note: "Nổi mẩn đỏ dị ứng",
  },
  {
    id: 5,
    patientName: "Hoàng Thị Thu",
    phone: "0945678901",
    date: "2026-11-12",
    time: "08:30",
    room: "Phòng Thần kinh",
    doctor: "BS. Vũ Thị Phương",
    status: "Cancelled",
    note: "Đau đầu mãn tính",
  },
  {
    id: 6,
    patientName: "Võ Minh Đức",
    phone: "0956789012",
    date: "2026-11-12",
    time: "11:00",
    room: "Phòng Mắt",
    doctor: "BS. Ngô Thị Hương",
    status: "Confirmed",
    note: "Khám mắt, cận thị tăng",
  },
  {
    id: 7,
    patientName: "Đinh Thị Hoa",
    phone: "0967890123",
    date: "2026-11-13",
    time: "09:30",
    room: "Phòng Chỉnh hình – Xương khớp",
    doctor: "BS. Hoàng Văn Em",
    status: "Pending",
    note: "Đau khớp gối sau chấn thương",
  },
  {
    id: 8,
    patientName: "Bùi Văn Hùng",
    phone: "0978901234",
    date: "2026-11-13",
    time: "15:00",
    room: "Phòng Nội tổng quát",
    doctor: "BS. Nguyễn Văn An",
    status: "Confirmed",
    note: "Khám tổng quát định kỳ",
  },
];

// ------------------------------------
// 4. Thống kê tổng quan Dashboard
// ------------------------------------
export const dashboardStats = {
  totalEquipment: equipmentList.length,
  activeEquipment: equipmentList.filter((e) => e.status === "Active").length,
  maintenanceEquipment: equipmentList.filter((e) => e.status === "Maintenance").length,
  totalRooms: clinicRoomList.length,
  availableRooms: clinicRoomList.filter((r) => r.status === "Available").length,
  totalBookings: bookingList.length,
  confirmedBookings: bookingList.filter((b) => b.status === "Confirmed").length,
  pendingBookings: bookingList.filter((b) => b.status === "Pending").length,
};
