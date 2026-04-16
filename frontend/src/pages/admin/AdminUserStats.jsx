import { useState, useEffect } from 'react';
import { userApi, itemApi } from '../../api/axiosConfig';
 
const MONTHS = [
  { value: '',   label: 'All Months' },
  { value: '1',  label: 'January'   }, { value: '2',  label: 'February'  },
  { value: '3',  label: 'March'     }, { value: '4',  label: 'April'     },
  { value: '5',  label: 'May'       }, { value: '6',  label: 'June'      },
  { value: '7',  label: 'July'      }, { value: '8',  label: 'August'    },
  { value: '9',  label: 'September' }, { value: '10', label: 'October'   },
  { value: '11', label: 'November'  }, { value: '12', label: 'December'  },
];
 
const statusStyle = (status) => {
  const map = {
    LOST:      { background: '#f8d7da', color: '#842029' },
    FOUND:     { background: '#d1e7dd', color: '#0a3622' },
    SEARCHING: { background: '#fff3cd', color: '#664d03' },
    MATCHED:   { background: '#cfe2ff', color: '#084298' },
    RETURNED:  { background: '#d1e7dd', color: '#0a3622' },
    CLOSED:    { background: '#e2e3e5', color: '#41464b' }
  };
  return map[status] || { background: '#e2e3e5', color: '#41464b' };
};
 
function filterItemsByDate(items, year, month) {
  return items.filter(item => {
    if (!item.createdAt) return true;
    const d = new Date(item.createdAt);
    if (year  && d.getFullYear() !== parseInt(year))  return false;
    if (month && d.getMonth() + 1 !== parseInt(month)) return false;
    return true;
  });
}
 
function AdminUserStats() {
  const [allData, setAllData]       = useState([]); 
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [searched, setSearched]     = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedYear,  setSelectedYear]  = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [detailModal, setDetailModal]     = useState({ open: false, user: null });
  const [detailItems, setDetailItems]     = useState([]);
  const [actionMessage, setActionMessage] = useState('');
 
  useEffect(() => { loadStats(); }, []);
 

  const loadStats = async () => {
    try {
      const usersRes = await userApi.get('/api/users/all');
      const users = usersRes.data;
      if (users.length === 0) { setAllData([]); setLoading(false); return; }
 
      const data = await Promise.all(
        users.map(async (user) => {
          try {
            const res = await itemApi.get(`/api/items/my/${user.id}`);
            return { user, items: res.data };
          } catch {
            return { user, items: [] };
          }
        })
      );
 
      setAllData(data);
      setLoading(false);
    } catch {
      setError('Failed to load stats. Check all services are running.');
      setLoading(false);
    }
  };
 
  const availableYears = [...new Set(
    allData.flatMap(d => d.items)
      .filter(i => i.createdAt)
      .map(i => new Date(i.createdAt).getFullYear())
  )].sort((a, b) => b - a);
 

  const computeStats = (entry) => {
    const filtered = filterItemsByDate(entry.items, selectedYear, selectedMonth);
    return {
      id:                entry.user.id,
      username:          entry.user.username,
      email:             entry.user.email,
      role:              entry.user.role,
      blocked:           entry.user.blocked,
      temporaryPassword: entry.user.temporaryPassword,
      lostCount:         filtered.filter(i => i.reportType === 'LOST').length,
      foundCount:        filtered.filter(i => i.reportType === 'FOUND').length,
      total:             filtered.length,
      rawItems:          entry.items, 
    };
  };
 
 
  const visibleStats = allData
    .map(computeStats)
    .filter(s => {
      if (activeFilter === 'admins' && s.role !== 'ADMIN') return false;
      if (activeFilter === 'users'  && s.role !== 'USER')  return false;
      
      if (searched && search.trim()) {
        const q = search.toLowerCase();
        if (!s.username.toLowerCase().includes(q) && !(s.email || '').toLowerCase().includes(q))
          return false;
      }
      return true;
    });
 
  const handleBoxFilter = (key) => {
    setActiveFilter(prev => (prev === key ? null : key));
    setSearch(''); setSearched(false);
  };
  const handleSearch = () => {
    setActiveFilter(null);
    setSearched(true);
  };
  const handleClear = () => { setSearch(''); setSearched(false); setActiveFilter(null); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };
  const openDetail = (stat) => {
    setDetailModal({ open: true, user: stat });
    setDetailItems(filterItemsByDate(stat.rawItems, selectedYear, selectedMonth));
    setActionMessage('');
  };
 
  const closeDetail = () => setDetailModal({ open: false, user: null });
  const handleBlock = async (id) => {
    if (!window.confirm('Block this user?')) return;
    try {
      await userApi.put(`/api/users/${id}/block`);
      setDetailModal(prev => ({ ...prev, user: { ...prev.user, blocked: true } }));
      setActionMessage('User blocked successfully.');
      loadStats();
    } catch { setActionMessage('Failed to block user.'); }
  };
 
  const handleUnblock = async (id) => {
    try {
      await userApi.put(`/api/users/${id}/unblock`);
      setDetailModal(prev => ({ ...prev, user: { ...prev.user, blocked: false } }));
      setActionMessage('User unblocked successfully.');
      loadStats();
    } catch { setActionMessage('Failed to unblock user.'); }
  };
 
  if (loading) return (
    <div className="page" style={{ color: '#6c757d', fontSize: '14px' }}>Loading stats...</div>
  );
 
  const adminCount = allData.filter(d => d.user.role === 'ADMIN').length;
  const userCount  = allData.filter(d => d.user.role === 'USER').length;
  const currentAdminId = parseInt(localStorage.getItem('userId'));
 
  const summaryBoxes = [
    { key: 'total',  label: 'Total Accounts', value: allData.length, color: '#212529' },
    { key: 'admins', label: 'Admins',          value: adminCount,    color: '#084298' },
    { key: 'users',  label: 'Users',           value: userCount,     color: '#0a3622' },
  ];
 
  return (
    <div className="page">
      <div className="page-title">User Statistics</div>
      <div className="page-subtitle">
        Click a summary box to filter. Use year/month to filter item counts. Click any card to view full profile.
      </div>
 
      {error && <div className="alert alert-danger">{error}</div>}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {summaryBoxes.map(s => {
          const isActive = activeFilter === s.key;
          return (
            <div
              key={s.key}
              onClick={() => handleBoxFilter(s.key)}
              title={`Click to show ${s.label} only`}
              style={{
                background: isActive ? s.color : 'white',
                border: isActive ? `2px solid ${s.color}` : '1px solid #e0e0e0',
                borderRadius: '8px', padding: '8px 20px', textAlign: 'center',
                minWidth: '100px', cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: isActive ? `0 2px 8px ${s.color}44` : 'none'
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = s.color; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e0e0e0'; }}
            >
              <div style={{ fontWeight: '700', fontSize: '18px', color: isActive ? 'white' : s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.85)' : '#6c757d' }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
 
    
      {activeFilter && (
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#084298', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Showing: <strong>{summaryBoxes.find(b => b.key === activeFilter)?.label}</strong>
          <span onClick={() => setActiveFilter(null)}
            style={{ cursor: 'pointer', color: '#6c757d', fontSize: '12px', textDecoration: 'underline' }}>
            Clear filter
          </span>
        </div>
      )}
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        <select
          className="input" style={{ width: 'auto' }}
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          <option value="">All Years</option>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
 
        <select
          className="input" style={{ width: 'auto' }}
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
 
        {(selectedYear || selectedMonth) && (
          <button className="btn btn-ghost"
            onClick={() => { setSelectedYear(''); setSelectedMonth(''); }}>
            Clear Date Filter
          </button>
        )}
 
        {(selectedYear || selectedMonth) && (
          <span style={{ fontSize: '13px', color: '#084298' }}>
            Counts filtered to{selectedYear ? ` ${selectedYear}` : ''}{selectedMonth ? ` ${MONTHS.find(m => m.value === selectedMonth)?.label}` : ''}
          </span>
        )}
      </div>
 
      
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <input
          className="input" style={{ flex: 1 }}
          placeholder="Search by username or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-dark" onClick={handleSearch}>Search</button>
        {(searched || search) && (
          <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
        )}
        <span style={{ fontSize: '13px', color: '#6c757d', whiteSpace: 'nowrap' }}>
          {visibleStats.length} account(s)
        </span>
      </div>
 
    
      {visibleStats.length === 0 ? (
        <div className="alert alert-info">
          {searched ? 'No accounts match your search.' : 'No accounts registered yet.'}
        </div>
      ) : (
        <div className="card-grid">
          {visibleStats.map(stat => (
            <div
              className="card"
              key={stat.id}
              onClick={() => openDetail(stat)}
              style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="card-header"
                style={{ background: stat.role === 'ADMIN' ? '#cfe2ff' : stat.blocked ? '#f8d7da' : undefined }}>
                <span style={{ fontSize: '13px', color: '#6c757d' }}>#{stat.id}</span>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                  borderRadius: '10px', color: 'white',
                  background: stat.blocked ? '#842029' : stat.role === 'ADMIN' ? '#084298' : '#198754'
                }}>
                  {stat.blocked ? 'Blocked' : stat.role}
                </span>
              </div>
 
              <div className="card-body">
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>
                  {stat.username}
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6c757d', fontWeight: '400' }}>
                    {stat.total} report(s)
                    {(selectedYear || selectedMonth) && (
                      <span style={{ fontSize: '11px', color: '#084298', marginLeft: '4px' }}>
                        (filtered)
                      </span>
                    )}
                  </span>
                </div>
                {stat.email ? (
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '10px' }}>{stat.email}</div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#adb5bd', marginBottom: '10px' }}>No email on file</div>
                )}
 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>Items Reported Lost</span>
                  <span style={{ padding: '2px 12px', borderRadius: '20px', background: '#f8d7da', color: '#842029', fontWeight: '700', fontSize: '14px' }}>
                    {stat.lostCount}
                  </span>
                </div>
 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>Items Reported Found</span>
                  <span style={{ padding: '2px 12px', borderRadius: '20px', background: '#d1e7dd', color: '#0a3622', fontWeight: '700', fontSize: '14px' }}>
                    {stat.foundCount}
                  </span>
                </div>
 
                <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '10px' }}>
                  Click to view full profile and items
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
 
     
      {detailModal.open && detailModal.user && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.45)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '10px', width: '560px',
            maxHeight: '88vh', overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '16px 20px',
              background: detailModal.user.blocked ? '#f8d7da'
                : detailModal.user.role === 'ADMIN' ? '#cfe2ff' : '#d1e7dd',
              borderRadius: '10px 10px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>{detailModal.user.username}</span>
                <span style={{
                  marginLeft: '10px', padding: '2px 10px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: '600', color: 'white',
                  background: detailModal.user.blocked ? '#842029'
                    : detailModal.user.role === 'ADMIN' ? '#084298' : '#0a3622'
                }}>
                  {detailModal.user.blocked ? 'Blocked' : detailModal.user.role}
                </span>
              </div>
              <button onClick={closeDetail} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#495057', lineHeight: 1 }}>×</button>
            </div>
 
            <div style={{ padding: '20px' }}>
              {actionMessage && (
                <div style={{ padding: '10px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '13px', background: '#d1e7dd', color: '#0a3622' }}>
                  {actionMessage}
                </div>
              )}
 
             
              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '14px 16px', marginBottom: '18px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#495057' }}>Profile Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  {[
                    ['User ID',        `#${detailModal.user.id}`],
                    ['Username',       detailModal.user.username],
                    ['Email',          detailModal.user.email || 'Not provided'],
                    ['Role',           detailModal.user.role],
                    ['Account Status', detailModal.user.blocked ? 'Blocked' : 'Active'],
                    ['Password Status', detailModal.user.temporaryPassword ? 'Temporary — not changed yet' : 'Password set by user'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span style={{ color: '#6c757d' }}>{label}</span>
                      <div style={{
                        fontWeight: '600',
                        color: label === 'Account Status' ? (detailModal.user.blocked ? '#842029' : '#0a3622')
                          : label === 'Password Status' ? (detailModal.user.temporaryPassword ? '#664d03' : '#0a3622')
                          : '#212529'
                      }}>{val}</div>
                    </div>
                  ))}
                </div>
                {detailModal.user.temporaryPassword && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fff3cd', borderRadius: '6px', fontSize: '12px', color: '#664d03', border: '1px solid #ffc107' }}>
                    This user has not logged in yet. Temp password was sent to <strong>{detailModal.user.email || '(no email)'}</strong>.
                    Invalidated automatically after first login.
                  </div>
                )}
              </div>
 
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                {[
                  { label: 'Total',  value: detailItems.length,                                  color: '#212529' },
                  { label: 'Lost',   value: detailItems.filter(i => i.reportType === 'LOST').length,  color: '#842029' },
                  { label: 'Found',  value: detailItems.filter(i => i.reportType === 'FOUND').length, color: '#0a3622' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>{s.label}</div>
                  </div>
                ))}
              </div>
 
           
              {detailModal.user.id !== currentAdminId && (
                <div style={{ marginBottom: '18px' }}>
                  {detailModal.user.blocked ? (
                    <button onClick={() => handleUnblock(detailModal.user.id)}
                      style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #a3cfbb', background: '#d1e7dd', color: '#0a3622', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                      Unblock User — Allow Login
                    </button>
                  ) : (
                    <button onClick={() => handleBlock(detailModal.user.id)}
                      style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #f1aeb5', background: '#f8d7da', color: '#842029', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                      Block User — Prevent Login
                    </button>
                  )}
                </div>
              )}
 
              
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#495057' }}>
                  Reported Items
                  {(selectedYear || selectedMonth) && (
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#084298', fontWeight: '400' }}>
                      (filtered to{selectedYear ? ` ${selectedYear}` : ''}{selectedMonth ? ` ${MONTHS.find(m => m.value === selectedMonth)?.label}` : ''})
                    </span>
                  )}
                </div>
 
                {detailItems.length === 0 ? (
                  <div style={{ padding: '14px', background: '#e7f3fe', borderRadius: '6px', fontSize: '13px', color: '#084298', textAlign: 'center' }}>
                    No items{(selectedYear || selectedMonth) ? ' in the selected period.' : ' reported yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detailItems.map(item => {
                      const ss = statusStyle(item.status);
                      return (
                        <div key={item.id} style={{
                          border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 14px',
                          background: 'white',
                          borderLeft: `4px solid ${item.reportType === 'LOST' ? '#dc3545' : '#198754'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.itemName}</span>
                              <span style={{
                                marginLeft: '8px', fontSize: '11px', padding: '1px 6px',
                                borderRadius: '10px', fontWeight: '600',
                                background: item.reportType === 'LOST' ? '#f8d7da' : '#d1e7dd',
                                color: item.reportType === 'LOST' ? '#842029' : '#0a3622'
                              }}>{item.reportType}</span>
                            </div>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', ...ss }}>
                              {item.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                            {item.category}{item.location && ` • ${item.location}`}
                            {item.urgent && (
                              <span style={{ marginLeft: '8px', background: '#dc3545', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>URGENT</span>
                            )}
                          </div>
                          {item.createdAt && (
                            <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '3px' }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
 
            <div style={{ padding: '14px 20px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeDetail} style={{ padding: '7px 20px', background: '#212529', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default AdminUserStats;
 
 