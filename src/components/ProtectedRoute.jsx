import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ userType }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // Get stored user type
  const storedUserType = localStorage.getItem('userType');
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If userType is specified and doesn't match, redirect to home
  if (userType && storedUserType !== userType) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and authorized, render children
  return <Outlet />;
};

export default ProtectedRoute; 