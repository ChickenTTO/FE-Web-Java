import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceName } from '../utils/deviceInfo';
import { useClinic } from '../contexts/ClinicContext';
import { DEMO_MODE, homeFor, uid, dateAfter } from '../services/clinicStore';
import { Cross, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Laptop } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo } = useAuth();
  const { db, commit } = useClinic();

  const demo = (role) => {
    const profile = db.users.find(u => u.id === `demo-${role.toLowerCase()}`);
    const sessionId = uid();
    commit(n => {
      n.sessions.push({id:sessionId,userId:profile.id,deviceName:currentDeviceName,lastUsedAt:new Date().toISOString(),expiresAt:dateAfter(7),isRevoked:false});
      n.auditLogs.unshift({id:uid(),userName:profile.name,action:'LOGIN_SUCCESS',at:new Date().toISOString(),reason:'Đăng nhập xem thử'});
    }, 'Đã mở phiên xem thử.');
    const u = loginDemo({...profile,sessionId});
    navigate(homeFor(u), {replace:true});
  };

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentDeviceName = getDeviceName();

  // Lấy đường dẫn trước đó mà user định truy cập, hoặc mặc định về /admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tài khoản đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      // Đăng nhập thành công, chuyển hướng người dùng
      navigate(location.state?.from?.pathname || homeFor(result.user), { replace: true });
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error || error.message ||
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
        background: '#e5e5e5',
        padding: '1.5rem',
      }}
    >
      <div
        className="card border-0"
        style={{
          maxWidth: '440px',
          width: '100%',
          borderRadius: '32px',
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Card Header with Brand */}
        <div
          className="text-white text-center py-4 px-4"
          style={{
            background: 'var(--color-primary-blue)',
          }}
        >
          <div
            className="mx-auto mb-2 d-flex align-items-center justify-content-center"
            style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              background: '#ffffff',
            }}
          >
            <Cross size={26} color="var(--color-primary-blue)" strokeWidth={2.5} />
          </div>
          <h3 className="heading-title mb-1" style={{ fontSize: 28, lineHeight: 1.1 }}>
            MediCare Portal
          </h3>
          <p className="mb-0" style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>
            Đăng nhập hệ thống quản lý bệnh viện & thiết bị y tế
          </p>
        </div>

        {/* Card Body */}
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="heading-title mb-0" style={{ fontSize: 20, color: 'var(--color-primary-blue)' }}>Đăng nhập tài khoản</h5>
            <Link
              to="/"
              className="text-decoration-none d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem', color: '#444444' }}
            >
              <ArrowLeft size={14} /> Trang chủ
            </Link>
          </div>

          {errorMessage && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 border-0"
              role="alert"
              style={{ borderRadius: '16px', fontSize: '0.875rem' }}
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          {location.state?.registered && <p role="status">Đăng ký thành công. Vui lòng đăng nhập.</p>}
          <form onSubmit={handleSubmit}>
            {/* Identifier Field (username/email/phone) */}
            <div className="mb-3">
              <label
                htmlFor="identifier"
                className="form-label text-secondary"
              >
                Tên đăng nhập / Email
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border-end-0"
                  style={{ background: '#ffffff', border: '1.5px solid #c6c6c6', color: '#444444' }}
                >
                  <User size={18} />
                </span>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  className="form-control border-start-0"
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
                className="form-label text-secondary"
              >
                Mật khẩu
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border-end-0"
                  style={{ background: '#ffffff', border: '1.5px solid #c6c6c6', color: '#444444' }}
                >
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-control border-start-0 border-end-0"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="btn btn-light border border-start-0"
                  style={{ background: '#ffffff', border: '1.5px solid #c6c6c6', color: '#444444' }}
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
                <Laptop size={13} color="var(--color-primary-blue)" />
                <span className="text-truncate" style={{ maxWidth: '120px' }}>{currentDeviceName}</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
              style={{
                borderRadius: '8px',
                boxShadow: 'none',
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

          <p className="mt-3 text-center">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
          {DEMO_MODE && <div className="clinic-demo-login"><div className="mono-label mb-2">XEM THỬ GIAO DIỆN</div><p className="small">Dữ liệu mẫu trên trình duyệt, không cần kết nối BE.</p><div className="clinic-demo-grid">{[['PATIENT','Bệnh nhân'],['DOCTOR','Bác sĩ'],['STAFF','Lễ tân / Kho'],['ADMIN','Quản trị viên']].map(([r,label])=><button type="button" key={r} className="btn btn-light" onClick={()=>demo(r)}>{label}</button>)}</div></div>}
          {/* Security Note */}
          <div
            className="mt-4 p-2 text-center text-muted d-flex align-items-center justify-content-center gap-1"
            style={{ fontSize: '0.75rem', background: '#f3f3f3', borderRadius: '16px', border: 0 }}
          >
            <ShieldCheck size={14} color="var(--color-primary-blue)" />
            <span>Phiên làm việc bảo mật tự động bằng Token Cookies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
