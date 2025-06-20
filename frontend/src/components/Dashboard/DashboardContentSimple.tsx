import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import AIRecommendations from './AIRecommendations';
import PlanRenewalStatus from './PlanRenewalStatus';

interface ProgressData {
  value: number;
  max: number;
  percentage: number;
}

export default function DashboardContentSimple() {
  const [waterIntake, setWaterIntake] = useState<ProgressData>({ value: 5, max: 8, percentage: 62.5 });
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([]);
  const [dailyCalories, setDailyCalories] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
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
    // Load diet plan data
    const savedDietPlan = localStorage.getItem('dietPlan');
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
      }
    }

    // Load workout plan data
    const savedWorkoutPlan = localStorage.getItem('workoutPlan');
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
      }
    }
  }, []);

  const updateWaterIntake = (increment: boolean) => {
    setWaterIntake(prev => {
      const newValue = increment 
        ? Math.min(prev.value + 1, prev.max)
        : Math.max(prev.value - 1, 0);
      const newWaterData = {
        ...prev,
        value: newValue,
        percentage: (newValue / prev.max) * 100
      };
      
      // Save to localStorage
      localStorage.setItem('waterIntake', JSON.stringify({
        ...newWaterData,
        date: new Date().toDateString()
      }));
      
      return newWaterData;
    });
  };

  // Load water intake data on mount
  useEffect(() => {
    const savedWaterIntake = localStorage.getItem('waterIntake');
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
        }
      } catch (error) {
        console.error('Error loading water intake:', error);
      }
    }
  }, []);

  // Search functionality
  const searchableContent = [
    { id: 'progress-overview', title: 'Progress Overview', keywords: ['progress', 'overview', 'diet', 'workout', 'today', 'week'] },
    { id: 'weekly-charts', title: 'Weekly Progress Charts', keywords: ['weekly', 'progress', 'charts', 'workout', 'calorie', 'intake', 'daily'] },
    { id: 'ai-health-coach', title: 'AI Health Coach', keywords: ['ai', 'health', 'coach', 'recommendations', 'artificial', 'intelligence'] },
    { id: 'quick-actions', title: 'Quick Actions', keywords: ['quick', 'actions', 'diet', 'workout', 'profile', 'store', 'plan'] }
  ];

  const filteredSections = searchQuery.trim() === '' 
    ? searchableContent 
    : searchableContent.filter(section => {
        const query = searchQuery.toLowerCase();
        return section.title.toLowerCase().includes(query) || 
               section.keywords.some(keyword => keyword.toLowerCase().includes(query));
      });

  const shouldShowSection = (sectionId: string) => {
    return searchQuery.trim() === '' || filteredSections.some(section => section.id === sectionId);
  };

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const query = searchQuery.toLowerCase();
    const index = text.toLowerCase().indexOf(query);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-yellow-200 px-1 rounded">{text.substring(index, index + query.length)}</span>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input 
              type="text" 
              placeholder="Search sections..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-800 font-medium">
              {filteredSections.length > 0 
                ? `Found ${filteredSections.length} section${filteredSections.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `No sections found matching "${searchQuery}"`
              }
            </span>
          </div>
        </div>
      )}

      {/* Plan Renewal Status */}
      <PlanRenewalStatus />

      {/* Progress Overview Section */}
      {shouldShowSection('progress-overview') && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{highlightText('Progress Overview')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diet Progress Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800">Today's Diet Progress</h3>
              <div className="bg-green-200 rounded-full p-2">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Meals Completed</span>
                <span className="font-semibold text-green-800">{dietProgress.completedMeals}/{dietProgress.totalMeals}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getTodaysDietProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Calories: {getCaloriesConsumed()}/{dietProgress.targetCalories}</span>
                <span className="font-semibold text-green-800">{getTodaysDietProgress()}%</span>
              </div>
              <div className="pt-2">
                <Link 
                  to="/dashboard/diet" 
                  className="inline-flex items-center text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  View Diet Plan →
                </Link>
              </div>
            </div>
          </div>

          {/* Workout Progress Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800">This Week's Workouts</h3>
              <div className="bg-blue-200 rounded-full p-2">
                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Workouts Completed</span>
                <span className="font-semibold text-blue-800">{workoutProgress.completedWorkouts}/{workoutProgress.totalWorkouts}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getWeeklyWorkoutProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700">Exercises: {workoutProgress.completedExercises}/{workoutProgress.totalExercises}</span>
                <span className="font-semibold text-blue-800">{getWeeklyWorkoutProgress()}%</span>
              </div>
              <div className="pt-2">
                <Link 
                  to="/dashboard/workout" 
                  className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  View Workout Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Progress Charts Section */}
      {shouldShowSection('weekly-charts') && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{highlightText('Weekly Progress Charts')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Workout Progress Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Workout Progress</h3>
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-8">{day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${weeklyProgress[index] || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">
                    {weeklyProgress[index] || 0}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Completion</span>
                <span className="font-semibold text-blue-600">
                  {weeklyProgress.length > 0 ? Math.round(weeklyProgress.reduce((a, b) => a + b, 0) / weeklyProgress.length) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Calorie Intake Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Daily Calorie Intake</h3>
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
                    <div className="w-full bg-gray-100 rounded-t flex items-end justify-center relative" style={{ height: '120px' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-500 ease-out flex items-end justify-center"
                        style={{ height: `${height}%` }}
                      >
                        {calories > 0 && (
                          <span className="text-xs text-white font-medium mb-1">
                            {calories}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily Average</span>
                <span className="font-semibold text-green-600">
                  {dailyCalories.length > 0 ? Math.round(dailyCalories.reduce((a, b) => a + b, 0) / dailyCalories.length) : 0} cal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Stats Cards - Always show, part of Progress Overview */}
      {shouldShowSection('progress-overview') && (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Daily Calorie Goal Card */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Daily Calorie Goal</h3>
              <div className="bg-green-100 rounded-full p-1.5">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{dietProgress.targetCalories}</p>
                <p className="text-xs text-gray-500">Target</p>
              </div>
              <div className="text-sm text-green-500 font-medium">
                {getTodaysDietProgress()}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Calories Consumed Card */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Calories Consumed</h3>
              <div className="bg-red-100 rounded-full p-1.5">
                <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{getCaloriesConsumed()}</p>
                <p className="text-xs text-gray-500">Consumed</p>
              </div>
              <div className="text-sm text-blue-500 font-medium">
                {dietProgress.completedMeals}/{dietProgress.totalMeals}
              </div>
            </div>
          </div>
        </div>
        
        {/* Workouts Completed Card */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Workouts This Week</h3>
              <div className="bg-blue-100 rounded-full p-1.5">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{getCompletedWorkoutsThisWeek()}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-sm text-green-500 font-medium">
                {getWeeklyWorkoutProgress()}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Water Intake Card */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Water Intake</h3>
              <div className="bg-cyan-100 rounded-full p-1.5">
                <svg className="h-4 w-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{waterIntake.value}/{waterIntake.max}</p>
                  <p className="text-xs text-gray-500">Glasses</p>
                </div>
                <div className="text-sm text-cyan-500 font-medium">
                  {waterIntake.percentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-cyan-100 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${waterIntake.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={() => updateWaterIntake(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-1 transition-colors disabled:opacity-50"
                  disabled={waterIntake.value === 0}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => updateWaterIntake(true)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-1 transition-colors disabled:opacity-50"
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
      )}

      {/* AI Recommendations Section */}
      {shouldShowSection('ai-health-coach') && (
        <div className="mb-8">
          <AIRecommendations />
        </div>
      )}

      {/* Quick Actions */}
      {shouldShowSection('quick-actions') && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{highlightText('Quick Actions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/dashboard/diet"
            className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-200 rounded-full p-2 group-hover:bg-green-300 transition-colors">
                <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Diet Plan</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            to="/dashboard/workout"
            className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-200 rounded-full p-2 group-hover:bg-blue-300 transition-colors">
                <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Workout Plan</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            to="/dashboard/profile"
            className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-200 rounded-full p-2 group-hover:bg-purple-300 transition-colors">
                <svg className="w-4 h-4 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Profile</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            to="/dashboard/store"
            className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-200 rounded-full p-2 group-hover:bg-orange-300 transition-colors">
                <svg className="w-4 h-4 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Store</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
      )}
    </main>
  );
} 