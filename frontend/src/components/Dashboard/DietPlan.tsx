import DietPlanContent from './DietPlanContent';

export default function DietPlan() {
  console.log('DietPlan wrapper component rendering');
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white', fontSize: '24px' }}>
      <h1>THIS IS THE DIET PLAN PAGE - ROUTING TEST</h1>
      <p>If you can see this red message, the routing is working!</p>
      <DietPlanContent />
    </div>
  );
}