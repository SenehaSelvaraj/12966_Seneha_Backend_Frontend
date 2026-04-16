import { useNavigate, useLocation } from 'react-router-dom';
 
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
 
  const hideOn = ['/', '/register', '/admin-setup-9x7k'];
  if (hideOn.includes(location.pathname)) return null;
  if (!userId) return null;
 
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
 
  // Check if current path matches the nav link
  const isActive = (path) => location.pathname === path;
 
  const navBtn = (path, label) => (
    <button
      onClick={() => navigate(path)}
      style={{
        padding: '6px 14px',
        borderRadius: '4px',
        border: isActive(path) ? 'none' : '1px solid #adb5bd',
        background: isActive(path) ? '#ffffff' : 'transparent',
        color: isActive(path) ? '#212529' : '#ffffff',
        fontWeight: isActive(path) ? '600' : '400',
        cursor: 'pointer',
        fontSize: '14px'
      }}>
      {label}
    </button>
  );
 
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 30px',
      backgroundColor: '#212529',
      color: 'white'
    }}>
      <span
        style={{ fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', color: 'white' }}
        onClick={() => navigate(role === 'ADMIN' ? '/admin' : '/dashboard')}>
        Lost & Found
      </span>
 
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
{role === 'USER' && (
  <>
    {navBtn('/dashboard', 'Dashboard')}
    {navBtn('/report-found', 'Report Found')}
    {navBtn('/report-lost', 'Report Lost')}
    {navBtn('/searching-items', 'Browse Lost Items')}
    {navBtn('/my-reports', 'My Reports')}
  </>
)}
 
        {role === 'ADMIN' && (
          <>
            {navBtn('/admin', 'Dashboard')}
            {navBtn('/admin/items', 'Manage Items')}
            {navBtn('/admin/user-stats', 'User Stats')}
            {navBtn('/admin/users', 'User Management')}
          </>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            border: 'none',
            background: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
 
export default Navbar;
 