import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { useAuth } from '../../contexts/AuthContext';
import AIRecommendations from './AIRecommendations';
import PlanRenewalStatus from './PlanRenewalStatus';

interface ProgressData {
  value: number;
  max: number;
  percentage: number;
}

export default function DashboardContentSimple() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [waterIntake, setWaterIntake] = useState<ProgressData>({ value: 5, max: 8, percentage: 62.5 });
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([]);
  const [dailyCalories, setDailyCalories] = useState<number[]>([]);
  
  const { 
    getTodaysDietProgress, 
    getWeeklyWorkoutProgress, 
    getCaloriesConsumed, 
    getCompletedWorkoutsThisWeek,
    dietProgress,
    workoutProgress 
  } = useProgress();

  // Load actual data from localStorage and sync with diet/workout plans
  useEffect(() => {
    if (!user?._id) {
      // Reset all data if no user
      setDailyCalories([]);
      setWeeklyProgress([]);
      return;
    }
    
    // Initialize default empty data first
    setDailyCalories([]);
    setWeeklyProgress([]);
    
    // Load diet plan data
    const savedDietPlan = localStorage.getItem(`dietPlan_${user._id}`);
    if (savedDietPlan) {
      try {
        const dietPlan = JSON.parse(savedDietPlan);
        // Generate weekly calorie data from diet plan
        const weeklyCalories = dietPlan.slice(0, 7).map((day: any) => {
          const completedMealCalories = day.meals
            .filter((meal: any) => meal.completed)
            .reduce((sum: number, meal: any) => sum + meal.calories, 0);
          return completedMealCalories;
        });
        setDailyCalories(weeklyCalories);
      } catch (error) {
        console.error('Error loading diet plan:', error);
        setDailyCalories([]);
      }
    }

    // Load workout plan data
    const savedWorkoutPlan = localStorage.getItem(`workoutPlan_${user._id}`);
    if (savedWorkoutPlan) {
      try {
        const workoutPlan = JSON.parse(savedWorkoutPlan);
        // Generate weekly workout completion data
        const weeklyWorkouts = workoutPlan.slice(0, 7).map((day: any) => {
          const completedExercises = day.exercises
            ? day.exercises.filter((ex: any) => ex.completed).length
            : 0;
          const totalExercises = day.exercises ? day.exercises.length : 0;
          return totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
        });
        setWeeklyProgress(weeklyWorkouts);
      } catch (error) {
        console.error('Error loading workout plan:', error);
        setWeeklyProgress([]);
      }
    }
  }, [user?._id, dietProgress, workoutProgress]); // React to progress changes when plans are cleared

  const updateWaterIntake = (increment: boolean) => {
    if (!user?._id) return; // Don't update if no user
    
    setWaterIntake(prev => {
      const newValue = increment 
        ? Math.min(prev.value + 1, prev.max)
        : Math.max(prev.value - 1, 0);
      const newWaterData = {
        ...prev,
        value: newValue,
        percentage: (newValue / prev.max) * 100
      };
      
      // Save to localStorage with user-specific key
      localStorage.setItem(`waterIntake_${user._id}`, JSON.stringify({
        ...newWaterData,
        date: new Date().toDateString()
      }));
      
      return newWaterData;
    });
  };

  // Load water intake data on mount
  useEffect(() => {
    if (!user?._id) {
      // Reset water intake if no user
      setWaterIntake({ value: 0, max: 8, percentage: 0 });
      return;
    }
    
    const savedWaterIntake = localStorage.getItem(`waterIntake_${user._id}`);
    if (savedWaterIntake) {
      try {
        const parsed = JSON.parse(savedWaterIntake);
        // Check if it's from today, if not reset
        if (parsed.date === new Date().toDateString()) {
          setWaterIntake({
            value: parsed.value,
            max: parsed.max,
            percentage: parsed.percentage
          });
        } else {
          // Reset for new day
          setWaterIntake({ value: 0, max: 8, percentage: 0 });
        }
      } catch (error) {
        console.error('Error loading water intake:', error);
        // Reset on error
        setWaterIntake({ value: 0, max: 8, percentage: 0 });
      }
    } else {
      // No saved data for this user, reset to default
      setWaterIntake({ value: 0, max: 8, percentage: 0 });
    }
  }, [user?._id]); // Keep water intake separate from progress changes

  // Search functionality

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h1>
        {/* Sign Up Button - Top Right Corner */}
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Sign Up
          </button>
        )}
      </div>

      {/* Plan Renewal Status */}
      <PlanRenewalStatus />

      {/* Progress Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Progress Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diet Progress Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/80 dark:to-green-800/80 border border-green-200 dark:border-green-500 rounded-xl p-6 dark:shadow-lg dark:shadow-green-900/20">
                          <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-white">Today's Diet Progress</h3>
                <div className="bg-yellow-200 dark:bg-yellow-600 rounded-full p-2">
                  <svg className="w-5 h-5 text-yellow-700 dark:text-yellow-100" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </div>
              </div>
                          <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-700 dark:text-yellow-50">Meals Completed</span>
                  <span className="font-semibold text-yellow-800 dark:text-white">{dietProgress.completedMeals}/{dietProgress.totalMeals}</span>
                </div>
                <div className="w-full bg-yellow-200 dark:bg-yellow-700/70 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 dark:bg-yellow-300 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getTodaysDietProgress()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-yellow-700 dark:text-yellow-50">Calories: {getCaloriesConsumed()}/{dietProgress.targetCalories}</span>
                  <span className="font-semibold text-yellow-800 dark:text-white">{getTodaysDietProgress()}%</span>
                </div>
                <div className="pt-2">
                  <Link 
                    to="/dashboard/diet" 
                    className="inline-flex items-center text-sm text-yellow-700 dark:text-yellow-100 hover:text-yellow-800 dark:hover:text-white font-medium"
                  >
                    View Diet Plan →
                  </Link>
                </div>
              </div>
          </div>

          {/* Workout Progress Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/80 dark:to-blue-800/80 border border-blue-200 dark:border-blue-500 rounded-xl p-6 dark:shadow-lg dark:shadow-blue-900/20">
                          <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-white">This Week's Workouts</h3>
                <div className="bg-purple-200 dark:bg-purple-600 rounded-full p-2">
                  <svg className="w-5 h-5 text-purple-700 dark:text-purple-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
                          <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-50">Workouts Completed</span>
                  <span className="font-semibold text-purple-800 dark:text-white">{workoutProgress.completedWorkouts}/{workoutProgress.totalWorkouts}</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-700/70 rounded-full h-2">
                  <div 
                    className="bg-purple-600 dark:bg-purple-300 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getWeeklyWorkoutProgress()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-700 dark:text-purple-50">Exercises: {workoutProgress.completedExercises}/{workoutProgress.totalExercises}</span>
                  <span className="font-semibold text-purple-800 dark:text-white">{getWeeklyWorkoutProgress()}%</span>
                </div>
                <div className="pt-2">
                  <Link 
                    to="/dashboard/workout" 
                    className="inline-flex items-center text-sm text-purple-700 dark:text-purple-100 hover:text-purple-800 dark:hover:text-white font-medium"
                  >
                    View Workout Plan →
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Progress Charts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Progress Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Workout Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Weekly Workout Progress</h3>
              <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-200 w-8">{day}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${weeklyProgress[index] || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-200 w-10 text-right">
                    {weeklyProgress[index] || 0}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-200">Average Completion</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {weeklyProgress.length > 0 ? Math.round(weeklyProgress.reduce((a, b) => a + b, 0) / weeklyProgress.length) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Calorie Intake Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Daily Calorie Intake</h3>
              <div className="bg-yellow-100 dark:bg-yellow-800 rounded-full p-2">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </div>
            </div>
            <div className="h-40 flex items-end justify-between space-x-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const calories = dailyCalories[index] || 0;
                const maxCalories = Math.max(...dailyCalories, 2000);
                const height = maxCalories > 0 ? (calories / maxCalories) * 100 : 0;
                
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t flex items-end justify-center relative" style={{ height: '120px' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 dark:from-green-400 dark:to-green-300 rounded-t transition-all duration-500 ease-out flex items-end justify-center"
                        style={{ height: `${height}%` }}
                      >
                        {calories > 0 && (
                          <span className="text-xs text-white dark:text-gray-900 font-medium mb-1">
                            {calories}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-200 mt-2 font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-200">Daily Average</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {dailyCalories.length > 0 ? Math.round(dailyCalories.reduce((a, b) => a + b, 0) / dailyCalories.length) : 0} cal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards - Always show, part of Progress Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Daily Calorie Goal Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Daily Calorie Goal</h3>
              <div className="bg-yellow-100 dark:bg-yellow-700 rounded-full p-1.5">
                <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dietProgress.targetCalories}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Target</p>
              </div>
              <div className="text-sm text-yellow-500 dark:text-yellow-300 font-medium">
                {getTodaysDietProgress()}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Calories Consumed Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Calories Consumed</h3>
              <div className="bg-red-100 dark:bg-red-700 rounded-full p-1.5">
                <svg className="h-4 w-4 text-red-600 dark:text-red-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getCaloriesConsumed()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Consumed</p>
              </div>
              <div className="text-sm text-yellow-500 dark:text-yellow-300 font-medium">
                {dietProgress.completedMeals}/{dietProgress.totalMeals}
              </div>
            </div>
          </div>
        </div>
        
        {/* Workouts Completed Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Workouts This Week</h3>
              <div className="bg-purple-100 dark:bg-purple-700 rounded-full p-1.5">
                <svg className="h-4 w-4 text-purple-600 dark:text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getCompletedWorkoutsThisWeek()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Completed</p>
              </div>
              <div className="text-sm text-purple-500 dark:text-purple-300 font-medium">
                {getWeeklyWorkoutProgress()}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Water Intake Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Water Intake</h3>
              <div className="bg-cyan-100 dark:bg-cyan-700 rounded-full p-1.5">
                <svg className="h-4 w-4 text-cyan-600 dark:text-cyan-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{waterIntake.value}/{waterIntake.max}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Glasses</p>
                </div>
                <div className="text-sm text-cyan-500 dark:text-cyan-300 font-medium">
                  {waterIntake.percentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-cyan-100 dark:bg-cyan-800/60 rounded-full h-2">
                <div 
                  className="bg-cyan-500 dark:bg-cyan-300 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${waterIntake.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={() => updateWaterIntake(false)}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-full p-1 transition-colors disabled:opacity-50"
                  disabled={waterIntake.value === 0}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => updateWaterIntake(true)}
                  className="bg-cyan-500 dark:bg-cyan-600 hover:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-full p-1 transition-colors disabled:opacity-50"
                  disabled={waterIntake.value === waterIntake.max}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="mb-8">
        <AIRecommendations />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/dashboard/diet"
            className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-800/40 border border-yellow-200 dark:border-yellow-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-200 dark:bg-yellow-700 rounded-full p-2 group-hover:bg-yellow-300 dark:group-hover:bg-yellow-600 transition-colors">
                <svg className="w-4 h-4 text-yellow-700 dark:text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-100">Diet Plan</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            to="/dashboard/workout"
            className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-200 dark:bg-purple-700 rounded-full p-2 group-hover:bg-purple-300 dark:group-hover:bg-purple-600 transition-colors">
                <svg className="w-4 h-4 text-purple-700 dark:text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-100">Workout Plan</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            to="/dashboard/profile"
            className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-200 dark:bg-purple-700 rounded-full p-2 group-hover:bg-purple-300 dark:group-hover:bg-purple-600 transition-colors">
                <svg className="w-4 h-4 text-purple-700 dark:text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-100">Profile</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            to="/dashboard/store"
            className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-800/40 border border-orange-200 dark:border-orange-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-200 dark:bg-orange-700 rounded-full p-2 group-hover:bg-orange-300 dark:group-hover:bg-orange-600 transition-colors">
                <svg className="w-4 h-4 text-orange-700 dark:text-orange-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-100">Store</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
} 