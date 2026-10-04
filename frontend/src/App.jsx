import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import QuickPrompts from './components/QuickPrompts';
import { Globe2, Sparkles, BookCheck } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleReset = () => {
    if (messages.length > 0 && !window.confirm('Start a new chat session?')) {
      return;
    }
    setMessages([]);
    setSessionId('session-' + Math.random().toString(36).substring(2, 9));
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMessage = {
      sender: 'user',
      content: text,
      time: userTime
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const botMessage = {
        sender: 'bot',
        content: data.answer,
        sources: data.sources || [],
        type: data.type || 'general',
        language: data.language,
        language_name: data.language_name,
        translated_query: data.translated_query,
        time: botTime,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          content: '⚠️ Unable to connect to the backend server. Please make sure the Django server is running on http://127.0.0.1:8000.',
          time: botTime,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header onReset={handleReset} messageCount={messages.length} />

      {/* Messages area */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="welcome-card">
            <div className="welcome-icon">🎓</div>
            <h2 className="welcome-title">Welcome to IIIT Kottayam</h2>
            <p className="welcome-desc">
              Your AI-powered Multilingual Admission Assistant. Ask questions regarding B.Tech admissions, seat eligibility, fee structure, hostel life, or JoSAA counselling in your native language.
            </p>

            <div className="language-tags-grid">
              <span className="lang-badge">🌐 English</span>
              <span className="lang-badge">🇮🇳 മലയാളം (Malayalam)</span>
              <span className="lang-badge">🇮🇳 हिन्दी (Hindi)</span>
              <span className="lang-badge">🇮🇳 தமிழ் (Tamil)</span>
              <span className="lang-badge">🇮🇳 తెలుగు (Telugu)</span>
              <span className="lang-badge">🇮🇳 ಕನ್ನಡ (Kannada)</span>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="message-row bot">
            <div className="msg-avatar">🤖</div>
            <div className="message-bubble-wrapper">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <QuickPrompts onSelectPrompt={handleSendMessage} />

      {/* Chat Input & Voice Recorder */}
      <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
}
