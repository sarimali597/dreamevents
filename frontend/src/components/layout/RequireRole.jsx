import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageLoader } from '../ui/Feedback.jsx';

export function RequireRole({ role, children }) {
  const { user, loading, isCustomer, isSeller, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  const allowed = role === 'customer' ? isCustomer : role === 'seller' ? isSeller : isAdmin;
  if (!allowed) {
  const home = isAdmin ? '/admin' : isSeller ? '/seller' : '/customer';
  return <Navigate to={home} replace />;
  }
  return children;
}