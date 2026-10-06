import React from 'react';
<<<<<<< HEAD
import { RotateCcw, MapPin, Compass } from 'lucide-react';

export default function Header({ onReset, onOpenMap, messageCount }) {
=======
import { RotateCcw, MessageSquare } from 'lucide-react';

export default function Header({ onReset, messageCount, onFeedback }) {
>>>>>>> 085bf62 (admin, feedback)
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
          <p>Official Multilingual Admission & Campus Guide</p>
        </div>
      </div>

      <div className="header-actions">
<<<<<<< HEAD
        {/* Campus Map & Room Navigator Button */}
        <button 
          className="campus-map-nav-btn"
          onClick={onOpenMap}
          title="Open IIITK Campus Map & Room Locator"
          aria-label="Campus Map"
        >
          <Compass size={16} className="text-blue-400 animate-spin-slow" />
          <span>Campus Map &amp; Rooms</span>
        </button>

        {/* Reset Chat Button */}
        <button 
          className="btn-icon" 
          onClick={onReset} 
=======
        {/* General Feedback button */}
        <button
          className="btn-icon"
          onClick={onFeedback}
          title="Give Feedback"
          aria-label="Give feedback"
        >
          <MessageSquare size={17} />
        </button>

        {/* New chat / reset button */}
        <button
          className="btn-icon"
          onClick={onReset}
>>>>>>> 085bf62 (admin, feedback)
          title="Start New Conversation"
          aria-label="New chat"
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </header>
  );
}
