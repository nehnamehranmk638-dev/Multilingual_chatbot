import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot';
  const [speaking, setSpeaking] = useState(false);

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

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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

          {/* Sources citations */}
          {message.sources && message.sources.length > 0 && (
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
      </div>
    </div>
  );
}
