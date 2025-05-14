import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import LoginPage from './pages/LoginPage';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Onboarding from './components/Onboarding';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard/*" element={<DashboardPage />} />
    </Routes>
  )
}
export default App
