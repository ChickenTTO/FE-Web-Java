import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceName } from '../utils/deviceInfo';
import { Cross, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Laptop } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentDeviceName = getDeviceName();

  // Lấy đường dẫn trước đó mà user định truy cập, hoặc mặc định về /admin
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tài khoản đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
      // Đăng nhập thành công, chuyển hướng người dùng
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.status === 401
          ? 'Tài khoản hoặc mật khẩu không chính xác.'
          : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại dịch vụ Backend.');
      setErrorMessage(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e2eafc 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          maxWidth: '440px',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Card Header with Brand */}
        <div
          className="text-white text-center py-4 px-4"
          style={{
            background: 'linear-gradient(135deg, #1a6fdb 0%, #0fa37f 100%)',
          }}
        >
          <div
            className="mx-auto mb-2 d-flex align-items-center justify-content-center"
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Cross size={26} color="#fff" strokeWidth={2.5} />
          </div>
          <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>
            MediCare Portal
          </h3>
          <p className="mb-0 text-white-50" style={{ fontSize: '0.875rem' }}>
            Đăng nhập hệ thống quản lý bệnh viện & thiết bị y tế
          </p>
        </div>

        {/* Card Body */}
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold mb-0 text-dark">Đăng nhập tài khoản</h5>
            <Link
              to="/"
              className="text-decoration-none d-flex align-items-center gap-1 text-muted"
              style={{ fontSize: '0.8rem' }}
            >
              <ArrowLeft size={14} /> Trang chủ
            </Link>
          </div>

          {errorMessage && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 border-0"
              role="alert"
              style={{ borderRadius: '8px', fontSize: '0.875rem' }}
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Identifier Field (username/email/phone) */}
            <div className="mb-3">
              <label
                htmlFor="identifier"
                className="form-label fw-semibold text-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Tên đăng nhập / Email
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  className="form-control bg-light border-start-0"
                  placeholder="Nhập tên đăng nhập hoặc email..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label
                htmlFor="password"
                className="form-label fw-semibold text-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Mật khẩu
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-control bg-light border-start-0 border-end-0"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="btn btn-light border border-start-0 text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Device Info & Remember Me */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="form-check-label text-muted"
                  htmlFor="rememberMe"
                  style={{ fontSize: '0.85rem' }}
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <span
                className="text-muted d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem' }}
                title={`Thiết bị: ${currentDeviceName}`}
              >
                <Laptop size={13} color="#1a6fdb" />
                <span className="text-truncate" style={{ maxWidth: '120px' }}>{currentDeviceName}</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1a6fdb, #1355b0)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(26,111,219,0.3)',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div
            className="mt-4 p-2 bg-light rounded text-center text-muted d-flex align-items-center justify-content-center gap-1"
            style={{ fontSize: '0.75rem', border: '1px dashed #d0d7de' }}
          >
            <ShieldCheck size={14} color="#0fa37f" />
            <span>Phiên làm việc bảo mật tự động bằng Token Cookies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
