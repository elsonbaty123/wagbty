
'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import type { User, UserRole } from '@/lib/types';
import { isWhitelistedEmail } from '@/lib/whitelisted-emails';
import i18n from '@/i18n';

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

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [allUsers, setAllUsers] = React.useState<StoredUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const t = i18n.t;

  React.useEffect(() => {
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
      throw new Error(t('auth_password_requirements'));
    }
  }

  const login = async (email: string, password: string, role: UserRole): Promise<User> => {
    if (!isWhitelistedEmail(email)) {
      throw new Error(t('auth_email_not_allowed'));
    }

    const potentialUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (potentialUser && potentialUser.password === password) {
      const { password: _, ...userToLogin } = potentialUser;
      persistUser(userToLogin);
      return userToLogin;
    } else {
      throw new Error(t('auth_incorrect_credentials'));
    }
  };

  const signup = async (details: Partial<User> & { password: string, role: UserRole }): Promise<User> => {
    if (!isWhitelistedEmail(details.email!)) {
      throw new Error(t('auth_email_not_allowed'));
    }

    if (allUsers.some(u => u.email.toLowerCase() === details.email!.toLowerCase())) {
      throw new Error(t('auth_email_in_use'));
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
        bio: details.role === 'chef' ? `New chef excited to share their creations in ${details.specialty} cuisine.` : undefined,
        imageUrl: details.role === 'chef' ? `https://placehold.co/400x400.png` : `https://placehold.co/100x100.png`,
        rating: details.role === 'chef' ? 4.5 : undefined,
        availabilityStatus: details.role === 'chef' ? 'available' : undefined,
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
    if (!user) throw new Error(t("auth_must_be_logged_in_to_update"));

    if (updatedUserDetails.email && !isWhitelistedEmail(updatedUserDetails.email)) {
        throw new Error(t('auth_email_not_allowed'));
    }

    let userToUpdate: StoredUser | undefined;

    const updatedUsers = allUsers.map(u => {
      if (u.id === user.id) {
        userToUpdate = { ...u, ...updatedUserDetails };
        return userToUpdate;
      }
      return u;
    });

    if (!userToUpdate) {
      throw new Error(t("auth_user_not_found"));
    }
    
    persistAllUsers(updatedUsers);
    
    const { password, ...publicUser } = userToUpdate;
    persistUser(publicUser);
    
    return publicUser;
  };

  const changePassword = async ({ oldPassword, newPassword, confirmPassword }: { oldPassword: string; newPassword: string; confirmPassword: string; }) => {
    if (!user) throw new Error(t("auth_must_be_logged_in_to_change_password"));
    if (newPassword !== confirmPassword) throw new Error(t("auth_passwords_do_not_match"));
  
    validatePassword(newPassword);
    
    const userInDb = allUsers.find(u => u.id === user.id);
  
    if (!userInDb) throw new Error(t("auth_user_not_found"));
    if (userInDb.password !== oldPassword) throw new Error(t("auth_old_password_incorrect"));
  
    const updatedUsers = allUsers.map(u => {
      if (u.id === user.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
  
    persistAllUsers(updatedUsers);
  };
  
  const resetPassword = async (email: string, newPassword: string) => {
    if (!isWhitelistedEmail(email)) {
      throw new Error(t("auth_email_not_allowed"));
    }

    validatePassword(newPassword);
    
    const userIndex = allUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        throw new Error(t("auth_email_not_found"));
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
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
