import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../api/client';
import {
  Plus,
  Edit2,
  Trash2,
  QrCode,
  ExternalLink,
  Download,
  Copy,
  Check,
  X,
  Printer,
  Power
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    review_url: '',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedShopForQr, setSelectedShopForQr] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const qrCanvasRef = useRef(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/shops');
      setShops(res.data);
    } catch (err) {
      console.error('Failed to load shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleOpenAdd = () => {
    setEditingShop(null);
    setFormData({
      name: '',
      tagline: 'Share Market & Trading Education',
      review_url: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      tagline: shop.tagline || '',
      review_url: shop.review_url,
      is_active: shop.is_active,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (shop) => {
    try {
      const res = await api.put(`/api/admin/shops/${shop.id}`, {
        is_active: !shop.is_active,
      });
      setShops(shops.map((s) => (s.id === shop.id ? res.data : s)));
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteShop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shop and all its reviews?')) return;
    try {
      await api.delete(`/api/admin/shops/${id}`);
      setShops(shops.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete shop.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingShop) {
        const res = await api.put(`/api/admin/shops/${editingShop.id}`, formData);
        setShops(shops.map((s) => (s.id === editingShop.id ? res.data : s)));
      } else {
        const res = await api.post('/api/admin/shops', formData);
        setShops([res.data, ...shops]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save shop error:', err);
      alert(err.response?.data?.detail || 'Failed to save shop.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenQr = (shop) => {
    setSelectedShopForQr(shop);
    setCopiedLink(false);
    setQrModalOpen(true);
  };

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${selectedShopForQr?.slug || 'dhankranti'}-qr-code.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyLink = () => {
    if (!selectedShopForQr) return;
    const fullUrl = `${window.location.origin}/r/${selectedShopForQr.qr_token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintQr = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Shops & Centers</h1>
          <p className="admin-page-subtitle">
            Configure Dhankranti centers, Google Review destinations, and printable QR codes.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-dhankranti-primary" id="add-shop-btn" style={{ height: '42px', padding: '0 18px', width: 'auto' }}>
          <Plus size={18} />
          <span>Add Shop</span>
        </button>
      </div>

      {/* Shops Table matching prompt */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Review URL</th>
                <th>Status</th>
                <th>QR</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '36px' }}>
                    No shops yet. Click "+ Add Shop" to register Dhankranti.
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{shop.name}</div>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>{shop.tagline}</div>
                    </td>
                    <td>
                      <a
                        href={shop.review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1e3a8a' }}
                      >
                        <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {shop.review_url}
                        </span>
                        <ExternalLink size={14} />
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${shop.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {shop.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        id={`qr-btn-${shop.id}`}
                        onClick={() => handleOpenQr(shop)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          border: '1.5px solid #bfdbfe',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1e3a8a',
                          cursor: 'pointer',
                        }}
                      >
                        <QrCode size={16} />
                        <span>View QR</span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Open Customer Page */}
                        <a
                          href={`/r/${shop.qr_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-action-btn"
                          title="Open Customer Page"
                        >
                          <ExternalLink size={16} />
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(shop)}
                          className="table-action-btn"
                          title="Edit Shop"
                          id={`edit-shop-${shop.id}`}
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Deactivate / Toggle Status */}
                        <button
                          onClick={() => handleToggleActive(shop)}
                          className="table-action-btn"
                          title={shop.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={16} color={shop.is_active ? '#059669' : '#94a3b8'} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteShop(shop.id)}
                          className="table-action-btn delete"
                          title="Delete Shop"
                          id={`delete-shop-${shop.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Shop Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingShop ? 'Edit Shop' : 'Add New Shop'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="admin-modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Shop / Center Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dhankranti Share Market Classes"
                  className="form-input"
                  id="shop-name-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Share Market & Trading Education"
                  className="form-input"
                  id="shop-tagline-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Google Review URL *</label>
                <input
                  type="url"
                  required
                  value={formData.review_url}
                  onChange={(e) => setFormData({ ...formData, review_url: e.target.value })}
                  placeholder="https://www.google.com/search?..."
                  className="form-input"
                  id="shop-url-input"
                />
                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  The Google destination where customers will be directed to paste and submit their review.
                </span>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#1e3a8a' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Active (QR code works)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-dhankranti-secondary"
                  style={{ width: 'auto', padding: '0 18px', height: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-dhankranti-primary"
                  style={{ width: 'auto', padding: '0 24px', height: '42px' }}
                  id="save-shop-btn"
                >
                  {formSubmitting ? 'Saving...' : editingShop ? 'Update Shop' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Management Modal matching prompt */}
      {qrModalOpen && selectedShopForQr && (
        <div className="modal-overlay" onClick={() => setQrModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '440px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
            id="qr-modal-dialog"
          >
            <div className="admin-modal-header" style={{ marginBottom: '14px' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 className="admin-modal-title" style={{ fontSize: '17px' }}>
                  {selectedShopForQr.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                  Scan to leave a review
                </span>
              </div>
              <button onClick={() => setQrModalOpen(false)} className="admin-modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Large Crisp QR Code */}
            <div
              ref={qrCanvasRef}
              style={{
                backgroundColor: '#ffffff',
                padding: '18px',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                display: 'inline-block',
                margin: '6px auto 14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              }}
            >
              <QRCodeCanvas
                value={`${window.location.origin}/r/${selectedShopForQr.qr_token}`}
                size={230}
                level="H"
                includeMargin={true}
              />
            </div>

            <p
              style={{
                fontSize: '13px',
                color: '#1e3a8a',
                wordBreak: 'break-all',
                marginBottom: '20px',
                fontWeight: 600,
                backgroundColor: '#f1f5f9',
                padding: '6px 12px',
                borderRadius: '8px',
              }}
            >
              {window.location.origin}/r/{selectedShopForQr.qr_token}
            </p>

            {/* 4 Action Buttons matching prompt */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleDownloadQr}
                className="btn-dhankranti-primary"
                style={{ height: '42px', fontSize: '13.5px' }}
                id="download-qr-btn"
              >
                <Download size={16} />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handlePrintQr}
                className="btn-dhankranti-secondary"
                style={{ height: '42px', fontSize: '13.5px' }}
                id="print-qr-btn"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="btn-dhankranti-secondary"
                style={{ height: '42px', fontSize: '13.5px' }}
                id="copy-qr-link-btn"
              >
                {copiedLink ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={`/r/${selectedShopForQr.qr_token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dhankranti-secondary"
                style={{ height: '42px', fontSize: '13.5px', textDecoration: 'none' }}
                id="open-customer-page-btn"
              >
                <ExternalLink size={16} />
                <span>Open Page</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
