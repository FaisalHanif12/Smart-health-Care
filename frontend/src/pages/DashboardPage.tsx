import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import Dashboard from '../components/Dashboard/Dashboard';
import WorkoutPlan from '../components/Dashboard/WorkoutPlan';
import DietPlan from '../components/Dashboard/DietPlan';
import Profile from '../components/Dashboard/Profile';
import Store from '../components/Dashboard/Store';
import Cart from '../components/Dashboard/Cart';
import Payment from '../components/Dashboard/Payment';
import PaymentSuccess from '../components/Dashboard/PaymentSuccess';

export default function DashboardPage() {
  console.log('DashboardPage rendering');
  const navigate = useNavigate();

  // Simulating profile check - in real implementation, this would check the backend
  useEffect(() => {
    const userProfileComplete = localStorage.getItem('userProfileComplete');
    if (!userProfileComplete) {
      navigate('/onboarding');
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="" element={<Dashboard />} />
        <Route path="workout" element={<WorkoutPlan />} />
        <Route path="diet" element={<DietPlan />} />
        <Route path="profile" element={<Profile />} />
        <Route path="store" element={<Store />} />
        <Route path="cart" element={<Cart />} />
        <Route path="payment" element={<Payment />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
      </Routes>
    </DashboardLayout>
  );
}
