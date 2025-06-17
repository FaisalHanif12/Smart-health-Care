import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DietPlanContent from './DietPlanContent';

export default function DietPlan() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('DietPlan component mounted - location:', location.pathname);
    return () => {
      console.log('DietPlan component unmounted');
    };
  }, [location.pathname]);

  return (
    <div key={`diet-plan-${location.pathname}`}>
      <DietPlanContent />
    </div>
  );
}