import React from 'react';
import { XIcon, MoonIcon, SunIcon, BellIcon } from './Icons';
import { Language } from '../translations';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  notifications: {
    lowStock: boolean;
    dailySummary: boolean;
  };
  toggleNotification: (type: 'lowStock' | 'dailySummary') => void;
  lang: Language;
  setLang: (l: Language) => void;
  onReplayOnboarding: () => void;
  t: any;
}

const Settings: React.FC<SettingsProps> = ({ 
  isOpen, 
  onClose, 
  onClearData,
  isDarkMode,
  toggleTheme,
  notifications,
  toggleNotification,
  lang,
  setLang,
  onReplayOnboarding,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.settings}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Appearance & Language */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <SunIcon className="w-4 h-4 text-emerald-500" /> {t.appearance}
            </h3>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">{t.darkMode}</span>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">{t.language}</span>
                <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lang === 'en' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLang('ms')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lang === 'ms' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}
                  >
                    BM
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-emerald-500" /> {t.notifications}
            </h3>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{t.lowStock}</p>
                </div>
                <button 
                  onClick={() => toggleNotification('lowStock')}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${notifications.lowStock ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                   <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${notifications.lowStock ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                   <p className="text-sm text-slate-700 dark:text-slate-300">{t.dailySummary}</p>
                </div>
                <button 
                  onClick={() => toggleNotification('dailySummary')}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${notifications.dailySummary ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                   <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${notifications.dailySummary ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Misc & Data */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">General</h3>
            <div className="space-y-2">
               <button 
                 onClick={() => {
                   onReplayOnboarding();
                   onClose();
                 }}
                 className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-left"
               >
                 Replay Onboarding Tutorial
               </button>

               <button
                onClick={() => {
                  if(window.confirm("Are you sure? This will delete all transaction history on this device.")) {
                    onClearData();
                    onClose();
                  }
                }}
                className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-sm text-left flex items-center justify-between"
              >
                {t.clearData}
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Local Storage</span>
              </button>
            </div>
          </div>

          <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 mt-4">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} w3jdev · <a href="https://w3jdev.com" target="_blank" className="hover:text-emerald-500">w3jdev.com</a> · <a href="https://github.com/w3jdev" target="_blank" className="hover:text-emerald-500">GitHub</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;