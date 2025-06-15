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
            content: `You are a professional fitness trainer and exercise physiologist. Create safe, effective, and personalized workout plans.
            Always respond with ONLY a valid JSON object that matches the exact structure requested.
            Do not include any explanatory text, markdown formatting, or code blocks - just pure JSON.
            Ensure exercises are appropriate for the user's fitness level and goals.`
          },
          {
            role: 'user',
            content: `${prompt}

            IMPORTANT: Respond with ONLY a JSON object in this EXACT format (no additional text):
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
            
            Provide complete workout plans for all 6 days. Include specific exercise names, proper rep ranges, and realistic rest times.`
          }
        ],
        max_tokens: 2500,
        temperature: 0.7
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
            content: `You are a professional nutritionist and dietitian. Create safe, effective, and personalized diet plans.
            Always respond with ONLY a valid JSON object that matches the exact structure requested.
            Do not include any explanatory text, markdown formatting, or code blocks - just pure JSON.
            Ensure meals are appropriate for the user's health conditions and dietary goals.`
          },
          {
            role: 'user',
            content: `${prompt}

            IMPORTANT: Respond with ONLY a JSON object in this EXACT format (no additional text):
            {
              "breakfast": {
                "time": "8:00 AM",
                "foods": ["Food item 1", "Food item 2"],
                "calories": 400
              },
              "lunch": {
                "time": "1:00 PM", 
                "foods": ["Food item 1", "Food item 2"],
                "calories": 500
              },
              "dinner": {
                "time": "7:00 PM",
                "foods": ["Food item 1", "Food item 2"],
                "calories": 450
              },
              "snacks": ["Healthy snack 1", "Healthy snack 2"],
              "macros": {
                "protein": 120,
                "carbs": 200,
                "fats": 60
              },
              "dailyCalories": 1500,
              "tips": ["Nutrition tip 1", "Nutrition tip 2"]
            }
            
            Provide complete meal plans with appropriate calories and macronutrients based on the user's profile.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
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