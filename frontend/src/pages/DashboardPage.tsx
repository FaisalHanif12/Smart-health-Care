import { useEffect } from 'react';
import { useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import Dashboard from '../components/Dashboard/Dashboard';
import WorkoutPlan from '../components/Dashboard/WorkoutPlan';
import DietPlan from '../components/Dashboard/DietPlan';
import Profile from '../components/Dashboard/Profile';
import Store from '../components/Dashboard/Store';

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
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <Dashboard />
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="" element={<Outlet />}>
              <Route path="workout" element={<WorkoutPlan />} />
              <Route path="diet" element={<DietPlan />} />
              <Route path="profile" element={<Profile />} />
              <Route path="store" element={<Store />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}