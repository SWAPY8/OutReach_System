import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getErrorMessage } from '../../utils/errorHandler';
import { Toast } from '../../components/common/Toast';
import { History, CheckCircle2, ExternalLink, Copy, Clock, RefreshCw, Info, X } from 'lucide-react';

export const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [detailModalSession, setDetailModalSession] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setToast({ message: getErrorMessage(err, 'Failed to load sessions.'), type: 'error' });
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
      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'error' })}
        />
      )}

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Review Sessions</h1>
          <p className="admin-page-subtitle">
            Real-time activity log of customer review selections, clipboard copies, and Google Reviews opens.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="btn-dhankranti-secondary"
          id="refresh-sessions-btn"
          style={{ height: '40px', padding: '0 16px', width: 'auto' }}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sessions Table */}
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
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px' }}>
                    No customer review sessions recorded yet. Scan a shop QR code to start a session.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sess.shop_name}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                      {sess.category_name || '—'}
                    </td>
                    <td>
                      {sess.review_text ? (
                        <div
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.45,
                          }}
                          title={sess.review_text}
                        >
                          "{sess.review_text}"
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '12px' }}>
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
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid var(--primary-border)',
                          }}
                        >
                          ✓ Selected
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
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
                            backgroundColor: 'var(--accent-light)',
                            color: 'var(--accent)',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid var(--accent-border)',
                          }}
                        >
                          ✓ Copied
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
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
                            backgroundColor: 'var(--success-light)',
                            color: 'var(--success)',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid var(--success-border)',
                          }}
                        >
                          ✓ Opened
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
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
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  ANONYMOUS SESSION TOKEN
                </strong>
                <code
                  style={{
                    backgroundColor: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--glass-border-subtle)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-main)',
                    wordBreak: 'break-all',
                  }}
                >
                  {detailModalSession.session_token}
                </code>
              </div>

              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  SHOP & CATEGORY
                </strong>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                  {detailModalSession.shop_name} &bull; {detailModalSession.category_name || 'No Category'}
                </span>
              </div>

              {detailModalSession.review_text && (
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                    SELECTED REVIEW
                  </strong>
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--glass-bg-subtle)',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border-subtle)',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}
                  >
                    "{detailModalSession.review_text}"
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--glass-border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Session Created:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatDateTime(detailModalSession.created_at)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Review Selected:</span>
                  <span style={{ fontWeight: 600, color: detailModalSession.selected_at ? 'var(--primary)' : 'var(--text-light)' }}>
                    {formatDateTime(detailModalSession.selected_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Clipboard Copied:</span>
                  <span style={{ fontWeight: 600, color: detailModalSession.copied_at ? 'var(--accent)' : 'var(--text-light)' }}>
                    {formatDateTime(detailModalSession.copied_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Google Redirected:</span>
                  <span style={{ fontWeight: 600, color: detailModalSession.redirected_at ? 'var(--success)' : 'var(--text-light)' }}>
                    {formatDateTime(detailModalSession.redirected_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ marginTop: '22px' }}>
              <button
                type="button"
                onClick={() => setDetailModalSession(null)}
                className="btn-dhankranti-primary"
                style={{ width: '100%', height: '42px' }}
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
