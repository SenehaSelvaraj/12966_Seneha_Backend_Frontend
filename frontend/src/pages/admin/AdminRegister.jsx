import { useState } from 'react';
import { userApi } from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
 
function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
 
  const validatePassword = (password) => {
    const rules = [];
    if (password.length < 8) rules.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) rules.push('At least one uppercase letter');
    if (!/[0-9]/.test(password)) rules.push('At least one number');
    if (!/[@_]/.test(password)) rules.push('At least one special character (@ or _)');
    if (/[^a-zA-Z0-9@_]/.test(password)) rules.push('Only @ and _ are allowed as special characters');
    return rules;
  };
 
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setServerError('');
 
    if (name === 'password') {
      const issues = validatePassword(value);
      setErrors(prev => ({ ...prev, password: issues }));
    }
 
    if (name === 'username' && value.length >= 3) {
      setUsernameChecking(true);
      try {
        const res = await userApi.get(`/api/users/check-username?username=${value}`);
        setErrors(prev => ({ ...prev, username: res.data.exists ? 'Username already exists' : '' }));
      } catch {
        setErrors(prev => ({ ...prev, username: '' }));
      }
      setUsernameChecking(false);
    } else if (name === 'username') {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const passwordIssues = validatePassword(form.password);
    if (passwordIssues.length > 0) {
      setErrors(prev => ({ ...prev, password: passwordIssues }));
      return;
    }
    if (errors.username) return;
    try {
      await userApi.post('/api/users/register-admin', form);
      setErrors({});
      setServerError('');
      setSuccess('Admin account created! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create admin');
    }
  };
 
  const inputStyle = (hasError) => ({
    width: '100%', padding: '8px 10px',
    border: `1px solid ${hasError ? '#dc3545' : '#ced4da'}`,
    borderRadius: '4px', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none'
  });
 
  return (
    <div style={{
      minHeight: '100vh', background: '#f8f9fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', padding: '32px',
        width: '420px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}>
        
        <div style={{
          background: '#212529', borderRadius: '6px',
          padding: '12px 16px', marginBottom: '24px'
        }}>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
            Lost & Found — Admin Setup
          </div>
          <div style={{ color: '#adb5bd', fontSize: '12px', marginTop: '2px' }}>
            This page is restricted. Only share this URL with administrators.
          </div>
        </div>
 
        {serverError && !success && (
          <div style={{
            padding: '10px 12px', background: '#f8d7da', color: '#842029',
            borderRadius: '4px', fontSize: '13px', marginBottom: '16px'
          }}>
            {serverError}
          </div>
        )}
 
        {success && (
          <div style={{
            padding: '10px 12px', background: '#d1e7dd', color: '#0a3622',
            borderRadius: '4px', fontSize: '13px', marginBottom: '16px'
          }}>
            {success}
          </div>
        )}
 
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input style={inputStyle(errors.username)}
                name="username" value={form.username}
                onChange={handleChange} placeholder="Admin username" required />
              {usernameChecking && (
                <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '12px', color: '#6c757d' }}>
                  Checking...
                </span>
              )}
            </div>
            {errors.username && (
              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                {errors.username}
              </div>
            )}
          </div>
 
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Email
            </label>
            <input style={inputStyle(false)}
              name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="Admin email" required />
          </div>
 
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <input style={inputStyle(errors.password?.length > 0)}
              name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Create a strong password" required />
 
            {form.password.length > 0 && (
              <div style={{
                marginTop: '8px', padding: '10px 12px',
                background: '#f8f9fa', borderRadius: '4px', fontSize: '12px'
              }}>
                {[
                  { rule: 'At least 8 characters', pass: form.password.length >= 8 },
                  { rule: 'At least one uppercase letter', pass: /[A-Z]/.test(form.password) },
                  { rule: 'At least one number', pass: /[0-9]/.test(form.password) },
                  { rule: 'Only @ or _ as special character', pass: /[@_]/.test(form.password) && !/[^a-zA-Z0-9@_]/.test(form.password) }
                ].map(item => (
                  <div key={item.rule} style={{
                    color: item.pass ? '#0a3622' : '#842029',
                    marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span style={{
                      width: '14px', height: '14px', borderRadius: '50%', fontSize: '10px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: item.pass ? '#d1e7dd' : '#f8d7da',
                      color: item.pass ? '#0a3622' : '#842029', flexShrink: 0
                    }}>
                      {item.pass ? '✓' : '✕'}
                    </span>
                    {item.rule}
                  </div>
                ))}
              </div>
            )}
          </div>
 
          <button type="submit" style={{
            width: '100%', padding: '9px', background: '#212529',
            color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', cursor: 'pointer', fontWeight: '600'
          }}>
            Create Admin Account
          </button>
        </form>
 
        <div style={{
          borderTop: '1px solid #dee2e6', marginTop: '20px',
          paddingTop: '16px', textAlign: 'center', fontSize: '13px'
        }}>
          Already have an account?{' '}
          <a href="/" style={{ color: '#212529', fontWeight: '600' }}>Login</a>
        </div>
      </div>
    </div>
  );
}
 
export default AdminRegister;
 