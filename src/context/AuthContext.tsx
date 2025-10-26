import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { User, Hospital } from '../types';

interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  userType: 'patient' | 'hospital' | null;
  login: (firebaseUid: string, userData: User | Hospital, type: 'patient' | 'hospital') => Promise<void>; // Modified login
  logout: () => void;
  isAuthenticated: boolean;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [userType, setUserType] = useState<'patient' | 'hospital' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    // Try to restore user data from localStorage
    const savedUserType = localStorage.getItem('userType');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedUserType && savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        if (savedUserType === 'patient') {
          setUser(userData);
          setHospital(null);
        } else {
          setHospital(userData);
          setUser(null);
        }
        setUserType(savedUserType as 'patient' | 'hospital');
        setIsAuthenticated(true);
        console.log('Restored user data from localStorage:', userData);
      console.log('Blood group from localStorage:', userData.bloodGroup || userData.blood_group);
      } catch (error) {
        console.error('Failed to restore user data:', error);
        localStorage.clear();
      }
    }
    
    setLoadingAuth(false);
  }, []);

  const login = async (uid: string, userData: User | Hospital, type: 'patient' | 'hospital') => {
    try {
      console.log('Setting user data:', { uid, userData, type });
      console.log('Blood group in userData:', userData.bloodGroup || userData.blood_group);
      
      // Try to save to Supabase, but don't fail if it doesn't work
      try {
        if (type === 'hospital') {
          await supabase.from('hospitals').upsert({ ...userData, id: uid });
          console.log('Hospital data saved to Supabase');
        } else {
          await supabase.from('patients').upsert({ ...userData, id: uid });
          console.log('Patient data saved to Supabase');
        }
      } catch (dbError) {
        console.warn('Failed to save to Supabase, continuing with local auth:', dbError);
      }
      
      if (type === 'patient') {
        setUser(userData as User);
        setHospital(null);
      } else {
        setHospital(userData as Hospital);
        setUser(null);
      }
      setUserType(type);
      setIsAuthenticated(true);
      localStorage.setItem('userType', type);
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('Login successful');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setHospital(null);
      setUserType(null);
      setIsAuthenticated(false);
      localStorage.clear();
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hospital,
        userType,
        login,
        logout,
        isAuthenticated,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};