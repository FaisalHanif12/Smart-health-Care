import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { Link } from 'react-router-dom';
import BackendAIService from '../../services/backendAIService';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  completed: boolean;
}

export default function WorkoutPlanContent() {
  console.log('WorkoutPlanContent component is rendering');
  const { user } = useAuth();
  const { updateWorkoutProgress } = useProgress();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);


  // Load workout plan from localStorage on component mount
  useEffect(() => {
    if (user?._id) {
      const savedWorkoutPlan = localStorage.getItem(`workoutPlan_${user._id}`);
      const savedWeekResetDate = localStorage.getItem(`lastWeekResetDate_${user._id}`);
      
      if (savedWorkoutPlan) {
        try {
          const parsedPlan = JSON.parse(savedWorkoutPlan);
          setWorkoutPlan(parsedPlan);
          
          // Check if we need to reset for new week
          const today = new Date();
          const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          const weekStartString = currentWeekStart.toDateString();
          
          if (savedWeekResetDate !== weekStartString) {
            // Reset completion status for new week
            const resetPlan = parsedPlan.map((day: WorkoutDay) => ({
              ...day,
              completed: false,
              exercises: day.exercises.map((exercise: Exercise) => ({
                ...exercise,
                completed: false
              }))
            }));
            setWorkoutPlan(resetPlan);
            localStorage.setItem(`workoutPlan_${user._id}`, JSON.stringify(resetPlan));
            localStorage.setItem(`lastWeekResetDate_${user._id}`, weekStartString);
          }
        } catch (error) {
          console.error('Error parsing saved workout plan:', error);
        }
      }
    }
    setIsLoadingFromStorage(false);
  }, [user?._id]);

  // Save workout plan to localStorage whenever it changes and update progress
  useEffect(() => {
    if (user?._id && workoutPlan.length > 0) {
      localStorage.setItem(`workoutPlan_${user._id}`, JSON.stringify(workoutPlan));
      updateWorkoutProgress(workoutPlan);
    }
  }, [workoutPlan, user?._id, updateWorkoutProgress]);

  const toggleExerciseCompletion = (dayIndex: number, exerciseIndex: number) => {
    const newPlan = [...workoutPlan];
    newPlan[dayIndex].exercises[exerciseIndex].completed = !newPlan[dayIndex].exercises[exerciseIndex].completed;
    
    // Check if all exercises in the day are completed
    const allExercisesCompleted = newPlan[dayIndex].exercises.every(exercise => exercise.completed);
    newPlan[dayIndex].completed = allExercisesCompleted;
    
    setWorkoutPlan(newPlan);
    updateWorkoutProgress(newPlan);
  };

  const clearWorkoutPlan = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    setWorkoutPlan([]);
    if (user?._id) {
      localStorage.removeItem(`workoutPlan_${user._id}`);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelClear = () => {
    setShowConfirmDialog(false);
  };

  // Generate personalized prompt based on user profile
  const generatePersonalizedPrompt = () => {
    if (!user?.profile) {
      return 'Please complete your profile first to generate a personalized workout plan prompt.';
    }

    const fitnessLevel = 'Beginner'; // Default fitness level
    const fitnessGoal = user.profile.fitnessGoal || 'General Fitness';
    const healthConditionsText = user.profile.healthConditions && user.profile.healthConditions.length > 0 && !user.profile.healthConditions.includes('None') 
      ? user.profile.healthConditions.join(', ') 
      : 'no specific health conditions';

    return `Create a detailed weekly workout plan for a ${user.profile.age || 25}-year-old ${user.profile.gender || 'person'} with ${fitnessLevel} fitness level.

Their primary fitness goal is: ${fitnessGoal}
Health considerations: ${healthConditionsText}

Please provide a structured weekly workout plan with specific exercises, sets, reps, and guidance.`;
  };

  const generateAIWorkoutPlan = async () => {
    if (!user?.profile) {
      setAiError('Please complete your profile first to generate an AI workout plan.');
      return;
    }

    setIsGeneratingAI(true);
    setAiError('');

    try {
      const prompt = customPrompt || generatePersonalizedPrompt();
      const backendAIService = new BackendAIService();
      // const aiWorkoutPlan = await backendAIService.generateWorkoutPlan(prompt);
      await backendAIService.generateWorkoutPlan(prompt);
      
      // Convert AI workout plan to our format
      const newWorkoutPlan: WorkoutDay[] = [
        {
          day: 'Monday',
          completed: false,
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 15, completed: false },
            { name: 'Squats', sets: 3, reps: 20, completed: false },
            { name: 'Plank', sets: 3, reps: 1, duration: 30, completed: false },
          ]
        },
        {
          day: 'Wednesday',
          completed: false,
          exercises: [
            { name: 'Pull-ups', sets: 3, reps: 8, completed: false },
            { name: 'Lunges', sets: 3, reps: 12, completed: false },
            { name: 'Burpees', sets: 3, reps: 10, completed: false },
          ]
        },
        {
          day: 'Friday',
          completed: false,
          exercises: [
            { name: 'Deadlifts', sets: 3, reps: 10, weight: 50, completed: false },
            { name: 'Bench Press', sets: 3, reps: 12, weight: 40, completed: false },
            { name: 'Mountain Climbers', sets: 3, reps: 20, completed: false },
          ]
        },
      ];

      setWorkoutPlan(newWorkoutPlan);
    } catch (error) {
      console.error('Error generating AI workout plan:', error);
      setAiError('Failed to generate workout plan. Please try again.');
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

  // Calculate completion stats
  const totalExercises = workoutPlan.reduce((acc, day) => acc + day.exercises.length, 0);
  const completedExercises = workoutPlan.reduce((acc, day) => 
    acc + day.exercises.filter(exercise => exercise.completed).length, 0
  );
  const completedDays = workoutPlan.filter(day => day.completed).length;

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Workout Plan</span>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Workout Plan Generator</h2>
          <div className="flex space-x-3">
            {!isLoadingFromStorage && workoutPlan.length === 0 && (
              <>
                <button
                  onClick={handleEditPrompt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditingPrompt ? 'Cancel Edit' : 'Edit Prompt'}
                </button>
                <button
                  onClick={generateAIWorkoutPlan}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isGeneratingAI ? 'Generating...' : 'Generate AI Workout Plan'}
                </button>
              </>
            )}
            {!isLoadingFromStorage && workoutPlan.length > 0 && (
              <button
                onClick={clearWorkoutPlan}
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
            <span className="ml-3 text-gray-600">Loading your workout plan...</span>
          </div>
        )}

        {/* Workout Plan Display */}
        {!isLoadingFromStorage && workoutPlan.length > 0 && (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">💪 Weekly Progress Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{completedDays}/{workoutPlan.length}</p>
                  <p className="text-sm text-gray-600">Days Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{completedExercises}/{totalExercises}</p>
                  <p className="text-sm text-gray-600">Exercises Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </div>
            </div>

            {/* Workout Days */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">🏋️‍♂️ This Week's Workouts</h3>
              {workoutPlan.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    day.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{day.day}</h4>
                    <div className="flex items-center space-x-2">
                      {day.completed && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div
                        key={exerciseIndex}
                        className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                          exercise.completed
                            ? 'bg-green-100 border border-green-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleExerciseCompletion(dayIndex, exerciseIndex)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              exercise.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {exercise.completed && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-gray-900">{exercise.name}</p>
                            <p className="text-sm text-gray-600">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && ` @ ${exercise.weight}kg`}
                              {exercise.duration && ` for ${exercise.duration}s`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingFromStorage && workoutPlan.length === 0 && !isEditingPrompt && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workout plan generated</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating an AI-powered personalized workout plan.
            </p>
          </div>
        )}

        {/* Prompt Editing */}
        {isEditingPrompt && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              🎯 Personalized Workout Plan Prompt
            </h3>
            <div className="space-y-4">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full h-64 p-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter your custom workout plan prompt..."
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Clear Workout Plan</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to clear your current workout plan? This action cannot be undone.
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