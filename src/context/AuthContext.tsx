import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  usersList: User[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchUser: (targetUser: User) => void;
  switchRole: (role: UserRole) => void;
  refreshUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUsers = async () => {
    try {
      const users = await api.getUsers();
      setUsersList(users);
      return users;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const fetchedUsers = await refreshUsers();

      // Check saved user in localStorage
      const savedUserStr = localStorage.getItem('bj3_user');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          setUser(parsed);
        } catch {
          localStorage.removeItem('bj3_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    setUser(res.user);
    localStorage.setItem('bj3_user', JSON.stringify(res.user));
    if (res.token) {
      localStorage.setItem('bj3_token', res.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bj3_user');
    localStorage.removeItem('bj3_token');
  };

  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    localStorage.setItem('bj3_user', JSON.stringify(targetUser));
  };

  const switchRole = (role: UserRole) => {
    const matched = usersList.find((u) => u.role === role);
    if (matched) {
      switchUser(matched);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        usersList,
        login,
        logout,
        switchUser,
        switchRole,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
