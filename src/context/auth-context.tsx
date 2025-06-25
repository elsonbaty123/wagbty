
'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';

type StoredUser = User & { password: string };

interface AuthContextType {
  user: User | null;
  users: User[];
  chefs: User[];
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  signup: (details: Partial<User> & { password: string, role: UserRole }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUserDetails: Partial<User>) => Promise<User>;
  changePassword: (passwordDetails: { oldPassword; newPassword; confirmPassword; }) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('chefconnect_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedUsers = localStorage.getItem('chefconnect_users');
       if (storedUsers) {
        setAllUsers(JSON.parse(storedUsers));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('chefconnect_user');
      localStorage.removeItem('chefconnect_users');
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = (userToPersist: User | null) => {
    setUser(userToPersist);
    if (userToPersist) {
      localStorage.setItem('chefconnect_user', JSON.stringify(userToPersist));
    } else {
      localStorage.removeItem('chefconnect_user');
    }
  }

  const persistAllUsers = (usersToPersist: StoredUser[]) => {
    setAllUsers(usersToPersist);
    localStorage.setItem('chefconnect_users', JSON.stringify(usersToPersist));
  }
  
  const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length > 7;
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol || !isLongEnough) {
      throw new Error("كلمة المرور يجب أن تحتوي على ٨ أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز.");
    }
  }

  const login = async (email: string, password: string, role: UserRole): Promise<User> => {
    const potentialUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (potentialUser && potentialUser.password === password) {
      const { password: _, ...userToLogin } = potentialUser;
      persistUser(userToLogin);
      return userToLogin;
    } else {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  const signup = async (details: Partial<User> & { password: string, role: UserRole }): Promise<User> => {
    if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase())) {
      throw new Error('هذا البريد الإلكتروني مستخدم بالفعل.');
    }
    
    validatePassword(details.password);

    const newUser: User = {
        id: `${details.role}-${Date.now()}`,
        name: details.name!,
        email: details.email!,
        role: details.role,
        phone: details.phone,
        address: details.role === 'customer' ? details.address : undefined,
        specialty: details.specialty,
        bio: details.role === 'chef' ? `شيف جديد متحمس لمشاركة إبداعاته في المطبخ ${details.specialty}.` : undefined,
        imageUrl: details.role === 'chef' ? `https://placehold.co/400x400.png` : `https://placehold.co/100x100.png`,
        rating: details.role === 'chef' ? 4.5 : undefined,
    };
    
    persistAllUsers([...allUsers, { ...newUser, password: details.password }]);
    persistUser(newUser);
    return newUser;
  };

  const logout = () => {
    persistUser(null);
    router.push('/');
  };
  
  const updateUser = async (updatedUserDetails: Partial<User>): Promise<User> => {
    if (!user) throw new Error("يجب تسجيل الدخول لتحديث الملف الشخصي.");

    let userToUpdate: StoredUser | undefined;

    const updatedUsers = allUsers.map(u => {
      if (u.id === user.id) {
        userToUpdate = { ...u, ...updatedUserDetails };
        return userToUpdate;
      }
      return u;
    });

    if (!userToUpdate) {
      throw new Error("لم يتم العثور على المستخدم.");
    }
    
    persistAllUsers(updatedUsers);
    
    const { password, ...publicUser } = userToUpdate;
    persistUser(publicUser);
    
    return publicUser;
  };

  const changePassword = async ({ oldPassword, newPassword, confirmPassword }: { oldPassword: string; newPassword: string; confirmPassword: string; }) => {
    if (!user) throw new Error("يجب تسجيل الدخول لتغيير كلمة المرور.");
    if (newPassword !== confirmPassword) throw new Error("كلمتا المرور الجديدتان غير متطابقتين.");
  
    validatePassword(newPassword);
    
    const userInDb = allUsers.find(u => u.id === user.id);
  
    if (!userInDb) throw new Error("لم يتم العثور على المستخدم.");
    if (userInDb.password !== oldPassword) throw new Error("كلمة المرور القديمة غير صحيحة.");
  
    const updatedUsers = allUsers.map(u => {
      if (u.id === user.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
  
    persistAllUsers(updatedUsers);
  };
  
  const resetPassword = async (email: string, newPassword: string) => {
    validatePassword(newPassword);
    
    const userIndex = allUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        throw new Error("البريد الإلكتروني غير موجود.");
    }
    
    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
    
    persistAllUsers(updatedUsers);
  };

  const publicUsers = allUsers.map(({ password, ...user }) => user);
  const chefs = publicUsers.filter(u => u.role === 'chef');

  return (
    <AuthContext.Provider value={{ user, users: publicUsers, chefs, login, signup, logout, updateUser, changePassword, resetPassword, loading }}>
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
