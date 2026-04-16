import { useState, useEffect } from 'react';
import { itemApi } from '../../api/axiosConfig';
 
const STATUS_OPTIONS = ['LOST','FOUND','SEARCHING','MATCHED','RETURNED','CLOSED'];
 
const CATEGORIES = [
  'Wallet', 'Phone', 'Keys', 'Bag', 'ID Card',
  'Laptop', 'Earphones', 'Watch', 'Glasses', 'Clothing', 'Other'
];
 
const EMPTY_ITEM_FORM = {
  itemName: '', category: '', location: '', description: '', urgent: false, urgentReason: ''
};
 
function AdminItems() {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [matchModal, setMatchModal] = useState({ open: false, lostItem: null });
  const [matchForm, setMatchForm] = useState({ foundItemId: '', collectTime: '', collectMessage: '' });
  const [matchSearch, setMatchSearch] = useState('');
  const [matchMessage, setMatchMessage] = useState('');
  const [reportModal, setReportModal] = useState({ open: false, type: null });
  const [reportForm, setReportForm] = useState(EMPTY_ITEM_FORM);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
 
  useEffect(() => { fetchItems(); }, []);
 
  const fetchItems = async () => {
    const res = await itemApi.get('/api/items');
    setItems(res.data);
  };
 
  const filtered = items.filter(i => {
    const typeMatch   = filterType   === 'ALL' || i.reportType === filterType;
    const statusMatch = filterStatus === 'ALL' || i.status     === filterStatus;
    return typeMatch && statusMatch;
  });
 
  const foundItems = items
    .filter(i => i.reportType === 'FOUND' && i.status === 'FOUND')
    .filter(i => i.itemName.toLowerCase().includes(matchSearch.toLowerCase()) ||
                 (i.category || '').toLowerCase().includes(matchSearch.toLowerCase()));
 
  const publishSearching = async (id) => {
    await itemApi.put(`/api/items/${id}/searching`);
    fetchItems();
  };
 
  const handleMatch = async (e) => {
    e.preventDefault();
    try {
      await itemApi.post('/api/items/match', {
        lostItemId: matchModal.lostItem.id,
        foundItemId: parseInt(matchForm.foundItemId),
        collectTime: matchForm.collectTime,
        collectMessage: matchForm.collectMessage
      });
      setMatchMessage('Items matched successfully!');
      setTimeout(() => {
        setMatchModal({ open: false, lostItem: null });
        setMatchSearch('');
        setMatchForm({ foundItemId: '', collectTime: '', collectMessage: '' });
        fetchItems();
      }, 1500);
    } catch (err) {
      setMatchMessage(err.response?.data?.error || 'Match failed.');
    }
  };
 
  const updateStatus = async (id, status) => {
    await itemApi.put(`/api/items/${id}/status`, { status });
    fetchItems();
  };
  const openReportModal = (type) => {
    setReportForm(EMPTY_ITEM_FORM);
    setReportError('');
    setReportSuccess('');
    setReportModal({ open: true, type });
  };
 
  const handleAdminReport = async (e) => {
    e.preventDefault();
    setReportError('');
    try {
      const adminId = localStorage.getItem('userId');
      const endpoint = reportModal.type === 'FOUND' ? '/api/items/report-found' : '/api/items/report-lost';
      await itemApi.post(endpoint, {
        ...reportForm,
        reportedBy: adminId,
        urgent: reportForm.urgent,
        urgentReason: reportForm.urgent ? reportForm.urgentReason : '',
      });
      setReportSuccess(`${reportModal.type === 'FOUND' ? 'Found' : 'Lost'} item added successfully!`);
      setTimeout(() => {
        setReportModal({ open: false, type: null });
        fetchItems();
      }, 1200);
    } catch (err) {
      setReportError(err.response?.data?.error || 'Failed to add item.');
    }
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
 
  return (
    <div className="page">
      <div className="page-title">Manage Items</div>
      <div className="page-subtitle">
        Review reports, match lost with found, update status, or add items directly
      </div>
 
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <select className="input" style={{ width: 'auto' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
 
      
        <button className="btn btn-green" onClick={() => openReportModal('FOUND')}>
          + Add Found Item
        </button>
        <button className="btn btn-red" onClick={() => openReportModal('LOST')}>
          + Add Lost Item
        </button>
 
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#6c757d' }}>
          {filtered.length} items
        </span>
      </div>
 
      {items.some(i => i.urgent && (i.status === 'LOST' || i.status === 'SEARCHING')) && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          There are urgent items that need immediate attention.
          Filter by LOST to review them.
        </div>
      )}
 
      {filtered.length === 0 ? (
        <div className="alert alert-info">No items found.</div>
      ) : (
        <div className="card-grid">
          {filtered.map(item => {
            const ss = statusBadge(item.status);
            return (
              <div className="card" key={item.id}
                style={{ borderTop: item.urgent ? '3px solid #dc3545' : undefined }}>
 
                <div className="card-header">
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>
                    #{item.id} — {item.reportType}
                    {item.urgent && (
                      <span style={{
                        marginLeft: '6px', background: '#dc3545', color: 'white',
                        padding: '1px 7px', borderRadius: '10px',
                        fontSize: '11px', fontWeight: '600'
                      }}>
                        URGENT
                      </span>
                    )}
                  </span>
                  <span className="badge" style={ss}>{item.status}</span>
                </div>
 
                <div className="card-body">
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
                    {item.itemName}
                  </div>
                  <div><span style={{ color: '#6c757d' }}>Category:</span> {item.category}</div>
                  <div><span style={{ color: '#6c757d' }}>Location:</span> {item.location || '-'}</div>
                  <div><span style={{ color: '#6c757d' }}>Reporter:</span> User #{item.reportedBy}</div>
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
                      Urgent: {item.urgentReason}
                    </div>
                  )}
                  {item.matchedItemId && (
                    <div style={{ fontSize: '12px', color: '#084298', marginTop: '6px' }}>
                      Matched with Item #{item.matchedItemId}
                    </div>
                  )}
                </div>
 
                <div
 className="card-footer"
 style={{
   display: 'flex',
   flexDirection: 'column',
   gap: '8px'
 }}
>
 {item.reportType === 'LOST' && item.status === 'LOST' && (
 <button
  className="btn btn-blue"
  style={{ width: '100%' }}
  onClick={() => publishSearching(item.id)}
 >
   Publish Searching
 </button>
 )}
 
 {item.reportType === 'LOST' &&
 (item.status === 'LOST' || item.status === 'SEARCHING') &&
 items.some(i => i.reportType === 'FOUND' && i.status === 'FOUND') && (
 <button
  className="btn btn-blue"
  style={{ width: '100%' }}
  onClick={() => {
    setMatchModal({ open: true, lostItem: item });
    setMatchSearch('');
    setMatchMessage('');
    setMatchForm({ foundItemId: '', collectTime: '', collectMessage: '' });
  }}
 >
   Match Found
 </button>
 )}
 
 {item.status === 'MATCHED' && (
 <button
  className="btn btn-blue"
  style={{ width: '100%' }}
  onClick={() => updateStatus(item.id, 'RETURNED')}
 >
  Mark Returned
 </button>
 )}
 
 {item.status === 'RETURNED' && (
 <button
  className="btn btn-blue"
  style={{ width: '100%' }}
  onClick={() => updateStatus(item.id, 'CLOSED')}
 >
 Mark Closed
 </button>
 )}
</div>
 
              </div>
            );
          })}
        </div>
      )}
 
      
      {reportModal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>
              {reportModal.type === 'FOUND' ? '✅ Add Found Item' : '🔴 Add Lost Item'}
            </div>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '16px' }}>
              {reportModal.type === 'FOUND'
                ? 'Admin is reporting an item that was found.'
                : 'Admin is reporting a lost item on behalf of someone.'}
            </p>
 
            <form onSubmit={handleAdminReport}>
              <div className="field">
                <label>Item Name</label>
                <input className="input"
                  value={reportForm.itemName}
                  onChange={e => setReportForm({ ...reportForm, itemName: e.target.value })}
                  placeholder="e.g. Black Wallet" required />
              </div>
 
              <div className="field">
                <label>Category</label>
                <select className="input" value={reportForm.category}
                  onChange={e => setReportForm({ ...reportForm, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
 
              <div className="field">
                <label>Location {reportModal.type === 'FOUND' ? 'Found' : 'Lost'}</label>
                <input className="input"
                  value={reportForm.location}
                  onChange={e => setReportForm({ ...reportForm, location: e.target.value })}
                  placeholder="e.g. Library 2nd Floor" />
              </div>
 
              <div className="field">
                <label>Description</label>
                <textarea className="input" rows="3" style={{ resize: 'vertical' }}
                  value={reportForm.description}
                  onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Additional details..." />
              </div>
 
              {reportModal.type === 'LOST' && (
                <div className="field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox"
                      checked={reportForm.urgent}
                      onChange={e => setReportForm({ ...reportForm, urgent: e.target.checked })} />
                    Mark as Urgent
                  </label>
                  {reportForm.urgent && (
                    <input className="input" style={{ marginTop: '8px' }}
                      value={reportForm.urgentReason}
                      onChange={e => setReportForm({ ...reportForm, urgentReason: e.target.value })}
                      placeholder="Reason for urgency..." />
                  )}
                </div>
              )}
 
              {reportError && <div className="alert alert-danger">{reportError}</div>}
              {reportSuccess && <div className="alert alert-success">{reportSuccess}</div>}
 
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-dark" style={{ flex: 1 }}>
                  Submit
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }}
                  onClick={() => setReportModal({ open: false, type: null })}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      
      {matchModal.open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '500px' }}>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Match Lost Item</div>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '16px' }}>
              Lost: <strong>{matchModal.lostItem.itemName}</strong>
              — {matchModal.lostItem.category}
            </p>
 
            <form onSubmit={handleMatch}>
              <div className="field">
                <label>Search Found Items</label>
                <input className="input" style={{ marginBottom: '8px' }}
                  placeholder="Type item name or category to filter..."
                  value={matchSearch}
                  onChange={e => setMatchSearch(e.target.value)} />
 
                <div style={{
                  maxHeight: '180px', overflowY: 'auto',
                  border: '1px solid #ced4da', borderRadius: '4px'
                }}>
                  {foundItems.length === 0 ? (
                    <div style={{ padding: '12px', fontSize: '13px', color: '#6c757d', textAlign: 'center' }}>
                      No found items match your search
                    </div>
                  ) : (
                    foundItems.map(f => (
                      <div key={f.id}
                        onClick={() => setMatchForm({ ...matchForm, foundItemId: f.id.toString() })}
                        style={{
                          padding: '10px 12px', cursor: 'pointer', fontSize: '13px',
                          borderBottom: '1px solid #f0f0f0',
                          background: matchForm.foundItemId === f.id.toString() ? '#cfe2ff' : 'white',
                          color: matchForm.foundItemId === f.id.toString() ? '#084298' : '#212529'
                        }}>
                        <div style={{ fontWeight: '600' }}>#{f.id} — {f.itemName}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {f.category} — {f.location || 'No location'}
                        </div>
                        {f.description && (
                          <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                            {f.description.substring(0, 60)}...
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
 
                {matchForm.foundItemId && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#198754' }}>
                    Selected: Found Item #{matchForm.foundItemId}
                  </div>
                )}
              </div>
 
              <div className="field">
                <label>Collection Time</label>
                <input className="input"
                  value={matchForm.collectTime}
                  onChange={e => setMatchForm({ ...matchForm, collectTime: e.target.value })}
                  placeholder="e.g. Monday 3 PM at Admin Office"
                  required />
              </div>
 
              <div className="field">
                <label>Message to Owner</label>
                <textarea className="input" rows="3" style={{ resize: 'vertical' }}
                  value={matchForm.collectMessage}
                  onChange={e => setMatchForm({ ...matchForm, collectMessage: e.target.value })}
                  placeholder="e.g. Please bring your student ID when collecting." />
              </div>
 
              {matchMessage && (
                <div className={`alert ${matchMessage.includes('failed') || matchMessage.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
                  {matchMessage}
                </div>
              )}
 
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-dark"
                  style={{ flex: 1 }}
                  disabled={!matchForm.foundItemId}>
                  Confirm Match
                </button>
                <button type="button" className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setMatchModal({ open: false, lostItem: null })}>
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
 
export default AdminItems;
 
 