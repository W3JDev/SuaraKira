import React, { useState, useRef, useCallback } from "react";
import { MicIcon, LoaderIcon, KeyboardIcon, CameraIcon, SparklesIcon } from "./Icons";
import { AppState } from "../types";

interface InputBarProps {
  onImageSubmit: (file: File) => void;
  onManualEntry: () => void;
  onChatOpen: () => void;
  appState: AppState;
  customStatus?: string;
  t: any;
}

const playFeedbackSound = (type: "start" | "stop") => {
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

    if (type === "start") {
      // Ascending "On" Tone (A4 -> A5)
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.start(t);
      osc.stop(t + 0.35);
    } else {
      // Descending "Off" Tone (A5 -> A4)
      osc.type = "sine";
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

const InputBar: React.FC<InputBarProps> = ({
  onImageSubmit,
  onManualEntry,
  onChatOpen,
  appState,
  customStatus,
  t,
}) => {
  // Single ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSubmit(e.target.files[0]);
    }
    // Reset value to allow selecting the same file again
    e.target.value = "";
  };

  const isDisabled = appState === AppState.PROCESSING || appState === AppState.ANALYZING;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

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

          {/* 1. Left: Camera/Scan */}
          <button
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Scan Receipt"
          >
            <CameraIcon className="w-6 h-6" />
          </button>

          {/* 2. Center: AI Chat (Big - Primary Action) */}
          <div className="relative">
            <button
              onClick={onChatOpen}
              disabled={isDisabled}
              className={`
                relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 -mt-8 border-4 border-slate-50 dark:border-slate-800
                ${
                  isDisabled
                    ? "bg-slate-200 dark:bg-slate-700 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                }
              `}
              title="Quick Entry (Chat)"
            >
              <SparklesIcon className="w-8 h-8 text-white" />
            </button>
            {/* Hint text above button */}
            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
              <div className="bg-emerald-900/90 text-white text-xs px-3 py-1 rounded-full">
                Tap to type entry
              </div>
            </div>
          </div>

          {/* 3. Right: Manual Entry (Form) */}
          <button
            disabled={isDisabled}
            onClick={onManualEntry}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Manual Form"
          >
            <KeyboardIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default InputBar;
