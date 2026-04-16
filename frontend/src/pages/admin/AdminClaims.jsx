import { useState, useEffect } from 'react';

 
function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('ALL');
 
  useEffect(() => { fetchClaims(); }, []);
 
  const fetchClaims = async () => {
    const res = await claimApi.get('/api/claims');
    setClaims(res.data);
  };
 
  const approve = async (id) => { await claimApi.put(`/api/claims/${id}/approve`); fetchClaims(); };
  const reject  = async (id) => { await claimApi.put(`/api/claims/${id}/reject`);  fetchClaims(); };
 
  const statusStyle = {
    APPROVED: { background: '#d1e7dd', color: '#0a3622' },
    REJECTED: { background: '#f8d7da', color: '#842029' },
    PENDING:  { background: '#fff3cd', color: '#664d03' }
  };
 
  const filteredClaims = filter === 'ALL' ? claims : claims.filter(c => c.status === filter);
 
  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h5 style={{ fontWeight: '700', marginBottom: '4px' }}>Manage Claims</h5>
      <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '14px' }}>
        Review and approve or reject ownership claims
      </p>
 
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{
              padding: '6px 14px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer',
              border: filter === tab ? 'none' : '1px solid #ced4da',
              background: filter === tab ? '#212529' : 'white',
              color: filter === tab ? 'white' : '#212529',
              fontWeight: filter === tab ? '600' : '400'
            }}>
            {tab} ({tab === 'ALL' ? claims.length : claims.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>
 
      {filteredClaims.length === 0 ? (
        <div style={{ padding: '14px', background: '#e7f3fe', borderRadius: '6px', fontSize: '14px' }}>No claims found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredClaims.map(claim => {
            const ss = statusStyle[claim.status] || statusStyle.PENDING;
            return (
              <div key={claim.id} style={{
                border: '1px solid #dee2e6', borderRadius: '8px',
                background: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{
                  padding: '10px 14px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid #dee2e6', background: '#f8f9fa'
                }}>
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>Claim #{claim.id}</span>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...ss }}>
                    {claim.status}
                  </span>
                </div>
 
                <div style={{ padding: '14px', flex: 1, fontSize: '13px', color: '#495057', lineHeight: '1.8' }}>
                  <div><span style={{ color: '#6c757d' }}>Item ID:</span> #{claim.itemId}</div>
                  <div><span style={{ color: '#6c757d' }}>User ID:</span> #{claim.userId}</div>
                  <div style={{ marginTop: '6px', padding: '8px', background: '#f8f9fa', borderRadius: '4px', fontSize: '12px' }}>
                    <span style={{ color: '#6c757d', display: 'block', marginBottom: '2px' }}>Proof:</span>
                    {claim.proofDescription}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ color: '#6c757d' }}>Submitted:</span> {new Date(claim.submittedAt).toLocaleDateString()}
                  </div>
                </div>
 
                <div style={{ padding: '10px 14px', borderTop: '1px solid #dee2e6' }}>
                  {claim.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => approve(claim.id)}
                        style={{ flex: 1, padding: '6px', background: '#d1e7dd', color: '#0a3622', border: '1px solid #a3cfbb', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                        Approve
                      </button>
                      <button onClick={() => reject(claim.id)}
                        style={{ flex: 1, padding: '6px', background: '#f8d7da', color: '#842029', border: '1px solid #f1aeb5', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '13px', color: ss.color, fontWeight: '600'}}>
                      This claim has been {claim.status.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
 
export default AdminClaims;
 