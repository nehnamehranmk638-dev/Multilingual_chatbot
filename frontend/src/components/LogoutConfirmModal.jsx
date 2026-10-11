import React from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Logout",
  message = "Are you sure you want to log out of your session?",
  confirmText = "Log Out",
  icon: CustomIcon = null,
}) {
  if (!isOpen) return null;

  const IconComponent = CustomIcon || LogOut;

  return (
    <div
      className="feedback-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="feedback-dialog logout-confirm-dialog">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logout-icon-pill">
            <IconComponent size={20} className="text-red-400" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1a1a1a', fontWeight: 700 }}>
              {title}
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#6b6b6b', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div className="feedback-actions" style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="btn-feedback-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-confirm-logout"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

