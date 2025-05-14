import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

  const handleLogout = () => {
    localStorage.removeItem('userProfileComplete');
    localStorage.removeItem('userProfile');
    navigate('/');
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
        
        {/* Navigation Links */}
        <div className="mb-8 flex flex-col">
          <div className="space-y-2">
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
          </div>
          
          {/* Logout Button */}
          <div className="mt-auto pt-8">          
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm4 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
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
        </main>
      </div>
    </div>
  );
}