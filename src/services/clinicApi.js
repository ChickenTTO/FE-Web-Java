import apiClient from "./apiClient";
// API boundary for the next integration step. Local UI currently uses ClinicContext.
// Only routes explicitly defined by the supplied BE specification are listed here.
const base = "/api/v1";
const unwrap = (response) => {
  if (response.data?.success === false)
    throw new Error(response.data.message || "Không thể xử lý yêu cầu.");
  return response.data?.data ?? response.data;
};
const get = (path, params) =>
  apiClient.get(base + path, { params }).then(unwrap);
const post = (path, data) => apiClient.post(base + path, data).then(unwrap);
const put = (path, data) => apiClient.put(base + path, data).then(unwrap);
export const clinicApi = {
  register: (data) => post("/auth/register", data),
  sessions: () => get("/auth/sessions"),
  revokeSession: (id) =>
    apiClient
      .delete(`${base}/auth/sessions/${encodeURIComponent(id)}`)
      .then(unwrap),
  myProfiles: () => get("/patient-profiles/my"),
  createProfile: (data) => post("/patient-profiles", data),
  updateProfile: (id, data) =>
    put(`/patient-profiles/${encodeURIComponent(id)}`, data),
  specialties: () => get("/specialties"),
  services: (params) => get("/services", params),
  doctors: (params) => get("/doctors", params),
  doctorSchedules: (id, params) =>
    get(`/doctors/${encodeURIComponent(id)}/schedules`, params),
  createSchedules: (data) => post("/schedules/batch", data),
  appointments: (params) => get("/appointments", params),
  createAppointment: (data) => post("/appointments", data),
  updateAppointmentStatus: (id, data) =>
    apiClient
      .patch(`${base}/appointments/${encodeURIComponent(id)}/status`, data)
      .then(unwrap),
  completeAppointment: (id, data) =>
    post(`/appointments/${encodeURIComponent(id)}/complete`, data),
  createPayment: (data) => post("/payments", data),
  supplies: (params) => get("/inventory/supplies", params),
  createSupply: (data) => post("/inventory/supplies", data),
  expiringBatches: (params) => get("/inventory/batches/expiring", params),
  importInventory: (data) => post("/inventory/import", data),
  exportToRoom: (data) => post("/inventory/export-room", data),
  adjustInventory: (data) => post("/inventory/adjust", data),
  transactions: (params) => get("/inventory/transactions", params),
};
