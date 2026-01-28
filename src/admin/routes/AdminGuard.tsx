import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';

export default function AdminGuard() {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!location.pathname.startsWith('/admin')) return <Outlet />;

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
