import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MicIcon, LoaderIcon, KeyboardIcon, CameraIcon } from './Icons';
import { AppState } from '../types';

interface InputBarProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  onImageSubmit: (file: File) => void;
  onTextSubmit: (text: string) => void;
  appState: AppState;
  customStatus?: string;
}

const playBeep = (freq: number, type: OscillatorType = 'sine') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio beep failed", e);
  }
};

const InputBar: React.FC<InputBarProps> = ({ onAudioSubmit, onImageSubmit, onTextSubmit, appState, customStatus }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      if (appState === AppState.PROCESSING || appState === AppState.ANALYZING) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        onAudioSubmit(blob);
        stream.getTracks().forEach(track => track.stop());
        playBeep(440); // Low beep on stop
      };

      mediaRecorder.start();
      setIsRecording(true);
      playBeep(880); // High beep on start
      if (navigator.vibrate) navigator.vibrate(50);

    } catch (err) {
      console.error("Mic Error:", err);
      alert("Microphone access required.");
    }
  }, [appState, onAudioSubmit]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSubmit(e.target.files[0]);
    }
    // Reset value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    e.preventDefault();
    startRecording();
  };
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    stopRecording();
  };

  return (
    <>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        /* Removed capture="environment" to allow Gallery selection on mobile */
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Text Modal */}
      {isTextMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleTextSubmit} className="bg-white w-full max-w-md rounded-2xl p-4 shadow-2xl space-y-4 animate-in slide-in-from-bottom">
             <div className="flex justify-between items-center">
               <h3 className="font-semibold text-slate-800">Manual Entry</h3>
               <button type="button" onClick={() => setIsTextMode(false)} className="text-slate-400">Cancel</button>
             </div>
             <textarea 
               value={textInput}
               onChange={(e) => setTextInput(e.target.value)}
               placeholder="e.g. 'Sold 2 Nasi Lemak for RM 10'"
               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
               rows={3}
               autoFocus
             />
             <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform">
               Add Transaction
             </button>
          </form>
        </div>
      )}

      {/* Floating Input Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6 z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full p-2 flex items-center justify-between relative">
          
          {/* Status Badge */}
          {isDisabled && (
             <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
               <div className="bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                 <LoaderIcon className="w-3 h-3 animate-spin" />
                 {customStatus || (appState === AppState.ANALYZING ? "AI Accountant Thinking..." : "Processing...")}
               </div>
             </div>
          )}

          {/* Helper Text */}
          {isRecording && (
             <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-bold">
                  Listening... Release to finish
                </div>
             </div>
          )}

          {/* Left: Keyboard */}
          <button 
            disabled={isDisabled}
            onClick={() => setIsTextMode(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <KeyboardIcon className="w-6 h-6" />
          </button>

          {/* Center: Mic (Big) */}
          <button
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={stopRecording}
            disabled={isDisabled}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 -mt-8 border-4 border-slate-50
              ${isRecording 
                ? 'bg-red-500 scale-110 shadow-red-500/50' 
                : isDisabled 
                  ? 'bg-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }
            `}
          >
            <MicIcon className={`w-8 h-8 text-white ${isRecording ? 'animate-pulse' : ''}`} />
          </button>

          {/* Right: Camera */}
          <button 
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <CameraIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default InputBar;