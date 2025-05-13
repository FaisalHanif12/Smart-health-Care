import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <p className="text-gray-600">Welcome to your fitness journey! Your personalized plan is coming soon.</p>
      </div>
    </div>
  );
}