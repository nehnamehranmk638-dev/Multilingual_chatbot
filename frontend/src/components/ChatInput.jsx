import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../api';

export default function ChatInput({ onSendMessage, disabled, selectedLanguage }) {
  const [input, setInput] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Automatically keep focus on input when bot finishes replying (disabled becomes false)
  useEffect(() => {
    if (!disabled && !isTranscribing) {
      inputRef.current?.focus();
    }
  }, [disabled, isTranscribing]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ----------------------------------------------------
  // Audio Recording & Speech API
  // ----------------------------------------------------
  const startRecording = async () => {
    // Check for secure context first (browsers block getUserMedia on plain HTTP LAN IPs)
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      alert('Microphone access requires a secure connection (HTTPS or localhost). Please access the chatbot via HTTPS (e.g. https://<IP>:5173).');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Microphone recording is not supported on this browser or requires a secure HTTPS connection.');
      return;
    }

    setIsPreparing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      audioChunksRef.current = [];

      // Determine best supported mime type
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ].find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || '';

      const recorderOptions = {
        audioBitsPerSecond: 128000,
        ...(mimeType ? { mimeType } : {})
      };

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordedBlobType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedBlobType });
        await sendAudioForTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording with 250ms slice interval to flush buffers regularly
      mediaRecorder.start(250);
      setIsPreparing(false);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setIsPreparing(false);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isPreparing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendAudioForTranscription = async (blob) => {
    setIsTranscribing(true);
    try {
      const data = await transcribeAudio(blob, selectedLanguage);
      if (data && data.text) {
        setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
      }
    } catch (err) {
      console.error('Speech transcription failed:', err);
      alert('Speech transcription failed. Please try speaking again.');
    } finally {

      setIsTranscribing(false);
    }
  };

  return (
    <div className="chat-input-area">
      <form onSubmit={handleSubmit} className="input-box-wrapper">
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled || isTranscribing || isPreparing}
          className={`input-btn btn-mic ${isPreparing ? 'preparing' : isRecording ? 'recording' : ''}`}
          title={
            isPreparing
              ? 'Starting microphone...'
              : isRecording
              ? 'Recording: speak now! (Click square to finish)'
              : 'Voice Input (Groq Whisper)'
          }
          aria-label="Voice search"
        >
          {isTranscribing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPreparing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isRecording ? (
            <Square size={16} fill="currentColor" />
          ) : (
            <Mic size={18} />
          )}
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isPreparing
              ? 'Accessing microphone... Get ready to speak'
              : isRecording
              ? 'Listening... Speak now! Click square to stop'
              : isTranscribing
              ? 'Transcribing your voice with Groq Whisper...'
              : 'Ask anything in English, Malayalam, Hindi, Tamil, Telugu, Kannada...'
          }
          disabled={disabled || isTranscribing || isPreparing}
          className="chat-input"
          autoFocus
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || disabled || isTranscribing}
          className="input-btn btn-send"
          title="Send message"
          aria-label="Send"
        >
          {disabled ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
