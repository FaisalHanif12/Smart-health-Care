import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

export default function WorkoutPlan() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([
    {
      day: 'Monday',
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 15, completed: false },
        { name: 'Squats', sets: 4, reps: 12, completed: false },
        { name: 'Plank', sets: 3, reps: 30, completed: false },
      ],
    },
    {
      day: 'Tuesday',
      exercises: [
        { name: 'Burpees', sets: 3, reps: 10, completed: false },
        { name: 'Bicycle Crunches', sets: 3, reps: 20, completed: false },
        { name: 'Wall Sit', sets: 3, reps: 45, completed: false },
      ],
    },
    {
      day: 'Wednesday',
      exercises: [
        { name: 'Pull-ups', sets: 3, reps: 8, completed: false },
        { name: 'Lunges', sets: 3, reps: 12, completed: false },
        { name: 'Crunches', sets: 3, reps: 20, completed: false },
      ],
    },
    {
      day: 'Thursday',
      exercises: [
        { name: 'Jumping Jacks', sets: 3, reps: 25, completed: false },
        { name: 'Russian Twists', sets: 3, reps: 20, completed: false },
        { name: 'High Knees', sets: 3, reps: 30, completed: false },
      ],
    },
    {
      day: 'Friday',
      exercises: [
        { name: 'Dumbbell Rows', sets: 3, reps: 12, completed: false },
        { name: 'Deadlifts', sets: 4, reps: 10, completed: false },
        { name: 'Mountain Climbers', sets: 3, reps: 20, completed: false },
      ],
    },
    {
      day: 'Saturday',
      exercises: [
        { name: 'Tricep Dips', sets: 3, reps: 12, completed: false },
        { name: 'Leg Raises', sets: 3, reps: 15, completed: false },
        { name: 'Side Plank', sets: 2, reps: 30, completed: false },
      ],
    },
  ]);

  const toggleExerciseCompletion = (dayIndex: number, exerciseIndex: number) => {
    const newWorkoutPlan = [...workoutPlan];
    newWorkoutPlan[dayIndex].exercises[exerciseIndex].completed = 
      !newWorkoutPlan[dayIndex].exercises[exerciseIndex].completed;
    setWorkoutPlan(newWorkoutPlan);
  };

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
      <nav className={`w-64 bg-gray-900 min-h-screen p-4 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50`}>
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
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Workout Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutPlan.map((day, dayIndex) => (
          <div key={day.day} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{day.day}</h3>
            <div className="space-y-4">
              {day.exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exercise.name}
                  className={`p-4 rounded-lg ${exercise.completed ? 'bg-green-50' : 'bg-white'} shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                      <p className="text-sm text-gray-500">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExerciseCompletion(dayIndex, exerciseIndex)}
                      className={`${exercise.completed ? 'bg-green-500' : 'bg-gray-200'} p-2 rounded-full focus:outline-none`}
                    >
                      <svg
                        className={`h-5 w-5 ${exercise.completed ? 'text-white' : 'text-gray-500'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}