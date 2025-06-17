import { useEffect, useState } from 'react';
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
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Simulating profile check - in real implementation, this would check the backend
  useEffect(() => {
    const userProfileComplete = localStorage.getItem('userProfileComplete');
    if (!userProfileComplete) {
      navigate('/onboarding');
    }
  }, [navigate]);

  // Update current path when location changes
  useEffect(() => {
    console.log('DashboardPage - location changed to:', location.pathname);
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  console.log('DashboardPage render - current path:', currentPath);

  // Simple conditional rendering based on current path state
  const renderContent = () => {
    console.log('Rendering content for path:', currentPath);
    
    if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
      console.log('Rendering Dashboard');
      return <Dashboard key="dashboard" />;
    } else if (currentPath === '/dashboard/workout') {
      console.log('Rendering WorkoutPlan');
      return <WorkoutPlan key="workout" />;
    } else if (currentPath === '/dashboard/diet') {
      console.log('Rendering DietPlan');
      return <DietPlan key="diet" />;
    } else if (currentPath === '/dashboard/profile') {
      console.log('Rendering Profile');
      return <Profile key="profile" />;
    } else if (currentPath === '/dashboard/store') {
      console.log('Rendering Store');
      return <Store key="store" />;
    } else if (currentPath === '/dashboard/cart') {
      console.log('Rendering Cart');
      return <Cart key="cart" />;
    } else if (currentPath === '/dashboard/payment') {
      console.log('Rendering Payment');
      return <Payment key="payment" />;
    } else if (currentPath === '/dashboard/payment-success') {
      console.log('Rendering PaymentSuccess');
      return <PaymentSuccess key="payment-success" />;
    } else {
      console.log('Rendering Dashboard (fallback)');
      return <Dashboard key="dashboard-fallback" />; // fallback
    }
  };

  return (
    <DashboardLayout>
      <div key={currentPath}>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
