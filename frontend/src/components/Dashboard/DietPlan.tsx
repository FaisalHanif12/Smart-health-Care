import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OpenAIService from '../../services/openaiService';
import type { DietPlan as AIDietPlan } from '../../services/openaiService';
import { getOpenAIKey } from '../../config/api';

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
  const [meals, setMeals] = useState<DailyMeals[]>([
    {
      time: '8:00 AM',
      meal: {
        name: 'Oatmeal with Fruits',
        calories: 350,
        protein: 12,
        carbs: 55,
        fats: 8,
        completed: false,
      },
    },
    {
      time: '11:00 AM',
      meal: {
        name: 'Greek Yogurt with Nuts',
        calories: 250,
        protein: 15,
        carbs: 20,
        fats: 12,
        completed: false,
      },
    },
    {
      time: '2:00 PM',
      meal: {
        name: 'Grilled Chicken Salad',
        calories: 400,
        protein: 35,
        carbs: 25,
        fats: 15,
        completed: false,
      },
    },
    {
      time: '5:00 PM',
      meal: {
        name: 'Protein Shake',
        calories: 200,
        protein: 25,
        carbs: 15,
        fats: 5,
        completed: false,
      },
    },
    {
      time: '8:00 PM',
      meal: {
        name: 'Salmon with Quinoa',
        calories: 450,
        protein: 40,
        carbs: 35,
        fats: 20,
        completed: false,
      },
    },
  ]);

  const toggleMealCompletion = (index: number) => {
    const newMeals = [...meals];
    newMeals[index].meal.completed = !newMeals[index].meal.completed;
    setMeals(newMeals);
  };

  const totalNutrients = meals.reduce(
    (acc, { meal }) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
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
2. Lunch (12:00 PM) - Include specific foods, portions, and calories  
3. Dinner (6:00 PM) - Include specific foods, portions, and calories
4. 2 healthy snacks between meals
5. Daily water intake recommendations
6. Total daily calorie target and macro breakdown (protein, carbs, fats)
7. Special dietary considerations for their health conditions
8. Weekly meal prep suggestions

Format the response as a structured daily plan that can be easily followed. Consider their fitness goal of ${user.profile.fitnessGoal || 'General Fitness'} when calculating nutritional needs.`;
  };

  const generateAIDietPlan = async () => {
    if (!user?.profile) {
      setAiError('Please complete your profile first to generate an AI diet plan.');
      return;
    }

    const apiKey = getOpenAIKey();
    if (!apiKey) {
      setAiError('OpenAI API key not configured. Please check your environment variables.');
      return;
    }

    setIsGeneratingAI(true);
    setAiError('');

    try {
      const prompt = customPrompt || generatePersonalizedPrompt();
      const openaiService = new OpenAIService(apiKey);
      const aiDietPlan = await openaiService.generateDietPlan(prompt);
      
      // Convert AI diet plan to our meal format
      const newMeals: DailyMeals[] = [
        {
          time: aiDietPlan.breakfast.time,
          meal: {
            name: aiDietPlan.breakfast.foods.join(', '),
            calories: aiDietPlan.breakfast.calories,
            protein: Math.round(aiDietPlan.macros.protein * 0.3),
            carbs: Math.round(aiDietPlan.macros.carbs * 0.3),
            fats: Math.round(aiDietPlan.macros.fats * 0.3),
            completed: false,
          },
        },
        {
          time: aiDietPlan.lunch.time,
          meal: {
            name: aiDietPlan.lunch.foods.join(', '),
            calories: aiDietPlan.lunch.calories,
            protein: Math.round(aiDietPlan.macros.protein * 0.4),
            carbs: Math.round(aiDietPlan.macros.carbs * 0.4),
            fats: Math.round(aiDietPlan.macros.fats * 0.4),
            completed: false,
          },
        },
        {
          time: aiDietPlan.dinner.time,
          meal: {
            name: aiDietPlan.dinner.foods.join(', '),
            calories: aiDietPlan.dinner.calories,
            protein: Math.round(aiDietPlan.macros.protein * 0.3),
            carbs: Math.round(aiDietPlan.macros.carbs * 0.3),
            fats: Math.round(aiDietPlan.macros.fats * 0.3),
            completed: false,
          },
        },
      ];

      // Add snacks if provided
      if (aiDietPlan.snacks && aiDietPlan.snacks.length > 0) {
        aiDietPlan.snacks.forEach((snack, index) => {
          newMeals.push({
            time: index === 0 ? '10:00 AM' : '3:00 PM',
            meal: {
              name: snack,
              calories: Math.round(100 + Math.random() * 100),
              protein: 5,
              carbs: 15,
              fats: 3,
              completed: false,
            },
          });
        });
      }

      setMeals(newMeals);
    } catch (error) {
      console.error('Error generating AI diet plan:', error);
      setAiError('Failed to generate AI diet plan. Please try again.');
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
                <button
                  onClick={handleEditPrompt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{isEditingPrompt ? 'Cancel Edit' : 'Edit Prompt'}</span>
                </button>
                <button
                  onClick={generateAIDietPlan}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGeneratingAI ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              </div>
            </div>

            {aiError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{aiError}</p>
              </div>
            )}

            {/* Personalized Prompt Section */}
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

            {/* Generated Results Section */}
            {meals.length > 0 && (
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
    </div>
  );
}