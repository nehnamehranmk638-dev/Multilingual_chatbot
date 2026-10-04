import React from 'react';
import { RotateCcw, Sparkles, MessageSquare, Globe } from 'lucide-react';

export default function Header({ onReset, messageCount }) {
  return (
    <header className="chat-header">
      <div className="header-brand">
        <div className="header-logo-badge">
          🎓
        </div>
        <div className="header-titles">
          <h1>
            IIIT Kottayam
            <span className="status-badge">
              <span className="status-dot"></span>
              AI Online
            </span>
          </h1>
          <p>Official Multilingual Admission Assistant</p>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="btn-icon" 
          onClick={onReset} 
          title="Start New Conversation"
          aria-label="New chat"
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </header>
  );
}
