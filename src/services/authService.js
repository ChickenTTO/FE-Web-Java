import apiClient, { clearSession, setAccessToken, refreshAccessToken } from "./apiClient.js";
import { unwrap, normalizeUser } from "./apiHelpers.js";
import { getOrCreateDeviceId, getDeviceName } from "../utils/deviceInfo.js";
const USER_STORAGE_KEY = "medicare_auth_user";
export const authService = {
  async login(credentials) {
    const response = await apiClient.post("/api/v1/auth/login", {
      identifier: (credentials.identifier || credentials.username || credentials.email || "").trim(),
      password: credentials.password,
      deviceId: credentials.deviceId || getOrCreateDeviceId(),
      deviceName: credentials.deviceName || getDeviceName(),
    });
    const data = unwrap(response);
    if (!data?.accessToken || !data?.user?.id)
      throw new Error("Phản hồi đăng nhập thiếu accessToken hoặc thông tin tài khoản.");
    clearSession();
    setAccessToken(data.accessToken);
    const user = normalizeUser(data.user);
    this.setCurrentUser(user);
    return { response: data, user };
  },
  async restore() {
    await refreshAccessToken();
    const user = normalizeUser(unwrap(await apiClient.get("/api/v1/users/profile")));
    this.setCurrentUser(user);
    return user;
  },
  async logout() {
    try { await apiClient.post("/api/v1/auth/logout"); }
    finally { this.removeCurrentUser(); }
  },
  refreshToken: refreshAccessToken,
  setCurrentUser(user) { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); },
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || null; }
    catch { return null; }
  },
  removeCurrentUser() { clearSession(); localStorage.removeItem(USER_STORAGE_KEY); },
  isAuthenticated() { return !!this.getCurrentUser(); },
};
export default authService;
