import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple protected route. Checks for token in localStorage and redirects to /login if missing.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
