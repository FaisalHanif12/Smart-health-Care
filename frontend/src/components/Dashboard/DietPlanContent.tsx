import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { Link, useLocation } from 'react-router-dom';
import BackendAIService from '../../services/backendAIService';

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

export default function DietPlanContent() {
  const { user } = useAuth();
  const { updateDietProgress } = useProgress();
  const location = useLocation();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [meals, setMeals] = useState<DailyMeals[]>([]);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Close modals when location changes (navigation occurs)
  useEffect(() => {
    setShowConfirmDialog(false);
    setIsEditingPrompt(false);
  }, [location.pathname]);

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
    }
    setIsLoadingFromStorage(false);
  }, [user?._id]);

  // Save diet plan to localStorage whenever it changes and update progress
  useEffect(() => {
    if (user?._id && meals.length > 0) {
      localStorage.setItem(`dietPlan_${user._id}`, JSON.stringify(meals));
      updateDietProgress(meals);
    }
  }, [meals, user?._id, updateDietProgress]);

  const toggleMealCompletion = (index: number) => {
    const newMeals = [...meals];
    newMeals[index].meal.completed = !newMeals[index].meal.completed;
    setMeals(newMeals);
    updateDietProgress(newMeals);
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

Please provide a structured daily meal plan with specific foods, portions, and nutritional information.`;
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
      
      // Convert AI diet plan to our format
      const newMeals: DailyMeals[] = [
        {
          time: '8:00 AM',
          meal: {
            name: `Breakfast: ${aiDietPlan.breakfast?.foods?.join(', ') || 'Healthy breakfast'}`,
            calories: aiDietPlan.breakfast?.calories || 400,
            protein: 25,
            carbs: 50,
            fats: 15,
            completed: false,
          },
        },
        {
          time: '12:00 PM',
          meal: {
            name: `Lunch: ${aiDietPlan.lunch?.foods?.join(', ') || 'Healthy lunch'}`,
            calories: aiDietPlan.lunch?.calories || 500,
            protein: 35,
            carbs: 60,
            fats: 20,
            completed: false,
          },
        },
        {
          time: '6:00 PM',
          meal: {
            name: `Dinner: ${aiDietPlan.dinner?.foods?.join(', ') || 'Healthy dinner'}`,
            calories: aiDietPlan.dinner?.calories || 600,
            protein: 40,
            carbs: 70,
            fats: 25,
            completed: false,
          },
        },
      ];

      setMeals(newMeals);
    } catch (error) {
      console.error('Error generating AI diet plan:', error);
      setAiError('Failed to generate diet plan. Please try again.');
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

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Diet Plan</span>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Diet Plan Generator</h2>
          <div className="flex space-x-3">
            {!isLoadingFromStorage && meals.length === 0 && (
              <>
                <button
                  onClick={handleEditPrompt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditingPrompt ? 'Cancel Edit' : 'Edit Prompt'}
                </button>
                <button
                  onClick={generateAIDietPlan}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isGeneratingAI ? 'Generating...' : 'Generate AI Diet Plan'}
                </button>
              </>
            )}
            {!isLoadingFromStorage && meals.length > 0 && (
              <button
                onClick={clearDietPlan}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Plan
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
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your diet plan...</span>
          </div>
        )}

        {/* Diet Plan Display */}
        {!isLoadingFromStorage && meals.length > 0 && (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">📊 Daily Progress Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{totalNutrients.calories}</p>
                  <p className="text-sm text-gray-600">Calories Consumed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalNutrients.protein}g</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{totalNutrients.carbs}g</p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{totalNutrients.fats}g</p>
                  <p className="text-sm text-gray-600">Fats</p>
                </div>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">🍽️ Today's Meals</h3>
              {meals.map((mealTime, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    mealTime.meal.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleMealCompletion(index)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          mealTime.meal.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {mealTime.meal.completed && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <p className="font-medium text-gray-900">{mealTime.time}</p>
                        <p className="text-sm text-gray-600">{mealTime.meal.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{mealTime.meal.calories} cal</p>
                      <p className="text-xs text-gray-500">
                        P: {mealTime.meal.protein}g | C: {mealTime.meal.carbs}g | F: {mealTime.meal.fats}g
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingFromStorage && meals.length === 0 && !isEditingPrompt && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No diet plan generated</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating an AI-powered personalized diet plan.
            </p>
          </div>
        )}

        {/* Prompt Editing */}
        {isEditingPrompt && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              🎯 Personalized Diet Plan Prompt
            </h3>
            <div className="space-y-4">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full h-64 p-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter your custom diet plan prompt..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleSavePrompt}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Prompt
                </button>
                <button
                  onClick={() => setIsEditingPrompt(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Clear Diet Plan</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to clear your current diet plan? This action cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleConfirmClear}
                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 mb-2"
                  >
                    Yes, Clear Plan
                  </button>
                  <button
                    onClick={handleCancelClear}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 