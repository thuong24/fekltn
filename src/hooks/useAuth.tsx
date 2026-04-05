'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginPayload, LoginResponse, ApiResponse } from '../types';
import api from '../services/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<ApiResponse<LoginResponse['data']>>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AuthState;
          if (parsed.accessToken) {
            // Verify token by fetching profile
            const res = await api.get('/auth/me');
            if (res.data.success) {
              setAuthState({
                ...parsed,
                user: res.data.data,
              });
            } else {
              throw new Error('Invalid token');
            }
          }
        } catch (error) {
          console.error('Auth initialization failed', error);
          // If it's a network error (server down), maybe don't clear local storage immediately
          // but for now, we'll follow previous logic
          localStorage.removeItem('auth');
          if (pathname !== '/login') router.push('/login');
        } finally {
          setIsLoading(false);
        }
      } else {
        if (pathname !== '/login') router.push('/login');
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pathname, router]);

  const login = async (payload: LoginPayload) => {
    try {
      const res = await api.post<LoginResponse>('/auth/login', payload);
      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data.data;
        const newAuthState = { accessToken, refreshToken, user };
        setAuthState(newAuthState);
        localStorage.setItem('auth', JSON.stringify(newAuthState));
        
        // Redirect based on role
        if (user.role === 'Student') router.push('/student/dashboard');
        else if (user.role === 'Lecturer') router.push('/lecturer/dashboard');
        else if (user.role === 'TBM') router.push('/tbm/dashboard');
        
        return res.data;
      }
      throw new Error('Login failed');
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập',
      };
    }
  };

  const logout = () => {
    setAuthState({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem('auth');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
