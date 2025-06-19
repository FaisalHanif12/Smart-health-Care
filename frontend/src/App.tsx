import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute'; 
import Login from './components/Login';
import LoginPage from './pages/LoginPage';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Onboarding from './components/Onboarding';
import DashboardPage from './pages/DashboardPage';


function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Routes>
          {/* Public routes - redirect to dashboard if already authenticated */}
          <Route path="/" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          <Route path="/reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />
          
          {/* Protected routes - require authentication */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
      </ProgressProvider>
    </AuthProvider>
  )
}

export default App
