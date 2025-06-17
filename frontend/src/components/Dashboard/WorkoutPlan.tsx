import { useLocation } from 'react-router-dom';
import WorkoutPlanContent from './WorkoutPlanContent';

export default function WorkoutPlan() {
  const location = useLocation();
  return <WorkoutPlanContent key={`workout-${location.pathname}`} />;
} 