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

  // Get current path for unique keys
  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Dashboard key={`dashboard-${currentPath}`} />} />
        <Route path="workout" element={<WorkoutPlan key={`workout-${currentPath}`} />} />
        <Route path="diet" element={<DietPlan key={`diet-${currentPath}`} />} />
        <Route path="profile" element={<Profile key={`profile-${currentPath}`} />} />
        <Route path="store" element={<Store key={`store-${currentPath}`} />} />
        <Route path="cart" element={<Cart key={`cart-${currentPath}`} />} />
        <Route path="payment" element={<Payment key={`payment-${currentPath}`} />} />
        <Route path="payment-success" element={<PaymentSuccess key={`payment-success-${currentPath}`} />} />
      </Routes>
    </DashboardLayout>
  );
}
