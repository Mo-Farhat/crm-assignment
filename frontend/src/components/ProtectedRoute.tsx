import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/hooks/store';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
