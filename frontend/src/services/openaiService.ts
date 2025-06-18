interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface DietPlan {
  breakfast: {
    time: string;
    foods: string[];
    calories: number;
  };
  lunch: {
    time: string;
    foods: string[];
    calories: number;
  };
  dinner: {
    time: string;
    foods: string[];
    calories: number;
  };
  snacks: string[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface WorkoutPlan {
  [key: string]: {
    exercises: {
      name: string;
      sets: number;
      reps: number;
      restTime?: string;
      equipment?: string;
    }[];
    duration: string;
    warmup: string[];
    cooldown: string[];
  };
}

class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateDietPlan(prompt: string): Promise<DietPlan> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a professional nutritionist and dietitian. Create personalized, healthy, and practical diet plans. 
              Always respond with ONLY a valid JSON object that matches the exact structure requested. 
              Do not include any explanatory text, markdown formatting, or code blocks - just pure JSON.
              Ensure all nutritional values are realistic and well-balanced.`
            },
            {
              role: 'user',
              content: `${prompt}

              IMPORTANT: Respond with ONLY a JSON object in this EXACT format (no additional text):
              {
                "breakfast": {
                  "time": "8:00 AM",
                  "foods": ["Specific food item with portion", "Another food item"],
                  "calories": 400
                },
                "lunch": {
                  "time": "12:00 PM", 
                  "foods": ["Specific food item with portion", "Another food item"],
                  "calories": 500
                },
                "dinner": {
                  "time": "6:00 PM",
                  "foods": ["Specific food item with portion", "Another food item"], 
                  "calories": 600
                },
                "snacks": ["Healthy snack 1", "Healthy snack 2"],
                "totalCalories": 1500,
                "macros": {
                  "protein": 120,
                  "carbs": 180,
                  "fats": 50
                }
              }
              
              Make sure foods include specific portions (e.g., "1 cup oatmeal with berries", "150g grilled chicken breast").`
            }
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data: OpenAIResponse = await response.json();
      let content = data.choices[0].message.content.trim();
      
      // Clean up the response - remove any markdown formatting
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Validate and parse the JSON response
      let dietPlan: DietPlan;
      try {
        dietPlan = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', content);
        throw new Error('Invalid response format from AI. Please try again.');
      }
      
      // Validate the structure
      if (!dietPlan.breakfast || !dietPlan.lunch || !dietPlan.dinner || !dietPlan.macros) {
        throw new Error('Incomplete diet plan received. Please try again.');
      }
      
      return dietPlan;
    } catch (error) {
      console.error('Error generating diet plan:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate diet plan. Please check your API key and try again.');
    }
  }

  async generateWorkoutPlan(prompt: string): Promise<WorkoutPlan> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
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
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data: OpenAIResponse = await response.json();
      let content = data.choices[0].message.content.trim();
      
      // Clean up the response - remove any markdown formatting
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Validate and parse the JSON response
      let workoutPlan: WorkoutPlan;
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate workout plan. Please check your API key and try again.');
    }
  }
}

export default OpenAIService;
export type { DietPlan, WorkoutPlan }; 