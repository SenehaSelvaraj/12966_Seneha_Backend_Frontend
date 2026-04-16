import { useState, useEffect } from 'react';
import { itemApi } from '../api/axiosConfig';
 
function MyReports() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [urgentModal, setUrgentModal] = useState({ open: false, item: null });
  const [urgentReason, setUrgentReason] = useState('');
  const [urgentMessage, setUrgentMessage] = useState('');
 
  useEffect(() => { fetchItems(); }, []);
 
  const fetchItems = async () => {
    const userId = localStorage.getItem('userId');
    const res = await itemApi.get(`/api/items/my/${userId}`);
    setItems(res.data);
  };
 
  const handleAcknowledge = async (id) => {
    try {
      await itemApi.put(`/api/items/${id}/acknowledge`);
      fetchItems();
    } catch { alert('Failed to acknowledge. Try again.'); }
  };
 
  const handleMarkUrgent = async (e) => {
    e.preventDefault();
    try {
      await itemApi.put(`/api/items/${urgentModal.item.id}/urgent`, { reason: urgentReason });
      setUrgentMessage('Marked as urgent! Admin will prioritize your case.');
      setTimeout(() => {
        setUrgentModal({ open: false, item: null });
        setUrgentReason('');
        setUrgentMessage('');
        fetchItems();
      }, 1500);
    } catch { setUrgentMessage('Failed. Try again.'); }
  };
 
  const statusBadge = (status) => {
    const map = {
      LOST:      { background: '#f8d7da', color: '#842029' },
      FOUND:     { background: '#d1e7dd', color: '#0a3622' },
      SEARCHING: { background: '#fff3cd', color: '#664d03' },
      MATCHED:   { background: '#cfe2ff', color: '#084298' },
      RETURNED:  { background: '#d1e7dd', color: '#0a3622' },
      CLOSED:    { background: '#e2e3e5', color: '#41464b' }
    };
    return map[status] || {};
  };
 
  const canMarkUrgent = (item) =>
    !item.urgent &&
    (item.status === 'LOST' || item.status === 'SEARCHING') &&
    item.reportType === 'LOST';
 
  
  const hasAdminMessage = (item) =>
    item.status === 'MATCHED' && item.collectTime && !item.acknowledged;
 
  const filtered = filter === 'ALL'
    ? items
    : items.filter(i => i.reportType === filter);
 
 
  const unreadCount = items.filter(hasAdminMessage).length;
 
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div className="page-title" style={{ marginBottom: 0 }}>My Reports</div>
        {unreadCount > 0 && (
          <span style={{
            background: '#dc3545', color: 'white',
            borderRadius: '20px', padding: '2px 10px',
            fontSize: '12px', fontWeight: '600'
          }}>
            {unreadCount} new message{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="page-subtitle">All your found and lost item reports</div>
 
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['ALL', 'FOUND', 'LOST'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className="btn"
            style={{
              background: filter === tab ? '#212529' : 'white',
              color: filter === tab ? 'white' : '#212529',
              border: filter === tab ? 'none' : '1px solid #ced4da'
            }}>
            {tab} ({tab === 'ALL'
              ? items.length
              : items.filter(i => i.reportType === tab).length})
          </button>
        ))}
      </div>
 
      {filtered.length === 0 ? (
        <div className="alert alert-info">No reports yet.</div>
      ) : (
        <div className="card-grid">
          {filtered.map(item => {
            const ss = statusBadge(item.status);
            const hasMsg = hasAdminMessage(item);
            return (
              <div className="card" key={item.id}
                style={{
                  borderTop: item.urgent
                    ? '3px solid #dc3545'
                    : hasMsg
                    ? '3px solid #0d6efd'
                    : undefined
                }}>
 
                <div className="card-header">
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>
                    #{item.id} — {item.reportType}
                    {item.urgent && (
                      <span style={{
                        marginLeft: '6px', background: '#dc3545',
                        color: 'white', padding: '1px 7px',
                        borderRadius: '10px', fontSize: '11px', fontWeight: '600'
                      }}>
                        URGENT
                      </span>
                    )}
                    {hasMsg && (
                      <span style={{
                        marginLeft: '6px', background: '#0d6efd',
                        color: 'white', padding: '1px 7px',
                        borderRadius: '10px', fontSize: '11px', fontWeight: '600'
                      }}>
                        NEW MSG
                      </span>
                    )}
                  </span>
                  <span className="badge" style={ss}>{item.status}</span>
                </div>
 
                <div className="card-body">
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
                    {item.itemName}
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>Category:</span> {item.category}
                  </div>
                  {item.location && (
                    <div>
                      <span style={{ color: '#6c757d' }}>Location:</span> {item.location}
                    </div>
                  )}
                  {item.description && (
                    <div style={{
                      marginTop: '8px', padding: '8px',
                      background: '#f8f9fa', borderRadius: '4px', fontSize: '12px'
                    }}>
                      {item.description}
                    </div>
                  )}
 
                  {item.urgent && item.urgentReason && (
                    <div style={{
                      marginTop: '8px', padding: '8px',
                      background: '#f8d7da', borderRadius: '4px',
                      fontSize: '12px', color: '#842029'
                    }}>
                      Urgent reason: {item.urgentReason}
                    </div>
                  )}
 
                
                  {item.status === 'MATCHED' && item.collectTime && (
                    <div style={{
                      marginTop: '10px', padding: '12px',
                      background: item.acknowledged ? '#f8f9fa' : '#cfe2ff',
                      border: item.acknowledged ? '1px solid #e0e0e0' : '1px solid #b6d4fe',
                      borderRadius: '6px', fontSize: '13px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: item.acknowledged ? '#6c757d' : '#084298',
                        marginBottom: '6px', fontSize: '13px'
                      }}>
                        Message from Admin
                        {item.acknowledged && (
                          <span style={{
                            marginLeft: '8px', fontSize: '11px',
                            color: '#198754', fontWeight: '400'
                          }}>
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#495057', marginBottom: '4px' }}>
                        <span style={{ color: '#6c757d' }}>Collect at: </span>
                        <strong>{item.collectTime}</strong>
                      </div>
                      {item.collectMessage && (
                        <div style={{ color: '#495057', fontSize: '12px' }}>
                          {item.collectMessage}
                        </div>
                      )}
 
                      
                      {!item.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(item.id)}
                          style={{
                            marginTop: '10px', width: '100%',
                            padding: '7px', background: '#0d6efd',
                            color: 'white', border: 'none',
                            borderRadius: '4px', fontSize: '13px',
                            cursor: 'pointer', fontWeight: '600'
                          }}>
                          I Acknowledge — I will collect my item
                        </button>
                      )}
                    </div>
                  )}
                </div>
 
                {canMarkUrgent(item) && (
                  <div className="card-footer">
                    <button className="btn btn-red" style={{ width: '100%' }}
                      onClick={() => setUrgentModal({ open: true, item })}>
                      Mark as Urgent
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {urgentModal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Mark as Urgent</div>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>
              Item: <strong>{urgentModal.item.itemName}</strong>
            </p>
            <div style={{
              padding: '10px', background: '#fff3cd', borderRadius: '6px',
              fontSize: '12px', marginBottom: '16px', color: '#664d03'
            }}>
              Use this only if the item is critical. Admin will be
              notified to prioritize your case immediately.
            </div>
            <form onSubmit={handleMarkUrgent}>
              <div className="field">
                <label>Reason for urgency</label>
                <select className="input"
                  value={urgentReason}
                  onChange={e => setUrgentReason(e.target.value)}
                  required>
                  <option value="">Select a reason</option>
                  <option value="Contains medical items">Contains medical items</option>
                  <option value="Contains ID or passport">Contains ID or passport</option>
                  <option value="Contains financial cards or cash">
                    Contains financial cards or cash
                  </option>
                  <option value="Needed for upcoming exam or event">
                    Needed for upcoming exam or event
                  </option>
                  <option value="Work or official documents inside">
                    Work or official documents inside
                  </option>
                  <option value="Other urgent reason">Other urgent reason</option>
                </select>
              </div>
              {urgentMessage && (
                <div className={`alert ${urgentMessage.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
                  {urgentMessage}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-dark" style={{ flex: 1 }}>
                  Confirm Urgent
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }}
                  onClick={() => {
                    setUrgentModal({ open: false, item: null });
                    setUrgentReason('');
                    setUrgentMessage('');
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default MyReports;
 