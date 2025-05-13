import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Dummy data for the dashboard
  const [userData] = useState({
    name: 'John Doe',
    goal: 'Fat Burning',
    caloriesConsumed: 1200,
    caloriesRemaining: 800,
    dailyCalorieGoal: 2000
  });

  const [dietPlan] = useState([
    { meal: 'Breakfast', food: 'Oatmeal with berries and nuts', calories: 350, completed: false },
    { meal: 'Lunch', food: 'Grilled chicken salad with olive oil dressing', calories: 450, completed: false },
    { meal: 'Snack', food: 'Greek yogurt with honey', calories: 200, completed: false },
    { meal: 'Dinner', food: 'Baked salmon with steamed vegetables', calories: 500, completed: false }
  ]);

  const [workoutPlan] = useState([
    { name: 'Cardio', description: '30 minutes of jogging or cycling', completed: false },
    { name: 'HIIT', description: '15 minutes of high-intensity interval training', completed: false },
    { name: 'Strength', description: '3 sets of 12 reps for major muscle groups', completed: false }
  ]);

  const [storeItems] = useState([
    { id: 1, name: 'Organic Eggs', price: '$3.99', image: '🥚' },
    { id: 2, name: 'Protein Powder', price: '$24.99', image: '💪' },
    { id: 3, name: 'Quinoa Pack', price: '$5.99', image: '🌾' },
    { id: 4, name: 'Avocados (3)', price: '$4.99', image: '🥑' }
  ]);

  const [progressData] = useState({
    currentWeek: 2,
    weightLost: '2.5kg',
    prediction: 'On track to lose 5kg in 1 month',
    motivation: 'Great progress! Keep up the good work and stay consistent with your diet and exercise routine.'
  });

  const handleSetNewGoal = () => {
    navigate('/onboarding');
  };

  const toggleMealCompletion = (index: number) => {
    // In a real app, this would update the state and backend
    console.log(`Toggled meal completion for index ${index}`);
  };

  const toggleWorkoutCompletion = (index: number) => {
    // In a real app, this would update the state and backend
    console.log(`Toggled workout completion for index ${index}`);
  };

  const addToCart = (itemId: number) => {
    // In a real app, this would add to cart
    console.log(`Added item ${itemId} to cart`);
  };

  const markAsBought = (itemId: number) => {
    // In a real app, this would mark as bought
    console.log(`Marked item ${itemId} as bought`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Smart Health Tracker</h1>
          <button 
            onClick={handleSetNewGoal}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors duration-200"
          >
            Set New Goal
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* User Info & Calorie Counter */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Welcome, {userData.name}</h2>
              <p className="text-white/70">Current Goal: {userData.goal}</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 rounded-lg p-4 w-full md:w-auto">
              <h3 className="text-lg font-medium text-white mb-2">Daily Calories</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-white/70">Consumed</p>
                  <p className="text-xl font-bold text-white">{userData.caloriesConsumed}</p>
                </div>
                <div className="h-10 w-px bg-white/30"></div>
                <div>
                  <p className="text-sm text-white/70">Remaining</p>
                  <p className="text-xl font-bold text-white">{userData.caloriesRemaining}</p>
                </div>
                <div className="h-10 w-px bg-white/30"></div>
                <div>
                  <p className="text-sm text-white/70">Goal</p>
                  <p className="text-xl font-bold text-white">{userData.dailyCalorieGoal}</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-slate-500 h-2.5 rounded-full" 
                  style={{ width: `${(userData.caloriesConsumed / userData.dailyCalorieGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Progress Tracker</h2>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-white/70">Current Week</p>
                <p className="text-xl font-bold text-white">{progressData.currentWeek}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Weight Lost</p>
                <p className="text-xl font-bold text-white">{progressData.weightLost}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-white/70">1 Month Prediction</p>
              <p className="text-white">{progressData.prediction}</p>
            </div>
            <div className="bg-slate-500/20 border border-slate-500/30 rounded-lg p-3">
              <p className="text-white">{progressData.motivation}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;