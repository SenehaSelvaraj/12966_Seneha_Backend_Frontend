import { Navigate } from 'react-router-dom';
 
// This component protects pages from being accessed without login
// Usage: wrap any page you want to protect
 
function PrivateRoute({ children, requiredRole }) {
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
 
  // If not logged in at all, send to login page
  if (!userId) {
    return <Navigate to="/" />;
  }
 
  // If a specific role is required (e.g. ADMIN) and user doesn't have it
  if (requiredRole && role !== requiredRole) {
    // Send user back to their correct dashboard
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} />;
  }
 
  // All checks passed - show the page
  return children;
}
 
export default PrivateRoute;
 