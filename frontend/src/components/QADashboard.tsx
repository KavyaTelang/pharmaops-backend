const QADashboard = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: '#1f2937',
          marginBottom: '1rem' 
        }}>
          QA Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          Quality Assurance dashboard coming soon!
          <br />
          This will allow you to review and approve vendor documents.
        </p>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#374151',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Planned Features:
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem',
            color: '#6b7280',
            lineHeight: 2
          }}>
            <li>View pending documents for review</li>
            <li>Approve or reject vendor submissions</li>
            <li>Add review comments</li>
            <li>Track approval statistics</li>
            <li>Auto-update order status after approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QADashboard;