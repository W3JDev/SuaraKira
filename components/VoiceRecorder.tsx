import React, { useState, useRef, useCallback } from 'react';
import { MicIcon, LoaderIcon, KeyboardIcon, CameraIcon } from './Icons';
import { AppState } from '../types';

interface InputBarProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  onImageSubmit: (file: File) => void;
  onTextSubmit: (text: string) => void;
  appState: AppState;
  customStatus?: string;
  t: any;
}

const playFeedbackSound = (type: 'start' | 'stop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    // Create context on the fly to ensure it works on mobile interaction
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;
    
    if (type === 'start') {
      // Ascending "On" Tone (A4 -> A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t); 
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.15); 
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.start(t);
      osc.stop(t + 0.35);
    } else {
      // Descending "Off" Tone (A5 -> A4)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t); 
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.15); 

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.start(t);
      osc.stop(t + 0.35);
    }
  } catch (e) {
    console.error("Audio feedback failed", e);
  }
};

const InputBar: React.FC<InputBarProps> = ({ onAudioSubmit, onImageSubmit, onTextSubmit, appState, customStatus, t }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false); // Visual feedback between touch and stream start
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Single ref for the combined action
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      if (appState === AppState.PROCESSING || appState === AppState.ANALYZING) return;

      // Immediate feedback
      setIsPreparing(true);
      playFeedbackSound('start');
      if (navigator.vibrate) navigator.vibrate(50);

      // Request high quality audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        } 
      });

      // Explicitly set high-quality options for accurate AI transcription
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 128000 };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4", audioBitsPerSecond: 128000 };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Use the actual mime type resolved by the recorder
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onAudioSubmit(blob);
        stream.getTracks().forEach(track => track.stop());
        playFeedbackSound('stop');
      };

      mediaRecorder.start();
      setIsPreparing(false);
      setIsRecording(true);
      
    } catch (err) {
      console.error("Mic Error:", err);
      setIsPreparing(false);
      alert("Microphone access required. Please check your browser permissions.");
    }
  }, [appState, onAudioSubmit]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPreparing(false);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSubmit(e.target.files[0]);
    }
    // Reset value to allow selecting the same file again
    e.target.value = '';
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onTextSubmit(textInput);
      setTextInput("");
      setIsTextMode(false);
    }
  };

  const isDisabled = appState === AppState.PROCESSING || appState === AppState.ANALYZING;

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
       // Allow touch interaction
    }
    startRecording();
  };
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    stopRecording();
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Text Modal */}
      {isTextMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleTextSubmit} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-4 shadow-2xl space-y-4 animate-in slide-in-from-bottom border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-center">
               <h3 className="font-semibold text-slate-800 dark:text-white">{t.manualEntry}</h3>
               <button type="button" onClick={() => setIsTextMode(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600">{t.cancel}</button>
             </div>
             <textarea 
               value={textInput}
               onChange={(e) => setTextInput(e.target.value)}
               placeholder={t.placeholder}
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
               rows={3}
               autoFocus
             />
             <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform">
               {t.addTransaction}
             </button>
          </form>
        </div>
      )}

      {/* Floating Input Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-40">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-full p-2 flex items-center justify-between relative transition-colors">
          
          {/* Status Badge: Processing */}
          {isDisabled && (
             <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
               <div className="bg-emerald-900 dark:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                 <LoaderIcon className="w-3 h-3 animate-spin" />
                 {customStatus || (appState === AppState.ANALYZING ? t.aiThinking : t.processing)}
               </div>
             </div>
          )}

          {/* Status Badge: Recording */}
          {(isRecording || isPreparing) && (
             <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <div className={`bg-red-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg font-bold transition-all duration-300 flex items-center gap-2 ${isPreparing ? 'opacity-80 scale-90' : 'opacity-100 scale-100'}`}>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    {isPreparing ? "Starting..." : t.listening}
                  </div>
                </div>
             </div>
          )}

          {/* 1. Left: Keyboard */}
          <button 
            disabled={isDisabled || isRecording}
            onClick={() => setIsTextMode(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <KeyboardIcon className="w-6 h-6" />
          </button>

          {/* 2. Center: Mic (Big) */}
          <div className="relative">
            {/* Ripple Effect Ring */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ripple"></div>
            )}
             {/* Preparing Ring */}
            {isPreparing && (
              <div className="absolute inset-0 rounded-full border-2 border-red-400 border-t-transparent animate-spin"></div>
            )}
            
            <button
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={stopRecording}
              disabled={isDisabled}
              className={`
                relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 -mt-8 border-4 border-slate-50 dark:border-slate-800
                ${(isRecording || isPreparing)
                  ? 'bg-red-500 scale-110 shadow-red-500/50' 
                  : isDisabled 
                    ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                }
              `}
            >
              <MicIcon className={`w-8 h-8 text-white ${(isRecording || isPreparing) ? 'scale-110' : ''}`} />
            </button>
          </div>

          {/* 3. Right: Camera/Scan (Triggers Native Picker) */}
          <button 
            disabled={isDisabled || isRecording}
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <CameraIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default InputBar;