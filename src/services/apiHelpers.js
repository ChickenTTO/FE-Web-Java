// OpenAPI contract at /api-docs.
export function unwrap(response) {
  const body = response.data;
  if (body?.success === false || Number(body?.code) >= 400)
    throw new Error(body.message || "Không thể xử lý yêu cầu.");
  return body && Object.hasOwn(body, "data") ? body.data : body;
}
export function apiError(error) {
  return error.response?.data?.message || (error.code === "ERR_NETWORK"
    ? "Không kết nối được máy chủ. Kiểm tra địa chỉ BE hoặc cấu hình CORS."
    : error.message) || "Không thể xử lý yêu cầu.";
}
export const resourcePaths = {
  specialties: "/specialties", rooms: "/examination-rooms", doctors: "/doctor-profiles",
  services: "/medical-services", timeSlots: "/time-slots", users: "/users", patients: "/patient-profile/me",
};
export function normalize(resource, row) {
  const result = { ...row, id: String(row.id) };
  if (row.userId != null) result.userId = String(row.userId);
  if (row.specialtyId != null || row.specialty?.id != null)
    result.specialtyId = String(row.specialtyId ?? row.specialty.id);
  if (resource === "rooms") Object.assign(result, { name: row.roomNumber, location: row.building });
  if (resource === "doctors") Object.assign(result, {
    name: row.user?.fullName || row.fullName || row.name || "Bác sĩ",
    userId: row.user?.id == null ? result.userId : String(row.user.id),
    qualification: row.title || "", experience: row.experienceYears ?? 0,
    description: row.biography || "", isActive: row.isAvailable !== false,
  });
  if (["users", "patients"].includes(resource)) result.name = row.fullName;
  if (resource === "users") result.role = row.role?.code || row.role?.name || row.role;
  if (resource === "patients") Object.assign(result, {
    gender: { male: "Nam", female: "Nữ", other: "Khác" }[row.gender] || row.gender,
    identityNumber: row.identityCard || "",
  });
  if (resource === "timeSlots") {
    const time = (v) => typeof v === "string" ? v.slice(0, 5)
      : v ? `${String(v.hour).padStart(2, "0")}:${String(v.minute).padStart(2, "0")}` : "";
    Object.assign(result, { startTime: time(row.startTime), endTime: time(row.endTime),
      name: row.formattedSlot || ({ morning: "Ca sáng", afternoon: "Ca chiều", evening: "Ca tối" }[row.session] || "Ca khám") });
  }
  return result;
}
export const normalizeUser = (user) => normalize("users", user);
export function toPayload(resource, values, creating = false) {
  const pick = (...keys) => Object.fromEntries(keys.filter((key) => values[key] !== undefined).map((key) => [key, values[key]]));
  switch (resource) {
    case "specialties": return pick("name", "slug", "description", "isActive");
    case "rooms": return { roomNumber: values.name, building: values.location, isActive: values.isActive };
    case "timeSlots": return pick("startTime", "endTime", "session");
    case "services": return { ...pick("name", "description", "isActive"), price: Number(values.price),
      specialtyId: values.specialtyId ? Number(values.specialtyId) : null,
      estimatedDurationMin: Number(values.estimatedDurationMin || 15) };
    case "doctors": return { ...(creating ? { userId: Number(values.userId) } : {}),
      specialtyId: Number(values.specialtyId), title: values.qualification,
      experienceYears: Number(values.experience), biography: values.description,
      consultationFee: Number(values.consultationFee), isAvailable: values.isActive };
    case "users": return { ...pick("email", "gender", "dateOfBirth", "address", "isActive"), fullName: values.name,
      roleId: { ADMIN: 1, DOCTOR: 2, STAFF: 3, PATIENT: 4 }[values.role],
      ...(creating ? pick("phone", "password") : {}) };
    default: throw new Error("Swagger chưa cung cấp API cập nhật chức năng này.");
  }
}
// Live verification: page/size work; Swagger incorrectly labels query parameters argN.
export async function collectPages(fetchPage, firstPage = 1) {
  const rows = [];
  let page = firstPage;
  for (;;) {
    const data = await fetchPage(page);
    if (Array.isArray(data)) return data;
    if (!Array.isArray(data?.items)) throw new Error("Dữ liệu danh sách từ BE không đúng định dạng.");
    rows.push(...data.items);
    if (data.last === true || data.totalPages === 0 ||
      (Number.isFinite(data.totalPages) && page - firstPage + 1 >= data.totalPages)) return rows;
    if (!data.items.length || data.pageNumber !== page || page - firstPage >= 999)
      throw new Error("BE trả phân trang không hợp lệ. Vui lòng thử lại.");
    page += 1;
  }
}
