import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import type { ReactNode } from 'react';

interface PublicDashboardRouteProps {
  children: ReactNode;
}

/**
 * PublicDashboardRoute allows unauthenticated users to view the dashboard
 * but redirects them to signup when they try to access restricted features
 */
export default function PublicDashboardRoute({ children }: PublicDashboardRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If user is authenticated, they can access everything normally
      // No redirect needed - let them use the dashboard
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Allow both authenticated and unauthenticated users to view dashboard
  // Individual components will handle redirecting to signup when needed
  return <>{children}</>;
}
