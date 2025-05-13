import { useState, useEffect } from 'react';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

export default function WorkoutPlan() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([
    {
      day: 'Monday',
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 15, completed: false },
        { name: 'Squats', sets: 4, reps: 12, completed: false },
        { name: 'Plank', sets: 3, reps: 30, completed: false },
      ],
    },
    {
      day: 'Wednesday',
      exercises: [
        { name: 'Pull-ups', sets: 3, reps: 8, completed: false },
        { name: 'Lunges', sets: 3, reps: 12, completed: false },
        { name: 'Crunches', sets: 3, reps: 20, completed: false },
      ],
    },
    {
      day: 'Friday',
      exercises: [
        { name: 'Dumbbell Rows', sets: 3, reps: 12, completed: false },
        { name: 'Deadlifts', sets: 4, reps: 10, completed: false },
        { name: 'Mountain Climbers', sets: 3, reps: 20, completed: false },
      ],
    },
  ]);

  const toggleExerciseCompletion = (dayIndex: number, exerciseIndex: number) => {
    const newWorkoutPlan = [...workoutPlan];
    newWorkoutPlan[dayIndex].exercises[exerciseIndex].completed = 
      !newWorkoutPlan[dayIndex].exercises[exerciseIndex].completed;
    setWorkoutPlan(newWorkoutPlan);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Workout Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workoutPlan.map((day, dayIndex) => (
          <div key={day.day} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{day.day}</h3>
            <div className="space-y-4">
              {day.exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exercise.name}
                  className={`p-4 rounded-lg ${exercise.completed ? 'bg-green-50' : 'bg-white'} shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                      <p className="text-sm text-gray-500">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExerciseCompletion(dayIndex, exerciseIndex)}
                      className={`${exercise.completed ? 'bg-green-500' : 'bg-gray-200'} p-2 rounded-full focus:outline-none`}
                    >
                      <svg
                        className={`h-5 w-5 ${exercise.completed ? 'text-white' : 'text-gray-500'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}