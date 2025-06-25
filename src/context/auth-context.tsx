
'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'customer' | 'chef';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user database
const mockUserStore: Record<string, User & { password: string }> = {
  'jane.doe@example.com': { id: 'customer1', name: 'فلانة الفلانية', email: 'jane.doe@example.com', role: 'customer', password: 'Password123!' },
  'chef.antoine@example.com': { id: 'chef2', name: 'الشيف أنطوان', email: 'chef.antoine@example.com', role: 'chef', password: 'Password123!' },
  'chef.isabella@example.com': { id: 'chef1', name: 'الشيف إيزابيلا', email: 'chef.isabella@example.com', role: 'chef', password: 'Password123!' },
  'chef.kenji@example.com': { id: 'chef3', name: 'الشيف كينجي', email: 'chef.kenji@example.com', role: 'chef', password: 'Password123!' },
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    const potentialUser = Object.values(mockUserStore).find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (potentialUser && potentialUser.password === password) {
      const { password: _, ...userToLogin } = potentialUser;
      localStorage.setItem('user', JSON.stringify(userToLogin));
      setUser(userToLogin);
    } else {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    if (mockUserStore[email.toLowerCase()]) {
      throw new Error('هذا البريد الإلكتروني مستخدم بالفعل.');
    }
    
    const newUser: User = {
        id: `${role}-${Date.now()}`,
        name,
        email,
        role,
    };
    
    mockUserStore[email.toLowerCase()] = { ...newUser, password };
    
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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
