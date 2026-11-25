import axios from "axios";
import { unwrap } from "./apiHelpers.js";
const config = {
  baseURL: import.meta.env?.VITE_API_BASE_URL || "",
  withCredentials: true, timeout: 20000,
  headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
};
export const apiClient = axios.create(config);
const refreshClient = axios.create(config);
let accessToken = null;
let refreshing = null;
let sessionVersion = 0;
export function setAccessToken(token) { accessToken = token || null; }
export function clearSession() { sessionVersion += 1; accessToken = null; }
export function hasAccessToken() { return Boolean(accessToken); }
// Access tokens stay in memory; the BE stores refresh tokens in HttpOnly cookies.
export function refreshAccessToken() {
  if (!refreshing) {
    const version = sessionVersion;
    refreshing = refreshClient.post("/api/v1/auth/refresh-token").then((response) => {
      const data = unwrap(response);
      if (version !== sessionVersion) throw new Error("Phiên đăng nhập đã thay đổi.");
      if (!data?.accessToken) throw new Error("BE không trả accessToken khi làm mới phiên.");
      setAccessToken(data.accessToken);
      return data;
    }).finally(() => { refreshing = null; });
  }
  return refreshing;
}
apiClient.interceptors.request.use((request) => {
  request._sessionVersion ??= sessionVersion;
  if (accessToken) request.headers.Authorization = `Bearer ${accessToken}`;
  return request;
});
apiClient.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  if (error.response?.status !== 401 || !request || request._sessionVersion !== sessionVersion ||
    /\/auth\/(login|register|refresh-token|logout)(?:\?|$)/.test(request.url || "") ||
    !request.headers?.Authorization) throw error;
  const expire = () => {
    if (request._sessionVersion !== sessionVersion) return;
    clearSession();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth:session-expired"));
  };
  if (request._retry) { expire(); throw error; }
  request._retry = true;
  try {
    if (request.headers.Authorization === `Bearer ${accessToken}`) await refreshAccessToken();
  } catch (refreshError) {
    expire();
    throw refreshError;
  }
  return apiClient(request);
});
export default apiClient;
