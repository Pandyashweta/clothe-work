import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * If the user is not logged in, redirects to /login with a ?redirect= param
 * so that after login the user is returned to the original destination.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    // Encode the current path so we can redirect back after login
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  return children;
}
