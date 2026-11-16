// Local adapter for UI development. Never use this data as an authorization source.
export const DEMO_MODE = import.meta.env?.VITE_DEMO_MODE !== "false";
export const clinicDate = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
export const today = () => clinicDate();
export const dateAfter = (days) => {
  const d = new Date(`${today()}T12:00:00+07:00`);
  return clinicDate(new Date(d.getTime() + days * 86400000));
};
export const money = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n) || 0,
  );
export const dateVN = (s) =>
  s ? new Date(`${s.slice(0, 10)}T12:00:00`).toLocaleDateString("vi-VN") : "—";
export const roleOf = (user) => {
  const r = user?.role || user?.roles?.[0];
  return String(
    typeof r === "object" ? r?.name || r?.authority : r || "PATIENT",
  ).replace("ROLE_", "");
};
export const homeFor = (user) =>
  ({
    PATIENT: "/my-appointments",
    DOCTOR: "/consultations",
    STAFF: "/appointments",
    ADMIN: "/admin",
  })[roleOf(user)] || "/";
export const uid = () => crypto.randomUUID();
export const code = (prefix) =>
  `${prefix}-${today().replaceAll("-", "").slice(2)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
export function initialClinic() {
  return {
    specialties: [
      {
        id: "sp1",
        name: "Nội tổng quát",
        description: "Khám và chăm sóc sức khỏe toàn diện",
        isActive: true,
      },
      {
        id: "sp2",
        name: "Nhi khoa",
        description: "Chăm sóc sức khỏe trẻ em",
        isActive: true,
      },
      {
        id: "sp3",
        name: "Tai Mũi Họng",
        description: "Chẩn đoán và điều trị chuyên sâu",
        isActive: true,
      },
    ],
    rooms: [
      {
        id: "r1",
        name: "P.201",
        location: "Tầng 2 · Khu A",
        specialtyId: "sp1",
        isActive: true,
      },
      {
        id: "r2",
        name: "P.202",
        location: "Tầng 2 · Khu A",
        specialtyId: "sp2",
        isActive: true,
      },
      {
        id: "r3",
        name: "P.301",
        location: "Tầng 3 · Khu B",
        specialtyId: "sp3",
        isActive: true,
      },
    ],
    doctors: [
      {
        id: "d1",
        userId: "demo-doctor",
        name: "BS. Nguyễn Minh Anh",
        specialtyId: "sp1",
        qualification: "Bác sĩ chuyên khoa II",
        experience: 12,
        description: "Thăm khám nội khoa, quản lý bệnh mạn tính.",
        isActive: true,
      },
      {
        id: "d2",
        name: "BS. Trần Thu Hà",
        specialtyId: "sp2",
        qualification: "Thạc sĩ · Bác sĩ",
        experience: 9,
        description: "Tư vấn dinh dưỡng và chăm sóc trẻ em.",
        isActive: true,
      },
      {
        id: "d3",
        name: "BS. Lê Hoàng Nam",
        specialtyId: "sp3",
        qualification: "Bác sĩ chuyên khoa I",
        experience: 10,
        description: "Chẩn đoán và điều trị bệnh Tai Mũi Họng.",
        isActive: true,
      },
    ],
    services: [
      {
        id: "sv1",
        name: "Khám nội tổng quát",
        specialtyId: "sp1",
        price: 250000,
        description: "Khám lâm sàng và tư vấn sức khỏe",
        isActive: true,
      },
      {
        id: "sv2",
        name: "Khám nhi khoa",
        specialtyId: "sp2",
        price: 300000,
        description: "Thăm khám và theo dõi phát triển",
        isActive: true,
      },
      {
        id: "sv3",
        name: "Khám Tai Mũi Họng",
        specialtyId: "sp3",
        price: 350000,
        description: "Thăm khám chuyên khoa",
        isActive: true,
      },
    ],
    timeSlots: [
      { id: "t1", name: "Ca sáng", startTime: "08:00", endTime: "11:30" },
      { id: "t2", name: "Ca chiều", startTime: "13:30", endTime: "17:00" },
      { id: "t3", name: "Ca tối", startTime: "17:30", endTime: "20:00" },
    ],
    schedules: Array.from({ length: 7 }, (_, i) =>
      [1, 2, 3].map((n) => ({
        id: `sc${i}-${n}`,
        doctorId: `d${n}`,
        roomId: `r${n}`,
        timeSlotId: "t1",
        workDate: dateAfter(i),
        maxPatients: 15,
        status: "available",
      })),
    ).flat(),
    patients: [
      {
        id: "p1",
        userId: "demo-patient",
        name: "Nguyễn Hoàng An",
        phone: "0901234567",
        dateOfBirth: "1995-04-12",
        gender: "Nam",
        relationship: "Bản thân",
        identityNumber: "",
        insuranceNumber: "",
        address: "TP. Hồ Chí Minh",
        medicalHistory: "Dị ứng penicillin",
      },
      {
        id: "p2",
        userId: "demo-patient",
        name: "Nguyễn Minh Khang",
        phone: "0901234567",
        dateOfBirth: "2020-06-18",
        gender: "Nam",
        relationship: "Con",
        medicalHistory: "Chưa ghi nhận",
      },
    ],
    appointments: [
      {
        id: "a1",
        appointmentCode: code("APT"),
        patientId: "p1",
        scheduleId: "sc0-1",
        serviceId: "sv1",
        status: "pending",
        queueNumber: 1,
        note: "Khám sức khỏe định kỳ",
        logs: [
          {
            status: "pending",
            at: new Date().toISOString(),
            note: "Tạo lịch hẹn",
          },
        ],
      },
      {
        id: "a2",
        appointmentCode: code("APT"),
        patientId: "p2",
        scheduleId: "sc0-2",
        serviceId: "sv2",
        status: "confirmed",
        queueNumber: 1,
        note: "Tái khám",
        logs: [
          {
            status: "confirmed",
            at: new Date().toISOString(),
            note: "Lễ tân xác nhận",
          },
        ],
      },
    ],
    payments: [],
    categories: [
      { id: "c1", name: "Vật tư tiêu hao", parentId: "" },
      { id: "c2", name: "Bảo hộ y tế", parentId: "c1" },
    ],
    suppliers: [
      {
        id: "sup1",
        name: "Công ty Y tế An Khang",
        phone: "02838220000",
        email: "contact@ankhang.example",
        address: "TP. Hồ Chí Minh",
        isActive: true,
      },
    ],
    supplies: [
      {
        id: "s1",
        sku: "VT-GANG-M",
        name: "Găng tay y tế size M",
        categoryId: "c2",
        unit: "Đôi",
        minStockLevel: 50,
      },
      {
        id: "s2",
        sku: "VT-BONG",
        name: "Bông y tế vô trùng",
        categoryId: "c1",
        unit: "Gói",
        minStockLevel: 30,
      },
      {
        id: "s3",
        sku: "VT-KHAUTRANG",
        name: "Khẩu trang y tế",
        categoryId: "c2",
        unit: "Cái",
        minStockLevel: 100,
      },
    ],
    batches: [
      {
        id: "b1",
        supplyId: "s1",
        supplierId: "sup1",
        batchNumber: "LOT-GT-001",
        expirationDate: dateAfter(20),
        receivedAt: today(),
        initialQuantity: 100,
        remainingQuantity: 100,
        importPrice: 2500,
        status: "active",
      },
      {
        id: "b2",
        supplyId: "s1",
        supplierId: "sup1",
        batchNumber: "LOT-GT-002",
        expirationDate: dateAfter(180),
        receivedAt: today(),
        initialQuantity: 200,
        remainingQuantity: 200,
        importPrice: 2600,
        status: "active",
      },
      {
        id: "b3",
        supplyId: "s2",
        supplierId: "sup1",
        batchNumber: "LOT-B-001",
        expirationDate: dateAfter(120),
        receivedAt: today(),
        initialQuantity: 20,
        remainingQuantity: 20,
        importPrice: 10000,
        status: "active",
      },
      {
        id: "b4",
        supplyId: "s3",
        supplierId: "sup1",
        batchNumber: "LOT-KT-001",
        expirationDate: dateAfter(-2),
        receivedAt: dateAfter(-180),
        initialQuantity: 50,
        remainingQuantity: 50,
        importPrice: 1000,
        status: "expired",
      },
    ],
    transactions: [],
    norms: [
      { id: "n1", serviceId: "sv1", supplyId: "s1", quantity: 2 },
      { id: "n2", serviceId: "sv2", supplyId: "s1", quantity: 1 },
      { id: "n3", serviceId: "sv3", supplyId: "s2", quantity: 1 },
    ],
    users: [
      {
        id: "demo-admin",
        name: "Quản trị MediCare",
        email: "admin@medicare.example",
        phone: "0900000001",
        role: "ADMIN",
        isActive: true,
      },
      {
        id: "demo-doctor",
        name: "BS. Nguyễn Minh Anh",
        email: "doctor@medicare.example",
        phone: "0900000002",
        role: "DOCTOR",
        isActive: true,
      },
      {
        id: "demo-staff",
        name: "Lễ tân MediCare",
        email: "staff@medicare.example",
        phone: "0900000003",
        role: "STAFF",
        isActive: true,
      },
      {
        id: "demo-patient",
        name: "Nguyễn Hoàng An",
        email: "patient@medicare.example",
        phone: "0901234567",
        role: "PATIENT",
        isActive: true,
      },
    ],
    sessions: [],
    auditLogs: [],
  };
}
export function stock(db, id) {
  return db.batches
    .filter(
      (b) =>
        b.supplyId === id &&
        b.status === "active" &&
        b.expirationDate > today(),
    )
    .reduce((s, b) => s + Number(b.remainingQuantity), 0);
}
export function allocate(db, supplyId, quantity, type, reference) {
  if (!(quantity > 0)) throw new Error("Số lượng phải lớn hơn 0.");
  if (stock(db, supplyId) < quantity)
    throw new Error("INSUFFICIENT_STOCK · Không đủ tồn kho khả dụng.");
  let remaining = quantity;
  const result = [];
  db.batches
    .filter(
      (b) =>
        b.supplyId === supplyId &&
        b.status === "active" &&
        b.expirationDate > today() &&
        b.remainingQuantity > 0,
    )
    .sort(
      (a, b) =>
        a.expirationDate.localeCompare(b.expirationDate) ||
        a.receivedAt.localeCompare(b.receivedAt),
    )
    .forEach((b) => {
      if (!remaining) return;
      const taken = Math.min(remaining, Number(b.remainingQuantity));
      b.remainingQuantity -= taken;
      remaining -= taken;
      if (!b.remainingQuantity) b.status = "depleted";
      const row = {
        id: uid(),
        transactionCode: code(type === "USAGE" ? "TH" : "XK"),
        transactionType: type,
        supplyId,
        batchId: b.id,
        quantity: -taken,
        reference,
        at: new Date().toISOString(),
      };
      db.transactions.unshift(row);
      result.push(row);
    });
  return result;
}
