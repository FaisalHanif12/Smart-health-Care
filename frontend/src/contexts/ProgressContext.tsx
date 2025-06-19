import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface DietProgress {
  date: string;
  completedMeals: number;
  totalMeals: number;
  caloriesConsumed: number;
  targetCalories: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatsConsumed: number;
}

interface WorkoutProgress {
  weekStart: string;
  completedWorkouts: number;
  totalWorkouts: number;
  completedExercises: number;
  totalExercises: number;
  workoutDays: {
    [key: string]: {
      completed: boolean;
      completedExercises: number;
      totalExercises: number;
    };
  };
}

interface ProgressContextType {
  dietProgress: DietProgress;
  workoutProgress: WorkoutProgress;
  updateDietProgress: (meals: any[]) => void;
  updateWorkoutProgress: (workoutPlan: any[]) => void;
  getTodaysDietProgress: () => number;
  getWeeklyWorkoutProgress: () => number;
  getCaloriesConsumed: () => number;
  getCompletedWorkoutsThisWeek: () => number;
  resetDailyProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  const [dietProgress, setDietProgress] = useState<DietProgress>({
    date: new Date().toDateString(),
    completedMeals: 0,
    totalMeals: 0,
    caloriesConsumed: 0,
    targetCalories: 2000,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatsConsumed: 0,
  });

  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress>({
    weekStart: getWeekStart(new Date()).toDateString(),
    completedWorkouts: 0,
    totalWorkouts: 0,
    completedExercises: 0,
    totalExercises: 0,
    workoutDays: {},
  });

  // Get the start of the current week (Monday)
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Load progress from localStorage on mount and sync with actual plans
  useEffect(() => {
    if (user?._id) {
      const savedDietProgress = localStorage.getItem(`dietProgress_${user._id}`);
      const savedWorkoutProgress = localStorage.getItem(`workoutProgress_${user._id}`);
      
      if (savedDietProgress) {
        try {
          const parsed = JSON.parse(savedDietProgress);
          // Check if it's from today, if not reset
          if (parsed.date === new Date().toDateString()) {
            setDietProgress(parsed);
          }
        } catch (error) {
          console.error('Error parsing diet progress:', error);
        }
      }
      
      if (savedWorkoutProgress) {
        try {
          const parsed = JSON.parse(savedWorkoutProgress);
          // Check if it's from this week, if not reset
          if (parsed.weekStart === getWeekStart(new Date()).toDateString()) {
            setWorkoutProgress(parsed);
          }
        } catch (error) {
          console.error('Error parsing workout progress:', error);
        }
      }

      // Auto-sync with actual diet and workout plans
      const syncWithPlans = () => {
        const savedDietPlan = localStorage.getItem('dietPlan');
        if (savedDietPlan) {
          try {
            const dietPlan = JSON.parse(savedDietPlan);
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const todaysPlan = dietPlan.find((day: any) => day.day === today);
            
            if (todaysPlan && todaysPlan.meals) {
              updateDietProgress(todaysPlan.meals.map((meal: any) => ({ meal })));
            }
          } catch (error) {
            console.error('Error syncing diet plan:', error);
          }
        }

        const savedWorkoutPlan = localStorage.getItem('workoutPlan');
        if (savedWorkoutPlan) {
          try {
            const workoutPlan = JSON.parse(savedWorkoutPlan);
            updateWorkoutProgress(workoutPlan);
          } catch (error) {
            console.error('Error syncing workout plan:', error);
          }
        }
      };

      syncWithPlans();
      
      // Set up interval to check for plan updates
      const interval = setInterval(syncWithPlans, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(`dietProgress_${user._id}`, JSON.stringify(dietProgress));
    }
  }, [dietProgress, user?._id]);

  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(`workoutProgress_${user._id}`, JSON.stringify(workoutProgress));
    }
  }, [workoutProgress, user?._id]);

  const updateDietProgress = (meals: any[]) => {
    const today = new Date().toDateString();
    const completedMeals = meals.filter(meal => meal.meal.completed).length;
    const totalMeals = meals.length;
    
    const nutrients = meals.reduce(
      (acc, { meal }) => {
        if (meal.completed) {
          return {
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fats: acc.fats + meal.fats,
          };
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    setDietProgress({
      date: today,
      completedMeals,
      totalMeals,
      caloriesConsumed: nutrients.calories,
      targetCalories: 2000, // This could be dynamic based on user profile
      proteinConsumed: nutrients.protein,
      carbsConsumed: nutrients.carbs,
      fatsConsumed: nutrients.fats,
    });
  };

  const updateWorkoutProgress = (workoutPlan: any[]) => {
    const weekStart = getWeekStart(new Date()).toDateString();
    const workoutDays: { [key: string]: { completed: boolean; completedExercises: number; totalExercises: number } } = {};
    
    let totalCompletedWorkouts = 0;
    let totalCompletedExercises = 0;
    let totalExercises = 0;

    workoutPlan.forEach(dayPlan => {
      const completedExercises = dayPlan.exercises.filter((ex: any) => ex.completed).length;
      const totalDayExercises = dayPlan.exercises.length;
      const dayCompleted = completedExercises === totalDayExercises && totalDayExercises > 0;
      
      workoutDays[dayPlan.day] = {
        completed: dayCompleted,
        completedExercises,
        totalExercises: totalDayExercises,
      };
      
      if (dayCompleted) {
        totalCompletedWorkouts++;
      }
      
      totalCompletedExercises += completedExercises;
      totalExercises += totalDayExercises;
    });

    setWorkoutProgress({
      weekStart,
      completedWorkouts: totalCompletedWorkouts,
      totalWorkouts: workoutPlan.length,
      completedExercises: totalCompletedExercises,
      totalExercises,
      workoutDays,
    });
  };

  const getTodaysDietProgress = (): number => {
    if (dietProgress.totalMeals === 0) return 0;
    return Math.round((dietProgress.completedMeals / dietProgress.totalMeals) * 100);
  };

  const getWeeklyWorkoutProgress = (): number => {
    if (workoutProgress.totalWorkouts === 0) return 0;
    return Math.round((workoutProgress.completedWorkouts / workoutProgress.totalWorkouts) * 100);
  };

  const getCaloriesConsumed = (): number => {
    return dietProgress.caloriesConsumed;
  };

  const getCompletedWorkoutsThisWeek = (): number => {
    return workoutProgress.completedWorkouts;
  };

  const resetDailyProgress = () => {
    const today = new Date().toDateString();
    if (dietProgress.date !== today) {
      setDietProgress({
        date: today,
        completedMeals: 0,
        totalMeals: 0,
        caloriesConsumed: 0,
        targetCalories: 2000,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatsConsumed: 0,
      });
    }
    
    const weekStart = getWeekStart(new Date()).toDateString();
    if (workoutProgress.weekStart !== weekStart) {
      setWorkoutProgress({
        weekStart,
        completedWorkouts: 0,
        totalWorkouts: 0,
        completedExercises: 0,
        totalExercises: 0,
        workoutDays: {},
      });
    }
  };

  const value: ProgressContextType = useMemo(() => ({
    dietProgress,
    workoutProgress,
    updateDietProgress,
    updateWorkoutProgress,
    getTodaysDietProgress,
    getWeeklyWorkoutProgress,
    getCaloriesConsumed,
    getCompletedWorkoutsThisWeek,
    resetDailyProgress,
  }), [dietProgress, workoutProgress]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}; 