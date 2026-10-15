import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getErrorMessage } from '../../utils/errorHandler';
import { Toast } from '../../components/common/Toast';
import { getCategoryIcon, AVAILABLE_ICONS } from '../../utils/iconMap';
import { Plus, Edit2, Trash2, X, AlertCircle, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState('');
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
      setToast({ message: getErrorMessage(err, 'Failed to load categories.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormError('');
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
    setFormError('');
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
      setToast({
        message: `Category "${cat.name}" is now ${updatedStatus ? 'Active' : 'Inactive'}.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Toggle category status failed:', err);
      setToast({ message: getErrorMessage(err, 'Failed to update category status.'), type: 'error' });
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
      setToast({ message: 'Category successfully deleted.', type: 'success' });
    } catch (err) {
      console.error('Delete category failed:', err);
      setToast({ message: getErrorMessage(err, 'Failed to delete category.'), type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingCategory) {
        const res = await api.put(`/api/admin/categories/${editingCategory.id}`, formData);
        setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, ...res.data } : c)));
        setToast({ message: 'Category updated successfully!', type: 'success' });
      } else {
        const res = await api.post('/api/admin/categories', formData);
        setCategories([...categories, res.data]);
        setToast({ message: 'Category created successfully!', type: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save category error:', err);
      const msg = getErrorMessage(err, 'Failed to save category. Please check your inputs.');
      setFormError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setFormSubmitting(false);
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
          className="btn-dhankranti-primary"
          id="add-category-btn"
          style={{ height: '42px', padding: '0 18px', width: 'auto' }}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Icon</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Templates</th>
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
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px' }}>
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
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--primary-light)',
                          border: '1px solid var(--primary-border)',
                          color: 'var(--primary)',
                        }}
                      >
                        {getCategoryIcon(cat.icon, 20)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '360px', fontSize: '13.5px' }}>
                      {cat.description || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: cat.review_count > 0 ? 'var(--primary-light)' : 'var(--glass-bg-subtle)',
                          color: cat.review_count > 0 ? 'var(--primary)' : 'var(--text-muted)',
                          border: '1px solid var(--glass-border-subtle)',
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
                            <ToggleRight size={18} color="var(--accent)" />
                          ) : (
                            <ToggleLeft size={18} color="var(--text-light)" />
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
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Teaching Quality & Faculty"
                  className="form-input"
                  id="cat-name-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Subtitle</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional guidance shown under category badge"
                  className="form-input"
                />
              </div>

              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">Select Icon</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--glass-border-subtle)',
                    borderRadius: '12px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                  }}
                >
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      type="button"
                      key={iconName}
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: formData.icon === iconName ? '2px solid var(--primary)' : '1px solid var(--glass-border-subtle)',
                        backgroundColor: formData.icon === iconName ? 'var(--primary-light)' : 'transparent',
                        color: formData.icon === iconName ? 'var(--primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                      title={iconName}
                    >
                      {getCategoryIcon(iconName, 20)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Active category</span>
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
