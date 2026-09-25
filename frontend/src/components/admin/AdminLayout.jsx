import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Layers,
  MessageSquareText,
  History,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
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
          backgroundColor: '#091124',
          color: '#ffffff',
          padding: '14px 20px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
        }}
        className="mobile-admin-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoImg} alt="Dhankranti" style={{ height: '30px' }} />
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>DHANKRANTI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', color: '#ffffff', padding: '4px' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar with Dhankranti Branding & Grouped Navigation */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img
            src={logoImg}
            alt="Dhankranti Logo"
            className="admin-sidebar-logo"
          />
          <div className="admin-sidebar-brand-name">DHANKRANTI</div>
          <div className="admin-sidebar-sub">Review Manager</div>
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
                  <span>Shops</span>
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
                  <span>Reviews</span>
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
            padding: '14px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12.5px',
            color: '#94a3b8',
          }}
        >
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{admin?.name || 'Dhankranti Admin'}</div>
          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{admin?.email}</div>
        </div>
      </aside>

      {/* Content Container */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};
