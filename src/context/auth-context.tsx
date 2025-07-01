
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CHEF_AVATAR, DEFAULT_CUSTOMER_AVATAR, DEFAULT_ADMIN_AVATAR, DEFAULT_DELIVERY_AVATAR } from '@/lib/data';
import * as db from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  users: User[];
  chefs: User[];
  deliveryUsers: User[];
  login: (identifier: string, password: string, role: UserRole) => Promise<User>;
  signup: (details: Partial<User> & { password: string, role: UserRole }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUserDetails: Partial<User>) => Promise<User>;
  updateUserByAdmin: (userId: string, updatedUserDetails: Partial<User>) => Promise<User>;
  changePassword: (passwordDetails: { currentPassword; newPassword; confirmPassword; }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>; // Mocked
  toggleFavoriteDish: (dishId: string) => Promise<void>;
  deleteUser: (userIdToDelete: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedUsers = await db.getUsers();
        setAllUsers(storedUsers);

        const currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
            const currentUser = storedUsers.find(u => u.id === currentUserId);
            if(currentUser) {
                setUser(currentUser);
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

  const refreshUsers = async () => {
      const updatedUsers = await db.getUsers();
      setAllUsers(updatedUsers);
      return updatedUsers;
  }

  const login = async (identifier: string, password: string, role: UserRole): Promise<User> => {
    const loggedInUser = await db.loginUser(identifier, password, role);

    if (loggedInUser.accountStatus === 'pending_approval') {
        throw new Error(t('auth_account_pending', 'حسابك قيد المراجعة. ستتلقى إشعارًا عند الموافقة عليه.'));
    }
    if (loggedInUser.accountStatus === 'rejected') {
        throw new Error(t('auth_account_rejected', 'تم رفض طلب انضمامك. يرجى التواصل مع الإدارة لمزيد من المعلومات.'));
    }
    
    setUser(loggedInUser);
    localStorage.setItem('currentUserId', loggedInUser.id);
    await refreshUsers();
    return loggedInUser;
  };

  const signup = async (details: Partial<User> & { password: string, role: UserRole }): Promise<User> => {
    const signedUpUser = await db.signupUser(details);
    
    if (signedUpUser.accountStatus === 'active') {
        setUser(signedUpUser);
        localStorage.setItem('currentUserId', signedUpUser.id);
    }
    await refreshUsers();
    return signedUpUser;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
    router.push('/');
  };
  
  const updateUser = async (updatedUserDetails: Partial<User>): Promise<User> => {
      if (!user) throw new Error(t("auth_must_be_logged_in_to_update"));
      const updatedUser = await db.updateUser(user.id, updatedUserDetails);
      setUser(updatedUser);
      await refreshUsers();
      return updatedUser;
  };

  const updateUserByAdmin = async (userId: string, updatedUserDetails: Partial<User>): Promise<User> => {
      if (!user || user.role !== 'admin') throw new Error(t("auth_admin_only_action"));
      const updatedUser = await db.updateUser(userId, updatedUserDetails);
      await refreshUsers();
      return updatedUser;
  };

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }: { currentPassword: string; newPassword: string; confirmPassword: string; }) => {
    if (!user) throw new Error(t("auth_must_be_logged_in_to_change_password"));
    await db.changeUserPassword(user.id, { currentPassword, newPassword, confirmPassword });
    await refreshUsers();
  };
  
  const sendPasswordResetEmail = async (email: string) => {
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
  
  const deleteUser = async (userIdToDelete: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error("Only admins can delete users.");
    }
    if (user.id === userIdToDelete) {
      throw new Error("Admin cannot delete their own account.");
    }
    await db.deleteUser(userIdToDelete);
    await refreshUsers();
  };

  const chefs = users.filter(u => u.role === 'chef');
  const deliveryUsers = users.filter(u => u.role === 'delivery');
  
  return (
    <AuthContext.Provider value={{ user, users, chefs, deliveryUsers, login, signup, logout, updateUser, updateUserByAdmin, changePassword, sendPasswordResetEmail, toggleFavoriteDish, deleteUser, loading }}>
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
