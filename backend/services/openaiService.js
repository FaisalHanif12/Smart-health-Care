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
               - Fat Burning: High-intensity cardio, circuit training, HIIT, compound movements
               - Muscle Gain: Heavy weight training, progressive overload, isolation exercises
               - Weight Loss: Cardio + strength training, high rep ranges, metabolic workouts
               - General Fitness: Balanced mix of cardio, strength, and flexibility
            
            2. NEVER recommend exercises that conflict with health conditions:
               - Heart Disease: Avoid high-intensity exercises, monitor heart rate
               - Joint Problems: Avoid high-impact exercises, use low-impact alternatives
               - Back Issues: Avoid heavy spinal loading, focus on core strengthening
               - High Blood Pressure: Avoid breath-holding exercises, isometric holds
            
            3. Adjust intensity and volume based on fitness goals and health status.
            
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
            - Exercises match the fitness goal (fat burning = HIIT, cardio, circuit training)
            - No exercises that conflict with health conditions
            - Appropriate intensity and volume for the user's profile
            - Complete workout plans for all 6 days with specific names and realistic parameters`
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
            1. ALWAYS align macronutrients with the user's fitness goal:
               - Fat Burning: Higher protein (30-35%), Lower carbs (30-35%), Lower fats (25-30%)
               - Muscle Gain: High protein (25-30%), Moderate carbs (40-45%), Moderate fats (20-25%)
               - Weight Loss: High protein (35-40%), Low carbs (25-30%), Low fats (20-25%)
               - General Fitness: Balanced - protein (25%), carbs (45%), fats (30%)
            
            2. NEVER recommend foods that conflict with health conditions:
               - Diabetes: Avoid high sugar, refined carbs, sugary fruits
               - Heart Disease: Avoid high sodium, saturated fats, processed foods
               - High Blood Pressure: Avoid high sodium foods, excessive caffeine
               - Kidney Disease: Limit protein, potassium, phosphorus
               - Digestive Issues: Avoid dairy, gluten, spicy foods as appropriate
            
            3. Calculate calories appropriately for goals:
               - Fat Burning/Weight Loss: Create moderate deficit (15-20% below maintenance)
               - Muscle Gain: Small surplus (10-15% above maintenance)
            
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
              "lunch": {
                "time": "12:00 PM", 
                "foods": ["Specific food with portion size", "Another food with portion"],
                "calories": 450
              },
              "dinner": {
                "time": "6:00 PM",
                "foods": ["Specific food with portion size", "Another food with portion"],
                "calories": 400
              },
              "snacks": ["Healthy snack with portion", "Another healthy snack with portion"],
              "macros": {
                "protein": 120,
                "carbs": 150,
                "fats": 45
              },
              "dailyCalories": 1400,
              "tips": [
                "Drink 3-4 liters of water daily for fat burning",
                "Eat protein within 30 minutes post-workout",
                "Avoid processed foods and added sugars"
              ]
            }
            
            ENSURE:
            - Macros match the fitness goal (fat burning = high protein, low carbs, low fats)
            - No foods that conflict with health conditions
            - Realistic portion sizes and calorie counts
            - Total daily calories support the fitness goal`
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