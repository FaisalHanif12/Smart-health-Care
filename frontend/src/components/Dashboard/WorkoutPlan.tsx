import { useEffect } from 'react';
import WorkoutPlanContent from './WorkoutPlanContent';

export default function WorkoutPlan() {
  useEffect(() => {
    console.log('WorkoutPlan component mounted');
    return () => {
      console.log('WorkoutPlan component unmounted');
    };
  }, []);

  return (
    <div key="workout-plan">
      <WorkoutPlanContent />
    </div>
  );
} 