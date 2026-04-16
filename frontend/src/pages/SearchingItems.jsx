import { useState, useEffect } from 'react';
import { itemApi } from '../api/axiosConfig';
 
function SearchingItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, item: null });
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
 
  useEffect(() => {
    itemApi.get('/api/items/searching').then(res => setItems(res.data));
  }, []);
 
  const filtered = items.filter(i =>
    i.itemName.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  );
 
  const handleIFoundIt = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    try {
      await itemApi.post(`/api/items/${modal.item.id}/i-found-it`, { userId, description });
      setMessage('Thank you! Admin has been notified and will verify shortly.');
      setModal({ open: false, item: null });
      setDescription('');
    } catch { setError('Failed to submit. Try again.'); }
  };
 
  return (
    <div className="page">
      <div className="page-title">Lost Items — Searching</div>
      <div className="page-subtitle">
        Items reported lost. If you found any of them, click "I Found It".
      </div>
 
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
 
     
      <div className="filter-bar">
        <input
          className="input"
          style={{ maxWidth: '260px' }}
          placeholder="Search by item name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
        {search && (
          <button className="btn btn-ghost" onClick={() => setSearch('')}>Clear</button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#6c757d' }}>
          {filtered.length} item(s)
        </span>
      </div>
 
      {filtered.length === 0 ? (
        <div className="alert alert-info">No items found.</div>
      ) : (
        <div className="card-grid">
          {filtered.map(item => (
            <div className="card" key={item.id}>
              <div className="card-header">
                <span style={{ fontSize: '13px', color: '#6c757d' }}>#{item.id}</span>
                <span className="badge" style={{ background: '#fff3cd', color: '#664d03' }}>
                  SEARCHING
                </span>
              </div>
              <div className="card-body">
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
                  {item.itemName}
                </div>
                <div><span style={{ color: '#6c757d' }}>Category:</span> {item.category}</div>
                {item.location && (
                  <div><span style={{ color: '#6c757d' }}>Last Seen:</span> {item.location}</div>
                )}
                {item.description && (
                  <div style={{
                    marginTop: '8px', padding: '8px',
                    background: '#f8f9fa', borderRadius: '4px', fontSize: '12px'
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button className="btn btn-dark" style={{ width: '100%' }}
                  onClick={() => setModal({ open: true, item })}>
                  I Found This Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>
              I Found: {modal.item.itemName}
            </div>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '16px' }}>
              Describe where you found it so admin can verify
            </p>
            <form onSubmit={handleIFoundIt}>
              <div className="field">
                <label>Description</label>
                <textarea className="input" rows="4"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Where did you find it? Any other details..."
                  style={{ resize: 'vertical' }}
                  required />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-dark" style={{ flex: 1 }}>Submit</button>
                <button type="button" className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => { setModal({ open: false, item: null }); setDescription(''); }}>
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
 
export default SearchingItems;
 