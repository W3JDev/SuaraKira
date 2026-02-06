import React from "react";
import { XIcon, MoonIcon, SunIcon, BellIcon } from "./Icons";
import { Language } from "../translations";
import { EntryMode, UseCase } from "../types";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  notifications: {
    lowStock: boolean;
    dailySummary: boolean;
  };
  toggleNotification: (type: "lowStock" | "dailySummary") => void;
  lang: Language;
  setLang: (l: Language) => void;
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;
  useCase: UseCase;
  setUseCase: (mode: UseCase) => void;
  onReplayOnboarding: () => void;
  onSwitchRole: () => void;
  currentRole: "admin" | "staff";
  t: any;
}

const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  onClearData,
  onLogout,
  isDarkMode,
  toggleTheme,
  notifications,
  toggleNotification,
  lang,
  setLang,
  onReplayOnboarding,
  entryMode,
  setEntryMode,
  useCase,
  setUseCase,
  onSwitchRole,
  currentRole,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.settings}</h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 space-y-6">
          {/* Appearance & Language */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <SunIcon className="w-4 h-4 text-emerald-500" /> {t.appearance}
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.darkMode}
                </span>
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isDarkMode ? "bg-emerald-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${isDarkMode ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2.5">
                  {t.language}
                </span>
                <div className="grid grid-cols-5 gap-1.5 bg-white dark:bg-slate-700 rounded-lg p-1.5">
                  <button
                    onClick={() => setLang("en")}
                    className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${lang === "en" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                    title="English"
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang("ms")}
                    className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${lang === "ms" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                    title="Bahasa Malaysia"
                  >
                    BM
                  </button>
                  <button
                    onClick={() => setLang("bn")}
                    className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${lang === "bn" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                    title="বাংলা"
                  >
                    বাং
                  </button>
                  <button
                    onClick={() => setLang("ta")}
                    className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${lang === "ta" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                    title="தமிழ்"
                  >
                    தமி
                  </button>
                  <button
                    onClick={() => setLang("zh")}
                    className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${lang === "zh" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                    title="中文"
                  >
                    中文
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2.5">
                  Use Case Context
                </span>
                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-700 rounded-lg p-1.5">
                  <button
                    onClick={() => setUseCase("personal")}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${useCase === "personal" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "text-slate-500"}`}
                  >
                    👤 Personal Finance
                  </button>
                  <button
                    onClick={() => setUseCase("business")}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${useCase === "business" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                  >
                    🏢 Business
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {useCase === "personal" && "Track income & expenses for personal budgeting"}
                  {useCase === "business" && "Track sales & costs with profit analysis"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2.5">
                  Entry Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-slate-700 rounded-lg p-1.5">
                  <button
                    onClick={() => setEntryMode("expense-only")}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${entryMode === "expense-only" ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" : "text-slate-500"}`}
                  >
                    💸 Expense Only
                  </button>
                  <button
                    onClick={() => setEntryMode("income-only")}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${entryMode === "income-only" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}
                  >
                    💰 Income Only
                  </button>
                  <button
                    onClick={() => setEntryMode("both")}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${entryMode === "both" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "text-slate-500"}`}
                  >
                    📊 Both
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {entryMode === "expense-only" && "Track expenses only (e.g., for employees)"}
                  {entryMode === "income-only" && "Track sales/income only (e.g., for cashiers)"}
                  {entryMode === "both" && "Full accounting - track both income and expenses"}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Notifications */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-emerald-500" /> {t.notifications}
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.lowStock}
                </p>
                <button
                  onClick={() => toggleNotification("lowStock")}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${notifications.lowStock ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${notifications.lowStock ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.dailySummary}
                </p>
                <button
                  onClick={() => toggleNotification("dailySummary")}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${notifications.dailySummary ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${notifications.dailySummary ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Misc & Data */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">General</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onReplayOnboarding();
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-left flex items-center justify-between"
              >
                <span>🎓 Replay Onboarding Tutorial</span>
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "⚠️ PERMANENT DELETION WARNING\n\nThis will DELETE all transactions from the DATABASE (Supabase).\n\n✅ What gets deleted:\n  • All your transaction records\n  • Cannot be recovered\n\n❌ This is NOT clearing browser cache!\n❌ This is PERMANENT!\n\nAre you absolutely sure?",
                    )
                  ) {
                    const confirmText = window.prompt("Type DELETE to confirm:");
                    if (confirmText === "DELETE") {
                      onClearData();
                      onClose();
                    } else {
                      alert("Deletion cancelled. Your data is safe.");
                    }
                  }
                }}
                className="w-full py-3.5 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-sm text-left flex items-center justify-between"
              >
                {t.clearData}
                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                  ⚠️ Permanent
                </span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to logout?")) {
                    onLogout();
                  }
                }}
                className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm text-left flex items-center justify-between"
              >
                🚪 Logout
                <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                  Sign Out
                </span>
              </button>

              <button
                onClick={() => {
                  onSwitchRole();
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all text-sm text-left flex items-center justify-between shadow-lg shadow-indigo-500/30"
              >
                <span>🔄 Switch Role</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                  {currentRole === "admin" ? "To Staff" : "To Admin"}
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
