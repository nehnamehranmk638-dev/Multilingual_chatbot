const API_BASE_URL = (typeof window !== 'undefined' && window.location.protocol === 'https:')
  ? '/api'
  : 'http://127.0.0.1:8000/api';

/**
 * Get or initialize persistent client user_id in localStorage.
 */
export function getPersistentUserId() {
  let uid = localStorage.getItem('client_user_id');
  if (!uid) {
    uid = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('client_user_id', uid);
  }
  return uid;
}

/**
 * Standard headers helper including auth token and persistent client user_id.
 */
function getHeaders(customHeaders = {}) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId') || getPersistentUserId();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (userId) {
    headers['X-User-ID'] = userId;
  }
  return headers;
}

/**
 * Fetch list of distinct chat sessions for this user.
 */
export async function fetchSessions() {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId') || getPersistentUserId();
  const url = token ? `${API_BASE_URL}/sessions/` : `${API_BASE_URL}/sessions/?user_id=${encodeURIComponent(userId)}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch full message history for a specific session.
 */
export async function fetchSessionHistory(sessionId) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId') || getPersistentUserId();
  const url = token ? `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/` : `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/?user_id=${encodeURIComponent(userId)}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch session history: ${response.status}`);
  }
  return await response.json();
}

/**
 * Send a chat message.
 */
export async function sendChatMessage(message, sessionId) {
  const userId = getPersistentUserId();
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `Server returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return await response.json();
}

/**
 * Delete a specific session by sessionId.
 */
export async function deleteSession(sessionId) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId') || getPersistentUserId();
  const url = token
    ? `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/`
    : `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/?user_id=${encodeURIComponent(userId)}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `Failed to delete session: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return await response.json();
}

/**
 * Transcribe recorded audio with optional language code.
 */
export async function transcribeAudio(audioBlob, language = null) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'speech.wav');
  if (language) {
    formData.append('language', language);
  }

  const token = localStorage.getItem('authToken');
  const speechUrl = `${API_BASE_URL}/transcribe/`;
  const response = await fetch(speechUrl, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Speech transcription failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Global audio player reference for synthesizeSpeech.
 */
let currentAudio = null;

export function stopSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
}

/**
 * Synthesize speech for text and language code using backend gTTS.
 * Sends both 'lang' and 'language' keys to eliminate naming mismatches.
 */
export async function synthesizeSpeech(text, lang = 'en') {
  if (!text || !text.trim()) return null;

  stopSpeech();

  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/synthesize/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      text,
      lang: lang || 'en',
      language: lang || 'en',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to synthesize speech: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(audioUrl);
  await currentAudio.play();
  return currentAudio;
}

