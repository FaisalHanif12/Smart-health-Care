const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateWorkoutPlan(prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional fitness trainer and exercise physiologist with expertise in goal-specific training and medical considerations.
            
            CRITICAL REQUIREMENTS:
            1. ALWAYS align exercises with the user's fitness goal:
               
               FAT BURNING:
               - High-intensity cardio (15-20 reps, 30-45 sec rest)
               - HIIT workouts, circuit training, metabolic conditioning
               - Compound movements (burpees, mountain climbers, jump squats)
               - 4-5 cardio days, 2-3 strength days per week
               
               MUSCLE BUILDING:
               - Heavy weight training (6-12 reps, 60-90 sec rest)
               - Progressive overload, isolation exercises
               - Split training (chest/back, legs, shoulders/arms)
               - 4-5 strength days, 1-2 light cardio days per week
               
               WEIGHT GAIN:
               - Moderate weight training (8-12 reps, 60-90 sec rest)
               - Compound lifts (squats, deadlifts, bench press)
               - Limited cardio (2-3 days max, low intensity)
               - Focus on strength building over fat burning
               
               STRENGTH TRAINING:
               - Heavy compound lifts (3-6 reps, 2-3 min rest)
               - Progressive overload with barbells/dumbbells
               - Focus on major lifts (squat, deadlift, bench, press)
               - 4-5 strength days, minimal cardio
               
               ENDURANCE TRAINING:
               - Long-duration cardio (60+ minutes, steady state)
               - Running, cycling, swimming, rowing
               - 5-6 cardio days, 1-2 light strength days
               - Focus on cardiovascular fitness and stamina
               
               GENERAL FITNESS:
               - Balanced mix: 3 strength, 2-3 cardio, 1 flexibility
               - Moderate intensity (10-15 reps, 45-60 sec rest)
               - Functional movements, bodyweight exercises
               - Well-rounded approach for overall health
            
            2. NEVER recommend exercises that conflict with health conditions:
               - Heart Disease: Avoid high-intensity exercises, monitor heart rate zones
               - Joint Problems: Use low-impact alternatives, avoid jumping/plyometrics
               - Back Issues: Avoid heavy spinal loading, focus on core strengthening
               - High Blood Pressure: Avoid breath-holding, isometric holds, inverted positions
               - Diabetes: Monitor intensity, include regular movement breaks
            
            3. Adjust sets, reps, and rest periods based on specific fitness goals and health status.
            
            Always respond with ONLY a valid JSON object. No explanatory text, markdown, or code blocks.`
          },
          {
            role: 'user',
            content: `${prompt}

            IMPORTANT: Analyze the user's fitness goal and health conditions carefully, then respond with ONLY a JSON object in this EXACT format:
            {
              "Monday": {
                "exercises": [
                  {
                    "name": "Exercise name with clear description",
                    "sets": 3,
                    "reps": 15,
                    "restTime": "60 seconds",
                    "equipment": "Equipment needed or 'None'"
                  }
                ],
                "duration": "45 minutes",
                "warmup": ["Specific warmup exercise 1", "Specific warmup exercise 2"],
                "cooldown": ["Specific cooldown exercise 1", "Specific cooldown exercise 2"]
              },
              "Tuesday": {
                "exercises": [
                  {
                    "name": "Exercise name",
                    "sets": 3,
                    "reps": 12,
                    "restTime": "90 seconds",
                    "equipment": "Equipment needed"
                  }
                ],
                "duration": "40 minutes",
                "warmup": ["Warmup exercise"],
                "cooldown": ["Cooldown exercise"]
              },
              "Wednesday": { "exercises": [], "duration": "", "warmup": [], "cooldown": [] },
              "Thursday": { "exercises": [], "duration": "", "warmup": [], "cooldown": [] },
              "Friday": { "exercises": [], "duration": "", "warmup": [], "cooldown": [] },
              "Saturday": { "exercises": [], "duration": "", "warmup": [], "cooldown": [] }
            }
            
            ENSURE:
            - Exercises perfectly match the fitness goal:
              * Fat Burning: HIIT, cardio circuits, high-rep compound movements
              * Muscle Building: Heavy weights, progressive overload, isolation exercises
              * Weight Gain: Compound lifts, moderate intensity, minimal cardio
              * Strength Training: Heavy compound lifts, low reps, long rest periods
              * Endurance Training: Long cardio sessions, steady-state training
              * General Fitness: Balanced cardio/strength mix, functional movements
            - Sets/reps/rest align with goal (fat burning=high reps/short rest, muscle gain=low reps/long rest)
            - No exercises that conflict with health conditions
            - Appropriate weekly split and intensity for the user's specific goal
            - Complete workout plans for all 6 days with goal-specific programming`
          }
        ],
        max_tokens: 2500,
        temperature: 0.3
      });

      let content = completion.choices[0].message.content.trim();
      
      // Clean up the response - remove any markdown formatting
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Validate and parse the JSON response
      let workoutPlan;
      try {
        workoutPlan = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', content);
        throw new Error('Invalid response format from AI. Please try again.');
      }
      
      // Validate the structure
      const requiredDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const missingDays = requiredDays.filter(day => !workoutPlan[day]);
      if (missingDays.length > 0) {
        throw new Error(`Incomplete workout plan received. Missing: ${missingDays.join(', ')}. Please try again.`);
      }
      
      return workoutPlan;
    } catch (error) {
      console.error('Error generating workout plan:', error);
      throw error;
    }
  }

  async generateDietPlan(prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional nutritionist and dietitian with expertise in sports nutrition and medical dietary requirements.
            
            CRITICAL REQUIREMENTS:
            1. ALWAYS align macronutrients and calories with the user's fitness goal:
               
               FAT BURNING:
               - High protein (35-40%), Low carbs (25-30%), Low fats (25-30%)
               - Calorie deficit (15-20% below maintenance)
               - Focus: Lean proteins, complex carbs, healthy fats
               - Foods: Chicken breast, fish, vegetables, quinoa, avocado
               
               MUSCLE BUILDING:
               - High protein (25-30%), High carbs (45-50%), Moderate fats (20-25%)
               - Calorie surplus (10-15% above maintenance)
               - Focus: Protein synthesis, glycogen replenishment
               - Foods: Protein powder, chicken, oats, rice, nuts, milk
               
               WEIGHT GAIN:
               - Moderate protein (20-25%), High carbs (50-55%), Higher fats (25-30%)
               - Significant surplus (15-25% above maintenance)
               - Focus: Calorie density, nutrient timing
               - Foods: Whole milk, nuts, pasta, oils, protein shakes, dried fruits
               
               STRENGTH TRAINING:
               - High protein (30-35%), Moderate carbs (35-40%), Moderate fats (25-30%)
               - Slight surplus (5-10% above maintenance)
               - Focus: Recovery, strength gains, adequate energy
               - Foods: Red meat, fish, sweet potatoes, nuts, olive oil
               
               ENDURANCE TRAINING:
               - Moderate protein (20-25%), High carbs (55-65%), Low fats (15-20%)
               - Maintenance calories or slight surplus
               - Focus: Glycogen storage, sustained energy
               - Foods: Pasta, rice, bananas, lean proteins, low-fat dairy
               
               GENERAL FITNESS:
               - Balanced protein (25%), Moderate carbs (45%), Moderate fats (30%)
               - Maintenance calories or slight deficit/surplus based on body composition
               - Focus: Overall health, micronutrients, variety
               - Foods: Balanced mix of all food groups, whole foods emphasis
            
            2. NEVER recommend foods that conflict with health conditions:
               - Diabetes: Avoid high sugar, refined carbs, sugary fruits, white bread/rice
               - Heart Disease: Avoid high sodium, saturated fats, processed foods, fried foods
               - High Blood Pressure: Avoid high sodium foods, excessive caffeine, processed meats
               - Kidney Disease: Limit protein, potassium, phosphorus, reduce dairy
               - Digestive Issues: Avoid dairy, gluten, spicy foods, high fiber if specified
               - Liver Disease: Limit protein, avoid alcohol, reduce fats
            
            3. Provide goal-specific nutrition tips and meal timing recommendations.
            
            4. EVENING SNACK GUIDELINES (10:00 PM):
               - Keep calories low (80-150 calories max)
               - Choose easy-to-digest foods that promote sleep
               - Avoid caffeine, high sugar, heavy proteins, or large portions
               - Good options: Herbal tea with a small portion of nuts, Greek yogurt with berries, chamomile tea with a small banana, cottage cheese, or a small handful of almonds
               - Focus on foods with tryptophan, magnesium, or natural melatonin precursors
               - Avoid anything that might disrupt sleep quality
            
            Always respond with ONLY a valid JSON object. No explanatory text, markdown, or code blocks.`
          },
          {
            role: 'user',
            content: `${prompt}

            IMPORTANT: Analyze the user's fitness goal and health conditions carefully, then respond with ONLY a JSON object in this EXACT format:
            {
              "breakfast": {
                "time": "8:00 AM",
                "foods": ["Specific food with portion size", "Another food with portion"],
                "calories": 350
              },
              "morningSnack": {
                "time": "10:00 AM",
                "foods": ["Light snack with portion size"],
                "calories": 150
              },
              "lunch": {
                "time": "12:00 PM", 
                "foods": ["Specific food with portion size", "Another food with portion"],
                "calories": 450
              },
              "afternoonSnack": {
                "time": "3:00 PM",
                "foods": ["Healthy snack with portion size"],
                "calories": 120
              },
              "dinner": {
                "time": "6:00 PM",
                "foods": ["Specific food with portion size", "Another food with portion"],
                "calories": 400
              },
              "eveningSnack": {
                "time": "10:00 PM",
                "foods": ["Light, easy-to-digest snack with portion size"],
                "calories": 100
              },
              "macros": {
                "protein": 120,
                "carbs": 150,
                "fats": 45
              },
              "dailyCalories": 1570,
              "tips": [
                "Drink 3-4 liters of water daily for fat burning",
                "Eat protein within 30 minutes post-workout",
                "Keep evening snack light to avoid sleep disruption",
                "Avoid processed foods and added sugars"
              ]
            }
            
            ENSURE:
            - Macros perfectly match the fitness goal:
              * Fat Burning: High protein (35-40%), Low carbs (25-30%), Low fats (25-30%)
              * Muscle Building: High protein (25-30%), High carbs (45-50%), Moderate fats (20-25%)
              * Weight Gain: Moderate protein (20-25%), High carbs (50-55%), Higher fats (25-30%)
              * Strength Training: High protein (30-35%), Moderate carbs (35-40%), Moderate fats (25-30%)
              * Endurance Training: Moderate protein (20-25%), High carbs (55-65%), Low fats (15-20%)
              * General Fitness: Balanced protein (25%), Moderate carbs (45%), Moderate fats (30%)
            - Calories align with goal (deficit for fat loss, surplus for gain, maintenance for general fitness)
            - Food choices support the specific goal (lean proteins for fat loss, calorie-dense for weight gain)
            - No foods that conflict with health conditions
            - Goal-specific nutrition tips and meal timing recommendations`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      let content = completion.choices[0].message.content.trim();
      
      // Clean up the response - remove any markdown formatting
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Validate and parse the JSON response
      let dietPlan;
      try {
        dietPlan = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', content);
        throw new Error('Invalid response format from AI. Please try again.');
      }
      
      return dietPlan;
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw error;
    }
  }
}

module.exports = OpenAIService; 