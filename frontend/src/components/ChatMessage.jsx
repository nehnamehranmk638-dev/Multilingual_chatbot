import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper: Check if response indicates information is not available in knowledge base
const isUnavailableAnswer = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('not available in the') ||
    lower.includes('not available in provided') ||
    lower.includes('not available in the provided') ||
    lower.includes('not available in the iiit kottayam') ||
    lower.includes("couldn't find a verified answer") ||
    lower.includes("could not find a verified answer") ||
    lower.includes("could not be verified from the") ||
    lower.includes("does not contain information") ||
    lower.includes("does not contain any information") ||
    (lower.includes('information') && lower.includes('not available')) ||
    (lower.includes('knowledge base') && lower.includes('not available')) ||
    (lower.includes('knowledge base') && lower.includes('lacks'))
  );
};

export default function ChatMessage({ message, sessionId }) {
  const isBot = message.sender === 'bot';
  const [speaking, setSpeaking] = useState(false);

  // ── Response-level feedback state ──────────────────────────
  const [feedbackGiven,    setFeedbackGiven]    = useState(null);   // 'helpful' | 'not_helpful'
  const [showDialog,       setShowDialog]       = useState(null);   // 'response_helpful' | 'response_not_helpful'
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);

    // Map language code to BCP-47 language tag
    const langMap = {
      hi: 'hi-IN',
      ml: 'ml-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      en: 'en-IN'
    };

    if (message.language && langMap[message.language]) {
      utterance.lang = langMap[message.language];
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend  = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ── Thumbs click handlers ────────────────────────────────────
  const handleThumbUp = () => {
    if (feedbackGiven) return;
    setShowDialog('response_helpful');
  };

  const handleThumbDown = () => {
    if (feedbackGiven) return;
    setShowDialog('response_not_helpful');
  };

  // ── Dialog submit ────────────────────────────────────────────
  const handleFeedbackSubmit = (data) => {
    setFeedbackGiven(data.rating);   // 'helpful' | 'not_helpful'
    setFeedbackSubmitted(true);
    setShowDialog(null);
  };

  const handleDialogClose = () => {
    setShowDialog(null);
  };

  // ────────────────────────────────────────────────────────────

  return (
    <div className={`message-row ${isBot ? 'bot' : 'user'}`}>
      <div className="msg-avatar">
        {isBot ? '🤖' : '👤'}
      </div>

      <div className="message-bubble-wrapper">
        <div className="message-bubble">
          {message.content}

          {/* If the query was translated from Indic language to English */}
          {message.translated_query && message.translated_query !== message.content && (
            <div className="translated-preview">
              <strong>Query in English:</strong> {message.translated_query}
            </div>
          )}

          {/* Sources citations (only display when an actual answer was retrieved) */}
          {message.sources && message.sources.length > 0 && !isUnavailableAnswer(message.content) && (
            <div className="sources-box">
              <BookOpen size={13} color="#38bdf8" />
              {message.sources.map((src, idx) => (
                <span key={idx} className="source-pill">
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Metadata & Controls */}
        <div className="message-meta">
          <span>{message.time || 'Just now'}</span>

          {message.language_name && (
            <span className="badge-tag badge-lang">
              {message.language_name}
            </span>
          )}

          {message.type && message.type !== 'general' && (
            <span className="badge-tag badge-intent">
              {message.type === 'eligibility_check' ? 'Eligibility' : message.type}
            </span>
          )}

          {isBot && (
            <button
              className={`speech-tts-btn ${speaking ? 'speaking' : ''}`}
              onClick={handleSpeak}
              title={speaking ? 'Stop speaking' : 'Read message aloud'}
              aria-label="Text to speech"
            >
              {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}
        </div>

        {/* ── Response Feedback Thumbs (bot only) ── */}
        {isBot && (
          <div className="feedback-thumbs">
            {feedbackSubmitted ? (
              <span className="feedback-thanks">✓ Thanks for your feedback!</span>
            ) : (
              <>
                <button
                  className={`thumb-btn ${feedbackGiven === 'helpful' ? 'selected-helpful' : ''}`}
                  onClick={handleThumbUp}
                  disabled={!!feedbackGiven}
                  title="Helpful"
                  aria-label="Mark as helpful"
                  type="button"
                >
                  <ThumbsUp size={13} /> Helpful
                </button>
                <button
                  className={`thumb-btn ${feedbackGiven === 'not_helpful' ? 'selected-not-helpful' : ''}`}
                  onClick={handleThumbDown}
                  disabled={!!feedbackGiven}
                  title="Not helpful"
                  aria-label="Mark as not helpful"
                  type="button"
                >
                  <ThumbsDown size={13} /> Not helpful
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Feedback Dialog ── */}
      {showDialog && (
        <FeedbackDialog
          type={showDialog}
          sessionId={sessionId}
          messageId={message.message_id || null}
          language={message.language || 'en'}
          onClose={handleDialogClose}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}
