
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { isWhitelistedEmail } from '@/lib/whitelisted-emails';
import { useTranslation } from 'react-i18next';
import * as bcrypt from 'bcryptjs';

type StoredUser = User & { hashedPassword: string };

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
  const { t } = useTranslation();

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

    if (potentialUser) {
        const isHash = potentialUser.hashedPassword.startsWith('$2a$') || potentialUser.hashedPassword.startsWith('$2b$');
        const isMatch = isHash
            ? await bcrypt.compare(password, potentialUser.hashedPassword)
            : potentialUser.hashedPassword === password;
        
        if (isMatch) {
            const { hashedPassword: _, ...userToLogin } = potentialUser;
            persistUser(userToLogin);
            
            // If the password was plain text, hash it now for future logins
            if(!isHash) {
                const saltRounds = 10;
                const newHashedPassword = await bcrypt.hash(password, saltRounds);
                const updatedUsers = allUsers.map(u => u.id === potentialUser.id ? { ...potentialUser, hashedPassword: newHashedPassword } : u);
                persistAllUsers(updatedUsers);
            }

            return userToLogin;
        }
    }

    throw new Error(t('auth_incorrect_credentials'));
  };

  const signup = async (details: Partial<User> & { password: string, role: UserRole }): Promise<User> => {
    if (!isWhitelistedEmail(details.email!)) {
      throw new Error(t('auth_email_not_allowed'));
    }

    if (allUsers.some(u => u.email.toLowerCase() === details.email!.toLowerCase())) {
      throw new Error(t('auth_email_in_use'));
    }
    
    validatePassword(details.password);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(details.password, saltRounds);

    const newUser: User = {
        id: `${details.role}-${Date.now()}`,
        name: details.name!,
        email: details.email!,
        role: details.role,
        phone: details.phone,
        address: details.role === 'customer' ? details.address : undefined,
        specialty: details.specialty,
        bio: t('new_chef_bio', { specialty: details.specialty }),
        imageUrl: details.role === 'chef' ? `https://placehold.co/400x400.png` : `https://placehold.co/100x100.png`,
        rating: details.role === 'chef' ? 4.5 : undefined,
        availabilityStatus: details.role === 'chef' ? 'available' : undefined,
    };
    
    persistAllUsers([...allUsers, { ...newUser, hashedPassword }]);
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
        // Create a temporary object to find the user, but don't include password details in the update from this function
        const tempUser = { ...u, ...updatedUserDetails };
        // Exclude password from the public user details object
        const { hashedPassword, ...publicDetails } = tempUser;
        userToUpdate = { ...u, ...publicDetails };
        return userToUpdate;
      }
      return u;
    });

    if (!userToUpdate) {
      throw new Error(t("auth_user_not_found"));
    }
    
    persistAllUsers(updatedUsers);
    
    const { hashedPassword, ...publicUser } = userToUpdate;
    persistUser(publicUser);
    
    return publicUser;
  };

  const changePassword = async ({ oldPassword, newPassword, confirmPassword }: { oldPassword: string; newPassword: string; confirmPassword: string; }) => {
    if (!user) throw new Error(t("auth_must_be_logged_in_to_change_password"));
    if (newPassword !== confirmPassword) throw new Error(t("auth_passwords_do_not_match"));
  
    const userInDb = allUsers.find(u => u.id === user.id);
  
    if (!userInDb) throw new Error(t("auth_user_not_found"));
    
    const isHash = userInDb.hashedPassword.startsWith('$2a$') || userInDb.hashedPassword.startsWith('$2b$');
    const isOldPasswordMatch = isHash
        ? await bcrypt.compare(oldPassword, userInDb.hashedPassword)
        : userInDb.hashedPassword === oldPassword;

    if (!isOldPasswordMatch) throw new Error(t("auth_old_password_incorrect"));
  
    validatePassword(newPassword);

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
    const updatedUsers = allUsers.map(u => {
      if (u.id === user.id) {
        return { ...u, hashedPassword: newHashedPassword };
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
    
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const userIndex = allUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        throw new Error(t("auth_email_not_found"));
    }
    
    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], hashedPassword: newHashedPassword };
    
    persistAllUsers(updatedUsers);
  };

  const publicUsers = allUsers.map(({ hashedPassword, ...user }) => user);
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
