import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PlanRenewalService } from '../services/planRenewalService';

interface DietProgress {
  date: string;
  completedMeals: number;
  totalMeals: number;
  caloriesConsumed: number;
  targetCalories: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatsConsumed: number;
  weeklyCompletedMeals: number;
  weeklyTotalMeals: number;
  weeklyCaloriesConsumed: number;
  weekStart: string;
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
  updateWorkoutProgress: (workoutPlan: any[]) => void;
  getTodaysDietProgress: () => number;
  getWeeklyWorkoutProgress: () => number;
  getWeeklyDietProgress: () => number;
  getCaloriesConsumed: () => number;
  getCompletedWorkoutsThisWeek: () => number;
  resetDailyProgress: () => void;
  archiveCurrentProgress: () => void;
  clearDietProgress: () => void;
  clearWorkoutProgress: () => void;
  clearAllProgress: () => void;
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
    weeklyCompletedMeals: 0,
    weeklyTotalMeals: 0,
    weeklyCaloriesConsumed: 0,
    weekStart: getWeekStart(new Date()).toDateString(),
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
    if (!user?._id) {
      // Reset progress data if no user
      setDietProgress({
        date: new Date().toDateString(),
        completedMeals: 0,
        totalMeals: 0,
        caloriesConsumed: 0,
        targetCalories: 2000,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatsConsumed: 0,
        weeklyCompletedMeals: 0,
        weeklyTotalMeals: 0,
        weeklyCaloriesConsumed: 0,
        weekStart: getWeekStart(new Date()).toDateString(),
      });
      
      setWorkoutProgress({
        weekStart: getWeekStart(new Date()).toDateString(),
        completedWorkouts: 0,
        totalWorkouts: 0,
        completedExercises: 0,
        totalExercises: 0,
        workoutDays: {},
      });
      return;
    }

    // Initialize with default values first
    const today = new Date().toDateString();
    const currentWeekStart = getWeekStart(new Date()).toDateString();
    
    setDietProgress({
      date: today,
      completedMeals: 0,
      totalMeals: 0,
      caloriesConsumed: 0,
      targetCalories: 2000,
      proteinConsumed: 0,
      carbsConsumed: 0,
      fatsConsumed: 0,
      weeklyCompletedMeals: 0,
      weeklyTotalMeals: 0,
      weeklyCaloriesConsumed: 0,
      weekStart: currentWeekStart,
    });
    
    setWorkoutProgress({
      weekStart: currentWeekStart,
      completedWorkouts: 0,
      totalWorkouts: 0,
      completedExercises: 0,
      totalExercises: 0,
      workoutDays: {},
    });

    const savedDietProgress = localStorage.getItem(`dietProgress_${user._id}`);
    const savedWorkoutProgress = localStorage.getItem(`workoutProgress_${user._id}`);
    
    if (savedDietProgress) {
      try {
        const parsed = JSON.parse(savedDietProgress);
        // Check if it's from today, if not keep defaults
        if (parsed.date === today && parsed.weekStart === currentWeekStart) {
          setDietProgress(parsed);
        }
      } catch (error) {
        console.error('Error parsing diet progress:', error);
      }
    }
    
    if (savedWorkoutProgress) {
      try {
        const parsed = JSON.parse(savedWorkoutProgress);
        // Check if it's from this week, if not keep defaults
        if (parsed.weekStart === currentWeekStart) {
          setWorkoutProgress(parsed);
        }
      } catch (error) {
        console.error('Error parsing workout progress:', error);
      }
    }

    // Auto-sync with actual diet and workout plans
    const syncWithPlans = () => {
      if (!user?._id) return; // Don't sync if no user
      
      const savedDietPlan = localStorage.getItem(`dietPlan_${user._id}`);
      if (savedDietPlan) {
        try {
          const dietPlan = JSON.parse(savedDietPlan);
          
          // Calculate weekly progress from all days in the plan
          let weeklyCompletedMeals = 0;
          let weeklyTotalMeals = 0;
          let weeklyCaloriesConsumed = 0;
          let todayCompletedMeals = 0;
          let todayTotalMeals = 0;
          let todayCaloriesConsumed = 0;
          let todayProtein = 0;
          let todayCarbs = 0;
          let todayFats = 0;
          
          const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          
          dietPlan.forEach((day: any) => {
            if (day.meals) {
              const completedMeals = day.meals.filter((meal: any) => meal.completed).length;
              const totalMeals = day.meals.length;
              
              weeklyCompletedMeals += completedMeals;
              weeklyTotalMeals += totalMeals;
              
              // Calculate calories for completed meals only
              const completedCalories = day.meals
                .filter((meal: any) => meal.completed)
                .reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
              weeklyCaloriesConsumed += completedCalories;
              
              // If this is today, also track daily progress
              if (day.day === todayName) {
                todayCompletedMeals = completedMeals;
                todayTotalMeals = totalMeals;
                todayCaloriesConsumed = completedCalories;
                
                // Calculate macros for today
                day.meals.forEach((meal: any) => {
                  if (meal.completed) {
                    todayProtein += parseFloat(meal.protein) || 0;
                    todayCarbs += parseFloat(meal.carbs) || 0;
                    todayFats += parseFloat(meal.fats) || 0;
                  }
                });
              }
            }
          });
          
          // Update diet progress with both daily and weekly data
          const weekStart = getWeekStart(new Date()).toDateString();
          
          setDietProgress({
            date: today,
            completedMeals: todayCompletedMeals,
            totalMeals: todayTotalMeals,
            caloriesConsumed: todayCaloriesConsumed,
            targetCalories: 2000,
            proteinConsumed: todayProtein,
            carbsConsumed: todayCarbs,
            fatsConsumed: todayFats,
            weeklyCompletedMeals,
            weeklyTotalMeals,
            weeklyCaloriesConsumed,
            weekStart,
          });
        } catch (error) {
          console.error('Error syncing diet plan:', error);
        }
      }

      // Sync workout plan
      const savedWorkoutPlan = localStorage.getItem(`workoutPlan_${user._id}`);
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
    
    // Check for plan renewals and initialize renewal service
    const checkPlanRenewals = async () => {
      if (user?.profile) {
        const renewalService = PlanRenewalService.getInstance();
        await renewalService.checkAndRenewPlans(user.profile, user._id);
        
        // Request notification permission on first load
        await renewalService.requestNotificationPermission();
      }
    };
    
    checkPlanRenewals();
    
    // Set up interval to check for plan updates and renewals
    const interval = setInterval(() => {
      syncWithPlans();
      checkPlanRenewals();
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [user?._id]); // Changed dependency to user._id to ensure it resets when user changes

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

  const getWeeklyDietProgress = (): number => {
    if (dietProgress.weeklyTotalMeals === 0) return 0;
    return Math.round((dietProgress.weeklyCompletedMeals / dietProgress.weeklyTotalMeals) * 100);
  };

  const getCaloriesConsumed = (): number => {
    return dietProgress.caloriesConsumed;
  };

  const getCompletedWorkoutsThisWeek = (): number => {
    return workoutProgress.completedWorkouts;
  };

  const resetDailyProgress = () => {
    const today = new Date().toDateString();
    const currentWeekStart = getWeekStart(new Date()).toDateString();
    
    if (dietProgress.date !== today || dietProgress.weekStart !== currentWeekStart) {
      setDietProgress({
        date: today,
        completedMeals: 0,
        totalMeals: 0,
        caloriesConsumed: 0,
        targetCalories: 2000,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatsConsumed: 0,
        weeklyCompletedMeals: 0,
        weeklyTotalMeals: 0,
        weeklyCaloriesConsumed: 0,
        weekStart: currentWeekStart,
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

  const archiveCurrentProgress = () => {
    if (!user?._id) return;
    
    const archiveData = {
      timestamp: new Date().toISOString(),
      dietProgress: { ...dietProgress },
      workoutProgress: { ...workoutProgress },
      weekEnding: dietProgress.weekStart,
    };
    
    // Get existing archives
    const existingArchives = localStorage.getItem(`progressArchive_${user._id}`);
    let archives = [];
    
    if (existingArchives) {
      try {
        archives = JSON.parse(existingArchives);
      } catch (error) {
        console.error('Error parsing progress archives:', error);
        archives = [];
      }
    }
    
    // Add current progress to archives
    archives.unshift(archiveData); // Add to beginning
    
    // Keep only last 10 weeks of archives to prevent localStorage bloat
    if (archives.length > 10) {
      archives = archives.slice(0, 10);
    }
    
    // Save back to localStorage
    localStorage.setItem(`progressArchive_${user._id}`, JSON.stringify(archives));
    
    console.log('✅ Progress archived successfully');
  };

  const clearDietProgress = () => {
    if (!user?._id) return;
    
    const today = new Date().toDateString();
    const currentWeekStart = getWeekStart(new Date()).toDateString();
    
    // Reset all diet-related progress
    setDietProgress({
      date: today,
      completedMeals: 0,
      totalMeals: 0,
      caloriesConsumed: 0,
      targetCalories: 2000,
      proteinConsumed: 0,
      carbsConsumed: 0,
      fatsConsumed: 0,
      weeklyCompletedMeals: 0,
      weeklyTotalMeals: 0,
      weeklyCaloriesConsumed: 0,
      weekStart: currentWeekStart,
    });
    
    // Remove diet progress from localStorage
    localStorage.removeItem(`dietProgress_${user._id}`);
    
    console.log('✅ Diet progress cleared successfully');
  };

  const clearWorkoutProgress = () => {
    if (!user?._id) return;
    
    const currentWeekStart = getWeekStart(new Date()).toDateString();
    
    // Reset all workout-related progress
    setWorkoutProgress({
      weekStart: currentWeekStart,
      completedWorkouts: 0,
      totalWorkouts: 0,
      completedExercises: 0,
      totalExercises: 0,
      workoutDays: {},
    });
    
    // Remove workout progress from localStorage
    localStorage.removeItem(`workoutProgress_${user._id}`);
    
    console.log('✅ Workout progress cleared successfully');
  };

  const clearAllProgress = () => {
    if (!user?._id) return;
    
    // Archive current progress before clearing everything
    archiveCurrentProgress();
    
    // Clear both diet and workout progress
    clearDietProgress();
    clearWorkoutProgress();
    
    console.log('✅ All progress cleared and archived successfully');
  };

  const value: ProgressContextType = useMemo(() => ({
    dietProgress,
    workoutProgress,
    updateWorkoutProgress,
    getTodaysDietProgress,
    getWeeklyWorkoutProgress,
    getWeeklyDietProgress,
    getCaloriesConsumed,
    getCompletedWorkoutsThisWeek,
    resetDailyProgress,
    archiveCurrentProgress,
    clearDietProgress,
    clearWorkoutProgress,
    clearAllProgress,
  }), [dietProgress, workoutProgress]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}; 