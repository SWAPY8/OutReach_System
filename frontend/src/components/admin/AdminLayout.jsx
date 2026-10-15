import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Store,
  Layers,
  MessageSquareText,
  History,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout-wrapper">
      {/* Mobile Top Header */}
      <div
        style={{
          display: 'none',
          backgroundColor: 'var(--sidebar-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          color: 'var(--text-main)',
          padding: '14px 20px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
        className="mobile-admin-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoImg} alt="Dhankranti" style={{ height: '32px' }} />
          <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>DHANKRANTI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--glass-border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isDark ? 'Switch to Light Glass' : 'Switch to Dark Glass'}
          >
            {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="var(--primary)" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar with Dhankranti Branding & Grouped Navigation */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
              src={logoImg}
              alt="Dhankranti Logo"
              className="admin-sidebar-logo"
            />
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--glass-border-subtle)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              title={isDark ? 'Switch to Light Glass' : 'Switch to Dark Glass'}
              id="admin-theme-toggle"
            >
              {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="var(--primary)" />}
            </button>
          </div>
          <div className="admin-sidebar-brand-name">DHANKRANTI</div>
          <div className="admin-sidebar-sub">Review Management</div>
        </div>

        <nav className="admin-sidebar-nav">
          {/* MAIN */}
          <div>
            <div className="nav-group-heading">MAIN</div>
            <ul className="nav-group-items">
              <li>
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* MANAGEMENT */}
          <div>
            <div className="nav-group-heading">MANAGEMENT</div>
            <ul className="nav-group-items">
              <li>
                <NavLink
                  to="/admin/shops"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Store size={18} />
                  <span>Shops & Centers</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Layers size={18} />
                  <span>Categories</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <MessageSquareText size={18} />
                  <span>Review Templates</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* ACTIVITY */}
          <div>
            <div className="nav-group-heading">ACTIVITY</div>
            <ul className="nav-group-items">
              <li>
                <NavLink
                  to="/admin/sessions"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <History size={18} />
                  <span>Review Sessions</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* SYSTEM */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <div className="nav-group-heading">SYSTEM</div>
            <ul className="nav-group-items">
              <li>
                <button onClick={handleLogout} className="admin-nav-logout-btn" id="admin-logout-btn">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Admin profile snippet in sidebar footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--sidebar-border)',
            background: 'var(--glass-bg-subtle)',
            fontSize: '12.5px',
          }}
        >
          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{admin?.name || 'Dhankranti Admin'}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{admin?.email}</div>
        </div>
      </aside>

      {/* Content Container */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};
