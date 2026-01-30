import { useState } from 'react';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(email, password);
      console.log('Login successful:', data);
      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick login buttons for testing
  const quickLogin = async (role: 'ADMIN' | 'VENDOR' | 'QA' | 'AUDITOR') => {
    const credentials: Record<string, { email: string; password: string }> = {
      ADMIN: { email: 'admin@pharmacorp.com', password: 'admin123' },
      VENDOR: { email: 'vendor@globallogistics.com', password: 'vendor123' },
      QA: { email: 'qa@pharmacorp.com', password: 'qa123' },
      AUDITOR: { email: 'auditor@pharmacorp.com', password: 'auditor123' },
    };

    const creds = credentials[role];
    setEmail(creds.email);
    setPassword(creds.password);

    // Auto-submit
    setLoading(true);
    setError('');
    try {
      const data = await api.login(creds.email, creds.password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .login-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .login-logo span {
          color: #667eea;
        }

        .login-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .login-button {
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          border: 1px solid #fecaca;
          margin-bottom: 1rem;
          animation: shake 0.4s ease-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .quick-login-section {
          background: #f9fafb;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .quick-login-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.875rem;
          text-align: center;
        }

        .quick-login-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .quick-login-btn {
          padding: 0.75rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }

        .quick-login-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .quick-login-btn.admin {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .quick-login-btn.vendor {
          border-color: #10b981;
          color: #10b981;
        }

        .quick-login-btn.qa {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .quick-login-btn.auditor {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #9ca3af;
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-logo">Pharma<span>Ops</span></h1>
            <p className="login-subtitle">Supply Chain Compliance Platform</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">Quick Access (Demo)</span>
            <div className="divider-line"></div>
          </div>

          <div className="quick-login-section">
            <div className="quick-login-title">Login as:</div>
            <div className="quick-login-grid">
              <button 
                onClick={() => quickLogin('ADMIN')} 
                className="quick-login-btn admin"
                disabled={loading}
              >
                👨‍💼 Admin
              </button>
              <button 
                onClick={() => quickLogin('VENDOR')} 
                className="quick-login-btn vendor"
                disabled={loading}
              >
                📦 Vendor
              </button>
              <button 
                onClick={() => quickLogin('QA')} 
                className="quick-login-btn qa"
                disabled={loading}
              >
                ✅ QA
              </button>
              <button 
                onClick={() => quickLogin('AUDITOR')} 
                className="quick-login-btn auditor"
                disabled={loading}
              >
                📊 Auditor
              </button>
            </div>
          </div>

          <p className="footer-text">
            Secure authentication powered by JWT
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;