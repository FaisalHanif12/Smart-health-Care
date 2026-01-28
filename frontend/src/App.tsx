import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import PublicDashboardRoute from './components/PublicDashboardRoute';
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
      <ThemeProvider>
        <ProgressProvider>
          <Routes>
            {/* Root route - goes directly to dashboard (public access) */}
            <Route path="/" element={<PublicDashboardRoute><DashboardPage /></PublicDashboardRoute>} />
            
            {/* Dashboard route - public access but features require auth */}
            <Route path="/dashboard/*" element={<PublicDashboardRoute><DashboardPage /></PublicDashboardRoute>} />
            
            {/* Auth routes - only accessible when not authenticated (or from signup flow) */}
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
            <Route path="/reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />
            
            {/* Protected routes - require authentication */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          </Routes>
        </ProgressProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
