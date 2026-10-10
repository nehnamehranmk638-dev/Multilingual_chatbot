import React from 'react';
import { MessageSquarePlus, MessageSquare, Clock, Trash2 } from 'lucide-react';

/**
 * Format timestamp into relative time string without external library.
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) {
  return (
    <aside className={`chat-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Header / Actions */}
      <div className="sidebar-top">
        <button
          className="btn-new-conversation"
          onClick={onNewSession}
          title="Start a new conversation"
        >
          <MessageSquarePlus size={18} />
          <span>New conversation</span>
        </button>
      </div>

      {/* History Section */}
      <div className="sidebar-section sidebar-history-section">
        <div className="sidebar-section-title">
          <Clock size={14} />
          <span>Chat History</span>
        </div>

        <div className="sidebar-history-list">
          {sessions.length === 0 ? (
            <div className="sidebar-empty-history">
              <span>No past conversations yet</span>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.session_id === currentSessionId;
              return (
                <div
                  key={sess.session_id}
                  role="button"
                  tabIndex={0}
                  className={`history-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectSession(sess.session_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSession(sess.session_id);
                    }
                  }}
                  title={sess.title}
                >
                  <MessageSquare size={16} className="history-icon" />
                  <div className="history-content">
                    <span className="history-title">{sess.title}</span>
                    <span className="history-time">
                      {formatRelativeTime(sess.last_updated)}
                    </span>
                  </div>
                  {onDeleteSession && (
                    <button
                      type="button"
                      className="btn-delete-session"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(sess.session_id);
                      }}
                      title="Delete conversation"
                      aria-label={`Delete conversation ${sess.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

