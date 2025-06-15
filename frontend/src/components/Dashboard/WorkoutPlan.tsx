import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BackendAIService from '../../services/backendAIService';
import type { WorkoutPlan as AIWorkoutPlan } from '../../services/backendAIService';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
  restTime?: string;
  equipment?: string;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  duration?: string;
  warmup?: string[];
  cooldown?: string[];
}

export default function WorkoutPlan() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load workout plan from localStorage on component mount
  useEffect(() => {
    if (user?._id) {
      const savedWorkoutPlan = localStorage.getItem(`workoutPlan_${user._id}`);
      if (savedWorkoutPlan) {
        try {
          setWorkoutPlan(JSON.parse(savedWorkoutPlan));
        } catch (error) {
          console.error('Error parsing saved workout plan:', error);
        }
      }
    }
    // Always set loading to false after checking localStorage
    setIsLoadingFromStorage(false);
  }, [user?._id]);

  // Save workout plan to localStorage whenever it changes
  useEffect(() => {
    if (user?._id && workoutPlan.length > 0) {
      localStorage.setItem(`workoutPlan_${user._id}`, JSON.stringify(workoutPlan));
    }
  }, [workoutPlan, user?._id]);

  const toggleExerciseCompletion = (dayIndex: number, exerciseIndex: number) => {
    const newWorkoutPlan = [...workoutPlan];
    newWorkoutPlan[dayIndex].exercises[exerciseIndex].completed = 
      !newWorkoutPlan[dayIndex].exercises[exerciseIndex].completed;
    setWorkoutPlan(newWorkoutPlan);
  };

  const clearWorkoutPlan = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    setWorkoutPlan([]);
    if (user?._id) {
      localStorage.removeItem(`workoutPlan_${user._id}`);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelClear = () => {
    setShowConfirmDialog(false);
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

  // Generate personalized prompt based on user profile
  const generatePersonalizedPrompt = () => {
    if (!user?.profile) {
      return 'Please complete your profile first to generate a personalized workout plan prompt.';
    }

    const height = user.profile.height || 170;
    const weight = user.profile.weight || 70;
    const heightInM = height / 100;
    const bmi = (weight / (heightInM * heightInM)).toFixed(1);
    
    const healthConditionsText = user.profile.healthConditions && user.profile.healthConditions.length > 0 && !user.profile.healthConditions.includes('None') 
      ? user.profile.healthConditions.join(', ') 
      : 'no specific health conditions';

    return `Create a detailed weekly workout plan for a ${user.profile.age || 25}-year-old ${user.profile.gender || 'person'} who is ${height}cm tall and weighs ${weight}kg (BMI: ${bmi}).

Their primary fitness goal is: ${user.profile.fitnessGoal || 'General Fitness'}
Health considerations: ${healthConditionsText}

Please provide a structured 6-day weekly workout schedule:
1. Monday - Specific exercises with sets, reps, and rest periods
2. Tuesday - Specific exercises with sets, reps, and rest periods
3. Wednesday - Specific exercises with sets, reps, and rest periods
4. Thursday - Specific exercises with sets, reps, and rest periods
5. Friday - Specific exercises with sets, reps, and rest periods
6. Saturday - Specific exercises with sets, reps, and rest periods
7. Sunday - Rest day with light activity suggestions

For each day, include:
- Warm-up routine (5-10 minutes)
- Main workout with specific exercises, sets, reps
- Cool-down and stretching routine
- Estimated workout duration
- Equipment needed (if any)
- Modifications for their fitness level and health conditions

Focus on exercises that support their goal of ${user.profile.fitnessGoal || 'General Fitness'} while considering their health conditions.`;
  };

  const generateAIWorkoutPlan = async () => {
    if (!user?.profile) {
      setAiError('Please complete your profile first to generate an AI workout plan.');
      return;
    }

    setIsGeneratingAI(true);
    setAiError('');

    try {
      const prompt = customPrompt || generatePersonalizedPrompt();
      const backendAIService = new BackendAIService();
      const aiWorkoutPlan = await backendAIService.generateWorkoutPlan(prompt);
      
      // Convert AI workout plan to our format
      const newWorkoutPlan: WorkoutDay[] = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      days.forEach(day => {
        if (aiWorkoutPlan[day] && aiWorkoutPlan[day].exercises) {
          const dayPlan = aiWorkoutPlan[day];
          const exercises: Exercise[] = dayPlan.exercises.map((exercise: any) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            completed: false,
            restTime: exercise.restTime,
            equipment: exercise.equipment,
          }));
          
          newWorkoutPlan.push({
            day,
            exercises,
            duration: dayPlan.duration,
            warmup: dayPlan.warmup,
            cooldown: dayPlan.cooldown,
          });
        }
      });

      setWorkoutPlan(newWorkoutPlan);
    } catch (error) {
      console.error('Error generating AI workout plan:', error);
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Authentication required')) {
          setAiError('Please log in again. Your session may have expired.');
        } else if (error.message.includes('Unable to connect to server')) {
          setAiError('Unable to connect to server. Please ensure the backend is running on port 5000.');
        } else if (error.message.includes('Prompt must be at least 50 characters')) {
          setAiError('Please complete your profile to generate a detailed prompt.');
        } else if (error.message.includes('OpenAI API key not configured')) {
          setAiError('OpenAI API key is not configured on the server. Please contact the administrator.');
        } else {
          setAiError(`Error: ${error.message}`);
        }
      } else {
        setAiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleEditPrompt = () => {
    if (!isEditingPrompt) {
      setCustomPrompt(generatePersonalizedPrompt());
    }
    setIsEditingPrompt(!isEditingPrompt);
  };

  const handleSavePrompt = () => {
    setIsEditingPrompt(false);
  };

  // Auto-update prompt when user profile changes
  useEffect(() => {
    if (!isEditingPrompt && !customPrompt) {
      // Only auto-update if user hasn't customized the prompt
      const newPrompt = generatePersonalizedPrompt();
      if (newPrompt !== customPrompt) {
        setCustomPrompt(''); // Reset to trigger auto-generation
      }
    }
  }, [user?.profile, isEditingPrompt]);

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">AI Workout Plan Generator</h2>
              <div className="flex space-x-3">
                {!isLoadingFromStorage && workoutPlan.length === 0 && (
                  <button
                    onClick={handleEditPrompt}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{isEditingPrompt ? 'Cancel Edit' : 'Edit Prompt'}</span>
                  </button>
                )}
                {!isLoadingFromStorage && workoutPlan.length > 0 && (
                  <button
                    onClick={clearWorkoutPlan}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Plan</span>
                  </button>
                )}
                {!isLoadingFromStorage && workoutPlan.length === 0 && (
                  <button
                    onClick={generateAIWorkoutPlan}
                    disabled={isGeneratingAI}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate AI Workout Plan</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {aiError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{aiError}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoadingFromStorage && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading your workout plan...</span>
              </div>
            )}

            {/* Personalized Prompt Section - Only show when no workout plan exists and not loading */}
            {!isLoadingFromStorage && workoutPlan.length === 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Your Personalized Workout Plan Prompt
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Auto-updates based on your profile)
                  </span>
                </h3>
                
                {isEditingPrompt ? (
                  <div className="space-y-4">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                      placeholder="Customize your workout plan prompt..."
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsEditingPrompt(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePrompt}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {customPrompt || generatePersonalizedPrompt()}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Generated Results Section */}
            {!isLoadingFromStorage && workoutPlan.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Workout Plan</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workoutPlan.map((day, dayIndex) => (
                    <div key={day.day} className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{day.day}</h3>
                        {day.duration && (
                          <p className="text-sm text-blue-600 font-medium">Duration: {day.duration}</p>
                        )}
                      </div>

                      {/* Warmup Section */}
                      {day.warmup && day.warmup.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-yellow-800 mb-2">🔥 Warm-up</h4>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {day.warmup.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises */}
                      <div className="space-y-3 mb-4">
                        {day.exercises.map((exercise, exerciseIndex) => (
                          <div
                            key={exercise.name}
                            className={`p-3 rounded-lg ${exercise.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} border shadow-sm`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">{exercise.name}</h4>
                                <div className="mt-1 space-y-1">
                                  <p className="text-xs text-gray-600">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                  {exercise.restTime && (
                                    <p className="text-xs text-blue-600">Rest: {exercise.restTime}</p>
                                  )}
                                  {exercise.equipment && exercise.equipment !== 'None' && (
                                    <p className="text-xs text-purple-600">Equipment: {exercise.equipment}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleExerciseCompletion(dayIndex, exerciseIndex)}
                                className={`ml-2 ${exercise.completed ? 'bg-green-500' : 'bg-gray-200'} p-2 rounded-full focus:outline-none transition-colors`}
                              >
                                <svg
                                  className={`h-4 w-4 ${exercise.completed ? 'text-white' : 'text-gray-500'}`}
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

                      {/* Cooldown Section */}
                      {day.cooldown && day.cooldown.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-blue-800 mb-2">❄️ Cool-down</h4>
                          <ul className="text-xs text-blue-700 space-y-1">
                            {day.cooldown.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Workout Plan</h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete your workout plan? This action cannot be undone and you will lose all your current workout data.
              </p>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelClear}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}