import { useState } from 'react';

// Import your dashboards
import AdminDashboard from './dashboards/AdminDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import QADashboard from './dashboards/QADashboard';
import AuditorDashboard from './dashboards/AuditorDashboard';

type DashboardType = 'landing' | 'admin' | 'vendor' | 'qa' | 'auditor';

function App() {
  const [currentView, setCurrentView] = useState<DashboardType>('landing');

  // Landing page
  if (currentView === 'landing') {
    return (
      <>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          .landing-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 2rem;
          }
          
          .landing-header {
            text-align: center;
            color: white;
            margin-bottom: 4rem;
          }
          
          .landing-header h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
          }
          
          .landing-header p {
            font-size: 1.25rem;
            opacity: 0.95;
            font-weight: 300;
          }
          
          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            width: 100%;
          }
          
          .dashboard-card {
            background: white;
            border-radius: 12px;
            padding: 2.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          
          .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
          }
          
          .dashboard-icon {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
          }
          
          .dashboard-card h2 {
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
            color: #1a202c;
          }
          
          .dashboard-card p {
            color: #718096;
            font-size: 0.95rem;
            line-height: 1.6;
          }
          
          .dashboard-card.admin { border-top: 4px solid #4f46e5; }
          .dashboard-card.vendor { border-top: 4px solid #059669; }
          .dashboard-card.qa { border-top: 4px solid #dc2626; }
          .dashboard-card.auditor { border-top: 4px solid #7c3aed; }
          
          @media (max-width: 768px) {
            .landing-header h1 { font-size: 2.5rem; }
            .dashboard-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        <div className="landing-container">
          <div className="landing-header">
            <h1>PharmaOps</h1>
            <p>Choose Your Dashboard</p>
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-card admin" onClick={() => setCurrentView('admin')}>
              <div className="dashboard-icon">👨‍💼</div>
              <h2>Admin Dashboard</h2>
              <p>Manage vendors, products, orders, and compliance rules</p>
            </div>
            
            <div className="dashboard-card vendor" onClick={() => setCurrentView('vendor')}>
              <div className="dashboard-icon">🏭</div>
              <h2>Vendor Dashboard</h2>
              <p>View orders, upload documents, and create shipments</p>
            </div>
            
            <div className="dashboard-card qa" onClick={() => setCurrentView('qa')}>
              <div className="dashboard-icon">🔍</div>
              <h2>QA Dashboard</h2>
              <p>Review documents, approve compliance, and verify quality</p>
            </div>
            
            <div className="dashboard-card auditor" onClick={() => setCurrentView('auditor')}>
              <div className="dashboard-icon">📊</div>
              <h2>Auditor Dashboard</h2>
              <p>View audit trails, trace orders, and generate reports</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Dashboard views with back button
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => setCurrentView('landing')}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Dashboard
        </span>
      </div>
      
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'vendor' && <VendorDashboard />}
      {currentView === 'qa' && <QADashboard />}
      {currentView === 'auditor' && <AuditorDashboard />}
    </div>
  );
}

export default App;