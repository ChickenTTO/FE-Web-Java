import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { DEMO_MODE } from '../services/clinicStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const currentUser = authService.getCurrentUser();
    if (currentUser?.isDemo && DEMO_MODE) {
      setUser(currentUser);
      setIsLoading(false);
    } else if (!DEMO_MODE && currentUser && !currentUser.isDemo) {
      authService.restore().then((restored) => {
        if (active) setUser(restored);
      }).catch(() => {
        if (active) { authService.removeCurrentUser(); setUser(null); }
      }).finally(() => { if (active) setIsLoading(false); });
    } else {
      if (currentUser) authService.removeCurrentUser();
      setIsLoading(false);
    }

    // Lắng nghe sự kiện phiên đăng nhập hết hạn từ apiClient (khi refresh-token thất bại)
    const handleSessionExpired = () => {
      authService.removeCurrentUser();
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      active = false;
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
    try {
      if (user?.isDemo) authService.removeCurrentUser();
      else await authService.logout();
    } finally { setUser(null); }
  };

  const loginDemo = (profile) => {
    if (!DEMO_MODE) throw new Error('Chế độ xem thử đã tắt.');
    const demoUser = { ...profile, fullName: profile.fullName || profile.name, isDemo: true };
    authService.setCurrentUser(demoUser);
    setUser(demoUser);
    return demoUser;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginDemo,
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
