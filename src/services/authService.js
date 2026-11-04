import apiClient from './apiClient';
import { getOrCreateDeviceId, getDeviceName } from '../utils/deviceInfo';

const USER_STORAGE_KEY = 'medicare_auth_user';

export const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - { identifier, password, deviceId?, deviceName? }
   * Backend sẽ tự động tiêm HttpOnly cookies accessToken & refreshToken
   */
  async login(credentials) {
    const identifier = (credentials.identifier || credentials.username || credentials.email || '').trim();
    const deviceId = credentials.deviceId || getOrCreateDeviceId();
    const deviceName = credentials.deviceName || getDeviceName();

    const payload = {
      identifier,
      password: credentials.password,
      deviceId,
      deviceName,
    };

    const response = await apiClient.post('/api/v1/auth/login', payload);
    const data = response.data;

    // Trích xuất thông tin user từ response (nếu backend trả về)
    const userData = data?.user || data?.data?.user || data?.data || {
      username: identifier,
      role: data?.role || 'ADMIN',
    };

    // Lưu thông tin người dùng cơ bản vào localStorage (không lưu token vì đã có trong cookie)
    this.setCurrentUser(userData);

    return { response: data, user: userData };
  },

  /**
   * Đăng xuất người dùng
   * Backend sẽ xóa cookie accessToken và refreshToken
   */
  async logout() {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (err) {
      console.warn('Lỗi khi gọi API logout từ BE:', err?.message || err);
    } finally {
      this.removeCurrentUser();
    }
  },

  /**
   * Làm mới accessToken bằng refreshToken có trong cookies
   */
  async refreshToken() {
    const response = await apiClient.post('/api/v1/auth/refresh-token');
    return response.data;
  },

  /**
   * Lưu thông tin người dùng vào localStorage
   */
  setCurrentUser(user) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Không thể lưu thông tin user vào localStorage', e);
    }
  },

  /**
   * Lấy thông tin người dùng từ localStorage
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Lỗi đọc thông tin user từ localStorage', e);
      return null;
    }
  },

  /**
   * Xóa thông tin người dùng khỏi localStorage
   */
  removeCurrentUser() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Lỗi xóa user khỏi localStorage', e);
    }
  },

  /**
   * Kiểm tra xem user có đang trong phiên đăng nhập (dựa trên stored user)
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};

export default authService;
