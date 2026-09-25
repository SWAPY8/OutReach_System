import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Store,
  Layers,
  MessageSquareText,
  History,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_shops: 0,
    total_categories: 0,
    total_reviews: 0,
    total_sessions: 0,
    recent_shops: [],
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, sessRes] = await Promise.all([
          api.get('/api/admin/dashboard'),
          api.get('/api/admin/sessions')
        ]);
        setStats(dashRes.data);
        setRecentSessions(sessRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Greeting */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dhankranti Review Overview</h1>
          <p className="admin-page-subtitle">
            Monitor review categories, feedback templates, and student review conversions.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards matching prompt */}
      <div className="stats-cards-grid">
        {/* Active Shops */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Store size={24} />
          </div>
          <div>
            <div className="stat-number">{stats.total_shops}</div>
            <div className="stat-label">Active Shops / Centers</div>
          </div>
        </div>

        {/* Review Categories (8) */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-number">{stats.total_categories}</div>
            <div className="stat-label">Review Categories</div>
          </div>
        </div>

        {/* Review Templates (80) */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <MessageSquareText size={24} />
          </div>
          <div>
            <div className="stat-number">{stats.total_reviews}</div>
            <div className="stat-label">Review Templates</div>
          </div>
        </div>

        {/* Sessions Today / Total */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <History size={24} />
          </div>
          <div>
            <div className="stat-number">{stats.total_sessions}</div>
            <div className="stat-label">Review Sessions</div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Sessions Table matching prompt */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent Student Review Activity</h2>
          <Link
            to="/admin/sessions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#1e3a8a',
            }}
          >
            <span>View All Sessions</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Center / Shop</th>
                <th>Category</th>
                <th style={{ width: '40%' }}>Selected Review Statement</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                    No customer review sessions recorded yet. Scan a QR code to record activity.
                  </td>
                </tr>
              ) : (
                recentSessions.map((sess) => (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: 700 }}>{sess.shop_name}</td>
                    <td style={{ color: '#475569', fontWeight: 600 }}>{sess.category_name || '—'}</td>
                    <td>
                      {sess.review_text ? (
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#334155',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={sess.review_text}
                        >
                          "{sess.review_text}"
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending selection</span>
                      )}
                    </td>
                    <td>
                      {sess.redirected_at ? (
                        <span className="badge badge-active">✓ Opened Google</span>
                      ) : sess.copied_at ? (
                        <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          ✓ Copied
                        </span>
                      ) : sess.selected_at ? (
                        <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                          ✓ Selected
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Scanned</span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {new Date(sess.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
