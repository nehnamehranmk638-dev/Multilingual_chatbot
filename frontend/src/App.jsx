import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import QuickPrompts from './components/QuickPrompts';
<<<<<<< HEAD
import CampusMapModal from './components/CampusMapModal';
import { Globe2, Sparkles, MapPin, Compass } from 'lucide-react';
=======
import FeedbackDialog from './components/FeedbackDialog';
>>>>>>> 085bf62 (admin, feedback)

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));
  
=======

  // Each chat gets its own session ID
  const [sessionId, setSessionId] = useState(
    () =>
      'session-' +
      Math.random().toString(36).substring(2, 9)
  );

  const [showGeneralFeedback, setShowGeneralFeedback] =
    useState(false);

>>>>>>> 085bf62 (admin, feedback)
  const messagesEndRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * USER MODE
   * ---------------------------------------------------------
   *
   * The application already asks the user to select
   * Student Mode or Parent Mode when entering the chatbot.
   *
   * We do NOT ask for it again inside the feedback form.
   *
   * This attempts to read the existing mode from localStorage.
   *
   * If your mode is stored under a different key, change
   * "userMode" below to the key used by your existing app.
   */

  const [userMode, setUserMode] = useState(() => {
    return (
      localStorage.getItem('userMode') ||
      localStorage.getItem('user_mode') ||
      ''
    );
  });


  /*
   * ---------------------------------------------------------
   * Keep userMode updated if another component changes it
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const updateUserMode = () => {
      const mode =
        localStorage.getItem('userMode') ||
        localStorage.getItem('user_mode') ||
        '';

      setUserMode(mode);
    };

    updateUserMode();

    window.addEventListener(
      'storage',
      updateUserMode
    );

    return () => {
      window.removeEventListener(
        'storage',
        updateUserMode
      );
    };
  }, []);


  /*
   * ---------------------------------------------------------
   * Scroll to latest message
   * ---------------------------------------------------------
   */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);


  /*
   * ---------------------------------------------------------
   * Start a new chat session
   * ---------------------------------------------------------
   */

  const handleReset = () => {
    if (
      messages.length > 0 &&
      !window.confirm(
        'Start a new chat session?'
      )
    ) {
      return;
    }

    setMessages([]);

    setSessionId(
      'session-' +
        Math.random()
          .toString(36)
          .substring(2, 9)
    );
  };


  /*
   * ---------------------------------------------------------
   * Send chat message
   * ---------------------------------------------------------
   */

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) {
      return;
    }

    const userTime =
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });


    /*
     * Add user's message immediately
     */

    const userMessage = {
      sender: 'user',
      content: text,
      time: userTime,
    };


    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);


    try {

      /*
       * Send message to Django backend
       */

      const response = await fetch(
        `${API_BASE_URL}/chat/`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            message: text,
            session_id: sessionId,
          }),
        }
      );


      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }


      const data =
        await response.json();


      const botTime =
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });


      /*
       * -----------------------------------------------------
       * IMPORTANT FOR M6 FEEDBACK
       *
       * Django now returns:
       *
       * {
       *   answer: "...",
       *   sources: [...],
       *   message_id: "..."
       * }
       *
       * We store message_id with the bot message.
       * FeedbackButtons / ChatMessage can later use
       * this ID to identify exactly which answer was rated.
       * -----------------------------------------------------
       */

      const botMessage = {
        sender: 'bot',

        content: data.answer,

        sources: data.sources || [],

        type:
          data.type || 'general',

        language:
          data.language || 'en',

        language_name:
          data.language_name || '',

        translated_query:
          data.translated_query || '',

        /*
         * THIS IS REQUIRED FOR RESPONSE FEEDBACK
         */
        message_id:
          data.message_id || null,

        /*
         * Keep session ID with the message
         */
        session_id: sessionId,

        /*
         * Automatically associate the
         * Student / Parent mode
         */
        user_mode: userMode || '',

        time: botTime,
      };


      /*
       * Add bot response to messages
       */

      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);

    } catch (err) {

      console.error(
        'Chat error:',
        err
      );


      const botTime =
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });


      /*
       * Error message
       *
       * No message_id is attached because this
       * is not an actual bot response stored
       * by the backend.
       */

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',

          content:
            '⚠️ Unable to connect to the backend server. Please make sure the Django server is running on http://127.0.0.1:8000.',

          message_id: null,

          session_id: sessionId,

          user_mode: userMode || '',

          time: botTime,
        },
      ]);

    } finally {

      setLoading(false);
    }
  };


  /*
   * ---------------------------------------------------------
   * General feedback submission
   * ---------------------------------------------------------
   *
   * FeedbackDialog itself performs the API request.
   *
   * Once it succeeds, this callback closes the modal.
   * ---------------------------------------------------------
   */

  const handleGeneralFeedbackSubmit = async (
    data
  ) => {

    console.log(
      'General feedback submitted:',
      data
    );

    setShowGeneralFeedback(false);
  };


  /*
   * ---------------------------------------------------------
   * Determine current language
   * ---------------------------------------------------------
   *
   * Used for general feedback.
   *
   * We look for the most recent bot message that
   * contains a language.
   * ---------------------------------------------------------
   */

  const currentLanguage =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender === 'bot' &&
          message.language
      )?.language || 'en';


  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="app-container">
<<<<<<< HEAD
      {/* Header */}
      <Header 
        onReset={handleReset} 
        onOpenMap={() => setIsMapOpen(true)}
        messageCount={messages.length} 
      />
=======
>>>>>>> 085bf62 (admin, feedback)

      {/* =====================================================
          HEADER
          ===================================================== */}

      <Header
        onReset={handleReset}

        messageCount={
          messages.length
        }

        onFeedback={() =>
          setShowGeneralFeedback(true)
        }
      />


      {/* =====================================================
          CHAT MESSAGES
          ===================================================== */}

      <div className="chat-messages-container">

        {messages.length === 0 ? (

          /*
           * -------------------------------------------------
           * WELCOME SCREEN
           * -------------------------------------------------
           */

          <div className="welcome-card">

            <div className="welcome-icon">
              🎓
            </div>


            <h2 className="welcome-title">
              Welcome to IIIT Kottayam
            </h2>


            <p className="welcome-desc">
<<<<<<< HEAD
              Your AI-powered Multilingual Admission &amp; Campus Guide. Ask questions regarding B.Tech admissions, seat eligibility, fee structure, classroom locations (e.g. <code>BC304</code>, <code>AA101</code>), or campus spots like Scoops, Milma &amp; Mess.
            </p>

            {/* Quick Interactive Map Launcher Banner */}
            <div 
              className="welcome-map-banner"
              onClick={() => setIsMapOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Compass size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Explore IIITK Campus Map &amp; Room Navigator
                    <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/40">NEW</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Find Admin Block, Old Academic (AA/AC), New Academic (BA/BC), Scoops, Milma &amp; Mess
                  </p>
                </div>
              </div>
              <button className="open-map-pill">
                Open Map 📍
              </button>
            </div>

            <div className="language-tags-grid mt-4">
              <span className="lang-badge">🌐 English</span>
              <span className="lang-badge">🇮🇳 മലയാളം (Malayalam)</span>
              <span className="lang-badge">🇮🇳 हिन्दी (Hindi)</span>
              <span className="lang-badge">🇮🇳 தமிழ் (Tamil)</span>
              <span className="lang-badge">🇮🇳 తెలుగు (Telugu)</span>
              <span className="lang-badge">🇮🇳 ಕನ್ನಡ (Kannada)</span>
=======
              Your AI-powered Multilingual
              Admission Assistant. Ask
              questions regarding B.Tech
              admissions, seat eligibility,
              fee structure, hostel life,
              or JoSAA counselling in your
              native language.
            </p>


            <div className="language-tags-grid">

              <span className="lang-badge">
                🌐 English
              </span>

              <span className="lang-badge">
                🇮🇳 മലയാളം (Malayalam)
              </span>

              <span className="lang-badge">
                🇮🇳 हिन्दी (Hindi)
              </span>

              <span className="lang-badge">
                🇮🇳 தமிழ் (Tamil)
              </span>

              <span className="lang-badge">
                🇮🇳 తెలుగు (Telugu)
              </span>

              <span className="lang-badge">
                🇮🇳 ಕನ್ನಡ (Kannada)
              </span>

>>>>>>> 085bf62 (admin, feedback)
            </div>

          </div>

        ) : (

          /*
           * -------------------------------------------------
           * CHAT MESSAGE LIST
           * -------------------------------------------------
           */

          messages.map(
            (msg, index) => (

              <ChatMessage
                key={
                  msg.message_id ||
                  `${msg.sender}-${index}`
                }

                message={msg}

                sessionId={
                  sessionId
                }

                /*
                 * Pass mode to ChatMessage
                 * so response feedback can
                 * automatically include it.
                 */
                userMode={
                  userMode
                }

              />

            )
          )

        )}


        {/* =================================================
            LOADING INDICATOR
            ================================================= */}

        {loading && (

          <div className="message-row bot">

            <div className="msg-avatar">
              🤖
            </div>


            <div className="message-bubble-wrapper">

              <div className="message-bubble typing-indicator">

                <span></span>
                <span></span>
                <span></span>

              </div>

            </div>

          </div>

        )}


        {/* Scroll target */}

        <div ref={messagesEndRef} />

      </div>


<<<<<<< HEAD
      {/* Chat Input & Voice Recorder */}
      <ChatInput onSendMessage={handleSendMessage} disabled={loading} />

      {/* Campus Map & Room Navigator Modal */}
      <CampusMapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)}
        onAskAboutPlace={(query) => {
          handleSendMessage(query);
        }}
      />
=======
      {/* =====================================================
          SUGGESTED QUICK PROMPTS
          ===================================================== */}

      <QuickPrompts
        onSelectPrompt={
          handleSendMessage
        }
      />


      {/* =====================================================
          CHAT INPUT + VOICE
          ===================================================== */}

      <ChatInput
        onSendMessage={
          handleSendMessage
        }

        disabled={loading}
      />


      {/* =====================================================
          GENERAL FEEDBACK MODAL
          ===================================================== */}

      {showGeneralFeedback && (

        <FeedbackDialog

          type="general"

          sessionId={
            sessionId
          }

          messageId={null}

          language={
            currentLanguage
          }

          /*
           * Student / Parent mode is
           * automatically attached.
           *
           * It is NOT shown to the user.
           */
          userMode={
            userMode
          }

          onClose={() =>
            setShowGeneralFeedback(
              false
            )
          }

          onSubmit={
            handleGeneralFeedbackSubmit
          }

        />

      )}

>>>>>>> 085bf62 (admin, feedback)
    </div>
  );
}