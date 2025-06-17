import { useEffect } from 'react';
import DietPlanContent from './DietPlanContent';

export default function DietPlan() {
  useEffect(() => {
    console.log('DietPlan component mounted');
    return () => {
      console.log('DietPlan component unmounted');
    };
  }, []);

  return (
    <div key="diet-plan">
      <DietPlanContent />
    </div>
  );
}