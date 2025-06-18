import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Import both services
import OpenAIService from '../../services/openaiService';
import BackendAIService from '../../services/backendAIService';

interface Meal {
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  completed?: boolean;
  notes?: string;
}

interface DietDay {
  day: string;
  meals: Meal[];
  totalCalories: number;
  completed?: boolean;
}

export default function DietPlanContent() {
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    totalDays: 0,
    completedDays: 0,
    avgCalories: 0,
    completionRate: 0
  });

  // Generate prompt from user profile
  const generatePromptFromProfile = () => {
    if (!user?.profile) return '';
    
    const { age, gender, height, weight, healthConditions, fitnessGoal } = user.profile;
    
    return `Create a personalized 6-day diet plan for me (Monday through Saturday):

Personal Information:
- Age: ${age} years old
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Goal: ${fitnessGoal}
- Health Conditions: ${healthConditions?.filter(c => c !== 'None').join(', ') || 'None'}

Based on my profile, please create a 6-day diet plan that:
1. Aligns with my ${fitnessGoal} goal
2. Considers my health conditions: ${healthConditions?.join(', ')}
3. Is appropriate for my age (${age}) and gender (${gender})
4. Provides proper nutrition and calorie distribution for my goals
5. Takes into account my current weight (${weight}kg) and height (${height}cm)
6. Covers Monday through Saturday with varied meal options
7. Includes breakfast, lunch, and dinner for each day

Please ensure the meal plan is safe, nutritious, and specifically designed for my goal of ${fitnessGoal}.`;
  };

  // Load saved diet plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('dietPlan');
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan);
        setDietPlan(plan);
        calculateStats(plan);
      } catch (error) {
        console.error('Error loading diet plan:', error);
      }
    }

    // Generate prompt from profile when component loads
    const prompt = generatePromptFromProfile();
    setGeneratedPrompt(prompt);
  }, [user]);

  const calculateStats = (plan: DietDay[]) => {
    const totalDays = plan.length;
    const completedDays = plan.filter(day => day.completed).length;
    const totalCalories = plan.reduce((sum, day) => sum + day.totalCalories, 0);
    const avgCalories = totalDays > 0 ? totalCalories / totalDays : 0;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    setWeeklyStats({
      totalDays,
      completedDays,
      avgCalories,
      completionRate
    });
  };

  const saveDietPlan = (plan: DietDay[]) => {
    localStorage.setItem('dietPlan', JSON.stringify(plan));
    setDietPlan(plan);
    calculateStats(plan);
  };

  const generateDietPlan = async () => {
    const promptToUse = generatedPrompt;
    
    if (!promptToUse.trim()) {
      alert('Please provide a prompt for generating your diet plan.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Try backend service first (GPT-4), fallback to frontend service (GPT-3.5)
      let dietData;
      
      try {
        console.log('🔄 Attempting to generate diet plan with Backend AI Service (GPT-4)...');
        const backendService = new BackendAIService();
        dietData = await backendService.generateDietPlan(promptToUse);
        console.log('✅ Backend AI Service (GPT-4) successful!');
      } catch (backendError) {
        console.warn('⚠️ Backend AI Service failed, trying Frontend OpenAI Service (GPT-3.5)...', backendError);
        
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        dietData = await openaiService.generateDietPlan(promptToUse);
        console.log('✅ Frontend OpenAI Service (GPT-4) successful!');
      }
      
      // Convert the AI response to our format - Generate 6 days (Monday through Saturday)
      const totalCalories = (dietData as any).dailyCalories || (dietData as any).totalCalories || 2000;
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const convertedPlan: DietDay[] = daysOfWeek.map((dayName, index) => {
        // Create variations for each day by adjusting meal components slightly
        const breakfastCalories = Math.round(dietData.breakfast?.calories || 400 + (index * 10));
        const lunchCalories = Math.round(dietData.lunch?.calories || 500 + (index * 15));
        const dinnerCalories = Math.round(dietData.dinner?.calories || 600 + (index * 20));
        
        // Generate varied meals for each day
        const breakfastFoods = dietData.breakfast?.foods || ['Healthy breakfast'];
        const lunchFoods = dietData.lunch?.foods || ['Healthy lunch'];
        const dinnerFoods = dietData.dinner?.foods || ['Healthy dinner'];
        
        // Add some variation to meals across days
        const variations = [
          '', ' with fresh herbs', ' and seasonal vegetables', ' (grilled)', ' (baked)', ' with whole grains'
        ];
        
        return {
          day: dayName,
          totalCalories: totalCalories + (index * 50), // Slight calorie variation per day
          meals: [
            {
              name: `Breakfast: ${breakfastFoods.join(', ')}${variations[index] || ''}`,
              calories: breakfastCalories,
              protein: `${Math.round((dietData.macros?.protein || 120) * 0.25) + index}g`,
              carbs: `${Math.round((dietData.macros?.carbs || 150) * 0.3) + (index * 2)}g`,
              fats: `${Math.round((dietData.macros?.fats || 50) * 0.25) + index}g`,
              completed: false,
              notes: dietData.breakfast?.time || '8:00 AM'
            },
            {
              name: `Lunch: ${lunchFoods.join(', ')}${variations[index] || ''}`,
              calories: lunchCalories,
              protein: `${Math.round((dietData.macros?.protein || 120) * 0.35) + (index * 2)}g`,
              carbs: `${Math.round((dietData.macros?.carbs || 150) * 0.4) + (index * 3)}g`,
              fats: `${Math.round((dietData.macros?.fats || 50) * 0.35) + index}g`,
              completed: false,
              notes: dietData.lunch?.time || '12:00 PM'
            },
            {
              name: `Dinner: ${dinnerFoods.join(', ')}${variations[index] || ''}`,
              calories: dinnerCalories,
              protein: `${Math.round((dietData.macros?.protein || 120) * 0.4) + (index * 2)}g`,
              carbs: `${Math.round((dietData.macros?.carbs || 150) * 0.3) + (index * 2)}g`,
              fats: `${Math.round((dietData.macros?.fats || 50) * 0.4) + (index * 2)}g`,
              completed: false,
              notes: dietData.dinner?.time || '6:00 PM'
            }
          ]
        };
      });

      saveDietPlan(convertedPlan);
    } catch (error) {
      console.error('❌ Error generating diet plan:', error);
      alert(`Failed to generate diet plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMealComplete = (dayIndex: number, mealIndex: number) => {
    const updatedPlan = [...dietPlan];
    updatedPlan[dayIndex].meals[mealIndex].completed = 
      !updatedPlan[dayIndex].meals[mealIndex].completed;
    
    // Check if all meals in the day are complete
    const allMealsComplete = updatedPlan[dayIndex].meals.every(meal => meal.completed);
    updatedPlan[dayIndex].completed = allMealsComplete;
    
    saveDietPlan(updatedPlan);
  };



  const clearDietPlan = () => {
    if (window.confirm('Are you sure you want to clear your diet plan? This cannot be undone.')) {
      localStorage.removeItem('dietPlan');
      setDietPlan([]);
      setWeeklyStats({ totalDays: 0, completedDays: 0, avgCalories: 0, completionRate: 0 });
    }
  };

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      alert('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      alert('Failed to copy prompt. Please copy manually.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Plan</h1>
        <p className="text-gray-600">
          Your personalized nutrition journey starts here. Track your meals and reach your goals!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Days</p>
              <p className="text-2xl font-bold text-blue-900">{weeklyStats.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{weeklyStats.completedDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Avg Calories</p>
              <p className="text-2xl font-bold text-orange-900">{Math.round(weeklyStats.avgCalories)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-900">{weeklyStats.completionRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Diet Plan Display */}
      {dietPlan.length > 0 ? (
        <>
          {/* Action Buttons - when plan exists - Only show Clear Plan button */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={clearDietPlan}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Plan
            </button>
          </div>

          <div className="space-y-6">
            {dietPlan.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className={`p-6 border-b border-gray-200 ${day.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{day.day}</h3>
                      <p className="text-sm text-gray-600">{day.totalCalories} total calories</p>
                    </div>
                    {day.completed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Completed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {day.meals.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          meal.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <button
                                onClick={() => toggleMealComplete(dayIndex, mealIndex)}
                                className={`mr-3 p-1 rounded-full transition-colors ${
                                  meal.completed 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <h4 className={`text-lg font-semibold ${meal.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                                {meal.name}
                              </h4>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Calories:</span>
                                <span className="ml-1 text-gray-900">{meal.calories}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Protein:</span>
                                <span className="ml-1 text-gray-900">{meal.protein}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Carbs:</span>
                                <span className="ml-1 text-gray-900">{meal.carbs}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Fats:</span>
                                <span className="ml-1 text-gray-900">{meal.fats}</span>
                              </div>
                            </div>
                            
                            {meal.notes && (
                              <p className="mt-2 text-sm text-gray-600 italic">{meal.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Diet Plan Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by generating your personalized diet plan based on your fitness goals.
          </p>

          {/* Show AI prompt preview */}
          {generatedPrompt && (
            <div className="max-w-2xl mx-auto mb-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">AI will use this information from your profile:</h4>
              <div className="text-sm text-blue-800 bg-white p-3 rounded border">
                <div className="line-clamp-4">{generatedPrompt}</div>
              </div>
              <button
                onClick={copyPromptToClipboard}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📋 Copy Full Prompt
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => generateDietPlan()}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Generating with AI...' : '🤖 Create Your 6-Day Plan with AI'}
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
