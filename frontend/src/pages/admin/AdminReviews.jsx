import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getErrorMessage } from '../../utils/errorHandler';
import { Toast } from '../../components/common/Toast';
import { Plus, Edit2, Trash2, X, AlertCircle, ToggleLeft, ToggleRight, Filter } from 'lucide-react';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Filter States
  const [selectedShopFilter, setSelectedShopFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    shop_id: '',
    category_id: '',
    review_text: '',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [catsRes, shopsRes] = await Promise.all([
        api.get('/api/admin/categories'),
        api.get('/api/admin/shops'),
      ]);
      setCategories(catsRes.data);
      setShops(shopsRes.data);
    } catch (err) {
      console.error('Failed to load filter dropdowns:', err);
    }
  };

  const fetchReviews = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params.shop_id) queryParams.append('shop_id', params.shop_id);
      if (params.category_id) queryParams.append('category_id', params.category_id);
      if (params.is_active !== undefined && params.is_active !== '') {
        queryParams.append('is_active', params.is_active);
      }

      const res = await api.get(`/api/admin/reviews?${queryParams.toString()}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setToast({ message: getErrorMessage(err, 'Failed to load reviews.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchReviews();
  }, []);

  const handleFilterChange = (shopId, catId, statusVal) => {
    setSelectedShopFilter(shopId);
    setSelectedCategoryFilter(catId);
    setSelectedStatusFilter(statusVal);

    fetchReviews({
      shop_id: shopId,
      category_id: catId,
      is_active: statusVal === '' ? undefined : statusVal === 'active',
    });
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormError('');
    setFormData({
      shop_id: shops.length > 0 ? shops[0].id : '',
      category_id: categories.length > 0 ? categories[0].id : '',
      review_text: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setFormError('');
    setFormData({
      shop_id: rev.shop_id,
      category_id: rev.category_id,
      review_text: rev.review_text,
      is_active: rev.is_active,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (rev) => {
    const updatedStatus = !rev.is_active;
    try {
      await api.put(`/api/admin/reviews/${rev.id}`, { is_active: updatedStatus });
      setReviews(reviews.map((r) => (r.id === rev.id ? { ...r, is_active: updatedStatus } : r)));
      setToast({
        message: `Review template status changed to ${updatedStatus ? 'Active' : 'Inactive'}.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Toggle review status error:', err);
      setToast({ message: getErrorMessage(err, 'Failed to update review status.'), type: 'error' });
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review template?')) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setReviews(reviews.filter((r) => r.id !== id));
      setToast({ message: 'Review template deleted.', type: 'success' });
    } catch (err) {
      console.error('Delete review error:', err);
      setToast({ message: getErrorMessage(err, 'Failed to delete review template.'), type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingReview) {
        const res = await api.put(`/api/admin/reviews/${editingReview.id}`, formData);
        setReviews(reviews.map((r) => (r.id === editingReview.id ? res.data : r)));
        setToast({ message: 'Review template updated successfully!', type: 'success' });
      } else {
        const res = await api.post('/api/admin/reviews', formData);
        setReviews([res.data, ...reviews]);
        setToast({ message: 'Review template created successfully!', type: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save review error:', err);
      const msg = getErrorMessage(err, 'Failed to save review. Please check inputs.');
      setFormError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
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

      {/* Header & Controls */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Review Templates</h1>
          <p className="admin-page-subtitle">
            Curate authentic student experience statements across each educational theme.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Shop Filter */}
          <select
            value={selectedShopFilter}
            onChange={(e) => handleFilterChange(e.target.value, selectedCategoryFilter, selectedStatusFilter)}
            className="form-select"
            id="filter-shop-select"
            style={{ width: 'auto', minWidth: '150px', height: '40px', padding: '0 12px' }}
          >
            <option value="">All Shops</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => handleFilterChange(selectedShopFilter, e.target.value, selectedStatusFilter)}
            className="form-select"
            id="filter-category-select"
            style={{ width: 'auto', minWidth: '160px', height: '40px', padding: '0 12px' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => handleFilterChange(selectedShopFilter, selectedCategoryFilter, e.target.value)}
            className="form-select"
            id="filter-status-select"
            style={{ width: 'auto', minWidth: '130px', height: '40px', padding: '0 12px' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="btn-dhankranti-primary"
            id="add-review-btn"
            style={{ height: '40px', padding: '0 18px', width: 'auto' }}
          >
            <Plus size={18} />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Review Text</th>
                <th>Category</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px' }}>
                    No reviews found matching the selected filters.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id}>
                    <td>
                      <div
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-main)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.45',
                          fontSize: '13.5px',
                        }}
                        title={rev.review_text}
                      >
                        "{rev.review_text}"
                      </div>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                      {rev.category_name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{rev.shop_name}</td>
                    <td>
                      <span className={`badge ${rev.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {rev.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {formatDate(rev.created_at)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleToggleActive(rev)}
                          className="table-action-btn"
                          title={rev.is_active ? 'Deactivate Review' : 'Activate Review'}
                          id={`toggle-rev-${rev.id}`}
                        >
                          {rev.is_active ? (
                            <ToggleRight size={18} color="var(--accent)" />
                          ) : (
                            <ToggleLeft size={18} color="var(--text-light)" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rev)}
                          className="table-action-btn"
                          title="Edit Review"
                          id={`edit-rev-${rev.id}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="table-action-btn delete"
                          title="Delete Review"
                          id={`delete-rev-${rev.id}`}
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

      {/* Add / Edit Review Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingReview ? 'Edit Review Template' : 'Add Review Template'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Shop / Center *</label>
                <select
                  required
                  value={formData.shop_id}
                  onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                  className="form-select"
                >
                  <option value="" disabled>
                    Select a Shop
                  </option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Review Category *</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="form-select"
                >
                  <option value="" disabled>
                    Select a Category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Review Statement *</label>
                <textarea
                  required
                  maxLength={500}
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="e.g. Dhankranti's structured mentorship made live trading clear and disciplined for me."
                  className="form-textarea"
                  id="review-text-input"
                />
                <div className="form-char-count">{formData.review_text.length} / 500 characters</div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Active review template</span>
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
                  id="save-review-btn"
                >
                  {formSubmitting ? 'Saving...' : editingReview ? 'Update Review' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
