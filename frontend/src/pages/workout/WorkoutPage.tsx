import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Exercise = {
  name: string;
  description: string;
  completed: boolean;
};

const WorkoutPage = () => {
  const navigate = useNavigate();
  
  const [workoutPlan] = useState<Exercise[]>([
    { name: 'Cardio', description: '30 minutes of jogging or cycling', completed: false },
    { name: 'HIIT', description: '15 minutes of high-intensity interval training', completed: false },
    { name: 'Strength', description: '3 sets of 12 reps for major muscle groups', completed: false }
  ]);

  const toggleWorkoutCompletion = (index: number) => {
    console.log(`Toggled workout completion for index ${index}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-8">
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Your Workout Plan</h1>
        
        <div className="space-y-4">
          {workoutPlan.map((workout, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-white">{workout.name}</h3>
                <p className="text-white/70">{workout.description}</p>
              </div>
              <button
                onClick={() => toggleWorkoutCompletion(index)}
                className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                  workout.completed 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {workout.completed ? 'Completed' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;