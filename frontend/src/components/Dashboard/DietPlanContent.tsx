import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
// Import both services
import OpenAIService from '../../services/openaiService';
import BackendAIService from '../../services/backendAIService';
import { PlanRenewalService } from '../../services/planRenewalService';

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
  const { archiveCurrentProgress, clearDietProgress } = useProgress();
  const [dietPlan, setDietPlan] = useState<DietDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
    
    return `Create a personalized 7-day diet plan for me (Monday through Sunday):

Personal Information:
- Age: ${age} years old
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Goal: ${fitnessGoal}
- Health Conditions: ${healthConditions?.filter(c => c !== 'None').join(', ') || 'None'}

Based on my profile, please create a 7-day diet plan that:
1. Aligns with my ${fitnessGoal} goal
2. Considers my health conditions: ${healthConditions?.join(', ')}
3. Is appropriate for my age (${age}) and gender (${gender})
4. Provides proper nutrition and calorie distribution for my goals
5. Takes into account my current weight (${weight}kg) and height (${height}cm)
6. Covers Monday through Sunday with varied meal options
7. Includes breakfast, lunch, and dinner for each day

Please ensure the meal plan is safe, nutritious, and specifically designed for my goal of ${fitnessGoal}.`;
  };

  // Load saved diet plan from localStorage
  useEffect(() => {
    if (!user?._id) {
      // Reset data if no user
      setDietPlan([]);
      setWeeklyStats({ totalDays: 0, completedDays: 0, avgCalories: 0, completionRate: 0 });
      return;
    }
    
    // Initialize with empty data first
    setDietPlan([]);
    setWeeklyStats({ totalDays: 0, completedDays: 0, avgCalories: 0, completionRate: 0 });
    
    const savedPlan = localStorage.getItem(`dietPlan_${user._id}`);
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan);
        setDietPlan(plan);
        calculateStats(plan);
      } catch (error) {
        console.error('Error loading diet plan:', error);
        setDietPlan([]);
        setWeeklyStats({ totalDays: 0, completedDays: 0, avgCalories: 0, completionRate: 0 });
      }
    }

    // Generate prompt from profile when component loads
    const prompt = generatePromptFromProfile();
    setGeneratedPrompt(prompt);
    setCustomPrompt(prompt);
  }, [user?._id]); // Changed dependency to user._id to ensure it resets when user changes

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
    if (!user?._id) return; // Don't save if no user
    
    localStorage.setItem(`dietPlan_${user._id}`, JSON.stringify(plan));
    setDietPlan(plan);
    calculateStats(plan);
  };

  const generateDietPlan = async (useCustomPrompt = false) => {
    const promptToUse = useCustomPrompt ? customPrompt : generatedPrompt;
    
    if (!promptToUse.trim()) {
      alert('Please provide a prompt for generating your diet plan.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('🤖 Initializing AI Diet Generator...');
    
    try {
      // Try backend service first (GPT-4), fallback to frontend service (GPT-3.5)
      let dietData;
      
      try {
        setLoadingMessage('🔄 Generating your personalized AI-based diet plan...');
        console.log('🔄 Attempting to generate diet plan with Backend AI Service (GPT-4)...');
        const backendService = new BackendAIService();
        dietData = await backendService.generateDietPlan(promptToUse);
        console.log('✅ Backend AI Service (GPT-4) successful!');
        setLoadingMessage('✅ AI diet plan generated! Formatting your meals...');
      } catch (backendError) {
        setLoadingMessage('🔄 Trying alternative AI service for your diet plan...');
        console.warn('⚠️ Backend AI Service failed, trying Frontend OpenAI Service (GPT-3.5)...', backendError);
        
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        dietData = await openaiService.generateDietPlan(promptToUse);
        console.log('✅ Frontend OpenAI Service (GPT-4) successful!');
        setLoadingMessage('✅ AI diet plan generated! Formatting your meals...');
      }
      
      // Determine total program duration in weeks from AI response
      const inferredWeeks = PlanRenewalService.extractDurationWeeks(dietData, 12);

      // Convert the AI response to our format - Generate 7 days (Monday through Sunday)
      const totalCalories = (dietData as any).dailyCalories || (dietData as any).totalCalories || 2000;
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
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
          '', ' with fresh herbs', ' and seasonal vegetables', ' (grilled)', ' (baked)', ' with whole grains', ' (roasted)'
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

      setLoadingMessage('💾 Saving your personalized diet plan...');
      saveDietPlan(convertedPlan);
      
      // Initialize plan metadata for auto-renewal system
      const renewalService = PlanRenewalService.getInstance();
      renewalService.initializePlanMetadata('diet', inferredWeeks, user?._id);
      
      setLoadingMessage('🎉 Your AI diet plan is ready! Enjoy your journey!');
      setShowPromptDialog(false);
    } catch (error) {
      console.error('❌ Error generating diet plan:', error);
      alert(`Failed to generate diet plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 1000); // Brief delay to show final success message
    }
  };

  const toggleMealComplete = (dayIndex: number, mealIndex: number) => {
    // Check if day is accessible before allowing toggle
    const dayName = extractDayName(dietPlan[dayIndex].day);
    if (!isDayAccessible(dayName)) {
      return; // Don't allow toggling for future days
    }
    
    const updatedPlan = [...dietPlan];
    updatedPlan[dayIndex].meals[mealIndex].completed = 
      !updatedPlan[dayIndex].meals[mealIndex].completed;
    
    // Check if all meals in the day are complete
    const allMealsComplete = updatedPlan[dayIndex].meals.every(meal => meal.completed);
    updatedPlan[dayIndex].completed = allMealsComplete;
    
    // Save diet plan - this will trigger the useEffect that updates the progress context
    saveDietPlan(updatedPlan);
  };

  const clearDietPlan = () => {
    setShowClearConfirm(true);
  };

  const confirmClearPlan = () => {
    if (!user?._id) return; // Don't clear if no user
    
    // Archive current progress before clearing
    archiveCurrentProgress();
    
    // Clear the diet plan from localStorage
    localStorage.removeItem(`dietPlan_${user._id}`);
    
    // Clear all diet-related progress from dashboard
    clearDietProgress();
    
    // Reset local component state
    setDietPlan([]);
    setWeeklyStats({ totalDays: 0, completedDays: 0, avgCalories: 0, completionRate: 0 });
    setShowClearConfirm(false);
  };

  const cancelClearPlan = () => {
    setShowClearConfirm(false);
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

  // Get current day and plan renewal service
  const renewalService = useMemo(() => PlanRenewalService.getInstance(), []);
  const currentDayName = useMemo(() => renewalService.getCurrentDayName(), []);

  // Function to check if a day is accessible (today or past days)
  const isDayAccessible = (dayName: string) => {
    return renewalService.isDayAccessible(dayName);
  };

  // Function to extract day name from the full day string (e.g., "Monday" from "Monday (Week 1)")
  const extractDayName = (fullDayName: string) => {
    return fullDayName.split(' ')[0];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Plan</h1>
        <p className="text-gray-600">
          Your personalized nutrition journey starts here. Track your meals and reach your goals!
        </p>
        <div className="mt-2 text-sm bg-blue-50 text-blue-800 p-2 rounded-md">
          <span className="font-semibold">Today is {currentDayName}:</span> You can only access and complete today's meals and previous days from this week.
        </div>
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
          <div className="flex justify-end mb-8">
            <button
              onClick={clearDietPlan}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Clear Plan
            </button>
          </div>

          <div className="space-y-6">
            {dietPlan.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className={`p-6 border-b border-gray-200 ${
                  day.completed 
                    ? 'bg-green-50' 
                    : extractDayName(day.day) === currentDayName
                      ? 'bg-blue-50'
                      : isDayAccessible(extractDayName(day.day))
                        ? 'bg-gray-50'
                        : 'bg-gray-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-900">{day.day}</h3>
                        {extractDayName(day.day) === currentDayName && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Today
                          </span>
                        )}
                        {!isDayAccessible(extractDayName(day.day)) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 sm:mt-0 sm:ml-3">{day.totalCalories} total calories</p>
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
                            : isDayAccessible(extractDayName(day.day))
                              ? 'border-gray-200 bg-white hover:border-gray-300'
                              : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <button
                                onClick={() => toggleMealComplete(dayIndex, mealIndex)}
                                disabled={!isDayAccessible(extractDayName(day.day))}
                                className={`mr-3 p-1 rounded-full transition-colors ${
                                  meal.completed 
                                    ? 'bg-green-600 text-white' 
                                    : isDayAccessible(extractDayName(day.day))
                                      ? 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <h4 className={`text-lg font-semibold ${
                                meal.completed 
                                  ? 'text-green-800 line-through' 
                                  : isDayAccessible(extractDayName(day.day))
                                    ? 'text-gray-900'
                                    : 'text-gray-500'
                              }`}>
                                {meal.name}
                                {!isDayAccessible(extractDayName(day.day)) && 
                                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                    Locked
                                  </span>
                                }
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
              onClick={() => generateDietPlan(false)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating AI Diet Plan...</span>
                </>
              ) : (
                <>🤖 Create Plan with AI</>
              )}
            </button>
            <button 
              onClick={() => setShowPromptDialog(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ✏️ Edit Prompt
            </button>
          </div>
        </div>
      )}


      {/* Prompt Edit Dialog */}
      {showPromptDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Customize Your Diet Prompt</h3>
              <button
                onClick={() => setShowPromptDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Prompt (edit to customize your diet plan):
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your diet preferences, goals, and any specific requirements..."
              />
            </div>
            
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowPromptDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => generateDietPlan(true)}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : '🤖 Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear Diet Plan</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear your diet plan? Your current progress will be automatically archived and preserved. This action will only remove the plan structure so you can create a new one.
            </p>
            
            <div className="flex gap-4 justify-end">
              <button
                onClick={cancelClearPlan}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearPlan}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Creating Your Diet Plan
              </h3>
              
              <div className="mb-6">
                <div className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {loadingMessage}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Our AI is analyzing your profile and creating a personalized nutrition plan just for you...
                </div>
              </div>
              
              {/* Progress Animation */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                This usually takes 10-20 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
