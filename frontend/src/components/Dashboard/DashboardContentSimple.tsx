import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';

interface ProgressData {
  value: number;
  max: number;
  percentage: number;
}

export default function DashboardContentSimple() {
  const [waterIntake] = useState<ProgressData>({ value: 5, max: 8, percentage: 62.5 });
  
  const { 
    getTodaysDietProgress, 
    getWeeklyWorkoutProgress, 
    getCaloriesConsumed, 
    getCompletedWorkoutsThisWeek,
    dietProgress,
    workoutProgress 
  } = useProgress();

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress Overview</h2>
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

      {/* Main Stats Cards */}
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
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{waterIntake.value}/{waterIntake.max}</p>
                <p className="text-xs text-gray-500">Glasses</p>
              </div>
              <div className="text-sm text-cyan-500 font-medium">
                {waterIntake.percentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
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
    </main>
  );
} 