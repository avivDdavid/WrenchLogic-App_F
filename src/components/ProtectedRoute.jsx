import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { session } = useAuth();

  // still resolving session — render nothing to avoid flash
  if (session === undefined) return null;

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}