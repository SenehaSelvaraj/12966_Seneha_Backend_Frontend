import { useState } from 'react';
import { itemApi } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from './ReportFound';
 
function ReportLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ itemName: '', category: '', location: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      await itemApi.post('/api/items/report-lost', { ...form, reportedBy: userId });
      setMessage('Lost item reported! Admin will review and try to find a match.');
      setTimeout(() => navigate('/my-reports'), 1500);
    } catch { setError('Failed to submit. Try again.'); }
  };
 
  const inputStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid #ced4da',
    borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'
  };
 
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '8px', padding: '32px', width: '480px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ borderLeft: '4px solid #dc3545', paddingLeft: '12px', marginBottom: '24px' }}>
          <h5 style={{ fontWeight: '700', margin: 0 }}>Report Lost Item</h5>
          <p style={{ color: '#6c757d', fontSize: '13px', margin: '4px 0 0' }}>
            Describe what you lost so we can help find it
          </p>
        </div>
 
        {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#842029', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
        {message && <div style={{ padding: '10px', background: '#d1e7dd', color: '#0a3622', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>{message}</div>}
 
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Item Name', name: 'itemName', placeholder: 'e.g. Blue Backpack' },
            { label: 'Last Seen Location', name: 'location', placeholder: 'e.g. Canteen near gate 2' }
          ].map(f => (
            <div key={f.name} style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{f.label}</label>
              <input style={inputStyle} name={f.name} value={form[f.name]}
                onChange={handleChange} placeholder={f.placeholder} required />
            </div>
          ))}
 
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Category</label>
            <select style={inputStyle} name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
 
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} name="description"
              value={form.description} onChange={handleChange} rows="3"
              placeholder="Describe your item in detail — color, brand, what was inside..." />
          </div>
 
          <button type="submit" style={{ width: '100%', padding: '9px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
            Submit Lost Report
          </button>
        </form>
      </div>
    </div>
  );
}
 
export default ReportLost;
 