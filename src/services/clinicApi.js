import apiClient from "./apiClient.js";
import { collectPages, normalize, resourcePaths, toPayload, unwrap } from "./apiHelpers.js";
const base = "/api/v1";
const get = (path, params) => apiClient.get(base + path, { params }).then(unwrap);
export const clinicApi = {
  register: (data) => apiClient.post(`${base}/auth/register`, data).then(unwrap),
  async list(resource, { publicOnly = false } = {}) {
    const path = resourcePaths[resource];
    if (!path) throw new Error("Swagger chưa cung cấp API cho chức năng này.");
    const data = resource === "specialties" && publicOnly ? await get("/specialties/active")
      : await collectPages((page) => get(path, { page, size: 100 }), resource === "services" ? 0 : 1);
    return data.map((row) => normalize(resource, row));
  },
  async save(resource, values) {
    const path = resourcePaths[resource];
    const creating = !values.id;
    const payload = toPayload(resource, values, creating);
    const response = creating ? await apiClient.post(base + path, payload)
      : await apiClient.put(`${base}${path}/${encodeURIComponent(values.id)}`, payload);
    return normalize(resource, unwrap(response));
  },
  async status(resource, row) {
    if (!["specialties", "rooms", "services", "doctors", "users"].includes(resource))
      throw new Error("Chức năng này chưa có API đổi trạng thái.");
    const suffix = resource === "doctors" ? "availability" : "status";
    const payload = resource === "doctors" ? { isAvailable: !row.isActive } : { isActive: !row.isActive };
    return normalize(resource, unwrap(await apiClient.patch(
      `${base}${resourcePaths[resource]}/${encodeURIComponent(row.id)}/${suffix}`, payload)));
  },
  delete: (resource, id) => {
    if (!["specialties", "rooms", "timeSlots", "users"].includes(resource))
      throw new Error("Swagger chưa cung cấp API xóa mục này.");
    return apiClient.delete(`${base}${resourcePaths[resource]}/${encodeURIComponent(id)}`).then(unwrap);
  },
  profile: () => get("/users/profile"),
  updateProfile: (data) => apiClient.put(`${base}/users/profile`, data).then(unwrap),
  changePassword: (data) => apiClient.patch(`${base}/users/change-password`, data).then(unwrap),
  resetPassword: (id, data) => apiClient.patch(`${base}/users/${encodeURIComponent(id)}/reset-password`, data).then(unwrap),
  myDoctorProfile: () => get("/doctor-profiles/me").then((row) => normalize("doctors", row)),
  updateMyDoctorProfile: (data) => apiClient.patch(`${base}/doctor-profiles/me`, data).then(unwrap),
};
