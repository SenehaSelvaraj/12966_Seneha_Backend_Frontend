import { useState } from 'react';
import { userApi } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
 
function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await userApi.post('/api/users/login', form);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
 
     
      if (res.data.temporaryPassword) {
        navigate('/change-password');
      } else if (res.data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };
 
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold"> Lost &amp; Found</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input className="form-control" name="username" value={form.username}
              onChange={handleChange} placeholder="Enter username" required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input className="form-control" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-dark w-100">Login</button>
        </form>
        <hr />
      </div>
    </div>
  );
}
 
export default Login;
 
 