import { useNavigate } from 'react-router-dom';
 
function UserDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
 
  const cards = [
    {
      title: 'Report Found Item',
      desc: 'Found something? Report it so the owner can claim it.',
      path: '/report-found',
      accent: '#198754'
    },
    {
      title: 'Report Lost Item',
      desc: 'Lost something? Submit a report and we will help.',
      path: '/report-lost',
      accent: '#dc3545'
    },
    {
      title: 'Browse Lost Items',
      desc: 'See items people are searching for. Found one? Let us know.',
      path: '/searching-items',
      accent: '#0d6efd'
    },
    {
      title: 'My Reports',
      desc: 'Track all your submitted found and lost reports.',
      path: '/my-reports',
      accent: '#6c757d'
    }
  ];
 
  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="page-title">Welcome, {username}</div>
        <div className="page-subtitle" style={{ marginBottom: 0 }}>
          What would you like to do today?
        </div>
      </div>
 
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        maxWidth: '560px',
        margin: '0 auto'
      }}>
        {cards.map(card => (
          <div key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderTop: `3px solid ${card.accent}`,
              borderRadius: '8px',
              padding: '18px 16px',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{
              fontWeight: '600', fontSize: '14px',
              marginBottom: '6px', color: card.accent
            }}>
              {card.title}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.5' }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
export default UserDashboard;
 