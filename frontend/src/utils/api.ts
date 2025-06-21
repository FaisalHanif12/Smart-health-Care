import { getAPIBaseURL } from '../config/api';

const API_BASE_URL = getAPIBaseURL();

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  resetInfo?: {
    email?: string;
    expiresIn?: string;
  };
}

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    healthConditions?: string[];
    fitnessGoal?: string;
    profileImage?: string;
  };
  isEmailVerified: boolean;
  isActive: boolean;
  role: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  bmi?: string;
}

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        } catch (parseError) {
          // If we can't parse the error response, provide a generic message
          if (response.status === 400) {
            throw new Error('Invalid registration data. Please check your information and try again.');
          } else if (response.status === 409) {
            throw new Error('An account with this email already exists. Please try logging in instead.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Registration failed. Please try again.');
          }
        }
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors (server not reachable, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      // Re-throw other errors (including our custom ones)
      throw error;
    }
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        } catch (parseError) {
          // If we can't parse the error response, provide a generic message
          if (response.status === 404) {
            throw new Error('No account found with this email address. Please register first or check your email.');
          } else if (response.status === 401) {
            throw new Error('Incorrect password. Please check your password and try again.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Login failed. Please check your credentials.');
          }
        }
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors (server not reachable, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      // Re-throw other errors (including our custom ones)
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    return response.json();
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user data');
    }

    return response.json();
  },

  // Update user profile
  updateProfile: async (profileData: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    healthConditions?: string[];
    fitnessGoal?: string;
    profileImage?: string;
  }): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/updateprofile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },

  // Update user details (username, email)
  updateDetails: async (userData: {
    username?: string;
    email?: string;
  }): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/updatedetails`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update details');
    }

    return response.json();
  },

  // Update password
  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/updatepassword`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }

    return response.json();
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgotpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send reset email');
    }

    return response.json();
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/resetpassword/${token}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    return response.json();
  },
};

// Utility functions
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('userProfileComplete');
};

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
  
  // Check if user has completed profile
  const hasProfile = user.profile && 
    user.profile.age && 
    user.profile.gender && 
    user.profile.height && 
    user.profile.weight && 
    user.profile.fitnessGoal;
    
  if (hasProfile) {
    localStorage.setItem('userProfileComplete', 'true');
  }
}; 