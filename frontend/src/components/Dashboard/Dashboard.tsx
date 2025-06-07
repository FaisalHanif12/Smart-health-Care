import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Profile from './Profile';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardProps {}

type NavItem = 'dashboard' | 'workout' | 'diet' | 'profile' | 'store';

interface ProgressData {
  value: number;
  max: number;
  percentage: number;
}

export default function Dashboard() {
  const [calories, setCalories] = useState(2000); // Example daily calorie goal
  const [caloriesBurned, setCaloriesBurned] = useState(450);
  const [caloriesConsumed, setCaloriesConsumed] = useState(1200);
  const [workoutProgress, setWorkoutProgress] = useState<ProgressData>({ value: 3, max: 5, percentage: 60 });
  const [waterIntake, setWaterIntake] = useState<ProgressData>({ value: 5, max: 8, percentage: 62.5 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-bold text-white">Health Tracker</h1>
        <button className="text-white" onClick={toggleMobileMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Side Navigation */}
      <nav className={`w-64 bg-gray-900 h-screen p-4 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50 overflow-y-auto`}>
        <div className="flex items-center mb-8">
          <h1 className="text-xl font-bold text-yellow-400">HEALTH TRACKER</h1>
        </div>
        
        {/* Navigation Links Container */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Main Navigation Links */}
          <div className="space-y-2 flex-grow-0">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/dashboard/workout"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/workout' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-9a9 9 0 100 18 9 9 0 000-18z" clipRule="evenodd" />
              </svg>
              <span>Workout Plan</span>
            </Link>
            <Link
              to="/dashboard/diet"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/diet' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              <span>Diet Plan</span>
            </Link>
            <Link
              to="/dashboard/store"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/store' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Store</span>
            </Link>
            <Link
              to="/dashboard/profile"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/profile' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Profile</span>
            </Link>
          </div>
          
          {/* Spacer to push logout to bottom */}
          <div className="flex-1"></div>
          
          {/* Logout Button - Always visible at bottom */}
          <div className="mt-auto py-4 border-t border-gray-800">          
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm3 6V7a1 1 0 012 0v2h2a1 1 0 110 2H8v2a1 1 0 11-2 0v-2H4a1 1 0 110-2h2z" clipRule="evenodd" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen">
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

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Calories</h3>
                  <div className="bg-green-100 rounded-full p-1.5">
                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{calories}</p>
                  </div>
                  <div className="text-sm text-green-500 font-medium">
                    +3.67%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Expense Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Calories Burned</h3>
                  <div className="bg-red-100 rounded-full p-1.5">
                    <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{caloriesBurned}</p>
                  </div>
                  <div className="text-sm text-red-500 font-medium">
                    -2.67%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Reservations Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Workouts Completed</h3>
                  <div className="bg-blue-100 rounded-full p-1.5">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{workoutProgress.value}</p>
                  </div>
                  <div className="text-sm text-green-500 font-medium">
                    +2.54%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Occupied Table Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Water Intake</h3>
                  <div className="bg-indigo-100 rounded-full p-1.5">
                    <svg className="h-4 w-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{waterIntake.value}/{waterIntake.max}</p>
                  </div>
                  <div className="text-sm text-red-500 font-medium">
                    -2.57%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Reservations Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Current Workout Schedule</h3>
              <button className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-200">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody>
                  {[
                    { name: 'Morning Run', time: '06:30', duration: '30 mins', status: 'Completed' },
                    { name: 'Chest Workout', time: '17:40', duration: '45 mins', status: 'Scheduled' },
                    { name: 'Evening Yoga', time: '19:00', duration: '30 mins', status: 'Scheduled' }
                  ].map((workout, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-indigo-600">{workout.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{workout.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-500">{workout.time}</td>
                      <td className="py-3 text-sm text-gray-500">{workout.duration}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workout.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {workout.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-sm text-gray-500 hover:text-indigo-600">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Activity Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Workouts Per Week</h3>
                <div className="flex space-x-2">
                  <button className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full">Weekly</button>
                  <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Monthly</button>
                </div>
              </div>
              <div className="h-64">
                <div className="flex h-48 items-end space-x-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const height = Math.max(20, Math.min(100, 30 + Math.random() * 70));
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-teal-600 rounded-t-md" 
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Average Check Size Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Calories Burned (kcal)</h3>
                <div className="flex space-x-2">
                  <button className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full">Weekly</button>
                  <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Monthly</button>
                </div>
              </div>
              <div className="h-64 relative">
                {/* This would be a line chart in a real implementation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path 
                      d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,70 C350,40 400,90 400,90 L400,200 L0,200 Z" 
                      fill="rgba(167, 139, 250, 0.3)" 
                      stroke="none"
                    />
                    <path 
                      d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,70 C350,40 400,90 400,90" 
                      fill="none" 
                      stroke="#8B5CF6" 
                      strokeWidth="2"
                    />
                    <circle cx="300" cy="70" r="4" fill="#8B5CF6" />
                    <text x="310" y="65" fontSize="12" fill="#6B7280">570.68</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Menu Items Section */}
          
          {/* Render nested routes when on sub-pages */}
          {location.pathname !== '/dashboard' && <Outlet />}
        </main>
      </div>
    </div>
  );
}