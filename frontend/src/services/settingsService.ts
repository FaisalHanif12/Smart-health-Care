import { getAPIBaseURL } from '../config/api';

const API_BASE_URL = getAPIBaseURL();

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

interface UserSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    workoutReminders: boolean;
    dietReminders: boolean;
    progressUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    shareProgress: boolean;
    dataCollection: boolean;
  };
  appSettings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'es' | 'fr' | 'de';
    units: 'metric' | 'imperial';
    autoSave: boolean;
  };
}

interface AccountUpdateData {
  username?: string;
  email?: string;
  profile?: {
    name?: string;
    age?: number;
    height?: number;
    weight?: number;
    goals?: string[];
    dietaryRestrictions?: string[];
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  };
}

export const settingsService = {
  // Get user settings
  getUserSettings: async (): Promise<UserSettings> => {
    try {
      const response = await makeAuthenticatedRequest('/auth/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },

  // Update user settings
  updateUserSettings: async (settings: UserSettings): Promise<UserSettings> => {
    try {
      const response = await makeAuthenticatedRequest('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Update account information
  updateAccountInfo: async (data: AccountUpdateData): Promise<any> => {
    try {
      const response = await makeAuthenticatedRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating account info:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await makeAuthenticatedRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Export user data
  exportUserData: async (): Promise<any> => {
    try {
      const response = await makeAuthenticatedRequest('/auth/export-data');
      return response.data;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (password: string): Promise<void> => {
    try {
      await makeAuthenticatedRequest('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Clear user data (diet plans, workout plans, progress)
  clearUserData: async (): Promise<void> => {
    try {
      await makeAuthenticatedRequest('/auth/user-data', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  },

  // Send test notification
  sendTestNotification: async (type: 'email' | 'push'): Promise<void> => {
    try {
      await makeAuthenticatedRequest('/auth/test-notification', {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  // Get account statistics
  getAccountStats: async (): Promise<{
    joinDate: string;
    lastLogin: string;
    totalWorkouts: number;
    totalDaysActive: number;
    dataSize: string;
  }> => {
    try {
      const response = await makeAuthenticatedRequest('/auth/account-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching account stats:', error);
      throw error;
    }
  }
}; 