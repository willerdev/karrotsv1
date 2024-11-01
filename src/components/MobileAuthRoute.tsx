import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isMobileDevice } from '../utils/deviceDetection';

interface MobileAuthRouteProps {
  children: React.ReactNode;
}

const MobileAuthRoute: React.FC<MobileAuthRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isMobile = isMobileDevice();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isMobile && !user && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default MobileAuthRoute;
