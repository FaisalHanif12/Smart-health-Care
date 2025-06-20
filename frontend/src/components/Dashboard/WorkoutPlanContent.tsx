import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
// Import both services
import OpenAIService from '../../services/openaiService';
import BackendAIService from '../../services/backendAIService';
import { PlanRenewalService } from '../../services/planRenewalService';

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
  const { user } = useAuth();
  const { archiveCurrentProgress } = useProgress();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    completionRate: 0
  });

  // Generate prompt from user profile
  const generatePromptFromProfile = () => {
    if (!user?.profile) return '';
    
    const { age, gender, height, weight, healthConditions, fitnessGoal } = user.profile;
    
    return `Create a personalized workout plan for me:

Personal Information:
- Age: ${age} years old
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Goal: ${fitnessGoal}
- Health Conditions: ${healthConditions?.filter(c => c !== 'None').join(', ') || 'None'}

Based on my profile, please create a workout plan that:
1. Aligns with my ${fitnessGoal} goal
2. Considers my health conditions: ${healthConditions?.join(', ')}
3. Is appropriate for my age (${age}) and gender (${gender})
4. Provides progressive training suitable for my current fitness level

Please ensure exercises are safe, effective, and specifically designed for my goal of ${fitnessGoal}.`;
  };

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

    // Generate prompt from profile when component loads
    const prompt = generatePromptFromProfile();
    setGeneratedPrompt(prompt);
  }, [user]);

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
    const promptToUse = generatedPrompt;
    
    if (!promptToUse.trim()) {
      alert('Please provide a prompt for generating your workout plan.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Try backend service first (GPT-4), fallback to frontend service (GPT-3.5)
      let workoutData;
      
      try {
        console.log('🔄 Attempting to generate workout plan with Backend AI Service (GPT-4)...');
        const backendService = new BackendAIService();
        workoutData = await backendService.generateWorkoutPlan(promptToUse);
        console.log('✅ Backend AI Service (GPT-4) successful!');
      } catch (backendError) {
        console.warn('⚠️ Backend AI Service failed, trying Frontend OpenAI Service (GPT-3.5)...', backendError);
        
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        workoutData = await openaiService.generateWorkoutPlan(promptToUse);
        console.log('✅ Frontend OpenAI Service (GPT-4) successful!');
      }
      
      // Convert the AI response to our format
      const convertedPlan: WorkoutDay[] = Object.entries(workoutData).map(([day, data]: [string, any]) => ({
        day: day,
        exercises: data.exercises?.map((exercise: any) => ({
          name: exercise.name,
          sets: exercise.sets?.toString() || '3',
          reps: exercise.reps?.toString() || '10-12',
          rest: exercise.restTime || '60s',
          notes: exercise.equipment ? `Equipment: ${exercise.equipment}` : undefined,
          completed: false
        })) || []
      }));

      saveWorkoutPlan(convertedPlan);
      
      // Initialize plan metadata for auto-renewal system
      const renewalService = PlanRenewalService.getInstance();
      const planDuration = localStorage.getItem('planDuration') || '3 months';
      const totalWeeks = planDuration.includes('3') ? 12 : planDuration.includes('6') ? 24 : 52;
      renewalService.initializePlanMetadata('workout', totalWeeks);
    } catch (error) {
      console.error('❌ Error generating workout plan:', error);
      alert(`Failed to generate workout plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`);
    } finally {
      setIsLoading(false);
    }
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

  const clearWorkoutPlan = () => {
    setShowClearConfirm(true);
  };

  const confirmClearPlan = () => {
    // Archive current progress before clearing
    archiveCurrentProgress();
    
    localStorage.removeItem('workoutPlan');
    setWorkoutPlan([]);
    setWeeklyStats({ totalWorkouts: 0, completedWorkouts: 0, completionRate: 0 });
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

  const openPromptDialog = () => {
    setCustomPrompt(generatedPrompt);
    setShowPromptDialog(true);
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) {
      alert('Please provide a prompt for generating your workout plan.');
      return;
    }
    
    setGeneratedPrompt(customPrompt);
    setShowPromptDialog(false);
    
    // Generate with custom prompt
    setIsLoading(true);
    
    try {
      let workoutData;
      
      try {
        console.log('🔄 Attempting to generate workout plan with Backend AI Service (GPT-4)...');
        const backendService = new BackendAIService();
        workoutData = await backendService.generateWorkoutPlan(customPrompt);
        console.log('✅ Backend AI Service (GPT-4) successful!');
      } catch (backendError) {
        console.warn('⚠️ Backend AI Service failed, trying Frontend OpenAI Service (GPT-3.5)...', backendError);
        
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        workoutData = await openaiService.generateWorkoutPlan(customPrompt);
        console.log('✅ Frontend OpenAI Service successful!');
      }
      
      const convertedPlan: WorkoutDay[] = Object.entries(workoutData).map(([day, data]: [string, any]) => ({
        day: day,
        exercises: data.exercises?.map((exercise: any) => ({
          name: exercise.name,
          sets: exercise.sets?.toString() || '3',
          reps: exercise.reps?.toString() || '10-12',
          rest: exercise.restTime || '60s',
          notes: exercise.equipment ? `Equipment: ${exercise.equipment}` : undefined,
          completed: false
        })) || []
      }));

      saveWorkoutPlan(convertedPlan);
      
      // Initialize plan metadata for auto-renewal system
      const renewalService = PlanRenewalService.getInstance();
      const planDuration = localStorage.getItem('planDuration') || '3 months';
      const totalWeeks = planDuration.includes('3') ? 12 : planDuration.includes('6') ? 24 : 52;
      renewalService.initializePlanMetadata('workout', totalWeeks);
    } catch (error) {
      console.error('❌ Error generating workout plan:', error);
      alert(`Failed to generate workout plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`);
    } finally {
      setIsLoading(false);
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

      {/* Workout Plan Display */}
      {workoutPlan.length > 0 ? (
        <>
          {/* Action Buttons - when plan exists - Only show Clear Plan button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={clearWorkoutPlan}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Clear Plan
            </button>
          </div>

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
        </>
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
              onClick={() => generateWorkoutPlan()}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Generating with AI...' : '🤖 Create Your Plan with AI'}
            </button>
            
            <button
              onClick={openPromptDialog}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              ✏️ Edit Prompt
            </button>
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
                <h3 className="text-lg font-semibold text-gray-900">Clear Workout Plan</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear your workout plan? Your current progress will be automatically archived and preserved. This action will only remove the plan structure so you can create a new one.
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

      {/* Edit Prompt Dialog */}
      {showPromptDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Workout Plan Prompt</h3>
              <button
                onClick={() => setShowPromptDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customize your workout plan prompt:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={12}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe your ideal workout plan..."
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
                onClick={handleCustomGenerate}
                disabled={isLoading || !customPrompt.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  '🤖 Generate with Custom Prompt'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
