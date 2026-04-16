import { useState, useEffect } from 'react';
import { userApi, itemApi } from '../../api/axiosConfig';
 
function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@_';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}
 
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
 
function AdminUsers() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [message, setMessage]         = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeFilter, setActiveFilter] = useState(null);
  const [createModal, setCreateModal]     = useState(false);
  const [createForm, setCreateForm]       = useState({ username: '', email: '', password: '', role: 'USER' });
  const [createError, setCreateError]     = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [emailSent, setEmailSent]         = useState(false);
  const [detailModal, setDetailModal]   = useState({ open: false, user: null });
  const [userItems, setUserItems]       = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
 
  useEffect(() => { fetchUsers(); }, []);
 
  const fetchUsers = async () => {
    try {
      const res = await userApi.get('/api/users/all');
      setUsers(res.data);
    } catch {}
    setLoading(false);
  };
 

  const handleBoxFilter = (key) => {
    setActiveFilter(prev => (prev === key ? null : key));
    setSearch('');
  };

  const applyFilters = () => {
    let result = [...users];
    if (activeFilter === 'admins')  result = result.filter(u => u.role === 'ADMIN');
    if (activeFilter === 'users')   result = result.filter(u => u.role === 'USER');
    if (activeFilter === 'active')  result = result.filter(u => !u.blocked);
    if (activeFilter === 'blocked') result = result.filter(u => u.blocked);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
 
    return result;
  };
 
  const filteredUsers = applyFilters();
 
  
  const openDetail = async (user) => {
    setDetailModal({ open: true, user });
    setUserItems([]);
    setItemsLoading(true);
    try {
      const res = await itemApi.get(`/api/items/my/${user.id}`);
      setUserItems(res.data);
    } catch { setUserItems([]); }
    setItemsLoading(false);
  };
 
  const closeDetail = () => setDetailModal({ open: false, user: null });
 
 
  const handleBlock = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Block this user? They will not be able to login.')) return;
    try {
      await userApi.put(`/api/users/${id}/block`);
      showMessage('User blocked successfully.', 'success');
      fetchUsers();
      if (detailModal.user && detailModal.user.id === id)
        setDetailModal(prev => ({ ...prev, user: { ...prev.user, blocked: true } }));
    } catch { showMessage('Failed to block user.', 'error'); }
  };
 
  const handleUnblock = async (id, e) => {
    e.stopPropagation();
    try {
      await userApi.put(`/api/users/${id}/unblock`);
      showMessage('User unblocked successfully.', 'success');
      fetchUsers();
      if (detailModal.user && detailModal.user.id === id)
        setDetailModal(prev => ({ ...prev, user: { ...prev.user, blocked: false } }));
    } catch { showMessage('Failed to unblock user.', 'error'); }
  };
 
  const showMessage = (msg, type) => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };
 
 
  const openCreateModal = () => {
    setCreateForm({ username: '', email: '', password: generateTempPassword(), role: 'USER' });
    setCreateError(''); setCreateSuccess(''); setEmailSent(false);
    setCreateModal(true);
  };
 
  const regenerateTempPassword = () =>
    setCreateForm(prev => ({ ...prev, password: generateTempPassword() }));
 
  const handleCreate = async (e) => {
    e.preventDefault(); setCreateError('');
    try {
      await userApi.post('/api/users/create', {
        username: createForm.username, email: createForm.email,
        password: createForm.password, role: createForm.role,
        temporaryPassword: 'true',
      });
      setEmailSent(true);
      setCreateSuccess(
        `Account created for "${createForm.username}". ` +
        (createForm.email
          ? `A temporary password has been sent to ${createForm.email}.`
          : 'No email provided — share the password manually.')
      );
    } catch (err) { setCreateError(err.response?.data?.error || 'Failed to create user'); }
  };
 
  const copyPassword = (pwd) => {
    navigator.clipboard.writeText(pwd);
    showMessage('Password copied to clipboard.', 'success');
  };
 
  const handleDone = () => {
    fetchUsers(); setCreateModal(false); setCreateSuccess('');
    setEmailSent(false);
    setCreateForm({ username: '', email: '', password: generateTempPassword(), role: 'USER' });
  };
 
  const currentAdminId = parseInt(localStorage.getItem('userId'));
  const admins  = users.filter(u => u.role === 'ADMIN');
  const members = users.filter(u => u.role === 'USER');
 
  if (loading) return <div className="page">Loading...</div>;
 
 
  const summaryBoxes = [
    { key: 'total',   label: 'Total',   value: users.length,                         color: '#212529' },
    { key: 'admins',  label: 'Admins',  value: admins.length,                        color: '#084298' },
    { key: 'users',   label: 'Users',   value: members.length,                       color: '#212529' },
    { key: 'active',  label: 'Active',  value: users.filter(u => !u.blocked).length, color: '#0a3622' },
    { key: 'blocked', label: 'Blocked', value: users.filter(u => u.blocked).length,  color: '#842029' },
  ];
 
  return (
    <div className="page">
      <div className="page-title">User Management</div>
      <div className="page-subtitle">
        Click a summary box to filter by group. Click any user card to view their full profile.
      </div>
 
      
      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: '6px', marginBottom: '16px',
          fontSize: '13px', display: 'flex', justifyContent: 'space-between',
          background: messageType === 'success' ? '#d1e7dd' : '#f8d7da',
          color:      messageType === 'success' ? '#0a3622' : '#842029'
        }}>
          {message}
          <span style={{ cursor: 'pointer', fontWeight: '600' }} onClick={() => setMessage('')}>×</span>
        </div>
      )}
 
      
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
                minWidth: '80px', cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? `0 2px 8px ${s.color}44` : 'none'
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = s.color; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e0e0e0'; }}
            >
              <div style={{
                fontWeight: '700', fontSize: '18px',
                color: isActive ? 'white' : s.color
              }}>
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
        <div style={{
          marginBottom: '12px', fontSize: '13px',
          color: '#084298', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          Showing: <strong>{summaryBoxes.find(b => b.key === activeFilter)?.label}</strong>
          <span
            onClick={() => setActiveFilter(null)}
            style={{ cursor: 'pointer', color: '#6c757d', fontSize: '12px',
                     textDecoration: 'underline' }}>
            Clear filter
          </span>
        </div>
      )}
 
      
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Search by username or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveFilter(null); }}
        />
        {search && (
          <button className="btn btn-ghost" onClick={() => setSearch('')}>Clear</button>
        )}
        <button className="btn btn-dark" style={{ marginLeft: 'auto' }} onClick={openCreateModal}>
          + Create User
        </button>
        <span style={{ fontSize: '13px', color: '#6c757d', whiteSpace: 'nowrap' }}>
          {filteredUsers.length} account(s)
        </span>
      </div>
 
   
      {filteredUsers.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <div className="card-grid">
          {filteredUsers.map(user => (
            <div
              className="card"
              key={user.id}
              onClick={() => openDetail(user)}
              style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="card-header" style={{
                background: user.blocked ? '#f8d7da'
                  : user.role === 'ADMIN' ? '#cfe2ff' : '#d1e7dd'
              }}>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>
                  #{user.id}
                  {user.id === currentAdminId && (
                    <span style={{ marginLeft: '6px', fontSize: '11px', color: '#6c757d', fontWeight: '400' }}>
                      (you)
                    </span>
                  )}
                </span>
                <span className="badge" style={{
                  background: user.blocked ? '#842029'
                    : user.role === 'ADMIN' ? '#084298' : '#0a3622',
                  color: 'white'
                }}>
                  {user.blocked ? 'Blocked' : user.role}
                </span>
              </div>
 
              <div className="card-body">
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                  {user.username}
                </div>
                {user.email && (
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                    {user.email}
                  </div>
                )}
                {user.temporaryPassword && (
                  <div style={{
                    fontSize: '11px', color: '#664d03', background: '#fff3cd',
                    borderRadius: '4px', padding: '2px 8px',
                    display: 'inline-block', marginTop: '4px'
                  }}>
                    Temp password — not changed yet
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '8px' }}>
                  Click to view full profile
                </div>
              </div>
 
              <div className="card-footer" onClick={e => e.stopPropagation()}>
                {user.id === currentAdminId ? (
                  <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', padding: '4px 0' }}>
                    Your account
                  </div>
                ) : user.blocked ? (
                  <button
                    onClick={(e) => handleUnblock(user.id, e)}
                    style={{
                      width: '100%', padding: '7px', borderRadius: '4px',
                      border: '1px solid #a3cfbb', background: '#d1e7dd',
                      color: '#0a3622', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                    }}>
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleBlock(user.id, e)}
                    style={{
                      width: '100%', padding: '7px', borderRadius: '4px',
                      border: '1px solid #f1aeb5', background: '#f8d7da',
                      color: '#842029', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                    }}>
                    Block User
                  </button>
                )}
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
                <span style={{ fontWeight: '700', fontSize: '16px' }}>
                  {detailModal.user.username}
                </span>
                <span style={{
                  marginLeft: '10px', padding: '2px 10px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: '600', color: 'white',
                  background: detailModal.user.blocked ? '#842029'
                    : detailModal.user.role === 'ADMIN' ? '#084298' : '#0a3622'
                }}>
                  {detailModal.user.blocked ? 'Blocked' : detailModal.user.role}
                </span>
              </div>
              <button onClick={closeDetail} style={{
                background: 'none', border: 'none', fontSize: '20px',
                cursor: 'pointer', color: '#495057', lineHeight: 1
              }}>×</button>
            </div>
 
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '14px 16px', marginBottom: '18px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#495057' }}>
                  Profile Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  {[
                    ['User ID', `#${detailModal.user.id}`],
                    ['Username', detailModal.user.username],
                    ['Email', detailModal.user.email || 'Not provided'],
                    ['Role', detailModal.user.role],
                    ['Account Status', detailModal.user.blocked ? 'Blocked' : 'Active'],
                    ['Password Status', detailModal.user.temporaryPassword ? 'Temporary — not changed yet' : 'Password set by user'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span style={{ color: '#6c757d' }}>{label}</span>
                      <div style={{
                        fontWeight: '600',
                        color: label === 'Account Status'
                          ? (detailModal.user.blocked ? '#842029' : '#0a3622')
                          : label === 'Password Status'
                          ? (detailModal.user.temporaryPassword ? '#664d03' : '#0a3622')
                          : '#212529'
                      }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
 
                {detailModal.user.temporaryPassword && (
                  <div style={{
                    marginTop: '12px', padding: '10px 12px', background: '#fff3cd',
                    borderRadius: '6px', fontSize: '12px', color: '#664d03', border: '1px solid #ffc107'
                  }}>
                    This user has not logged in yet. The temporary password was sent to{' '}
                    <strong>{detailModal.user.email || '(no email on file)'}</strong>.
                    It is invalidated automatically once they set a new password on first login.
                  </div>
                )}
              </div>
 
             
              {detailModal.user.id !== currentAdminId && (
                <div style={{ marginBottom: '18px' }}>
                  {detailModal.user.blocked ? (
                    <button
                      onClick={(e) => handleUnblock(detailModal.user.id, e)}
                      style={{
                        width: '100%', padding: '9px', borderRadius: '6px',
                        border: '1px solid #a3cfbb', background: '#d1e7dd',
                        color: '#0a3622', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                      }}>
                      Unblock User — Allow Login
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleBlock(detailModal.user.id, e)}
                      style={{
                        width: '100%', padding: '9px', borderRadius: '6px',
                        border: '1px solid #f1aeb5', background: '#f8d7da',
                        color: '#842029', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                      }}>
                      Block User — Prevent Login
                    </button>
                  )}
                </div>
              )}
 
              
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#495057' }}>
                  Items Reported
                  {!itemsLoading && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '400', color: '#6c757d' }}>
                      ({userItems.length} total —{' '}
                      {userItems.filter(i => i.reportType === 'LOST').length} lost,{' '}
                      {userItems.filter(i => i.reportType === 'FOUND').length} found)
                    </span>
                  )}
                </div>
 
                {itemsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d', fontSize: '13px' }}>
                    Loading items...
                  </div>
                ) : userItems.length === 0 ? (
                  <div style={{ padding: '14px', background: '#e7f3fe', borderRadius: '6px', fontSize: '13px', color: '#084298', textAlign: 'center' }}>
                    This user has not reported any items yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userItems.map(item => {
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
                              }}>
                                {item.reportType}
                              </span>
                            </div>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', ...ss }}>
                              {item.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                            {item.category}{item.location && ` • ${item.location}`}
                            {item.urgent && (
                              <span style={{
                                marginLeft: '8px', background: '#dc3545', color: 'white',
                                padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '600'
                              }}>URGENT</span>
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
              <button onClick={closeDetail} style={{
                padding: '7px 20px', background: '#212529', color: 'white',
                border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer'
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
 
      {createModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.45)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>Create New Account</div>
 
            {!emailSent ? (
              <form onSubmit={handleCreate}>
                <div className="field">
                  <label>Username</label>
                  <input className="input" value={createForm.username}
                    onChange={e => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="Enter username" required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="input" type="email" value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="user@example.com" required />
                  <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                    The temporary password will be sent to this email automatically.
                  </div>
                </div>
                <div className="field">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Temporary Password</span>
                    <button type="button"
                      style={{ fontSize: '11px', background: 'none', border: 'none', color: '#0d6efd', cursor: 'pointer', padding: 0 }}
                      onClick={regenerateTempPassword}>
                      Regenerate
                    </button>
                  </label>
                  <input className="input" value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Temporary password" required />
                  <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                    Valid only until first login. User must change on first login.
                  </div>
                </div>
                <div className="field">
                  <label>Role</label>
                  <select className="input" value={createForm.role}
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {createError && <div className="alert alert-danger">{createError}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-dark" style={{ flex: 1 }}>Create & Send Email</button>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }}
                    onClick={() => { setCreateModal(false); setCreateError(''); }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                {createSuccess && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{createSuccess}</div>}
                <div style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Email sent to {createForm.email}</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>The user can login with their temporary password and will be required to set a new one on first login.</div>
                </div>
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#664d03' }}>
                  <strong>Backup:</strong> If the user does not receive the email, share this password manually:
                  <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '15px', marginTop: '6px', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {createForm.password}
                    <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '2px 8px', marginLeft: '8px' }}
                      onClick={() => copyPassword(createForm.password)}>Copy</button>
                  </div>
                </div>
                <button className="btn btn-dark" style={{ width: '100%' }} onClick={handleDone}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
export default AdminUsers;
 
 