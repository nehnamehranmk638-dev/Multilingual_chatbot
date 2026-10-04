import React, { useState, useRef } from 'react';
import { Send, Mic, Square, Loader2 } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioForTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
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
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendAudioForTranscription = async (blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'speech.wav');

      const response = await fetch('http://127.0.0.1:8000/api/speech/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      if (data.text) {
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
          disabled={disabled || isTranscribing}
          className={`input-btn btn-mic ${isRecording ? 'recording' : ''}`}
          title={isRecording ? 'Stop Recording' : 'Voice Input (Groq Whisper)'}
          aria-label="Voice search"
        >
          {isTranscribing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isRecording ? (
            <Square size={16} fill="currentColor" />
          ) : (
            <Mic size={18} />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? 'Listening... Click square to stop'
              : isTranscribing
              ? 'Transcribing your voice with Groq Whisper...'
              : 'Ask anything in English, Malayalam, Hindi, Tamil, Telugu, Kannada...'
          }
          disabled={disabled || isTranscribing}
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
