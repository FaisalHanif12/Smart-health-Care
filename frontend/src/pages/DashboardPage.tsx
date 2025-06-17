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

  // Simple conditional rendering based on path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/dashboard' || path === '/dashboard/') {
      return <Dashboard />;
    } else if (path === '/dashboard/workout') {
      return <WorkoutPlan />;
    } else if (path === '/dashboard/diet') {
      return <DietPlan />;
    } else if (path === '/dashboard/profile') {
      return <Profile />;
    } else if (path === '/dashboard/store') {
      return <Store />;
    } else if (path === '/dashboard/cart') {
      return <Cart />;
    } else if (path === '/dashboard/payment') {
      return <Payment />;
    } else if (path === '/dashboard/payment-success') {
      return <PaymentSuccess />;
    } else {
      return <Dashboard />; // fallback
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
