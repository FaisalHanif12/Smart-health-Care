import OpenAIService from './openaiService';
import BackendAIService from './backendAIService';

interface PlanMetadata {
  startDate: string;
  currentWeek: number;
  renewalDate: string;
  totalWeeks: number;
  planType: 'diet' | 'workout';
  lastRenewalDate?: string;
}

interface DietDay {
  day: string;
  totalCalories: number;
  meals: Array<{
    name: string;
    calories: number;
    protein: string;
    carbs: string;
    fats: string;
    completed: boolean;
    notes: string;
  }>;
  completed?: boolean;
}

interface WorkoutDay {
  day: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    restTime?: string;
    equipment?: string;
    completed?: boolean;
  }>;
  completed?: boolean;
}

export class PlanRenewalService {
  private static instance: PlanRenewalService;
  
  public static getInstance(): PlanRenewalService {
    if (!PlanRenewalService.instance) {
      PlanRenewalService.instance = new PlanRenewalService();
    }
    return PlanRenewalService.instance;
  }

  /**
   * Check if plans need renewal and automatically renew them
   */
  public async checkAndRenewPlans(userProfile: any): Promise<void> {
    await Promise.all([
      this.checkDietPlanRenewal(userProfile),
      this.checkWorkoutPlanRenewal(userProfile)
    ]);
  }

  /**
   * Check if diet plan needs renewal (every 7 days)
   */
  private async checkDietPlanRenewal(userProfile: any): Promise<void> {
    const metadata = this.getDietPlanMetadata();
    const now = new Date();
    
    if (!metadata) {
      return;
    }

    const renewalDate = new Date(metadata.renewalDate);
    
    if (now >= renewalDate && metadata.currentWeek < metadata.totalWeeks) {
      console.log(`🔄 Auto-renewing diet plan - Week ${metadata.currentWeek + 1}`);
      await this.renewDietPlan(userProfile, metadata);
    }
  }

  /**
   * Check if workout plan needs renewal (every 6 days)
   */
  private async checkWorkoutPlanRenewal(userProfile: any): Promise<void> {
    const metadata = this.getWorkoutPlanMetadata();
    const now = new Date();
    
    if (!metadata) {
      return;
    }

    const renewalDate = new Date(metadata.renewalDate);
    
    if (now >= renewalDate && metadata.currentWeek < metadata.totalWeeks) {
      console.log(`🔄 Auto-renewing workout plan - Week ${metadata.currentWeek + 1}`);
      await this.renewWorkoutPlan(userProfile, metadata);
    }
  }

  /**
   * Initialize plan metadata when a new plan is created
   */
  public initializePlanMetadata(planType: 'diet' | 'workout', totalWeeks: number = 12): void {
    const now = new Date();
    const renewalDays = planType === 'diet' ? 7 : 6;
    const renewalDate = new Date(now.getTime() + (renewalDays * 24 * 60 * 60 * 1000));
    
    const metadata: PlanMetadata = {
      startDate: now.toISOString(),
      currentWeek: 1,
      renewalDate: renewalDate.toISOString(),
      totalWeeks,
      planType,
      lastRenewalDate: now.toISOString()
    };
    
    localStorage.setItem(`${planType}PlanMetadata`, JSON.stringify(metadata));
    
    if (!localStorage.getItem('planStartDate')) {
      localStorage.setItem('planStartDate', now.toISOString());
    }
    
    console.log(`✅ Initialized ${planType} plan metadata:`, metadata);
  }

  private getDietPlanMetadata(): PlanMetadata | null {
    const stored = localStorage.getItem('dietPlanMetadata');
    return stored ? JSON.parse(stored) : null;
  }

  private getWorkoutPlanMetadata(): PlanMetadata | null {
    const stored = localStorage.getItem('workoutPlanMetadata');
    return stored ? JSON.parse(stored) : null;
  }

  private async renewDietPlan(userProfile: any, metadata: PlanMetadata): Promise<void> {
    try {
      const newWeek = metadata.currentWeek + 1;
      const prompt = this.generateProgressiveDietPrompt(userProfile, newWeek, metadata.totalWeeks);
      
      let dietResponse;
      try {
        const backendService = new BackendAIService();
        dietResponse = await backendService.generateDietPlan(prompt);
      } catch (backendError) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        dietResponse = await openaiService.generateDietPlan(prompt);
      }

      const convertedPlan = this.convertDietPlanToAppFormat(dietResponse, newWeek);
      
      this.archiveCurrentPlan('diet', metadata);
      
      localStorage.setItem('dietPlan', JSON.stringify(convertedPlan));
      
      const now = new Date();
      const nextRenewalDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const updatedMetadata: PlanMetadata = {
        ...metadata,
        currentWeek: newWeek,
        renewalDate: nextRenewalDate.toISOString(),
        lastRenewalDate: now.toISOString()
      };
      
      localStorage.setItem('dietPlanMetadata', JSON.stringify(updatedMetadata));
      
      this.showRenewalNotification('diet', newWeek);
      
    } catch (error) {
      console.error('❌ Error renewing diet plan:', error);
    }
  }

  private async renewWorkoutPlan(userProfile: any, metadata: PlanMetadata): Promise<void> {
    try {
      const newWeek = metadata.currentWeek + 1;
      const prompt = this.generateProgressiveWorkoutPrompt(userProfile, newWeek, metadata.totalWeeks);
      
      let workoutResponse;
      try {
        const backendService = new BackendAIService();
        workoutResponse = await backendService.generateWorkoutPlan(prompt);
      } catch (backendError) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }
        const openaiService = new OpenAIService(apiKey);
        workoutResponse = await openaiService.generateWorkoutPlan(prompt);
      }

      const convertedPlan = this.convertWorkoutPlanToAppFormat(workoutResponse, newWeek);
      
      this.archiveCurrentPlan('workout', metadata);
      
      localStorage.setItem('workoutPlan', JSON.stringify(convertedPlan));
      
      const now = new Date();
      const nextRenewalDate = new Date(now.getTime() + (6 * 24 * 60 * 60 * 1000));
      
      const updatedMetadata: PlanMetadata = {
        ...metadata,
        currentWeek: newWeek,
        renewalDate: nextRenewalDate.toISOString(),
        lastRenewalDate: now.toISOString()
      };
      
      localStorage.setItem('workoutPlanMetadata', JSON.stringify(updatedMetadata));
      
      this.showRenewalNotification('workout', newWeek);
      
    } catch (error) {
      console.error('❌ Error renewing workout plan:', error);
    }
  }

  private generateProgressiveDietPrompt(userProfile: any, week: number, totalWeeks: number): string {
    const { age, gender, height, weight, healthConditions, fitnessGoal } = userProfile;
    
    const isEarlyPhase = week <= 4;
    const isMidPhase = week > 4 && week <= Math.floor(totalWeeks * 0.7);
    
    let progressiveAdjustments = '';
    if (isEarlyPhase) {
      progressiveAdjustments = `This is Week ${week} (Foundation Phase): Focus on establishing healthy eating habits with gradual changes and easier-to-follow meal plans. Emphasis on consistency over complexity.`;
    } else if (isMidPhase) {
      progressiveAdjustments = `This is Week ${week} (Progression Phase): Increase nutritional optimization with more varied and challenging meal combinations. Fine-tune macronutrient ratios for better results.`;
    } else {
      progressiveAdjustments = `This is Week ${week} (Advanced Phase): Maximum optimization for goal achievement with advanced meal timing and macro cycling strategies. Prepare for goal completion and maintenance.`;
    }

    return `Create a personalized 7-day diet plan for Week ${week} of my ${totalWeeks}-week program:

Personal Information:
- Age: ${age} years old
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Goal: ${fitnessGoal}
- Health Conditions: ${healthConditions?.filter((c: string) => c !== 'None').join(', ') || 'None'}

Progressive Context: ${progressiveAdjustments}

Week ${week} Requirements:
1. Build upon previous weeks with NEW meal varieties and recipes
2. Adjust portion sizes and macros based on Week ${week} progression needs
3. Align with ${fitnessGoal} goal with week-appropriate intensity
4. Provide fresh, engaging meal options that prevent dietary boredom
5. Include weekly macro targets appropriate for this phase

Please ensure meals are progressively optimized for Week ${week} of the program and varied from previous weeks.`;
  }

  private generateProgressiveWorkoutPrompt(userProfile: any, week: number, totalWeeks: number): string {
    const { age, gender, height, weight, healthConditions, fitnessGoal } = userProfile;
    
    const isEarlyPhase = week <= 4;
    const isMidPhase = week > 4 && week <= Math.floor(totalWeeks * 0.7);
    
    let progressiveAdjustments = '';
    if (isEarlyPhase) {
      progressiveAdjustments = `This is Week ${week} (Foundation Phase): Focus on form, technique, and habit building with moderate intensity. Sets: 2-3, Reps: 12-15, Rest: 60-90 seconds.`;
    } else if (isMidPhase) {
      progressiveAdjustments = `This is Week ${week} (Progression Phase): Increase intensity and complexity with progressive overload. Sets: 3-4, Reps: 8-12, Rest: 90-120 seconds.`;
    } else {
      progressiveAdjustments = `This is Week ${week} (Advanced Phase): Peak performance and specialization with high intensity. Sets: 3-5, Reps: 6-10, Rest: 2-3 minutes.`;
    }

    return `Create a personalized 6-day workout plan for Week ${week} of my ${totalWeeks}-week program:

Personal Information:
- Age: ${age} years old
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Goal: ${fitnessGoal}
- Health Conditions: ${healthConditions?.filter((c: string) => c !== 'None').join(', ') || 'None'}

Progressive Context: ${progressiveAdjustments}

Week ${week} Requirements:
1. Build upon previous weeks with PROGRESSIVE difficulty increase
2. Introduce NEW exercises and movement patterns
3. Adjust intensity, volume, and complexity for Week ${week}
4. Align with ${fitnessGoal} goal with week-appropriate training variables
5. Provide variety to prevent training plateaus

Please ensure workouts are progressively more challenging than Week ${week - 1} and include new exercises.`;
  }

  private convertDietPlanToAppFormat(dietResponse: any, week: number): DietDay[] {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const variations = ['', ' with herbs', ' variation', ' special', ' deluxe', ' premium', ' enhanced'];
    
    return daysOfWeek.map((dayName, index) => {
      const dayData = dietResponse[dayName] || {};
      
      const breakfastFoods = dayData.breakfast?.foods || ['Healthy breakfast option'];
      const lunchFoods = dayData.lunch?.foods || ['Nutritious lunch option'];
      const dinnerFoods = dayData.dinner?.foods || ['Balanced dinner option'];
      
      const breakfastCalories = dayData.breakfast?.calories || 400;
      const lunchCalories = dayData.lunch?.calories || 500;
      const dinnerCalories = dayData.dinner?.calories || 600;
      const totalCalories = breakfastCalories + lunchCalories + dinnerCalories;
      
      return {
        day: `${dayName} (Week ${week})`,
        totalCalories: totalCalories + (index * 50),
        meals: [
          {
            name: `Breakfast: ${breakfastFoods.join(', ')}${variations[index] || ''}`,
            calories: breakfastCalories,
            protein: `${Math.round((dietResponse.macros?.protein || 120) * 0.25) + index + (week * 2)}g`,
            carbs: `${Math.round((dietResponse.macros?.carbs || 150) * 0.3) + (index * 2) + (week * 3)}g`,
            fats: `${Math.round((dietResponse.macros?.fats || 50) * 0.25) + index + week}g`,
            completed: false,
            notes: `${dayData.breakfast?.time || '8:00 AM'} - Week ${week} optimized`
          },
          {
            name: `Lunch: ${lunchFoods.join(', ')}${variations[index] || ''}`,
            calories: lunchCalories,
            protein: `${Math.round((dietResponse.macros?.protein || 120) * 0.35) + (index * 2) + (week * 2)}g`,
            carbs: `${Math.round((dietResponse.macros?.carbs || 150) * 0.4) + (index * 3) + (week * 3)}g`,
            fats: `${Math.round((dietResponse.macros?.fats || 50) * 0.35) + index + week}g`,
            completed: false,
            notes: `${dayData.lunch?.time || '12:00 PM'} - Week ${week} progression`
          },
          {
            name: `Dinner: ${dinnerFoods.join(', ')}${variations[index] || ''}`,
            calories: dinnerCalories,
            protein: `${Math.round((dietResponse.macros?.protein || 120) * 0.4) + (index * 2) + (week * 2)}g`,
            carbs: `${Math.round((dietResponse.macros?.carbs || 150) * 0.3) + (index * 2) + (week * 2)}g`,
            fats: `${Math.round((dietResponse.macros?.fats || 50) * 0.4) + (index * 2) + week}g`,
            completed: false,
            notes: `${dayData.dinner?.time || '6:00 PM'} - Week ${week} specialized`
          }
        ],
        completed: false
      };
    });
  }

  private convertWorkoutPlanToAppFormat(workoutResponse: any, week: number): WorkoutDay[] {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return daysOfWeek.map(dayName => {
      const dayData = workoutResponse[dayName] || {};
      const exercises = dayData.exercises || [];
      
      return {
        day: `${dayName} (Week ${week})`,
        exercises: exercises.map((exercise: any) => ({
          name: `${exercise.name} - Week ${week} intensity`,
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          restTime: exercise.restTime || '60 seconds',
          equipment: exercise.equipment || 'None',
          completed: false
        })),
        completed: false
      };
    });
  }

  private archiveCurrentPlan(planType: 'diet' | 'workout', metadata: PlanMetadata): void {
    const currentPlan = localStorage.getItem(`${planType}Plan`);
    if (currentPlan) {
      const archiveKey = `${planType}PlanArchive_week${metadata.currentWeek}`;
      const archiveData = {
        week: metadata.currentWeek,
        plan: JSON.parse(currentPlan),
        completedDate: new Date().toISOString(),
        metadata: { ...metadata }
      };
      localStorage.setItem(archiveKey, JSON.stringify(archiveData));
      console.log(`📦 Archived ${planType} plan for Week ${metadata.currentWeek}`);
    }
  }

  private showRenewalNotification(planType: 'diet' | 'workout', week: number): void {
    const message = `🎉 Your ${planType} plan has been automatically renewed for Week ${week}! Check out your new progressive ${planType} plan.`;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Renewed!`, {
        body: message,
        icon: '/vite.svg'
      });
    }
    
    console.log(`🔔 ${message}`);
    
    const notifications = JSON.parse(localStorage.getItem('planRenewalNotifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      type: planType,
      week,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    if (notifications.length > 10) {
      notifications.splice(10);
    }
    
    localStorage.setItem('planRenewalNotifications', JSON.stringify(notifications));
  }

  public getCurrentWeek(planType: 'diet' | 'workout'): number {
    const metadata = planType === 'diet' ? this.getDietPlanMetadata() : this.getWorkoutPlanMetadata();
    return metadata?.currentWeek || 1;
  }

  public getRenewalStatus(): { diet: any, workout: any } {
    const dietMetadata = this.getDietPlanMetadata();
    const workoutMetadata = this.getWorkoutPlanMetadata();
    const now = new Date();
    
    return {
      diet: dietMetadata ? {
        currentWeek: dietMetadata.currentWeek,
        totalWeeks: dietMetadata.totalWeeks,
        renewalDate: dietMetadata.renewalDate,
        daysUntilRenewal: Math.ceil((new Date(dietMetadata.renewalDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
        needsRenewal: now >= new Date(dietMetadata.renewalDate)
      } : null,
      workout: workoutMetadata ? {
        currentWeek: workoutMetadata.currentWeek,
        totalWeeks: workoutMetadata.totalWeeks,
        renewalDate: workoutMetadata.renewalDate,
        daysUntilRenewal: Math.ceil((new Date(workoutMetadata.renewalDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
        needsRenewal: now >= new Date(workoutMetadata.renewalDate)
      } : null
    };
  }

  public async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
} 