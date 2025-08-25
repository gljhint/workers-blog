'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    admin: null,
    loading: true,
  });
  const router = useRouter();

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      });
      
      const result = await response.json() as { success: boolean, data: { authenticated: boolean, admin: Admin } };
      
      if (result.success && result.data.authenticated) {
        setAuthState({
          isAuthenticated: true,
          admin: result.data.admin,
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          admin: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        admin: null,
        loading: false,
      });
    }
  };

  // 登出
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setAuthState({
        isAuthenticated: false,
        admin: null,
        loading: false,
      });
      
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 需要认证的页面重定向
  const requireAuth = (redirectPath?: string) => {
    if (!authState.loading && !authState.isAuthenticated) {
      const currentPath = window.location.pathname;
      const loginUrl = redirectPath 
        ? `/admin/login?redirect=${encodeURIComponent(redirectPath)}`
        : `/admin/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return false;
    }
    return authState.isAuthenticated;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...authState,
    checkAuth,
    logout,
    requireAuth,
  };
}