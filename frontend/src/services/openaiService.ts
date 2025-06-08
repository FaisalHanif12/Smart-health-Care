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
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist. Provide diet plans in a structured JSON format that matches the DietPlan interface. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nPlease respond with a JSON object in this exact format:
              {
                "breakfast": {
                  "time": "8:00 AM",
                  "foods": ["food1", "food2"],
                  "calories": 400
                },
                "lunch": {
                  "time": "12:00 PM", 
                  "foods": ["food1", "food2"],
                  "calories": 500
                },
                "dinner": {
                  "time": "6:00 PM",
                  "foods": ["food1", "food2"], 
                  "calories": 600
                },
                "snacks": ["snack1", "snack2"],
                "totalCalories": 1500,
                "macros": {
                  "protein": 120,
                  "carbs": 180,
                  "fats": 50
                }
              }`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const dietPlan: DietPlan = JSON.parse(content);
      return dietPlan;
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw new Error('Failed to generate diet plan');
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
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fitness trainer. Provide workout plans in a structured JSON format that matches the WorkoutPlan interface. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nPlease respond with a JSON object in this exact format:
              {
                "Monday": {
                  "exercises": [
                    {
                      "name": "Push-ups",
                      "sets": 3,
                      "reps": 15,
                      "restTime": "60 seconds",
                      "equipment": "None"
                    }
                  ],
                  "duration": "45 minutes",
                  "warmup": ["5 min light jogging", "Dynamic stretching"],
                  "cooldown": ["5 min walking", "Static stretching"]
                },
                "Tuesday": { ... },
                "Wednesday": { ... },
                "Thursday": { ... },
                "Friday": { ... },
                "Saturday": { ... }
              }`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const workoutPlan: WorkoutPlan = JSON.parse(content);
      return workoutPlan;
    } catch (error) {
      console.error('Error generating workout plan:', error);
      throw new Error('Failed to generate workout plan');
    }
  }
}

export default OpenAIService;
export type { DietPlan, WorkoutPlan }; 