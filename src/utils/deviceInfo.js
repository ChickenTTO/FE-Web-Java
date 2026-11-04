/**
 * Tiện ích lấy hoặc khởi tạo Device ID và Device Name phục vụ xác thực thiết bị
 */

const DEVICE_ID_KEY = 'medicare_device_id';

/**
 * Lấy deviceId duy nhất của trình duyệt / thiết bị hiện tại (lưu trong localStorage)
 * Nếu chưa có, tự động sinh UUID v4 mới và lưu lại.
 */
export function getOrCreateDeviceId() {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = 'dev-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
      }
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (e) {
    console.warn('Không thể truy cập localStorage để lấy deviceId:', e);
    return 'dev-browser-temp';
  }
}

/**
 * Lấy tên thiết bị / trình duyệt thân thiện (ví dụ: "Chrome on Windows 10/11", "Edge on Windows", v.v.)
 */
export function getDeviceName() {
  if (typeof navigator === 'undefined') return 'Web Browser';

  const userAgent = navigator.userAgent || '';
  let browser = 'Web Browser';
  let os = 'Unknown OS';

  // Nhận diện Hệ điều hành
  if (/Windows NT 10.0/i.test(userAgent)) {
    os = 'Windows';
  } else if (/Windows NT/i.test(userAgent)) {
    os = 'Windows';
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    os = 'macOS';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
  }

  // Nhận diện Trình duyệt
  if (/Edg\//i.test(userAgent)) {
    browser = 'Edge';
  } else if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox\//i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    browser = 'Safari';
  } else if (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent)) {
    browser = 'Opera';
  }

  return `${browser} on ${os}`;
}

