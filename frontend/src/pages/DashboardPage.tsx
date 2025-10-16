import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import Dashboard from '../components/Dashboard/Dashboard';
import WorkoutPlanContent from '../components/Dashboard/WorkoutPlanContent';
import DietPlanContent from '../components/Dashboard/DietPlanContent';
import StoreContent from '../components/Dashboard/StoreContent';
import CartContent from '../components/Dashboard/CartContent';
import PaymentContent from '../components/Dashboard/PaymentContent';
import PaymentSuccessContent from '../components/Dashboard/PaymentSuccessContent';
import ProfileContent from '../components/Dashboard/ProfileContent';
import SettingsContent from '../components/Dashboard/SettingsContent';
import CommunityContent from '../components/Dashboard/CommunityContent';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<WorkoutPlanContent />} />
        <Route path="/diet" element={<DietPlanContent />} />
        <Route path="/store" element={<StoreContent />} />
        <Route path="/community" element={<CommunityContent />} />
        <Route path="/cart" element={<CartContent />} />
        <Route path="/payment" element={<PaymentContent />} />
        <Route path="/payment-success" element={<PaymentSuccessContent />} />
        <Route path="/profile" element={<ProfileContent />} />
        <Route path="/settings" element={<SettingsContent />} />
      </Routes>
    </DashboardLayout>
  );
}
