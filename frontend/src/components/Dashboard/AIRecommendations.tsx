import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import OpenAIService from '../../services/openaiService';
import BackendAIService from '../../services/backendAIService';

interface Recommendation {
  type: 'motivation' | 'warning' | 'suggestion' | 'achievement';
  title: string;
  message: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProgressAnalysis {
  planDuration: string; // e.g., "3 months", "6 months", "1 year"
  currentWeek: number;
  totalWeeks: number;
  dietCompliance: number;
  workoutCompliance: number;
  overall: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function AIRecommendations() {
  const { user } = useAuth();
  const { dietProgress, workoutProgress, getWeeklyDietProgress } = useProgress();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate plan analysis
  const calculateProgressAnalysis = (): ProgressAnalysis => {
    if (!user?._id) {
      // Return default analysis if no user
      return {
        planDuration: '3 months',
        currentWeek: 1,
        totalWeeks: 12,
        dietCompliance: 0,
        workoutCompliance: 0,
        overall: 'poor'
      };
    }

    // Get plan duration from localStorage or user preferences (defaulting to 3 months)
    const planDuration = localStorage.getItem(`planDuration_${user._id}`) || '3 months';
    const totalWeeks = planDuration.includes('3') ? 12 : planDuration.includes('6') ? 24 : 52;
    
    // Calculate current week (for demo, using date-based calculation)
    const planStartDate = localStorage.getItem(`planStartDate_${user._id}`);
    const startDate = planStartDate ? new Date(planStartDate) : new Date();
    const currentDate = new Date();
    const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.max(1, Math.min(weeksDiff + 1, totalWeeks));

    // Calculate compliance rates
    const dietCompliance = getWeeklyDietProgress();
    
    const workoutCompliance = workoutProgress.totalWorkouts > 0 
      ? (workoutProgress.completedWorkouts / workoutProgress.totalWorkouts) * 100 
      : 0;

    // Overall assessment
    const avgCompliance = (dietCompliance + workoutCompliance) / 2;
    let overall: 'excellent' | 'good' | 'fair' | 'poor';
    if (avgCompliance >= 90) overall = 'excellent';
    else if (avgCompliance >= 75) overall = 'good';
    else if (avgCompliance >= 60) overall = 'fair';
    else overall = 'poor';

    return {
      planDuration,
      currentWeek,
      totalWeeks,
      dietCompliance,
      workoutCompliance,
      overall
    };
  };

  // Generate AI recommendations based on progress
  const generateAIRecommendations = async (progressAnalysis: ProgressAnalysis) => {
    setIsLoading(true);
    
    try {
      const prompt = `As an AI health coach, analyze this user's fitness progress and provide personalized recommendations:

User Profile:
- Age: ${user?.profile?.age}
- Gender: ${user?.profile?.gender}
- Fitness Goal: ${user?.profile?.fitnessGoal}
- Health Conditions: ${user?.profile?.healthConditions?.join(', ') || 'None'}

Current Progress Analysis:
- Plan Duration: ${progressAnalysis.planDuration}
- Current Week: ${progressAnalysis.currentWeek} of ${progressAnalysis.totalWeeks}
- Diet Compliance: ${progressAnalysis.dietCompliance.toFixed(1)}%
- Workout Compliance: ${progressAnalysis.workoutCompliance.toFixed(1)}%
- Overall Performance: ${progressAnalysis.overall}

Please provide 3-4 specific, actionable recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "motivation|warning|suggestion|achievement",
      "title": "Short descriptive title",
      "message": "Detailed recommendation message",
      "priority": "high|medium|low"
    }
  ]
}

Focus on:
1. Celebrating achievements and progress
2. Addressing areas that need improvement
3. Providing specific, actionable advice
4. Motivating continued adherence to the plan
5. Adjusting expectations based on current week and total duration`;

      let aiResponse;
      
      try {
        const backendService = new BackendAIService();
        aiResponse = await backendService.generateAIRecommendations(prompt);
      } catch (backendError) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        aiResponse = await openaiService.generateAIRecommendations(prompt);
      }

      // Parse AI response
      const aiRecommendations = aiResponse.recommendations.map((rec: any) => ({
        ...rec,
        icon: getIconForType(rec.type)
      }));

      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Fallback to default recommendations
      setRecommendations(getDefaultRecommendations(progressAnalysis));
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon based on recommendation type
  const getIconForType = (type: string): string => {
    switch (type) {
      case 'motivation': return '💪';
      case 'warning': return '⚠️';
      case 'suggestion': return '💡';
      case 'achievement': return '🏆';
      default: return '💡';
    }
  };

  // Fallback recommendations if AI fails
  const getDefaultRecommendations = (progressAnalysis: ProgressAnalysis): Recommendation[] => {
    const recs: Recommendation[] = [];

    if (progressAnalysis.dietCompliance < 70) {
      recs.push({
        type: 'warning',
        title: 'Diet Plan Adherence',
        message: 'Your diet compliance is below target. Try meal prepping on weekends to stay consistent.',
        icon: '⚠️',
        priority: 'high'
      });
    }

    if (progressAnalysis.workoutCompliance > 80) {
      recs.push({
        type: 'achievement',
        title: 'Excellent Workout Consistency!',
        message: 'You\'re doing great with your workouts! Keep up the momentum.',
        icon: '🏆',
        priority: 'medium'
      });
    }

    if (progressAnalysis.currentWeek < 4) {
      recs.push({
        type: 'motivation',
        title: 'Building Healthy Habits',
        message: 'You\'re in the foundation phase. Focus on consistency over perfection.',
        icon: '💪',
        priority: 'medium'
      });
    }

    return recs;
  };

  // Load analysis and generate recommendations
  useEffect(() => {
    if (!user?._id) {
      // Reset data if no user
      setRecommendations([]);
      setAnalysis(null);
      return;
    }

    const analysis = calculateProgressAnalysis();
    setAnalysis(analysis);

    // Store plan start date if not exists (user-specific)
    if (!localStorage.getItem(`planStartDate_${user._id}`)) {
      localStorage.setItem(`planStartDate_${user._id}`, new Date().toISOString());
    }

    // Generate recommendations (throttled to avoid excessive API calls)
    const lastGeneration = localStorage.getItem(`lastRecommendationGeneration_${user._id}`);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!lastGeneration || (now - parseInt(lastGeneration)) > oneHour) {
      generateAIRecommendations(analysis);
      localStorage.setItem(`lastRecommendationGeneration_${user._id}`, now.toString());
    } else {
      // Load cached recommendations (user-specific)
      const cached = localStorage.getItem(`cachedRecommendations_${user._id}`);
      if (cached) {
        try {
          setRecommendations(JSON.parse(cached));
        } catch (error) {
          setRecommendations(getDefaultRecommendations(analysis));
        }
      } else {
        setRecommendations(getDefaultRecommendations(analysis));
      }
    }
  }, [user?._id, dietProgress, workoutProgress]); // Added user._id dependency

  // Cache recommendations (user-specific)
  useEffect(() => {
    if (recommendations.length > 0 && user?._id) {
      localStorage.setItem(`cachedRecommendations_${user._id}`, JSON.stringify(recommendations));
    }
  }, [recommendations, user?._id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30';
      case 'medium': return 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/30';
      case 'low': return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30';
      default: return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const getProgressColor = (overall: string) => {
    switch (overall) {
      case 'excellent': return 'text-green-600 dark:text-green-200 bg-green-100 dark:bg-green-800/50';
      case 'good': return 'text-blue-600 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/50';
      case 'fair': return 'text-yellow-600 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800/50';
      case 'poor': return 'text-red-600 dark:text-red-200 bg-red-100 dark:bg-red-800/50';
      default: return 'text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-800/50';
    }
  };

  if (!analysis) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🤖 AI Health Coach
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">Personalized insights based on your progress</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(analysis.overall)}`}>
            {analysis.overall.charAt(0).toUpperCase() + analysis.overall.slice(1)} Progress
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Week {analysis.currentWeek} of {analysis.totalWeeks} ({analysis.planDuration})
          </p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700 dark:text-green-200">Diet Compliance</span>
            <span className="text-lg font-bold text-green-900 dark:text-green-100">{analysis.dietCompliance.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-green-200 dark:bg-green-800/60 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${analysis.dietCompliance}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-200">Workout Compliance</span>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{analysis.workoutCompliance.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800/60 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${analysis.workoutCompliance}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Personalized Recommendations</h4>
        {recommendations.map((rec, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{rec.icon}</span>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{rec.title}</h5>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{rec.message}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                rec.priority === 'high' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' :
                rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200' :
                'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
              }`}>
                {rec.priority}
              </span>
            </div>
          </div>
        ))}
        
        {recommendations.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No recommendations available. Keep tracking your progress!</p>
          </div>
        )}
      </div>

      {/* Plan Duration Settings */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Duration:</span>
          <select
            value={analysis.planDuration}
            onChange={(e) => {
                                    if (user?._id) {
                        localStorage.setItem(`planDuration_${user._id}`, e.target.value);
                      }
              const newAnalysis = calculateProgressAnalysis();
              setAnalysis(newAnalysis);
              generateAIRecommendations(newAnalysis);
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3 months">3 Months</option>
            <option value="6 months">6 Months</option>
            <option value="1 year">1 Year</option>
          </select>
        </div>
      </div>
    </div>
  );
} 