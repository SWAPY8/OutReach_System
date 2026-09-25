import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getCategoryIcon, AVAILABLE_ICONS } from '../../utils/iconMap';
import { Plus, Edit2, Trash2, X, AlertCircle, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'star',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'graduation-cap',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'star',
      is_active: cat.is_active,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (cat) => {
    const updatedStatus = !cat.is_active;
    try {
      const res = await api.put(`/api/admin/categories/${cat.id}`, {
        is_active: updatedStatus,
      });
      setCategories(categories.map((c) => (c.id === cat.id ? { ...c, is_active: updatedStatus } : c)));
    } catch (err) {
      console.error('Toggle category status failed:', err);
      alert(err.response?.data?.detail || 'Failed to update category status.');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (cat.review_count > 0) {
      const confirmDeact = window.confirm(
        `This category has ${cat.review_count} active review templates associated with it.\n\nDeleting it directly is prevented to avoid breaking review links. Would you like to DEACTIVATE it instead?`
      );
      if (confirmDeact) {
        handleToggleActive(cat);
      }
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${cat.name}"?`)) return;

    try {
      await api.delete(`/api/admin/categories/${cat.id}`);
      setCategories(categories.filter((c) => c.id !== cat.id));
    } catch (err) {
      console.error('Delete category failed:', err);
      alert(err.response?.data?.detail || 'Failed to delete category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingCategory) {
        const res = await api.put(`/api/admin/categories/${editingCategory.id}`, formData);
        setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, ...res.data } : c)));
      } else {
        const res = await api.post('/api/admin/categories', formData);
        setCategories([...categories, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save category error:', err);
      alert(err.response?.data?.detail || 'Failed to save category.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Review Categories</h1>
          <p className="admin-page-subtitle">
            Configure Dhankranti educational experience themes and student review categories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary-blue"
          id="add-category-btn"
          style={{ height: '42px', padding: '0 18px', width: 'auto' }}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table: Icon | Category | Description | Review Count | Status | Actions */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Icon</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Review Count</th>
                <th>Status</th>
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
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '36px' }}>
                    No categories found. Click "+ Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          color: '#1e3a8a',
                        }}
                      >
                        {getCategoryIcon(cat.icon)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{cat.name}</td>
                    <td style={{ color: '#475569', maxWidth: '360px', fontSize: '13px' }}>
                      {cat.description || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: cat.review_count > 0 ? '#eff6ff' : '#f1f5f9',
                          color: cat.review_count > 0 ? '#1e40af' : '#64748b',
                        }}
                      >
                        {cat.review_count || 0} reviews
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cat.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className="table-action-btn"
                          title={cat.is_active ? 'Deactivate Category' : 'Activate Category'}
                          id={`toggle-cat-${cat.id}`}
                        >
                          {cat.is_active ? (
                            <ToggleRight size={18} color="#059669" />
                          ) : (
                            <ToggleLeft size={18} color="#94a3b8" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="table-action-btn"
                          title="Edit Category"
                          id={`edit-cat-${cat.id}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="table-action-btn delete"
                          title="Delete Category"
                          id={`delete-cat-${cat.id}`}
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="admin-modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Technical Analysis"
                  className="form-input"
                  id="category-name-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Chart reading, candlestick patterns, and indicators."
                  className="form-input"
                  id="category-desc-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lucide Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="form-select"
                  id="category-icon-select"
                >
                  {AVAILABLE_ICONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#1e3a8a' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Active (visible to students)</span>
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
                  id="save-category-btn"
                >
                  {formSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
