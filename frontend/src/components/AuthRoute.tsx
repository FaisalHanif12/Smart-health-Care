import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import type { ReactNode } from 'react';

interface AuthRouteProps {
  children: ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // User is authenticated, check where to redirect
      if (user) {
        const hasProfile = user.profile && 
          user.profile.age && 
          user.profile.gender && 
          user.profile.height && 
          user.profile.weight && 
          user.profile.fitnessGoal;

        if (hasProfile) {
          // User has completed profile, redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // User needs to complete profile, redirect to onboarding
          navigate('/onboarding', { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authenticated, don't render anything (navigation will happen)
  if (isAuthenticated) {
    return null;
  }

  // Render the auth content for unauthenticated users
  return <>{children}</>;
} 