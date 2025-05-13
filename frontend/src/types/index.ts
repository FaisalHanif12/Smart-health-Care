// Type definitions for the Smart Health Tracker application

// User types
export interface User {
  _id: string;
  email: string;
  userProfileComplete: boolean;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Profile types
export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  healthConditions: string[];
  goal: 'muscle_building' | 'fat_burning' | 'weight_gain' | 'general_fitness';
}

// Diet Plan types
export interface MealItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
  completed: boolean;
}

export interface DietPlan {
  dailyCalorieTarget: number;
  meals: Meal[];
  date: string;
}

// Workout Plan types
export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in minutes
  completed: boolean;
}

export interface WorkoutPlan {
  exercises: Exercise[];
  date: string;
}

// Store types
export interface StoreItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  price: number;
  image: string;
  inCart: boolean;
  purchased: boolean;
}

// Progress types
export interface ProgressData {
  startDate: string;
  currentDate: string;
  startWeight: number;
  currentWeight: number;
  goalWeight?: number;
  completedWorkouts: number;
  totalWorkouts: number;
  completedMeals: number;
  totalMeals: number;
  prediction: string;
  motivationalMessage: string;
}