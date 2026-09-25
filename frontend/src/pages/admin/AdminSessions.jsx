import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { History, CheckCircle2, ExternalLink, Copy, Clock, RefreshCw, Info, X } from 'lucide-react';

export const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalSession, setDetailModalSession] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatTime = (ts) => {
    if (!ts) return null;
    try {
      return new Date(ts).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  const formatDateTime = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Review Sessions</h1>
          <p className="admin-page-subtitle">
            Real-time activity log of customer review selections, clipboard copies, and Google Reviews opens.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="btn-secondary-outline"
          id="refresh-sessions-btn"
          style={{ height: '40px', padding: '0 16px', width: 'auto' }}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sessions Table: Shop | Category | Selected Review | Selected | Copied | Opened | Time */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Category</th>
                <th style={{ width: '38%' }}>Selected Review</th>
                <th style={{ textAlign: 'center' }}>Selected</th>
                <th style={{ textAlign: 'center' }}>Copied</th>
                <th style={{ textAlign: 'center' }}>Opened</th>
                <th style={{ textAlign: 'center' }}>Time</th>
                <th style={{ textAlign: 'right', width: '60px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '36px' }}>
                    No customer review sessions recorded yet. Scan a shop QR code to start a session.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{sess.shop_name}</td>
                    <td style={{ color: '#1e3a8a', fontWeight: 600, fontSize: '13px' }}>
                      {sess.category_name || '—'}
                    </td>
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
                            lineHeight: 1.4,
                          }}
                          title={sess.review_text}
                        >
                          "{sess.review_text}"
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                          Browsing categories...
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {sess.selected_at ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          ✓ Selected
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {sess.copied_at ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          ✓ Copied
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {sess.redirected_at ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          ✓ Opened
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      {formatTime(sess.created_at || sess.selected_at)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setDetailModalSession(sess)}
                        className="table-action-btn"
                        title="View Session Details"
                        id={`session-details-btn-${sess.id}`}
                      >
                        <Info size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details/Debug Modal for anonymous session token info */}
      {detailModalSession && (
        <div className="modal-overlay" onClick={() => setDetailModalSession(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Session Audit Details</h2>
              <button onClick={() => setDetailModalSession(null)} className="admin-modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div>
                <strong style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  ANONYMOUS SESSION TOKEN
                </strong>
                <code
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    display: 'block',
                    fontSize: '12px',
                    color: '#0f172a',
                    wordBreak: 'break-all',
                  }}
                >
                  {detailModalSession.session_token}
                </code>
              </div>

              <div>
                <strong style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  SHOP & CATEGORY
                </strong>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>
                  {detailModalSession.shop_name} &bull; {detailModalSession.category_name || 'No Category'}
                </span>
              </div>

              {detailModalSession.review_text && (
                <div>
                  <strong style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    SELECTED REVIEW
                  </strong>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}
                  >
                    "{detailModalSession.review_text}"
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Session Created:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatDateTime(detailModalSession.created_at)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Review Selected:</span>
                  <span style={{ fontWeight: 600, color: detailModalSession.selected_at ? '#1e40af' : '#94a3b8' }}>
                    {formatDateTime(detailModalSession.selected_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Clipboard Copied:</span>
                  <span style={{ fontWeight: 600, color: detailModalSession.copied_at ? '#059669' : '#94a3b8' }}>
                    {formatDateTime(detailModalSession.copied_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Google Redirected:</span>
                  <span style={{ fontWeight: 600, color: detailModalSession.redirected_at ? '#16a34a' : '#94a3b8' }}>
                    {formatDateTime(detailModalSession.redirected_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setDetailModalSession(null)}
                className="btn-primary-blue"
                style={{ width: '100%', height: '40px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
