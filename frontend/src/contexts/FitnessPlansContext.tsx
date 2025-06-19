import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface UserAnalysis {
  currentBMI: number;
  targetBMI: number;
  weightGoal: 'lose' | 'gain' | 'maintain';
  weightDifference: number;
  urgency: 'low' | 'moderate' | 'high';
  recommendedDuration: 3 | 6 | 12; // months
  planType: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';
}

interface MonthlyProgress {
  month: number;
  isCompleted: boolean;
  completionDate?: string;
  dietCompliance: number; // percentage
  workoutCompliance: number; // percentage
  weightChange: number;
  achievements: string[];
  aiPrediction: string;
  nextMonthRecommendations: string[];
}

interface FitnessPlan {
  id: string;
  startDate: string;
  endDate: string;
  totalMonths: number;
  currentMonth: number;
  userAnalysis: UserAnalysis;
  monthlyProgress: MonthlyProgress[];
  isActive: boolean;
  renewalRequired: boolean;
}

interface FitnessPlansContextType {
  currentPlan: FitnessPlan | null;
  analyzeUserProfile: () => UserAnalysis;
  createNewPlan: () => Promise<void>;
  updateMonthlyProgress: (month: number, data: Partial<MonthlyProgress>) => void;
  getCurrentMonthProgress: () => MonthlyProgress | null;
  getAIPrediction: (month: number) => Promise<string>;
  isWeeklyResetRequired: () => boolean;
  performWeeklyReset: () => void;
  shouldShowMonthlyCompletion: () => boolean;
  markMonthAsCompleted: (month: number) => void;
}

const FitnessPlansContext = createContext<FitnessPlansContextType | undefined>(undefined);

export const useFitnessPlans = () => {
  const context = useContext(FitnessPlansContext);
  if (!context) {
    throw new Error('useFitnessPlans must be used within a FitnessPlansProvider');
  }
  return context;
};

interface FitnessPlansProviderProps {
  children: ReactNode;
}

export const FitnessPlansProvider: React.FC<FitnessPlansProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<FitnessPlan | null>(null);
  const [lastWeeklyReset, setLastWeeklyReset] = useState<string>('');

  // Calculate BMI
  const calculateBMI = (weight: number, height: number): number => {
    const heightInM = height / 100;
    return weight / (heightInM * heightInM);
  };

  // Get ideal weight range
  const getIdealWeight = (height: number, gender: string): { min: number; max: number } => {
    const heightInM = height / 100;
    const minBMI = 18.5;
    const maxBMI = 24.9;
    
    return {
      min: minBMI * heightInM * heightInM,
      max: maxBMI * heightInM * heightInM
    };
  };

  // Analyze user profile to determine plan duration and type
  const analyzeUserProfile = (): UserAnalysis => {
    if (!user?.profile) {
      throw new Error('User profile not available');
    }

    const { weight, height, gender, fitnessGoal } = user.profile;
    const currentBMI = calculateBMI(weight, height);
    const idealWeight = getIdealWeight(height, gender);
    const currentWeight = weight;
    
    let targetWeight: number;
    let weightGoal: 'lose' | 'gain' | 'maintain';
    let planType: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';

    // Determine target weight and goal based on current BMI and fitness goal
    if (currentBMI < 18.5) {
      targetWeight = idealWeight.min + 2; // Target slightly above minimum
      weightGoal = 'gain';
      planType = 'weight_gain';
    } else if (currentBMI > 25) {
      targetWeight = idealWeight.max - 2; // Target slightly below maximum
      weightGoal = 'lose';
      planType = 'weight_loss';
    } else {
      // Normal BMI - base on fitness goal
      if (fitnessGoal === 'Muscle Building') {
        targetWeight = currentWeight + 5; // Gain muscle
        weightGoal = 'gain';
        planType = 'muscle_building';
      } else if (fitnessGoal === 'Fat Burning') {
        targetWeight = Math.max(idealWeight.min, currentWeight - 3);
        weightGoal = 'lose';
        planType = 'weight_loss';
      } else {
        targetWeight = currentWeight;
        weightGoal = 'maintain';
        planType = 'maintenance';
      }
    }

    const weightDifference = Math.abs(targetWeight - currentWeight);
    const targetBMI = calculateBMI(targetWeight, height);

    // Determine urgency and recommended duration
    let urgency: 'low' | 'moderate' | 'high';
    let recommendedDuration: 3 | 6 | 12;

    if (currentBMI < 16 || currentBMI > 35) {
      urgency = 'high';
      recommendedDuration = 12; // Severe cases need longer plans
    } else if (weightDifference > 15 || currentBMI < 18.5 || currentBMI > 30) {
      urgency = 'moderate';
      recommendedDuration = 6; // Moderate weight change needed
    } else {
      urgency = 'low';
      recommendedDuration = 3; // Minimal changes or maintenance
    }

    return {
      currentBMI,
      targetBMI,
      weightGoal,
      weightDifference,
      urgency,
      recommendedDuration,
      planType
    };
  };

  // Create new fitness plan
  const createNewPlan = async (): Promise<void> => {
    if (!user?._id) return;

    const analysis = analyzeUserProfile();
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + analysis.recommendedDuration);

    const monthlyProgress: MonthlyProgress[] = [];
    for (let i = 1; i <= analysis.recommendedDuration; i++) {
      monthlyProgress.push({
        month: i,
        isCompleted: false,
        dietCompliance: 0,
        workoutCompliance: 0,
        weightChange: 0,
        achievements: [],
        aiPrediction: await generateInitialPrediction(i, analysis),
        nextMonthRecommendations: []
      });
    }

    const newPlan: FitnessPlan = {
      id: `plan_${Date.now()}`,
      startDate,
      endDate: endDate.toISOString(),
      totalMonths: analysis.recommendedDuration,
      currentMonth: 1,
      userAnalysis: analysis,
      monthlyProgress,
      isActive: true,
      renewalRequired: false
    };

    setCurrentPlan(newPlan);
    localStorage.setItem(`fitnessPlan_${user._id}`, JSON.stringify(newPlan));
  };

  // Generate AI prediction for a specific month
  const generateInitialPrediction = async (month: number, analysis: UserAnalysis): Promise<string> => {
    const predictions = {
      1: {
        weight_loss: "You should see initial water weight loss (2-3 kg) and improved energy levels. Focus on building consistent habits.",
        weight_gain: "Expect gradual muscle gain (1-2 kg) with proper nutrition. Initial strength improvements will be noticeable.",
        muscle_building: "Foundation building phase. Expect improved form and technique with modest strength gains.",
        maintenance: "Focus on establishing routine. Energy levels and mood should improve significantly."
      },
      2: {
        weight_loss: "Steady fat loss continues (1-2 kg). Clothes should fit better. Cardiovascular endurance improves.",
        weight_gain: "Continued muscle development. Strength gains become more apparent. Appetite should normalize.",
        muscle_building: "Noticeable muscle definition. Strength increases become consistent. Recovery improves.",
        maintenance: "Routine is established. Overall fitness and stamina show marked improvement."
      },
      3: {
        weight_loss: "Significant progress visible. Target weight closer. Metabolic improvements stabilize.",
        weight_gain: "Healthy weight gain achieved. Muscle mass increased significantly. Strength peaked.",
        muscle_building: "Major muscle gains. Body composition dramatically improved. Peak performance.",
        maintenance: "Optimal fitness level maintained. Long-term healthy habits established."
      }
    };

    const monthKey = Math.min(month, 3) as 1 | 2 | 3;
    return predictions[monthKey][analysis.planType] || "Continue following your personalized plan for optimal results.";
  };

  // Get AI prediction for current progress
  const getAIPrediction = async (month: number): Promise<string> => {
    if (!currentPlan) return '';

    const progress = currentPlan.monthlyProgress[month - 1];
    const analysis = currentPlan.userAnalysis;
    
    // Generate prediction based on compliance and progress
    let prediction = '';
    
    if (progress.dietCompliance >= 80 && progress.workoutCompliance >= 80) {
      prediction = `Excellent progress! You're on track to ${analysis.weightGoal === 'lose' ? 'lose' : analysis.weightGoal === 'gain' ? 'gain' : 'maintain'} your target weight. `;
    } else if (progress.dietCompliance >= 60 && progress.workoutCompliance >= 60) {
      prediction = `Good progress with room for improvement. Consider increasing your commitment to see better results. `;
    } else {
      prediction = `Progress is slower than expected. Let's adjust your plan to make it more achievable. `;
    }

    // Add specific recommendations
    if (month < currentPlan.totalMonths) {
      prediction += await generateInitialPrediction(month + 1, analysis);
    } else {
      prediction += "You're approaching the end of your plan. Consider creating a new plan for continued progress.";
    }

    return prediction;
  };

  // Update monthly progress
  const updateMonthlyProgress = (month: number, data: Partial<MonthlyProgress>) => {
    if (!currentPlan || !user?._id) return;

    const updatedPlan = { ...currentPlan };
    const progressIndex = month - 1;
    
    if (progressIndex >= 0 && progressIndex < updatedPlan.monthlyProgress.length) {
      updatedPlan.monthlyProgress[progressIndex] = {
        ...updatedPlan.monthlyProgress[progressIndex],
        ...data
      };
      
      setCurrentPlan(updatedPlan);
      localStorage.setItem(`fitnessPlan_${user._id}`, JSON.stringify(updatedPlan));
    }
  };

  // Get current month progress
  const getCurrentMonthProgress = (): MonthlyProgress | null => {
    if (!currentPlan) return null;
    const currentMonth = getCurrentMonth();
    return currentPlan.monthlyProgress[currentMonth - 1] || null;
  };

  // Calculate current month based on start date
  const getCurrentMonth = (): number => {
    if (!currentPlan) return 1;
    
    const startDate = new Date(currentPlan.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    
    return Math.min(Math.max(monthsDiff + 1, 1), currentPlan.totalMonths);
  };

  // Check if weekly reset is required
  const isWeeklyResetRequired = (): boolean => {
    const now = new Date();
    const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const lastReset = lastWeeklyReset ? new Date(lastWeeklyReset) : null;
    
    return !lastReset || lastReset < currentWeekStart;
  };

  // Perform weekly reset of diet and workout plans
  const performWeeklyReset = () => {
    if (!user?._id) return;

    // Clear current week's diet and workout plans
    localStorage.removeItem('dietPlan');
    localStorage.removeItem('workoutPlan');
    
    // Update last reset date
    const now = new Date().toISOString();
    setLastWeeklyReset(now);
    localStorage.setItem(`lastWeeklyReset_${user._id}`, now);

    console.log('Weekly reset performed - diet and workout plans cleared');
  };

  // Check if monthly completion should be shown
  const shouldShowMonthlyCompletion = (): boolean => {
    if (!currentPlan) return false;
    
    const currentMonth = getCurrentMonth();
    const progress = currentPlan.monthlyProgress[currentMonth - 1];
    
    // Check if month is complete but not marked as completed
    return progress && !progress.isCompleted && 
           progress.dietCompliance >= 70 && 
           progress.workoutCompliance >= 70;
  };

  // Mark month as completed
  const markMonthAsCompleted = (month: number) => {
    updateMonthlyProgress(month, {
      isCompleted: true,
      completionDate: new Date().toISOString()
    });
  };

  // Load existing plan on mount
  useEffect(() => {
    if (user?._id) {
      const savedPlan = localStorage.getItem(`fitnessPlan_${user._id}`);
      const savedLastReset = localStorage.getItem(`lastWeeklyReset_${user._id}`);
      
      if (savedPlan) {
        try {
          const plan = JSON.parse(savedPlan);
          setCurrentPlan(plan);
        } catch (error) {
          console.error('Error loading fitness plan:', error);
        }
      }
      
      if (savedLastReset) {
        setLastWeeklyReset(savedLastReset);
      }
    }
  }, [user?._id]);

  // Auto-update current month and check for weekly resets
  useEffect(() => {
    if (currentPlan && user?._id) {
      const currentMonth = getCurrentMonth();
      if (currentMonth !== currentPlan.currentMonth) {
        const updatedPlan = { ...currentPlan, currentMonth };
        setCurrentPlan(updatedPlan);
        localStorage.setItem(`fitnessPlan_${user._id}`, JSON.stringify(updatedPlan));
      }

      // Check for weekly reset
      if (isWeeklyResetRequired()) {
        performWeeklyReset();
      }
    }
  }, [currentPlan, user?._id]);

  const value: FitnessPlansContextType = useMemo(() => ({
    currentPlan,
    analyzeUserProfile,
    createNewPlan,
    updateMonthlyProgress,
    getCurrentMonthProgress,
    getAIPrediction,
    isWeeklyResetRequired,
    performWeeklyReset,
    shouldShowMonthlyCompletion,
    markMonthAsCompleted
  }), [currentPlan, user?._id]);

  return (
    <FitnessPlansContext.Provider value={value}>
      {children}
    </FitnessPlansContext.Provider>
  );
}; 