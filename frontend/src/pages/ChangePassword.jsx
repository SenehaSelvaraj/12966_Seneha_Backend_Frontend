import { useState } from 'react';
import { userApi } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
 
function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      await userApi.put('/api/users/change-password', {
        userId,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed! Redirecting...');
      const role = localStorage.getItem('role');
      setTimeout(() => {
        if (role === 'ADMIN') navigate('/admin');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    }
  };
 
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4" style={{ width: '420px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold"> Set New Password</h2>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Your account was created by an admin with a temporary password.
            Please set a new password to continue.
          </p>
        </div>
 
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
 
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">New Password</label>
            <input
              className="form-control"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 6 chars)"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Confirm New Password</label>
            <input
              className="form-control"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Set Password &amp; Continue
          </button>
        </form>
      </div>
    </div>
  );
}
 
export default ChangePassword;
 
 