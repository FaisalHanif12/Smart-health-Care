import { useLocation } from 'react-router-dom';
import DietPlanContent from './DietPlanContent';

export default function DietPlan() {
  const location = useLocation();
  return <DietPlanContent key={`diet-${location.pathname}`} />;
}