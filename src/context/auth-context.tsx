
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { initialUsers, DEFAULT_CHEF_AVATAR, DEFAULT_CUSTOMER_AVATAR } from '@/lib/data';
import localforage from 'localforage';
import bcrypt from 'bcryptjs';
import { useToast } from '@/hooks/use-toast';

// Extend User type for local storage to include hashed password
type StoredUser = User & { hashedPassword?: string };

interface AuthContextType {
  user: User | null;
  users: User[];
  chefs: User[];
  login: (identifier: string, password: string, role: UserRole) => Promise<User>;
  signup: (details: Partial<User> & { password: string, role: UserRole }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUserDetails: Partial<User>) => Promise<User>;
  changePassword: (passwordDetails: { currentPassword; newPassword; confirmPassword; }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>; // Mocked
  toggleFavoriteDish: (dishId: string) => Promise<void>;
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
  const { toast } = useToast();

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

  const login = async (identifier: string, password: string, role: UserRole): Promise<User> => {
    const isEmail = identifier.includes('@');
    
    const targetUser = isEmail
        ? users.find(u => u.email.toLowerCase() === identifier.toLowerCase() && u.role === role)
        : users.find(u => u.phone === identifier && u.role === role);

    if (!targetUser || !targetUser.hashedPassword) {
      throw new Error(t('auth_identifier_not_found', 'رقم الهاتف أو البريد الإلكتروني غير مسجل.'));
    }

    const isMatch = await bcrypt.compare(password, targetUser.hashedPassword);
    if (!isMatch) {
      throw new Error(t('auth_incorrect_password', 'كلمة المرور غير صحيحة.'));
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

    if (details.phone) {
        const phoneExists = users.some(u => u.phone && u.phone === details.phone);
        if (phoneExists) {
            throw new Error(t('auth_phone_in_use', 'هذا الرقم مسجل بالفعل، الرجاء تسجيل الدخول أو استخدام رقم آخر.'));
        }
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
        imageUrl: details.imageUrl || (details.role === 'chef' ? DEFAULT_CHEF_AVATAR : DEFAULT_CUSTOMER_AVATAR),
        availabilityStatus: details.role === 'chef' ? 'available' : undefined,
        favoriteDishIds: details.role === 'customer' ? [] : undefined,
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
  
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex === -1) throw new Error("User not found");
  
      const currentUserState = users[userIndex];
      // Create a new object to avoid direct mutation
      const updatedStoredUser: StoredUser = { ...currentUserState, ...updatedUserDetails };
  
      // Explicitly handle removal of optional keys like 'status'
      if ('status' in updatedUserDetails && updatedUserDetails.status === undefined) {
          delete updatedStoredUser.status;
      }
  
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedStoredUser;
  
      setAllUsers(updatedUsers);
      await localforage.setItem('users', updatedUsers);
      
      const { hashedPassword, ...userToSet } = updatedStoredUser;
      setUser(userToSet);
      
      return userToSet;
  };

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }: { currentPassword: string; newPassword: string; confirmPassword: string; }) => {
    if (!user) throw new Error(t("auth_must_be_logged_in_to_change_password"));

    const storedUser = users.find(u => u.id === user.id);
    if (!storedUser || !storedUser.hashedPassword) {
      throw new Error(t("user_not_found"));
    }

    const isMatch = await bcrypt.compare(currentPassword, storedUser.hashedPassword);
    if (!isMatch) {
      throw new Error(t('auth_incorrect_current_password'));
    }

    if (newPassword !== confirmPassword) throw new Error(t("auth_passwords_do_not_match"));
  
    validatePassword(newPassword);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const updatedStoredUser = { ...storedUser, hashedPassword };
    const updatedUsers = users.map(u => u.id === user.id ? updatedStoredUser : u);

    setAllUsers(updatedUsers);
    await localforage.setItem('users', updatedUsers);
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    // This is a mock implementation for local storage mode.
    console.warn(`Password reset for ${email} is not available in local storage mode.`);
    return Promise.resolve();
  };

  const toggleFavoriteDish = async (dishId: string) => {
    if (!user || user.role !== 'customer') {
      toast({
        variant: 'destructive',
        title: t('login_required'),
        description: t('must_be_customer_to_favorite'),
      });
      return;
    }

    const currentFavorites = user.favoriteDishIds || [];
    const isFavorited = currentFavorites.includes(dishId);

    const newFavorites = isFavorited
      ? currentFavorites.filter(id => id !== dishId)
      : [...currentFavorites, dishId];

    await updateUser({ favoriteDishIds: newFavorites });
    
    toast({
      title: isFavorited ? t('removed_from_favorites') : t('added_to_favorites'),
    });
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
    <AuthContext.Provider value={{ user, users: publicUsers, chefs, login, signup, logout, updateUser, changePassword, sendPasswordResetEmail, toggleFavoriteDish, loading }}>
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
