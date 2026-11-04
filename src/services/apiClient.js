import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

// Khởi tạo instance axios với withCredentials: true để tự động gửi & nhận cookie (accessToken, refreshToken)
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Tự động bắt lỗi 401 để gọi refresh-token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua nếu không có response hoặc response status khác 401
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô tận nếu chính endpoint login hoặc refresh-token bị 401
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    // Nếu request đã thử retry rồi mà vẫn lỗi thì reject
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu đang trong quá trình refresh token, đưa request hiện tại vào hàng đợi chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Backend tự đọc refreshToken từ cookie và trả về cookie accessToken mới
      await apiClient.post('/api/v1/auth/refresh-token');

      // Giải phóng hàng đợi và retry các request đang chờ
      processQueue(null);

      // Retry request ban đầu
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Bắn event để AuthContext / App nhận biết phiên đăng nhập đã hết hạn
      window.dispatchEvent(new CustomEvent('auth:session-expired'));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;

