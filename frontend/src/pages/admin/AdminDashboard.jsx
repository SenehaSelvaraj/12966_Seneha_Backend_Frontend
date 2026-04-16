import { useState, useEffect } from 'react';
import { itemApi } from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
 
function AdminDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
 
  useEffect(() => {
    itemApi.get('/api/items').then(res => setItems(res.data));
  }, []);
 
  const totalLost  = items.filter(i => i.reportType === 'LOST').length;
  const totalFound = items.filter(i => i.reportType === 'FOUND').length;
  const pending    = items.filter(i => i.status === 'LOST' || i.status === 'FOUND').length;
  const matched    = items.filter(i => i.status === 'MATCHED').length;
  const returned   = items.filter(i => i.status === 'RETURNED' || i.status === 'CLOSED').length;
  const urgent     = items.filter(i => i.urgent && (i.status === 'LOST' || i.status === 'SEARCHING')).length;
 
  const statusCounts = ['LOST', 'FOUND', 'SEARCHING', 'MATCHED', 'RETURNED', 'CLOSED']
    .map(s => ({ name: s, value: items.filter(i => i.status === s).length }));
 
  return (
    <div className="page" style={{ maxWidth: '900px' }}>
 
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="page-title">Admin Dashboard</div>
        <div className="page-subtitle" style={{ marginBottom: 0 }}>
          Overview of all lost and found activity
        </div>
      </div>
 
      {urgent > 0 && (
        <div className="alert alert-danger" style={{ textAlign: 'center', marginBottom: '20px' }}>
          {urgent} urgent item(s) require immediate attention
        </div>
      )}
 
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Lost Reports',   value: totalLost,  color: '#dc3545' },
          { label: 'Found Reports',  value: totalFound, color: '#198754' },
          { label: 'Pending Review', value: pending,    color: '#ffc107' },
          { label: 'Matched',        value: matched,    color: '#0d6efd' },
          { label: 'Resolved',       value: returned,   color: '#6c757d' },
          { label: 'Urgent',         value: urgent,     color: '#dc3545' }
        ].map(s => (
          <div key={s.label} style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderTop: `3px solid ${s.color}`,
            borderRadius: '8px',
            padding: '14px 16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontWeight: '700', fontSize: '26px',
              color: s.color, marginBottom: '4px'
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '12px', color: '#495057' }}>
          Items by Status
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={statusCounts} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#212529" name="Items" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
 
      <div style={{
        display: 'flex', gap: '10px',
        justifyContent: 'center', flexWrap: 'wrap'
      }}>
        {[
          { label: 'Manage Items',    path: '/admin/items'      },
          { label: 'User Management', path: '/admin/users'      },
          { label: 'User Stats',      path: '/admin/user-stats' }
        ].map(btn => (
          <button key={btn.path} onClick={() => navigate(btn.path)}
            className="btn btn-dark"
            style={{ padding: '8px 20px', fontSize: '14px' }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
 
export default AdminDashboard;
 