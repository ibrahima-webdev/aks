import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token'); // Verified if user is authanticated
  return token ? <Outlet /> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
