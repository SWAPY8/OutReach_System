import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, Filter } from 'lucide-react';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters: Shop, Category, Status
  const [selectedShopFilter, setSelectedShopFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    shop_id: '',
    category_id: '',
    review_text: '',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch initial shops and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shopsRes, catsRes] = await Promise.all([
          api.get('/api/admin/shops'),
          api.get('/api/admin/categories'),
        ]);
        setShops(shopsRes.data);
        setCategories(catsRes.data);

        await fetchReviews('', '', '');
      } catch (err) {
        console.error('Failed to load reviews data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchReviews = async (shopId = selectedShopFilter, catId = selectedCategoryFilter, status = selectedStatusFilter) => {
    try {
      let url = '/api/admin/reviews';
      const params = new URLSearchParams();
      if (shopId) params.append('shop_id', shopId);
      if (catId) params.append('category_id', catId);
      if (status !== '') params.append('is_active', status === 'active' ? 'true' : 'false');
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleFilterChange = (shopId, catId, status) => {
    setSelectedShopFilter(shopId);
    setSelectedCategoryFilter(catId);
    setSelectedStatusFilter(status);
    fetchReviews(shopId, catId, status);
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
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
    } catch (err) {
      console.error('Toggle review status error:', err);
      alert('Failed to update review status.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review template?')) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete review error:', err);
      alert('Failed to delete review template.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingReview) {
        const res = await api.put(`/api/admin/reviews/${editingReview.id}`, formData);
        setReviews(reviews.map((r) => (r.id === editingReview.id ? res.data : r)));
      } else {
        const res = await api.post('/api/admin/reviews', formData);
        setReviews([res.data, ...reviews]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save review error:', err);
      alert(err.response?.data?.detail || 'Failed to save review.');
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
      {/* Header and Filters: Shop, Category, Status */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Review Templates</h1>
          <p className="admin-page-subtitle">
            Manage educational review templates for Dhankranti students to choose from.
          </p>
        </div>

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
            className="btn-primary-blue"
            id="add-review-btn"
            style={{ height: '40px', padding: '0 18px', width: 'auto' }}
          >
            <Plus size={18} />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Reviews Table: Review Text | Category | Shop | Status | Created | Actions */}
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
                  <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '36px' }}>
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
                          color: '#0f172a',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.4',
                          fontSize: '13px',
                        }}
                        title={rev.review_text}
                      >
                        "{rev.review_text}"
                      </div>
                    </td>
                    <td style={{ color: '#1e3a8a', fontWeight: 600, fontSize: '13px' }}>
                      {rev.category_name}
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>{rev.shop_name}</td>
                    <td>
                      <span className={`badge ${rev.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {rev.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>
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
                            <ToggleRight size={18} color="#059669" />
                          ) : (
                            <ToggleLeft size={18} color="#94a3b8" />
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

      {/* Add / Edit Review Modal with 300 char counter */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingReview ? 'Edit Review Template' : 'Add Review Template'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="admin-modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Shop *</label>
                  <select
                    required
                    value={formData.shop_id}
                    onChange={(e) => setFormData({ ...formData, shop_id: Number(e.target.value) })}
                    className="form-select"
                    id="review-shop-select"
                  >
                    <option value="">Select Shop</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="form-select"
                    id="review-category-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Text Textarea with Character Counter: 0 / 300 */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Review Text *</label>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: formData.review_text.length > 280 ? '#dc2626' : '#64748b' }}>
                    {formData.review_text.length} / 300
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={300}
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="e.g. Ram Sir explains market concepts in a very simple way. Great practical learning experience."
                  className="form-textarea"
                  id="review-text-input"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#1e3a8a' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Active (available to students)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary-outline"
                  style={{ width: 'auto', padding: '0 18px', height: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary-blue"
                  style={{ width: 'auto', padding: '0 24px', height: '42px' }}
                  id="save-review-btn"
                >
                  {formSubmitting ? 'Saving...' : editingReview ? 'Update Review' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
