import { useState, useEffect } from 'react';

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
  const [dietPlan, setDietPlan] = useState<DietDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({
    totalDays: 0,
    completedDays: 0,
    avgCalories: 0,
    completionRate: 0
  });

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
  }, []);

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
    setIsLoading(true);
    
    // Simulate API call with default diet plan
    const defaultPlan: DietDay[] = [
      {
        day: 'Monday',
        totalCalories: 2200,
        meals: [
          { 
            name: 'Breakfast: Oatmeal with Berries', 
            calories: 350, 
            protein: '12g', 
            carbs: '58g', 
            fats: '8g',
            notes: 'Steel-cut oats with mixed berries and honey'
          },
          { 
            name: 'Lunch: Grilled Chicken Salad', 
            calories: 450, 
            protein: '35g', 
            carbs: '20g', 
            fats: '25g',
            notes: 'Mixed greens, grilled chicken, avocado, olive oil dressing'
          },
          { 
            name: 'Snack: Greek Yogurt with Nuts', 
            calories: 200, 
            protein: '15g', 
            carbs: '12g', 
            fats: '10g' 
          },
          { 
            name: 'Dinner: Salmon with Quinoa', 
            calories: 600, 
            protein: '40g', 
            carbs: '45g', 
            fats: '25g',
            notes: 'Baked salmon with steamed vegetables and quinoa'
          },
          { 
            name: 'Evening Snack: Protein Smoothie', 
            calories: 300, 
            protein: '25g', 
            carbs: '35g', 
            fats: '8g' 
          }
        ]
      },
      {
        day: 'Tuesday',
        totalCalories: 2150,
        meals: [
          { 
            name: 'Breakfast: Egg White Omelet', 
            calories: 300, 
            protein: '20g', 
            carbs: '15g', 
            fats: '15g',
            notes: 'Spinach, mushrooms, low-fat cheese'
          },
          { 
            name: 'Lunch: Turkey Wrap', 
            calories: 400, 
            protein: '25g', 
            carbs: '35g', 
            fats: '18g',
            notes: 'Whole wheat tortilla, lean turkey, vegetables'
          },
          { 
            name: 'Snack: Apple with Almond Butter', 
            calories: 250, 
            protein: '8g', 
            carbs: '25g', 
            fats: '15g' 
          },
          { 
            name: 'Dinner: Lean Beef Stir-fry', 
            calories: 550, 
            protein: '35g', 
            carbs: '40g', 
            fats: '22g',
            notes: 'Brown rice, mixed vegetables, lean beef strips'
          },
          { 
            name: 'Evening Snack: Cottage Cheese', 
            calories: 150, 
            protein: '15g', 
            carbs: '8g', 
            fats: '5g' 
          }
        ]
      },
      {
        day: 'Wednesday',
        totalCalories: 2100,
        meals: [
          { 
            name: 'Breakfast: Protein Pancakes', 
            calories: 380, 
            protein: '25g', 
            carbs: '45g', 
            fats: '12g',
            notes: 'Made with protein powder and oat flour'
          },
          { 
            name: 'Lunch: Quinoa Buddha Bowl', 
            calories: 420, 
            protein: '18g', 
            carbs: '55g', 
            fats: '16g',
            notes: 'Quinoa, chickpeas, roasted vegetables, tahini dressing'
          },
          { 
            name: 'Snack: Mixed Nuts', 
            calories: 200, 
            protein: '8g', 
            carbs: '8g', 
            fats: '16g' 
          },
          { 
            name: 'Dinner: Grilled Fish with Sweet Potato', 
            calories: 500, 
            protein: '30g', 
            carbs: '40g', 
            fats: '20g',
            notes: 'Cod or tilapia with roasted sweet potato and broccoli'
          },
          { 
            name: 'Evening Snack: Herbal Tea with Honey', 
            calories: 50, 
            protein: '0g', 
            carbs: '12g', 
            fats: '0g' 
          }
        ]
      }
    ];

    setTimeout(() => {
      saveDietPlan(defaultPlan);
      setIsLoading(false);
    }, 1500);
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

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const resetPlan = dietPlan.map(day => ({
        ...day,
        completed: false,
        meals: day.meals.map(meal => ({ ...meal, completed: false }))
      }));
      saveDietPlan(resetPlan);
    }
  };

  const clearDietPlan = () => {
    if (window.confirm('Are you sure you want to clear your diet plan? This cannot be undone.')) {
      localStorage.removeItem('dietPlan');
      setDietPlan([]);
      setWeeklyStats({ totalDays: 0, completedDays: 0, avgCalories: 0, completionRate: 0 });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Plan</h1>
        <p className="text-gray-600">
          Fuel your body with the right nutrition. Track your meals and reach your goals!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
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
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={generateDietPlan}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate New Plan'}
        </button>

        {dietPlan.length > 0 && (
          <>
            <button
              onClick={resetProgress}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Reset Progress
            </button>
            <button
              onClick={clearDietPlan}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Plan
            </button>
          </>
        )}
      </div>

      {/* Diet Plan Display */}
      {dietPlan.length > 0 ? (
        <div className="space-y-6">
          {dietPlan.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className={`p-6 border-b border-gray-200 ${day.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{day.day}</h3>
                    <p className="text-sm text-gray-600">Total Calories: {day.totalCalories}</p>
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
                          <div className="flex items-center mb-3">
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
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                            <div className="bg-blue-50 p-2 rounded">
                              <span className="font-medium text-blue-700">Calories:</span>
                              <span className="ml-1 text-blue-900 font-bold">{meal.calories}</span>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <span className="font-medium text-red-700">Protein:</span>
                              <span className="ml-1 text-red-900 font-bold">{meal.protein}</span>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="font-medium text-yellow-700">Carbs:</span>
                              <span className="ml-1 text-yellow-900 font-bold">{meal.carbs}</span>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <span className="font-medium text-purple-700">Fats:</span>
                              <span className="ml-1 text-purple-900 font-bold">{meal.fats}</span>
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
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Diet Plan Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by generating your personalized nutrition plan based on your dietary goals.
          </p>
          <button
            onClick={generateDietPlan}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Create Your Plan'}
          </button>
        </div>
      )}
    </div>
  );
}
