
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { LoggedInUser } from '../types';
import { api } from '../services/mockApi';

interface AuthContextType {
  user: LoggedInUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to check storage
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from storage", e);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.login(email, password);

      console.log(userData)



      if (userData) {
        setUser(userData);
         
        return true;
      } else {
        setError("Invalid email or password.");
        return false;
      }
    } catch (e: any) {
      console.error("Login failed:", e);
      setError(e.message || "An unexpected error occurred during login.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

// console.log(user)


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
