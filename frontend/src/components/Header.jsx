import React from 'react';
import { RotateCcw, Compass, LogOut, MessageSquare, Home } from 'lucide-react';

export default function Header({
  onReset,
  onOpenMap,
  messageCount,
  onFeedback,
  currentUser,
  onLogout,
  onNavigateToHub,
}) {
  const isStudent = currentUser?.role === 'student';
  const isParent = currentUser?.role === 'parent';
  const roleLabel = isStudent ? '👤 Student' : isParent ? '👨‍👩‍👧 Parent' : (currentUser?.role ? `👤 ${currentUser.role}` : '');

  return (
    <header className="chat-header">
      <div className="header-brand">
        <div className="header-logo-badge">
          🎓
        </div>
        <div className="header-titles">
          <h1>
            IIIT Kottayam
            {roleLabel && (
              <span
                className={`role-badge ${isStudent ? 'role-student' : 'role-parent'}`}
                title={`Logged in as ${currentUser?.name || ''} (${currentUser?.email || ''})`}
              >
                {roleLabel} {currentUser?.name ? `• ${currentUser.name}` : ''}
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="header-actions">
        {/* Home / Hub Screen Button */}
        {onNavigateToHub && (
          <button
            className="btn-icon"
            onClick={onNavigateToHub}
            title="Return to Home Dashboard"
            aria-label="Home"
          >
            <Home size={17} />
          </button>
        )}

        {/* Give Feedback Button */}
        {onFeedback && (
          <button
            className="btn-icon"
            onClick={onFeedback}
            title="Give Feedback"
            aria-label="Give Feedback"
          >
            <MessageSquare size={17} />
          </button>
        )}

        {/* Reset Chat Button */}
        <button 
          className="btn-icon" 
          onClick={onReset} 
          title="Start New Conversation"
          aria-label="New chat"
        >
          <RotateCcw size={17} />
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            className="btn-icon btn-logout"
            onClick={onLogout}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={17} />
          </button>
        )}
      </div>
    </header>
  );
}
