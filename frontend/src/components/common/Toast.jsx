import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isInfo = type === 'info';

  const bgColor = isSuccess
    ? 'rgba(16, 185, 129, 0.16)'
    : isInfo
    ? 'rgba(59, 130, 246, 0.16)'
    : 'rgba(239, 68, 68, 0.16)';

  const borderColor = isSuccess
    ? 'rgba(16, 185, 129, 0.35)'
    : isInfo
    ? 'rgba(59, 130, 246, 0.35)'
    : 'rgba(239, 68, 68, 0.35)';

  const textColor = isSuccess
    ? '#10b981'
    : isInfo
    ? '#3b82f6'
    : '#ef4444';

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100% - 48px)',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: 'var(--text-main)',
        animation: 'slideInRight 0.25s ease-out',
      }}
      role="alert"
    >
      <div style={{ color: textColor, marginTop: '2px', flexShrink: 0 }}>
        {isSuccess ? <CheckCircle2 size={20} /> : isInfo ? <Info size={20} /> : <AlertCircle size={20} />}
      </div>
      <div style={{ flex: 1, fontSize: '13.5px', lineHeight: 1.45, fontWeight: 500 }}>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
