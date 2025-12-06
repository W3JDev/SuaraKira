import React from 'react';
import { XIcon } from './Icons';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onClearData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* AI Configuration Info */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h3 className="font-semibold text-emerald-900 text-sm mb-1">AI Engine Active</h3>
            <p className="text-xs text-emerald-700">
              Powered by Gemini 2.5 Flash for high-speed Manglish processing.
              Your API key is securely loaded from the environment.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Preferences</h3>
            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <span className="text-sm text-slate-600">Currency</span>
                 <span className="text-sm font-medium text-slate-900">MYR (RM)</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <span className="text-sm text-slate-600">Language</span>
                 <span className="text-sm font-medium text-slate-900">English / Manglish</span>
               </div>
            </div>
          </div>

           <hr className="border-slate-100" />

          {/* Danger Zone */}
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-3">Data Management</h3>
             <button
              onClick={() => {
                if(window.confirm("Are you sure? This will delete all transaction history on this device.")) {
                  onClearData();
                  onClose();
                }
              }}
              className="w-full py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors text-sm text-left flex items-center justify-between"
            >
              Clear All Transaction History
              <span className="text-xs bg-red-100 px-2 py-1 rounded">Local Storage</span>
            </button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[10px] text-slate-400">SuaraKira v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
