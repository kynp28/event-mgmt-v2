import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export interface UserPayload {
  userId: number;
  username?: string;
  avatarUrl?: string | null;
  roles: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: UserPayload | null;
  login: (userData: UserPayload) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<UserPayload>) => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    api.get('/auth/me', { signal: controller.signal })
      .then(res => {
        if (res.data?.data) {
          setUser(res.data.data);
        }
      })
      .catch((error) => {
        if (error.name !== 'CanceledError') {
          setUser(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const login = (userData: UserPayload) => {
    setUser(userData);
  };

  const logout = () => {
    api.post('/auth/logout').finally(() => {
      setUser(null);
      window.location.href = '/login';
    });
  };

  const updateUser = (updatedFields: Partial<UserPayload>) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, hasRole, isLoading }}>
      {!isLoading && children}
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

