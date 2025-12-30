import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, isTokenValid, clearAuthData, setAuthData } from '../utils/api';
import type { User } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  updateDetails: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && isTokenValid() && storedUser) {
          // Token exists and is valid, verify with backend
                    try {
            const response = await authAPI.getMe();
            if (response.data) {
              setUser(response.data);
              setIsAuthenticated(true);
              
              // Update stored user data
              localStorage.setItem('user', JSON.stringify(response.data));
              
              // Check if profile is complete
              const hasProfile = response.data.profile && 
                response.data.profile.age && 
                response.data.profile.gender && 
                response.data.profile.height && 
                response.data.profile.weight && 
                response.data.profile.fitnessGoal;
              
              if (hasProfile) {
                localStorage.setItem('userProfileComplete', 'true');
              } else {
                localStorage.removeItem('userProfileComplete');
              }
            }
          } catch (error) {
            // Token is invalid or expired
            console.error('Token validation failed:', error);
            clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No valid token
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data && response.token) {
        setAuthData(response.token, response.data);
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Check if profile is complete
        const hasProfile = response.data.profile && 
          response.data.profile.age && 
          response.data.profile.gender && 
          response.data.profile.height && 
          response.data.profile.weight && 
          response.data.profile.fitnessGoal;
          
        if (hasProfile) {
          localStorage.setItem('userProfileComplete', 'true');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      const response = await authAPI.register({ username, email, password });
      
      if (response.success && response.data && response.token) {
        setAuthData(response.token, response.data);
        setUser(response.data);
        setIsAuthenticated(true);
        
        // New users won't have complete profiles
        localStorage.removeItem('userProfileComplete');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if backend call fails
    } finally {
      // DO NOT clear user-specific data like plans and progress - these should persist!
      // Only clear session-related data and general auth data
      
      // Clear general auth data only
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData: any): Promise<void> => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Check if profile is now complete
        const hasProfile = response.data.profile && 
          response.data.profile.age && 
          response.data.profile.gender && 
          response.data.profile.height && 
          response.data.profile.weight && 
          response.data.profile.fitnessGoal;
          
        if (hasProfile) {
          localStorage.setItem('userProfileComplete', 'true');
        }
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updateDetails = async (userData: any): Promise<void> => {
    try {
      const response = await authAPI.updateDetails(userData);
      
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        throw new Error(response.message || 'Details update failed');
      }
    } catch (error) {
      console.error('Details update error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might need to login again
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateDetails,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 