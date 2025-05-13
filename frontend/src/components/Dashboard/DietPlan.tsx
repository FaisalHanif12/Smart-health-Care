import { useState } from 'react';

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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Diet Plan</h2>

      {/* Nutrition Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
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
  );
}