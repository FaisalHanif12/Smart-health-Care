import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WorkoutPlanContent from './WorkoutPlanContent';

export default function WorkoutPlan() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('WorkoutPlan component mounted - location:', location.pathname);
    return () => {
      console.log('WorkoutPlan component unmounted');
    };
  }, [location.pathname]);

  return (
    <div key={`workout-plan-${location.pathname}`}>
      <WorkoutPlanContent />
    </div>
  );
} 