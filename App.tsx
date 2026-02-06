import React, { useState, useEffect, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import InputBar from "./components/VoiceRecorder";
import Settings from "./components/Settings";
import Onboarding from "./components/Onboarding";
import ReceiptModal from "./components/ReceiptModal";
import ChatAssistant from "./components/ChatAssistant";
import TransactionForm from "./components/TransactionForm";
import AuthPage from "./pages/AuthPage";
import ToastContainer, { useToast } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import { SettingsIcon, ListIcon, ChartIcon, SparklesIcon } from "./components/Icons";
import { AppState, Transaction, DailyStats, FinancialInsight, UserRole } from "./types";
import * as db from "./services/db";
import * as gemini from "./services/geminiService";
import { translations, Language } from "./translations";
import { supabase } from "./services/supabase";

const App: React.FC = () => {
  // Session & Role
  const [session, setSession] = useState<{ user: { email: string } } | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [currentUser, setCurrentUser] = useState<string>("Boss");

  // App State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    totalSales: 0,
    transactionCount: 0,
    totalExpenses: 0,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [insightData, setInsightData] = useState<FinancialInsight | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Transaction Review State
  const [reviewData, setReviewData] = useState<Partial<Transaction> | null>(null);

  // Settings State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem("suarakira_theme") === "dark",
  );
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem("suarakira_lang") as Language) || "en",
  );
  const [notifications, setNotifications] = useState({
    lowStock: localStorage.getItem("suarakira_notif_lowstock") === "true",
    dailySummary: localStorage.getItem("suarakira_notif_daily") === "true",
  });

  const t = translations[lang];
  const { toasts, showToast, removeToast } = useToast();

  // Initialize
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");

    // Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        initializeUser();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initializeUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUser = async () => {
    const role = await db.getCurrentRole();
    const user = await db.getCurrentUser();
    setCurrentRole(role);
    setCurrentUser(user);
    loadData(role);

    // Setup realtime subscription
    const unsubscribe = db.subscribeToTransactions((newTransactions) => {
      setTransactions(newTransactions);
      setStats(db.getDailyStats(newTransactions));
    });

    return unsubscribe;
  };

  const loadData = async (role: UserRole) => {
    const loaded = await db.getTransactions(role);
    setTransactions(loaded);
    setStats(db.getDailyStats(loaded));
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("suarakira_theme", newVal ? "dark" : "light");
      if (newVal) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return newVal;
    });
  };

  const handleSwitchRole = async () => {
    const newRole = currentRole === "admin" ? "staff" : "admin";

    await db.setCurrentRole(newRole);

    setCurrentRole(newRole);
    const newUser = await db.getCurrentUser();
    setCurrentUser(newUser);
    loadData(newRole);

    showToast(
      `Switched to ${newRole === "admin" ? "Master Dashboard" : "Staff Entry Mode"}`,
      "info",
    );
  };

  // Called when AI processing completes. Instead of saving directly, we open the Review Form.
  const processTransactionResult = (result: any) => {
    let mainItemName = result.merchantName || result.item;
    if (!mainItemName || mainItemName.toLowerCase() === "unknown item") {
      mainItemName = result.type === "sale" ? "Uncategorized Sale" : "Uncategorized Expense";
    } else if (
      result.items &&
      result.items.length > 0 &&
      (!result.merchantName || result.merchantName.toLowerCase() === "unknown item")
    ) {
      mainItemName = result.items[0].description;
    }

    const draftTransaction: Partial<Transaction> = {
      id: Date.now().toString(),
      item: mainItemName,
      category: result.category || "Uncategorized",
      quantity: 1,
      price: result.grandTotal, // AI gives Total, we can assume Qty 1 default or infer
      total: result.grandTotal,
      type: result.type,
      timestamp: Date.now(),
      originalTranscript: result.originalTranscript || "Input",
      createdBy: currentUser,
      receipt: {
        merchantName: result.merchantName,
        merchantAddress: result.merchantAddress,
        invoiceNo: result.invoiceNo,
        date: result.date,
        items: result.items || [],
        subtotal: result.subtotal,
        tax: result.tax,
        serviceCharge: result.serviceCharge,
        rounding: result.rounding,
      },
    };

    setReviewData(draftTransaction);
    setAppState(AppState.SUCCESS);
    setProcessingMessage("");

    setTimeout(() => setAppState(AppState.IDLE), 500);
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      const updatedTransactions = await db.saveTransaction(transaction);
      setTransactions(updatedTransactions);
      setStats(db.getDailyStats(updatedTransactions));
      setReviewData(null);
      showToast(`Saved: ${transaction.item}`, "success");
    } catch (error) {
      showToast("Failed to save transaction", "error");
      console.error(error);
    }
  };

  // Input Handlers
  const handleAudioSubmit = async (audioBlob: Blob) => {
    setAppState(AppState.PROCESSING);
    setProcessingMessage(t.processing);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        const result = await gemini.processTransactionInput(
          { audio: base64Audio, mime: audioBlob.type },
          true,
        );
        processTransactionResult(result);
      };
    } catch (e) {
      setAppState(AppState.ERROR);
      showToast("Audio Error", "error");
      setAppState(AppState.IDLE);
    }
  };

  const handleImageSubmit = async (file: File) => {
    setAppState(AppState.PROCESSING);
    setProcessingMessage("Scanning Document...");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(",")[1];
        const result = await gemini.processImageTransaction(base64Image, file.type);
        processTransactionResult(result);
      };
    } catch (e) {
      setAppState(AppState.ERROR);
      showToast("Scan Error", "error");
      setAppState(AppState.IDLE);
    }
  };

  // Manual entry trigger
  const handleManualEntry = () => {
    setReviewData({
      id: Date.now().toString(),
      type: "sale",
      quantity: 1,
      price: 0,
      total: 0,
      timestamp: Date.now(),
      createdBy: currentUser,
    });
  };

  if (!session)
    return (
      <ErrorBoundary>
        <AuthPage
          onLogin={() => {
            // Session will be set by auth state listener
          }}
        />
      </ErrorBoundary>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20">
      {renderToasts()}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">SuaraKira</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
            {currentRole === "admin" ? "Master Dashboard" : `Staff Book: ${currentUser}`}
          </p>
        </div>
        <div className="flex gap-2">
          {currentRole === "admin" && (
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex mr-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow dark:bg-slate-700" : "text-slate-400"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("analytics")}
                className={`p-1.5 rounded-md ${viewMode === "analytics" ? "bg-white shadow dark:bg-slate-700" : "text-slate-400"}`}
              >
                <ChartIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full"
          >
            <SparklesIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="p-6">
        {viewMode === "list" ? (
          <Dashboard
            stats={stats}
            recentTransactions={transactions}
            onGenerateInsights={async () => {
              if (currentRole !== "admin") {
                showToast("Access Denied: Master Dashboard Only", "error");
                return;
              }
              setAppState(AppState.ANALYZING);
              try {
                const i = await gemini.generateInsights(transactions);
                setInsightData(i);
              } finally {
                setAppState(AppState.IDLE);
              }
            }}
            onEditTransaction={(t) => setSelectedTransaction(t)}
            insightData={insightData}
            onCloseInsight={() => setInsightData(null)}
            isAnalyzing={appState === AppState.ANALYZING}
            t={t}
          />
        ) : currentRole === "admin" ? (
          <Analytics transactions={transactions} isDark={isDarkMode} t={t} />
        ) : (
          <div className="text-center py-20 text-slate-400">
            Analytics restricted to Master Dashboard.
          </div>
        )}
      </main>

      <InputBar
        onAudioSubmit={handleAudioSubmit}
        onManualEntry={handleManualEntry}
        onImageSubmit={handleImageSubmit}
        appState={appState}
        customStatus={processingMessage}
        t={t}
      />

      {/* Manual Entry / Review Form */}
      {reviewData && (
        <TransactionForm
          initialData={reviewData}
          onSave={handleSaveTransaction}
          onCancel={() => setReviewData(null)}
          currentUser={currentUser}
        />
      )}

      {/* Floating Chat Assistant */}
      <ChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        transactions={transactions}
        userRole={currentRole}
        userName={currentUser}
        onTransactionAdd={processTransactionResult}
      />

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={async () => {
          await db.clearTransactions();
          loadData(currentRole);
        }}
        isDarkMode={isDarkMode}
        toggleTheme={handleToggleTheme}
        notifications={notifications}
        toggleNotification={() => {}}
        lang={lang}
        setLang={setLang}
        onReplayOnboarding={() => setShowOnboarding(true)}
        t={t}
      />

      {isSettingsOpen && (
        <div className="fixed bottom-20 left-6 z-[70] w-full max-w-xs">
          <button
            onClick={handleSwitchRole}
            className="w-full bg-slate-800 text-white py-3 rounded-xl shadow-lg mb-2 text-sm font-bold"
          >
            Switch Role: {currentRole === "admin" ? "To Staff" : "To Admin"}
          </button>
        </div>
      )}

      {selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onDelete={async (id) => {
            await db.deleteTransaction(id);
            loadData(currentRole);
            setSelectedTransaction(null);
          }}
        />
      )}

      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
    </div>
  );

  function renderToasts() {
    return <ToastContainer toasts={toasts} removeToast={removeToast} />;
  }
};

export default App;
