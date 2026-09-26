import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '../api';

type User = {
  id: string;
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  login: (user: User, permissions: string[]) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApi('/auth/me', { credentials: 'include' })
      .then((data) => {
        setUser(data.user);
        setPermissions(data.permissions);
      })
      .catch(() => {
        setUser(null);
        setPermissions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (userData: User, perms: string[]) => {
    setUser(userData);
    setPermissions(perms);
  };

  const logout = async () => {
    await fetchApi('/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
    setPermissions([]);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, permissions, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
