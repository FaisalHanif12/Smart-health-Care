import { useState, useEffect } from 'react';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
  completed?: boolean;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  completed?: boolean;
}

export default function WorkoutPlanContent() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    completionRate: 0
  });

  // Load saved workout plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('workoutPlan');
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan);
        setWorkoutPlan(plan);
        calculateStats(plan);
      } catch (error) {
        console.error('Error loading workout plan:', error);
      }
    }
  }, []);

  const calculateStats = (plan: WorkoutDay[]) => {
    const totalWorkouts = plan.length;
    const completedWorkouts = plan.filter(day => day.completed).length;
    const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
    
    setWeeklyStats({
      totalWorkouts,
      completedWorkouts,
      completionRate
    });
  };

  const saveWorkoutPlan = (plan: WorkoutDay[]) => {
    localStorage.setItem('workoutPlan', JSON.stringify(plan));
    setWorkoutPlan(plan);
    calculateStats(plan);
  };

  const generateWorkoutPlan = async () => {
    setIsLoading(true);
    
    // Simulate API call with default workout plan
    const defaultPlan: WorkoutDay[] = [
      {
        day: 'Monday - Upper Body',
        exercises: [
          { name: 'Push-ups', sets: '3', reps: '10-15', rest: '60s', notes: 'Keep core tight' },
          { name: 'Pull-ups/Assisted Pull-ups', sets: '3', reps: '5-10', rest: '90s', notes: 'Full range of motion' },
          { name: 'Shoulder Press', sets: '3', reps: '10-12', rest: '60s', notes: 'Control the weight' },
          { name: 'Bicep Curls', sets: '3', reps: '12-15', rest: '45s' },
          { name: 'Tricep Dips', sets: '3', reps: '8-12', rest: '60s' }
        ]
      },
      {
        day: 'Tuesday - Lower Body',
        exercises: [
          { name: 'Squats', sets: '3', reps: '12-15', rest: '90s', notes: 'Keep knees aligned' },
          { name: 'Lunges', sets: '3', reps: '10 each leg', rest: '60s', notes: 'Alternate legs' },
          { name: 'Deadlifts', sets: '3', reps: '8-10', rest: '90s', notes: 'Keep back straight' },
          { name: 'Calf Raises', sets: '3', reps: '15-20', rest: '45s' },
          { name: 'Leg Press', sets: '3', reps: '12-15', rest: '60s' }
        ]
      },
      {
        day: 'Wednesday - Core & Cardio',
        exercises: [
          { name: 'Plank', sets: '3', reps: '30-60s', rest: '30s', notes: 'Keep body straight' },
          { name: 'Russian Twists', sets: '3', reps: '20 each side', rest: '45s' },
          { name: 'Mountain Climbers', sets: '3', reps: '20 each leg', rest: '30s' },
          { name: 'Jumping Jacks', sets: '3', reps: '30s', rest: '30s' },
          { name: 'Burpees', sets: '3', reps: '5-10', rest: '60s' }
        ]
      }
    ];

    setTimeout(() => {
      saveWorkoutPlan(defaultPlan);
      setIsLoading(false);
    }, 1500);
  };

  const toggleExerciseComplete = (dayIndex: number, exerciseIndex: number) => {
    const updatedPlan = [...workoutPlan];
    updatedPlan[dayIndex].exercises[exerciseIndex].completed = 
      !updatedPlan[dayIndex].exercises[exerciseIndex].completed;
    
    // Check if all exercises in the day are complete
    const allExercisesComplete = updatedPlan[dayIndex].exercises.every(ex => ex.completed);
    updatedPlan[dayIndex].completed = allExercisesComplete;
    
    saveWorkoutPlan(updatedPlan);
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const resetPlan = workoutPlan.map(day => ({
        ...day,
        completed: false,
        exercises: day.exercises.map(ex => ({ ...ex, completed: false }))
      }));
      saveWorkoutPlan(resetPlan);
    }
  };

  const clearWorkoutPlan = () => {
    if (window.confirm('Are you sure you want to clear your workout plan? This cannot be undone.')) {
      localStorage.removeItem('workoutPlan');
      setWorkoutPlan([]);
      setWeeklyStats({ totalWorkouts: 0, completedWorkouts: 0, completionRate: 0 });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Plan</h1>
        <p className="text-gray-600">
          Your personalized fitness journey starts here. Track your progress and stay consistent!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Workouts</p>
              <p className="text-2xl font-bold text-blue-900">{weeklyStats.totalWorkouts}</p>
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
              <p className="text-2xl font-bold text-green-900">{weeklyStats.completedWorkouts}</p>
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
          onClick={generateWorkoutPlan}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate New Plan'}
        </button>

        {workoutPlan.length > 0 && (
          <>
            <button
              onClick={resetProgress}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Reset Progress
            </button>
            <button
              onClick={clearWorkoutPlan}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Plan
            </button>
          </>
        )}
      </div>

      {/* Workout Plan Display */}
      {workoutPlan.length > 0 ? (
        <div className="space-y-6">
          {workoutPlan.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className={`p-6 border-b border-gray-200 ${day.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{day.day}</h3>
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
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exerciseIndex}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        exercise.completed 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <button
                              onClick={() => toggleExerciseComplete(dayIndex, exerciseIndex)}
                              className={`mr-3 p-1 rounded-full transition-colors ${
                                exercise.completed 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <h4 className={`text-lg font-semibold ${exercise.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                              {exercise.name}
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Sets:</span>
                              <span className="ml-1 text-gray-900">{exercise.sets}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Reps:</span>
                              <span className="ml-1 text-gray-900">{exercise.reps}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Rest:</span>
                              <span className="ml-1 text-gray-900">{exercise.rest}</span>
                            </div>
                          </div>
                          
                          {exercise.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic">{exercise.notes}</p>
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
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Workout Plan Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by generating your personalized workout plan based on your fitness goals.
          </p>
          <button
            onClick={generateWorkoutPlan}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Create Your Plan'}
          </button>
        </div>
      )}
    </div>
  );
}
