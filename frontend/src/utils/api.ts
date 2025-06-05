const API_BASE_URL = 'http://localhost:5000/api';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
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