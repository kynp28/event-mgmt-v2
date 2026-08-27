import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserPayload {
  userId: number;
  username?: string;
  avatarUrl?: string | null;
  roles: string[];
  permissions?: string[];
  exp?: number;
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<UserPayload>) => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string): UserPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    const payload = JSON.parse(jsonPayload);

    // เช็ค JWT หมดอายุ
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('JWT token expired');
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserPayload | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      return parseJwt(savedToken);
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUser(decoded);
        // Fetch full profile (avatarUrl, latest username)
        fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.data) {
              setUser(prev => prev ? { ...prev, ...data.data } : data.data);
            }
          })
          .catch(() => {});
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<UserPayload>) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  // isAuthenticated ใช้ทั้ง token และ user เพื่อลด race condition
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated, hasRole }}>
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

