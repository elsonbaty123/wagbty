
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  users: User[];
  chefs: User[];
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  signup: (details: Partial<User> & { password: string, role: UserRole }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUserDetails: Partial<User>) => Promise<User>;
  changePassword: (passwordDetails: { newPassword; confirmPassword; }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // If firebase is not configured, do nothing.
    if (!auth || !db) {
        setUser(null);
        setAllUsers([]);
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          setUser(null); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    const fetchUsers = async () => {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setAllUsers(userList);
    };

    fetchUsers();


    return () => unsubscribe();
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
    if (!auth || !db) throw new Error("Firebase is not configured. Please add your credentials to .env.local");
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()), where('role', '==', role));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(t('auth_incorrect_credentials'));
    }

    await signInWithEmailAndPassword(auth, email, password);
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  };

  const signup = async (details: Partial<User> & { password: string, role: UserRole }): Promise<User> => {
    if (!auth || !db) throw new Error("Firebase is not configured. Please add your credentials to .env.local");
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', details.email!.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error(t('auth_email_in_use'));
    }
    
    validatePassword(details.password);

    const userCredential = await createUserWithEmailAndPassword(auth, details.email!, details.password);
    const firebaseUser = userCredential.user;

    const newUser: Omit<User, 'id'> = {
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
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), newUser);
    const userWithId = { ...newUser, id: firebaseUser.uid };
    setUser(userWithId);
    
    return userWithId;
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    router.push('/');
  };
  
  const updateUser = async (updatedUserDetails: Partial<User>): Promise<User> => {
    if (!auth || !db) throw new Error("Firebase is not configured. Please add your credentials to .env.local");
    if (!user) throw new Error(t("auth_must_be_logged_in_to_update"));

    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, updatedUserDetails);
    
    const updatedUser = { ...user, ...updatedUserDetails };
    setUser(updatedUser);
    
    return updatedUser;
  };

  const changePassword = async ({ newPassword, confirmPassword }: { newPassword: string; confirmPassword: string; }) => {
    if (!auth?.currentUser) throw new Error(t("auth_must_be_logged_in_to_change_password"));
    if (newPassword !== confirmPassword) throw new Error(t("auth_passwords_do_not_match"));
  
    validatePassword(newPassword);

    try {
        await updatePassword(auth.currentUser, newPassword);
    } catch(error: any) {
        console.error(error);
        throw new Error(t('password_change_failed_toast_desc'));
    }
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    if (!auth) throw new Error("Firebase is not configured. Please add your credentials to .env.local");
    await firebaseSendPasswordResetEmail(auth, email);
  };

  const chefs = users.filter(u => u.role === 'chef');

  return (
    <AuthContext.Provider value={{ user, users, chefs, login, signup, logout, updateUser, changePassword, sendPasswordResetEmail, loading }}>
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
