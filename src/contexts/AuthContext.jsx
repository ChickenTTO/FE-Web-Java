import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Khi component mount, kiểm tra phiên đăng nhập đã lưu
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    // Lắng nghe sự kiện phiên đăng nhập hết hạn từ apiClient (khi refresh-token thất bại)
    const handleSessionExpired = () => {
      authService.removeCurrentUser();
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (identifierOrCreds, password) => {
    const creds =
      typeof identifierOrCreds === 'object' && identifierOrCreds !== null
        ? identifierOrCreds
        : { identifier: identifierOrCreds, password };

    const result = await authService.login(creds);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
