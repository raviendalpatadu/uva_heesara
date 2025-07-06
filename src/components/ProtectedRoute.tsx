import React, { useEffect } from 'react';
import { useAuth } from '../utils/auth';
import { PageLoading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    // If not authenticated and not currently loading, trigger login
    if (!isAuthenticated && !isLoading) {
      login().catch(error => {
        console.error('Auto-login failed:', error);
      });
    }
  }, [isAuthenticated, isLoading, login]);

  // Show loading while authentication is in progress
  if (isLoading) {
    return <PageLoading message="Authenticating..." />;
  }

  // Show loading while redirecting to login
  if (!isAuthenticated) {
    return <PageLoading message="Redirecting to login..." />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
