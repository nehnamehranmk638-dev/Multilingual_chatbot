import React from 'react';
import { MessageSquare, MapPin, MessageSquarePlus, LogOut } from 'lucide-react';

export default function HubDashboard({
  currentUser,
  selectedLanguage,
  onOpenChat,
  onOpenMap,
  onOpenFeedback,
  onRequestLogout,
  onChangeLanguage,
}) {
  const isStudent = currentUser?.role === 'student';
  const isParent = currentUser?.role === 'parent';
  const roleLabel = isStudent ? 'Student' : isParent ? 'Parent' : (currentUser?.role || 'Guest');

  const langNames = {
    en: 'English',
    ml: 'മലയാളം (Malayalam)',
    hi: 'हिन्दी (Hindi)',
    ta: 'தமிழ் (Tamil)',
    te: 'తెలుగు (Telugu)',
    kn: 'ಕನ್ನಡ (Kannada)',
  };

  const currentLangLabel = langNames[selectedLanguage] || 'English';

  return (
    <div className="hub-container">
      {/* Top Bar */}
      <header className="hub-header">
        <div className="header-brand">
          <div className="header-logo-badge">🎓</div>
          <div className="header-titles">
            <h1>
              IIIT Kottayam
              <span className={`role-badge ${isStudent ? 'role-student' : 'role-parent'}`}>
                {roleLabel} {currentUser?.name ? `• ${currentUser.name}` : ''}
              </span>
            </h1>
          </div>
        </div>

        <div className="header-actions">
          {onChangeLanguage && (
            <button
              className="hub-lang-switch-btn"
              onClick={onChangeLanguage}
              title="Change preferred language"
            >
              🌐 {currentLangLabel}
            </button>
          )}

          <button
            className="btn-icon btn-logout"
            onClick={onRequestLogout}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="hub-content">
        <div className="hub-welcome-banner">
          <h2>Welcome{currentUser?.name ? `, ${currentUser.name}` : ''}</h2>
          <p>Please select an option below to proceed:</p>
        </div>

        <div className="hub-cards-grid">
          {/* Card 1: Chatbot */}
          <div
            className="hub-feature-card"
            onClick={onOpenChat}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenChat()}
          >
            <div className="hub-card-icon-box chat-icon">
              <MessageSquare size={32} />
            </div>
            <div className="hub-card-info">
              <h3>Admission Chatbot</h3>
              <p>Ask admission, fee structure, eligibility, and course inquiries in your preferred language.</p>
            </div>
            <span className="hub-card-action">Launch Chat →</span>
          </div>

          {/* Card 2: Campus Map */}
          <div
            className="hub-feature-card"
            onClick={onOpenMap}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenMap()}
          >
            <div className="hub-card-icon-box map-icon">
              <MapPin size={32} />
            </div>
            <div className="hub-card-info">
              <h3>Campus Map &amp; Room Finder</h3>
              <p>Explore academic blocks, classroom numbers (BC304, AA101), mess, and faculty cabin locations.</p>
            </div>
            <span className="hub-card-action">Explore Map →</span>
          </div>

          {/* Card 3: Give Feedback */}
          <div
            className="hub-feature-card"
            onClick={onOpenFeedback}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenFeedback()}
          >
            <div className="hub-card-icon-box feedback-icon">
              <MessageSquarePlus size={32} />
            </div>
            <div className="hub-card-info">
              <h3>Give Feedback</h3>
              <p>Share your suggestions, rate the assistant, or report any discrepancies to the admission team.</p>
            </div>
            <span className="hub-card-action">Share Thoughts →</span>
          </div>
        </div>
      </main>
    </div>
  );
}
