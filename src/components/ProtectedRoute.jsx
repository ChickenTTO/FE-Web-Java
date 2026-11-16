import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roleOf, homeFor } from '../services/clinicStore';

export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Điều hướng đến trang login và lưu vị trí hiện tại để quay lại sau khi đăng nhập thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(roleOf(user))) return <Navigate to={homeFor(user)} replace />;
  return children ? children : <Outlet />;
}

