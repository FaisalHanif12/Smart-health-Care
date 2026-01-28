import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to redirect to signup if user is not authenticated
 * Use this in components that require authentication
 */
export function useRequireAuth(redirectPath: string = '/register') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectPath, { 
        replace: true,
        state: { 
          from: window.location.pathname,
          message: 'Please sign up to access this feature'
        }
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath]);

  return { isAuthenticated, isLoading };
}
