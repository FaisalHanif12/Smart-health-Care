import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BackendAIService from '../../services/backendAIService';
import type { DietPlan as AIDietPlan } from '../../services/backendAIService';

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
}

interface DailyMeals {    
  time: string;
  meal: Meal;
}

export default function DietPlan() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [meals, setMeals] = useState<DailyMeals[]>([]);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastResetDate, setLastResetDate] = useState<string>('');

  // Check if we need to reset daily progress
  const checkDailyReset = () => {
    if (!user?._id) return;
    
    const today = new Date().toDateString();
    const savedResetDate = localStorage.getItem(`lastResetDate_${user._id}`);
    
    if (savedResetDate !== today) {
      // Reset all meal completion status
      const resetMeals = meals.map(mealTime => ({
        ...mealTime,
        meal: {
          ...mealTime.meal,
          completed: false
        }
      }));
      setMeals(resetMeals);
      setLastResetDate(today);
      localStorage.setItem(`lastResetDate_${user._id}`, today);
      if (resetMeals.length > 0) {
        localStorage.setItem(`dietPlan_${user._id}`, JSON.stringify(resetMeals));
      }
    }
  };

  // Load diet plan from localStorage on component mount
  useEffect(() => {
    if (user?._id) {
      const savedDietPlan = localStorage.getItem(`dietPlan_${user._id}`);
      const savedResetDate = localStorage.getItem(`lastResetDate_${user._id}`);
      
      if (savedDietPlan) {
        try {
          const parsedMeals = JSON.parse(savedDietPlan);
          setMeals(parsedMeals);
          
          // Check if we need to reset for today
          const today = new Date().toDateString();
          if (savedResetDate !== today) {
            // Reset completion status for new day
            const resetMeals = parsedMeals.map((mealTime: DailyMeals) => ({
              ...mealTime,
              meal: {
                ...mealTime.meal,
                completed: false
              }
            }));
            setMeals(resetMeals);
            localStorage.setItem(`dietPlan_${user._id}`, JSON.stringify(resetMeals));
            localStorage.setItem(`lastResetDate_${user._id}`, today);
          }
        } catch (error) {
          console.error('Error parsing saved diet plan:', error);
        }
      }
      
      if (savedResetDate) {
        setLastResetDate(savedResetDate);
      }
    }
    // Always set loading to false after checking localStorage
    setIsLoadingFromStorage(false);
  }, [user?._id]);

  // Save diet plan to localStorage whenever it changes
  useEffect(() => {
    if (user?._id && meals.length > 0) {
      localStorage.setItem(`dietPlan_${user._id}`, JSON.stringify(meals));
    }
  }, [meals, user?._id]);

  // Check for daily reset every time the component mounts or user changes
  useEffect(() => {
    if (user?._id && meals.length > 0) {
      checkDailyReset();
    }
  }, [user?._id]);

  // Check for daily reset every 5 minutes when component is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?._id && meals.length > 0) {
        checkDailyReset();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?._id, meals]);

  const toggleMealCompletion = (index: number) => {
    const newMeals = [...meals];
    newMeals[index].meal.completed = !newMeals[index].meal.completed;
    setMeals(newMeals);
  };

  const clearDietPlan = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    setMeals([]);
    if (user?._id) {
      localStorage.removeItem(`dietPlan_${user._id}`);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelClear = () => {
    setShowConfirmDialog(false);
  };

  // Calculate total nutrients only from completed meals
  const totalNutrients = meals.reduce(
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
      return 'Please complete your profile first to generate a personalized diet plan prompt.';
    }

    const height = user.profile.height || 170;
    const weight = user.profile.weight || 70;
    const heightInM = height / 100;
    const bmi = (weight / (heightInM * heightInM)).toFixed(1);
    
    const healthConditionsText = user.profile.healthConditions && user.profile.healthConditions.length > 0 && !user.profile.healthConditions.includes('None') 
      ? user.profile.healthConditions.join(', ') 
      : 'no specific health conditions';

    return `Create a detailed daily diet plan for a ${user.profile.age || 25}-year-old ${user.profile.gender || 'person'} who is ${height}cm tall and weighs ${weight}kg (BMI: ${bmi}).

Their primary fitness goal is: ${user.profile.fitnessGoal || 'General Fitness'}
Health considerations: ${healthConditionsText}

Please provide a structured daily meal plan with:
1. Breakfast (8:00 AM) - Include specific foods, portions, and calories
2. Morning Snack (10:00 AM) - Light healthy snack
3. Lunch (12:00 PM) - Include specific foods, portions, and calories  
4. Afternoon Snack (3:00 PM) - Light healthy snack
5. Dinner (6:00 PM) - Include specific foods, portions, and calories
6. Evening Snack (10:00 PM) - Light, sleep-friendly snack (80-150 calories max)
   - Focus on foods that promote good sleep quality
   - Avoid caffeine, high sugar, heavy proteins, or large portions
   - Good options: herbal tea with nuts, Greek yogurt with berries, small banana, cottage cheese, or almonds
   - Foods with tryptophan, magnesium, or natural melatonin precursors are preferred
7. Daily water intake recommendations
8. Total daily calorie target and macro breakdown (protein, carbs, fats)
9. Special dietary considerations for their health conditions
10. Weekly meal prep suggestions

Format the response as a structured daily plan that can be easily followed. Consider their fitness goal of ${user.profile.fitnessGoal || 'General Fitness'} when calculating nutritional needs.`;
  };

  const generateAIDietPlan = async () => {
    if (!user?.profile) {
      setAiError('Please complete your profile first to generate an AI diet plan.');
      return;
    }

    setIsGeneratingAI(true);
    setAiError('');

    try {
      const prompt = customPrompt || generatePersonalizedPrompt();
      const backendAIService = new BackendAIService();
      const aiDietPlan = await backendAIService.generateDietPlan(prompt);
      
      // Convert AI diet plan to our meal format with 6 meals including 10 PM
      const newMeals: DailyMeals[] = [
        {
          time: aiDietPlan.breakfast?.time || '8:00 AM',
          meal: {
            name: aiDietPlan.breakfast?.foods?.join(', ') || 'Breakfast meal',
            calories: aiDietPlan.breakfast?.calories || 400,
            protein: Math.round((aiDietPlan.macros?.protein || 120) * 0.25),
            carbs: Math.round((aiDietPlan.macros?.carbs || 150) * 0.25),
            fats: Math.round((aiDietPlan.macros?.fats || 60) * 0.25),
            completed: false,
          },
        },
        {
          time: aiDietPlan.morningSnack?.time || '10:00 AM',
          meal: {
            name: aiDietPlan.morningSnack?.foods?.join(', ') || 'Morning Snack (Apple with almonds)',
            calories: aiDietPlan.morningSnack?.calories || 150,
            protein: Math.round((aiDietPlan.macros?.protein || 120) * 0.08),
            carbs: Math.round((aiDietPlan.macros?.carbs || 150) * 0.12),
            fats: Math.round((aiDietPlan.macros?.fats || 60) * 0.12),
            completed: false,
          },
        },
        {
          time: aiDietPlan.lunch?.time || '12:00 PM',
          meal: {
            name: aiDietPlan.lunch?.foods?.join(', ') || 'Lunch meal',
            calories: aiDietPlan.lunch?.calories || 500,
            protein: Math.round((aiDietPlan.macros?.protein || 120) * 0.35),
            carbs: Math.round((aiDietPlan.macros?.carbs || 150) * 0.35),
            fats: Math.round((aiDietPlan.macros?.fats || 60) * 0.35),
            completed: false,
          },
        },
        {
          time: aiDietPlan.afternoonSnack?.time || '3:00 PM',
          meal: {
            name: aiDietPlan.afternoonSnack?.foods?.join(', ') || 'Afternoon Snack (Greek yogurt with berries)',
            calories: aiDietPlan.afternoonSnack?.calories || 120,
            protein: Math.round((aiDietPlan.macros?.protein || 120) * 0.1),
            carbs: Math.round((aiDietPlan.macros?.carbs || 150) * 0.1),
            fats: Math.round((aiDietPlan.macros?.fats || 60) * 0.08),
            completed: false,
          },
        },
        {
          time: aiDietPlan.dinner?.time || '6:00 PM',
          meal: {
            name: aiDietPlan.dinner?.foods?.join(', ') || 'Dinner meal',
            calories: aiDietPlan.dinner?.calories || 450,
            protein: Math.round((aiDietPlan.macros?.protein || 120) * 0.32),
            carbs: Math.round((aiDietPlan.macros?.carbs || 150) * 0.28),
            fats: Math.round((aiDietPlan.macros?.fats || 60) * 0.32),
            completed: false,
          },
        },
        {
          time: aiDietPlan.eveningSnack?.time || '10:00 PM',
          meal: {
            name: aiDietPlan.eveningSnack?.foods?.join(', ') || 'Evening Snack (Herbal tea with 10 almonds)',
            calories: aiDietPlan.eveningSnack?.calories || 100,
            protein: Math.round((aiDietPlan.macros?.protein || 120) * 0.05),
            carbs: Math.round((aiDietPlan.macros?.carbs || 150) * 0.05),
            fats: Math.round((aiDietPlan.macros?.fats || 60) * 0.13),
            completed: false,
          },
        },
      ];

      setMeals(newMeals);
    } catch (error) {
      console.error('Error generating AI diet plan:', error);
      
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
              <h2 className="text-2xl font-bold text-gray-900">AI Diet Plan Generator</h2>
              <div className="flex space-x-3">
                {!isLoadingFromStorage && meals.length === 0 && (
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
                {!isLoadingFromStorage && meals.length > 0 && (
                  <button
                    onClick={clearDietPlan}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Plan</span>
                  </button>
                )}
                {!isLoadingFromStorage && meals.length === 0 && (
                  <button
                    onClick={generateAIDietPlan}
                    disabled={isGeneratingAI}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate AI Diet Plan</span>
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

            {/* Personalized Prompt Section - Only show when no diet plan exists and not loading */}
            {!isLoadingFromStorage && meals.length === 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Your Personalized Diet Plan Prompt
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
                      placeholder="Customize your diet plan prompt..."
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

            {/* Loading State */}
            {isLoadingFromStorage && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading your diet plan...</span>
              </div>
            )}

            {/* Generated Results Section */}
            {!isLoadingFromStorage && meals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Diet Plan</h3>
                
                {/* Nutrition Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-600">Total Calories</h4>
                    <p className="text-2xl font-bold text-blue-900">{totalNutrients.calories}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-600">Protein</h4>
                    <p className="text-2xl font-bold text-green-900">{totalNutrients.protein}g</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-600">Carbs</h4>
                    <p className="text-2xl font-bold text-yellow-900">{totalNutrients.carbs}g</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-600">Fats</h4>
                    <p className="text-2xl font-bold text-red-900">{totalNutrients.fats}g</p>
                  </div>
                </div>

                {/* Meal List */}
                <div className="space-y-4">
                  {meals.map((mealTime, index) => (
                    <div
                      key={mealTime.time}
                      className={`p-4 rounded-lg ${mealTime.meal.completed ? 'bg-green-50' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{mealTime.meal.name}</h3>
                            <span className="text-sm text-gray-500">{mealTime.time}</span>
                          </div>
                          <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                            <span>{mealTime.meal.calories} cal</span>
                            <span>{mealTime.meal.protein}g protein</span>
                            <span>{mealTime.meal.carbs}g carbs</span>
                            <span>{mealTime.meal.fats}g fats</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleMealCompletion(index)}
                          className={`ml-4 p-2 rounded-full ${mealTime.meal.completed ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <svg
                            className={`h-5 w-5 ${mealTime.meal.completed ? 'text-white' : 'text-gray-500'}`}
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
                <h3 className="text-lg font-medium text-gray-900">Delete Diet Plan</h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete your diet plan? This action cannot be undone and you will lose all your current diet data.
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