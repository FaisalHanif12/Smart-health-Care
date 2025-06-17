import { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  // Simulating profile check - in real implementation, this would check the backend
  useEffect(() => {
    const userProfileComplete = localStorage.getItem('userProfileComplete');
    if (!userProfileComplete) {
      navigate('/onboarding');
    }
  }, [navigate]);

  console.log('DashboardPage render - current path:', location.pathname);

  return (
    <DashboardLayout>
      <Routes key={location.pathname}>
        <Route path="" element={<Dashboard key="dashboard" />} />
        <Route path="workout" element={<WorkoutPlan key="workout" />} />
        <Route path="diet" element={<DietPlan key="diet" />} />
        <Route path="profile" element={<Profile key="profile" />} />
        <Route path="store" element={<Store key="store" />} />
        <Route path="cart" element={<Cart key="cart" />} />
        <Route path="payment" element={<Payment key="payment" />} />
        <Route path="payment-success" element={<PaymentSuccess key="payment-success" />} />
      </Routes>
    </DashboardLayout>
  );
}
