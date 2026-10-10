import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import QuickPrompts from './components/QuickPrompts';
import CampusMapModal from './components/CampusMapModal';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import FeedbackDialog from './components/FeedbackDialog';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import HubDashboard from './components/HubDashboard';
import { Globe2, Sparkles, MapPin, Compass } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showGeneralFeedback, setShowGeneralFeedback] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('chatLanguage') || 'en');
  const [sessionId, setSessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));

  // ----------------------------------------------------------
  // URL PATH ROUTING & AUTH STATE
  // ----------------------------------------------------------
  const getRouteFromPath = (pathname) => {
    const p = (pathname || window.location.pathname).toLowerCase();
    if (p.startsWith('/admin/login')) return 'admin-login';
    if (p.startsWith('/admin')) return 'admin-dashboard';
    if (p.startsWith('/signup')) return 'signup';
    if (p.startsWith('/login')) return 'login';
    if (p.startsWith('/hub')) return 'hub';
    if (p.startsWith('/chat')) return 'chat';
    return localStorage.getItem('authToken') ? 'hub' : 'login';
  };

  const [currentRoute, setCurrentRoute] = useState(() => getRouteFromPath(window.location.pathname));

  // Track sub-view for authenticated portal: 'hub' | 'chat'
  const [activeView, setActiveView] = useState(() => {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.startsWith('/chat')) return 'chat';
    return 'hub';
  });

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(getRouteFromPath(path));
  };

  useEffect(() => {
    const onPop = () => {
      setCurrentRoute(getRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return {
      name:  localStorage.getItem('userName')  || '',
      email: localStorage.getItem('userEmail') || '',
      role:  localStorage.getItem('userRole')  || '',
    };
  });

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

  // ----------------------------------------------------------
  // AUTH & NAVIGATION HANDLERS
  // ----------------------------------------------------------

  const handleLoginSuccess = (user, redirect) => {
    if (redirect === 'signup') { navigate('/signup'); return; }
    if (redirect === 'login')  { navigate('/login');  return; }
    if (redirect === 'admin-login') { navigate('/admin/login'); return; }
    setCurrentUser(user);
    setUserMode(user?.role || '');
    setActiveView('hub');
    navigate('/hub');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch('http://127.0.0.1:8000/api/auth/logout/', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore network errors on logout */ }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMode');
    localStorage.removeItem('hasSelectedLang');
    setCurrentUser(null);
    setUserMode('');
    setMessages([]);
    setActiveView('hub');
    navigate('/login');
  };

  // ----------------------------------------------------------
  // ADMIN ROUTES
  // ----------------------------------------------------------
  if (currentRoute === 'admin-dashboard') {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      return (
        <AdminLoginPage
          onAdminLoginSuccess={() => navigate('/admin')}
          onNavigateToApp={navigate}
        />
      );
    }
    return <AdminDashboard onLogout={() => navigate('/admin/login')} />;
  }

  if (currentRoute === 'admin-login') {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      return <AdminDashboard onLogout={() => navigate('/admin/login')} />;
    }
    return (
      <AdminLoginPage
        onAdminLoginSuccess={() => navigate('/admin')}
        onNavigateToApp={navigate}
      />
    );
  }

  // ----------------------------------------------------------
  // STUDENT / PARENT ROUTES
  // ----------------------------------------------------------
  if (currentRoute === 'signup') {
    return <SignupPage onSignupSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (currentRoute === 'login' || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

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
            ...(localStorage.getItem('authToken')
              ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
              : {}),
          },

          body: JSON.stringify({
            message: text,
            session_id: sessionId,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        throw new Error('Authentication required. Please log in.');
      }

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

  // If in Hub view, show Hub Dashboard
  if (activeView === 'hub') {
    return (
      <div className="app-container">
        <HubDashboard
          currentUser={currentUser}
          selectedLanguage={selectedLanguage}
          onOpenChat={() => {
            setActiveView('chat');
            navigate('/chat');
          }}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenFeedback={() => setShowGeneralFeedback(true)}
          onRequestLogout={() => setShowLogoutModal(true)}
        />

        {/* Campus Map & Room Navigator Modal */}
        <CampusMapModal 
          isOpen={isMapOpen} 
          onClose={() => setIsMapOpen(false)}
          onAskAboutPlace={(query) => {
            setIsMapOpen(false);
            setActiveView('chat');
            navigate('/chat');
            handleSendMessage(query);
          }}
        />

        {/* General Feedback Modal */}
        {showGeneralFeedback && (
          <FeedbackDialog
            type="general"
            sessionId={sessionId}
            messageId={null}
            language={selectedLanguage || currentLanguage}
            userMode={userMode}
            onClose={() => setShowGeneralFeedback(false)}
            onSubmit={handleGeneralFeedbackSubmit}
          />
        )}

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
          title="Confirm Logout"
          message="Are you sure you want to log out?"
        />
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* =====================================================
          HEADER
          ===================================================== */}
      <Header
        onReset={handleReset}
        onOpenMap={() => setIsMapOpen(true)}
        messageCount={messages.length}
        onFeedback={() => setShowGeneralFeedback(true)}
        currentUser={currentUser}
        onLogout={() => setShowLogoutModal(true)}
        onNavigateToHub={() => {
          setActiveView('hub');
          navigate('/hub');
        }}
      />


      {/* =====================================================
          CHAT MESSAGES / WELCOME SCREEN
          ===================================================== */}

      <div className="chat-messages-container">

        {messages.length === 0 ? (

          <div className="welcome-card simplified-welcome-card">

            <div className="welcome-icon">
              🎓
            </div>

            <h2 className="welcome-title">
              Welcome to IIIT Kottayam
            </h2>

            <p className="welcome-desc" style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.92rem' }}>
              How can I help you today? You can ask about B.Tech admissions, eligibility, fees, scholarships, or hostels in English, Malayalam, Hindi, Tamil, Telugu, or Kannada.
            </p>

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

      {/* General Feedback Modal */}
      {showGeneralFeedback && (
        <FeedbackDialog
          type="general"
          sessionId={sessionId}
          messageId={null}
          language={selectedLanguage || currentLanguage}
          userMode={userMode}
          onClose={() => setShowGeneralFeedback(false)}
          onSubmit={handleGeneralFeedbackSubmit}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </div>
  );
}