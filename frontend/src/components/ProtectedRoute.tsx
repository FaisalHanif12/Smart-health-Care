import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        navigate('/login', { 
          replace: true, 
          state: { from: location.pathname } 
        });
        return;
      }

      // User is authenticated, check profile completion
      if (user) {
        const hasProfile = user.profile && 
          user.profile.age && 
          user.profile.gender && 
          user.profile.height && 
          user.profile.weight && 
          user.profile.fitnessGoal;

        const isOnboardingRoute = location.pathname === '/onboarding';
        const isDashboardRoute = location.pathname.startsWith('/dashboard');

        if (!hasProfile && isDashboardRoute) {
          // User trying to access dashboard without completing profile
          navigate('/onboarding', { replace: true });
        } else if (hasProfile && isOnboardingRoute) {
          // User with completed profile trying to access onboarding
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, don't render anything (navigation will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
} 