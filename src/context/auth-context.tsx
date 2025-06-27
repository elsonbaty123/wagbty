
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { initialUsers } from '@/lib/data';
import localforage from 'localforage';
import bcrypt from 'bcryptjs';

// Extend User type for local storage to include hashed password
type StoredUser = User & { hashedPassword?: string };

interface AuthContextType {
  user: User | null;
  users: User[];
  chefs: User[];
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  signup: (details: Partial<User> & { password: string, role: UserRole }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUserDetails: Partial<User>) => Promise<User>;
  changePassword: (passwordDetails: { newPassword; confirmPassword; }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>; // Mocked
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure localforage
localforage.config({
    name: 'chefConnect',
    storeName: 'app_data',
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setAllUsers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 1. Fetch users from local storage or seed if empty
        let storedUsers: StoredUser[] | null = await localforage.getItem('users');
        if (!storedUsers || storedUsers.length === 0) {
            storedUsers = initialUsers;
            await localforage.setItem('users', storedUsers);
        }
        setAllUsers(storedUsers);

        // 2. Check for a logged-in user session
        const currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
            const currentUser = storedUsers.find(u => u.id === currentUserId);
            if(currentUser) {
                const { hashedPassword, ...userToSet } = currentUser;
                setUser(userToSet);
            } else {
                localStorage.removeItem('currentUserId');
            }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length > 7;
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol || !isLongEnough) {
      throw new Error(t('auth_password_requirements'));
    }
  }

  const login = async (email: string, password: string, role: UserRole): Promise<User> => {
    const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

    if (!targetUser || !targetUser.hashedPassword) {
      throw new Error(t('auth_incorrect_credentials'));
    }

    const isMatch = await bcrypt.compare(password, targetUser.hashedPassword);
    if (!isMatch) {
      throw new Error(t('auth_incorrect_credentials'));
    }
    
    const { hashedPassword, ...userToSet } = targetUser;
    setUser(userToSet);
    localStorage.setItem('currentUserId', userToSet.id);
    return userToSet;
  };

  const signup = async (details: Partial<User> & { password: string, role: UserRole }): Promise<User> => {
    const emailExists = users.some(u => u.email.toLowerCase() === details.email!.toLowerCase());
    if (emailExists) {
        throw new Error(t('auth_email_in_use'));
    }
    
    validatePassword(details.password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(details.password, salt);
    
    const newUserId = `user_${Date.now()}`;
    const newUser: StoredUser = {
        id: newUserId,
        name: details.name!,
        email: details.email!,
        role: details.role,
        phone: details.phone,
        address: details.role === 'customer' ? details.address : undefined,
        specialty: details.specialty,
        bio: details.role === 'chef' ? t('new_chef_bio', { specialty: details.specialty }) : undefined,
        imageUrl: details.role === 'chef' ? `https://placehold.co/400x400.png` : `https://placehold.co/100x100.png`,
        rating: details.role === 'chef' ? 4.5 : undefined,
        availabilityStatus: details.role === 'chef' ? 'available' : undefined,
        hashedPassword: hashedPassword
    };
    
    const updatedUsers = [...users, newUser];
    setAllUsers(updatedUsers);
    await localforage.setItem('users', updatedUsers);

    const { hashedPassword: _, ...userToSet } = newUser;
    setUser(userToSet);
    localStorage.setItem('currentUserId', userToSet.id);
    
    return userToSet;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
    router.push('/');
  };
  
  const updateUser = async (updatedUserDetails: Partial<User>): Promise<User> => {
    if (!user) throw new Error(t("auth_must_be_logged_in_to_update"));

    const updatedUser: User = { ...user, ...updatedUserDetails };
    const updatedStoredUser: StoredUser = { 
        ...users.find(u => u.id === user.id)!, 
        ...updatedUserDetails 
    };

    const updatedUsers = users.map(u => u.id === user.id ? updatedStoredUser : u);
    setAllUsers(updatedUsers);
    await localforage.setItem('users', updatedUsers);
    
    setUser(updatedUser);
    
    return updatedUser;
  };

  const changePassword = async ({ newPassword, confirmPassword }: { newPassword: string; confirmPassword: string; }) => {
    if (!user) throw new Error(t("auth_must_be_logged_in_to_change_password"));
    if (newPassword !== confirmPassword) throw new Error(t("auth_passwords_do_not_match"));
  
    validatePassword(newPassword);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const userToUpdate = users.find(u => u.id === user.id);
    if (!userToUpdate) throw new Error("User not found");

    const updatedStoredUser = { ...userToUpdate, hashedPassword };
    const updatedUsers = users.map(u => u.id === user.id ? updatedStoredUser : u);

    setAllUsers(updatedUsers);
    await localforage.setItem('users', updatedUsers);
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    // This is a mock implementation for local storage mode.
    console.warn(`Password reset for ${email} is not available in local storage mode.`);
    return Promise.resolve();
  };

  const chefs = users.filter(u => u.role === 'chef').map(u => {
    const { hashedPassword, ...rest } = u;
    return rest;
  });
  
  const publicUsers = users.map(u => {
    const { hashedPassword, ...rest } = u;
    return rest;
  });


  return (
    <AuthContext.Provider value={{ user, users: publicUsers, chefs, login, signup, logout, updateUser, changePassword, sendPasswordResetEmail, loading }}>
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
