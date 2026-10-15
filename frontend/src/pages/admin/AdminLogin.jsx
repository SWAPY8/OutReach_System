import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../utils/errorHandler';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Sun, Moon, ArrowLeft } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-body)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow orbs for glass refraction */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(37, 99, 235, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.22) 0%, rgba(5, 150, 105, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar with Home & Theme Toggle */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="var(--primary)" />}
        </button>
      </div>

      {/* Glassmorphic Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRadius: '28px',
          boxShadow: 'var(--glass-shadow-lg)',
          border: '1px solid var(--glass-border)',
          padding: '42px 36px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Dhankranti Brand Badge */}
        <div
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '16px',
          }}
        >
          <img
            src={logoImg}
            alt="Dhankranti Logo"
            style={{ height: '52px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
          DHANKRANTI
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '28px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Admin Review Manager
        </p>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email-input">
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Mail
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="admin-password-input">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <Lock
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  padding: '4px',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '26px',
              fontSize: '13.5px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            id="admin-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-dhankranti-primary"
            style={{ width: '100%', height: '48px', fontSize: '15px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
