import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard/Dashboard';
import WorkoutPlan from '../components/Dashboard/WorkoutPlan';
import DietPlan from '../components/Dashboard/DietPlan';
import Profile from '../components/Dashboard/Profile';
import Store from '../components/Dashboard/Store';
import Cart from '../components/Dashboard/Cart';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Simulating profile check - in real implementation, this would check the backend
  useEffect(() => {
    const userProfileComplete = localStorage.getItem('userProfileComplete');
    if (!userProfileComplete) {
      navigate('/onboarding');
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="" element={<Dashboard />} />
      <Route path="workout" element={<WorkoutPlan />} />
      <Route path="diet" element={<DietPlan />} />
      <Route path="profile" element={<Profile />} />
      <Route path="store" element={<Store />} />
      <Route path="cart" element={<Cart />} />
    </Routes>
  );
}
