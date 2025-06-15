import { API_CONFIG } from '../config/api';

// Backend AI Service Interface
interface BackendAIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

interface WorkoutPlan {
  [key: string]: {
    exercises: {
      name: string;
      sets: number;
      reps: number;
      restTime?: string;
      equipment?: string;
    }[];
    duration: string;
    warmup: string[];
    cooldown: string[];
  };
}

interface DietPlan {
  breakfast: {
    time: string;
    foods: string[];
    calories: number;
  };
  lunch: {
    time: string;
    foods: string[];
    calories: number;
  };
  dinner: {
    time: string;
    foods: string[];
    calories: number;
  };
  snacks: string[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  dailyCalories: number;
  tips: string[];
}

class BackendAIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BACKEND_URL;
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Use relative URL to leverage Vite proxy
    const url = `/api/ai${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorResult = await response.json();
          errorMessage = errorResult.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result: BackendAIResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Request failed');
      }

      if (!result.data) {
        throw new Error('No data received from server');
      }

      return result.data;
    } catch (error) {
      console.error('Network error:', error);
      
      // Handle specific fetch errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running on port 5000.');
      }
      
      throw error;
    }
  }

  async generateWorkoutPlan(prompt: string): Promise<WorkoutPlan> {
    try {
      return await this.makeRequest<WorkoutPlan>('/generate-workout-plan', { prompt });
    } catch (error) {
      console.error('Error generating workout plan:', error);
      throw error;
    }
  }

  async generateDietPlan(prompt: string): Promise<DietPlan> {
    try {
      return await this.makeRequest<DietPlan>('/generate-diet-plan', { prompt });
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw error;
    }
  }

  async checkStatus(): Promise<{ openai_configured: boolean; model: string; status: string }> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`/api/ai/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result: BackendAIResponse<{ openai_configured: boolean; model: string; status: string }> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (!result.success || !result.data) {
        throw new Error('Failed to check AI service status');
      }

      return result.data;
    } catch (error) {
      console.error('Error checking AI status:', error);
      throw error;
    }
  }
}

export default BackendAIService;
export type { WorkoutPlan, DietPlan }; 