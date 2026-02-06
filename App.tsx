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
import LandingPage from "./pages/LandingPage";
import BrandedFooter from "./components/BrandedFooter";
import OrganizationOnboarding from "./components/OrganizationOnboarding";
import ToastContainer, { useToast } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import DateRangeSelector, { DateRange } from "./components/DateRangeSelector";
import BottomNav, { NavItem } from "./components/BottomNav";
import Accounts from "./components/Accounts";
import Categories from "./components/Categories";
import Budgets from "./components/Budgets";
import { SettingsIcon, ListIcon, ChartIcon, SparklesIcon } from "./components/Icons";
import {
  AppState,
  Transaction,
  DailyStats,
  FinancialInsight,
  UserRole,
  EntryMode,
  UseCase,
} from "./types";
import * as db from "./services/db";
import * as gemini from "./services/geminiService";
import { translations, Language } from "./translations";
import { supabase } from "./services/supabase";

const App: React.FC = () => {
  // Session & Role
  const [session, setSession] = useState<{ user: { email: string } } | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [currentUser, setCurrentUser] = useState<string>("Boss");
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [needsOrgOnboarding, setNeedsOrgOnboarding] = useState(false);

  // App State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    totalSales: 0,
    totalExpenses: 0,
    totalIncome: 0,
    totalSpent: 0,
    netAmount: 0,
    transactionCount: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [insightData, setInsightData] = useState<FinancialInsight | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Date Range State
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  // Bottom Navigation State
  const [activeNavItem, setActiveNavItem] = useState<NavItem>("list");
  const [showManualForm, setShowManualForm] = useState(false);

  // Feature Modals State
  const [showAccounts, setShowAccounts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);

  // Transaction Review State
  const [reviewData, setReviewData] = useState<Partial<Transaction> | null>(null);

  // Button disable state to prevent double-tap
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem("suarakira_theme") === "dark",
  );
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem("suarakira_lang") as Language) || "en",
  );
  const [entryMode, setEntryMode] = useState<EntryMode>(
    () => (localStorage.getItem("suarakira_entry_mode") as EntryMode) || "both",
  );
  const [useCase, setUseCase] = useState<UseCase>(
    () => (localStorage.getItem("suarakira_use_case") as UseCase) || "business",
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
      } else {
        setShowLandingPage(true);
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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has organization
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.organization_id) {
        setNeedsOrgOnboarding(true);
        return;
      }

      const role = await db.getCurrentRole();
      const userName = await db.getCurrentUser();
      setCurrentRole(role);
      setCurrentUser(userName);
      loadData(role);

      // Setup realtime subscription
      const unsubscribe = db.subscribeToTransactions((newTransactions) => {
        setTransactions(newTransactions);
        const currentUseCase =
          (localStorage.getItem("suarakira_use_case") as UseCase) || "business";
        recalculateStats(newTransactions, currentUseCase);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  };

  const loadData = async (role: UserRole) => {
    const loaded = await db.getTransactions(role);
    setTransactions(loaded);
    const currentUseCase = (localStorage.getItem("suarakira_use_case") as UseCase) || "business";
    recalculateStats(loaded, currentUseCase);
  };

  const recalculateStats = (txns: Transaction[], useCaseMode: UseCase) => {
    let calculatedStats: DailyStats;
    const currentDateRange = dateRange;

    switch (currentDateRange) {
      case "today":
        calculatedStats = db.getDailyStats(txns, useCaseMode);
        break;
      case "week":
        calculatedStats = db.getWeekStats(txns, useCaseMode);
        break;
      case "month":
        calculatedStats = db.getMonthStats(txns, useCaseMode);
        break;
      case "year":
        calculatedStats = db.getYearStats(txns, useCaseMode);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          calculatedStats = db.getDateRangeStats(txns, useCaseMode, customStartDate, customEndDate);
        } else {
          calculatedStats = db.getDailyStats(txns, useCaseMode);
        }
        break;
      default:
        calculatedStats = db.getDailyStats(txns, useCaseMode);
    }

    setStats(calculatedStats);
  };

  // Recalculate stats whenever date range or transactions change
  useEffect(() => {
    recalculateStats(transactions, useCase);
  }, [dateRange, customStartDate, customEndDate, transactions, useCase]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("suarakira_theme", newVal ? "dark" : "light");
      if (newVal) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return newVal;
    });
  };

  const handleSetUseCase = (mode: UseCase) => {
    setUseCase(mode);
    localStorage.setItem("suarakira_use_case", mode);
    // Recalculate stats with new context
    recalculateStats(transactions, mode);
  };

  const handleSetEntryMode = (mode: EntryMode) => {
    setEntryMode(mode);
    localStorage.setItem("suarakira_entry_mode", mode);
  };

  const handleDateRangeChange = (range: DateRange, customStart?: Date, customEnd?: Date) => {
    setDateRange(range);
    if (range === "custom" && customStart && customEnd) {
      setCustomStartDate(customStart);
      setCustomEndDate(customEnd);
    }
    // Trigger stats recalculation
    recalculateStats(transactions, useCase);
  };

  const handleBottomNavNavigate = (item: NavItem) => {
    setActiveNavItem(item);

    switch (item) {
      case "voice":
        // Open voice recorder (already in InputBar)
        setIsChatOpen(true);
        break;
      case "scan":
        // Trigger image upload
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.capture = "environment";
        fileInput.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) handleImageSubmit(file);
        };
        fileInput.click();
        break;
      case "form":
        // Open manual entry form
        setShowManualForm(true);
        handleManualEntry();
        break;
      case "list":
        // Show transaction list (default view)
        setViewMode("list");
        break;
      case "settings":
        // Open settings
        setIsSettingsOpen(true);
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setTransactions([]);
      setShowLandingPage(true);
      showToast("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Failed to logout", "error");
    }
  };

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  const handleOrgOnboardingComplete = () => {
    setNeedsOrgOnboarding(false);
    initializeUser();
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
    // PREVENT DOUBLE-TAP
    if (isSaving) return;

    try {
      setIsSaving(true);
      const updatedTransactions = await db.saveTransaction(transaction);
      setTransactions(updatedTransactions);
      setStats(db.getDailyStats(updatedTransactions, useCase));
      setReviewData(null);
      showToast(`Saved: ${transaction.item}`, "success");
    } catch (error) {
      showToast("Failed to save transaction", "error");
      console.error(error);
    } finally {
      // Re-enable after 1 second to prevent rapid double-taps
      setTimeout(() => setIsSaving(false), 1000);
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
    if (isSaving) return; // Prevent double-tap

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

  // Chat open trigger
  const handleChatOpen = () => {
    if (isSaving) return; // Prevent double-tap
    setIsChatOpen(true);
  };

  // Direct transaction add from chat (no review form)
  const handleDirectTransactionAdd = async (transaction: Partial<Transaction>) => {
    // PREVENT DOUBLE-TAP
    if (isSaving) return;

    try {
      setIsSaving(true);
      const fullTransaction: Transaction = {
        id: transaction.id || Date.now().toString(),
        item: transaction.item || "Transaction",
        category: transaction.category || "Uncategorized",
        quantity: transaction.quantity || 1,
        price: transaction.price || 0,
        total: transaction.total || 0,
        type: transaction.type || "expense",
        timestamp: transaction.timestamp || Date.now(),
        createdBy: currentUser,
        sourceChannel: transaction.sourceChannel || "CHAT_TEXT",
        paymentMethod: transaction.paymentMethod || "CASH",
        isBusiness: transaction.isBusiness ?? true,
        status: transaction.status || "CONFIRMED",
        rawTextInput: transaction.rawTextInput,
      };

      await handleSaveTransaction(fullTransaction);
    } catch (error) {
      console.error("Direct save error:", error);
      showToast("Failed to save transaction", "error");
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  if (!session) {
    if (showLandingPage) {
      return (
        <ErrorBoundary>
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <LandingPage onGetStarted={handleGetStarted} />
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <AuthPage
          onLogin={() => {
            // Session will be set by auth state listener
          }}
        />
      </ErrorBoundary>
    );
  }

  if (needsOrgOnboarding && session) {
    return (
      <ErrorBoundary>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <OrganizationOnboarding
          userEmail={session.user.email}
          userName={currentUser}
          onComplete={handleOrgOnboardingComplete}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-28">
      {renderToasts()}

      {/* Date Range Selector */}
      <DateRangeSelector
        selected={dateRange}
        onSelect={handleDateRangeChange}
        customStart={customStartDate}
        customEnd={customEndDate}
      />

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
                const i = await gemini.generateInsights(transactions, lang);
                setInsightData(i);
              } finally {
                setAppState(AppState.IDLE);
              }
            }}
            onEditTransaction={(t) => setSelectedTransaction(t)}
            insightData={insightData}
            onCloseInsight={() => setInsightData(null)}
            isAnalyzing={appState === AppState.ANALYZING}
            useCase={useCase}
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

      {/* Quick Access Buttons */}
      <div className="fixed right-4 bottom-20 z-40 flex flex-col gap-2">
        <button
          onClick={() => setShowBudgets(true)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl"
          title="Budgets"
        >
          💵
        </button>
        <button
          onClick={() => setShowCategories(true)}
          className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center text-xl"
          title="Categories"
        >
          🏷️
        </button>
        <button
          onClick={() => setShowAccounts(true)}
          className="w-12 h-12 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 flex items-center justify-center text-xl"
          title="Accounts"
        >
          💰
        </button>
      </div>

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
        onTransactionAdd={handleDirectTransactionAdd}
        entryMode={entryMode}
      />

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={async () => {
          await db.clearTransactions();
          loadData(currentRole);
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleTheme={handleToggleTheme}
        notifications={notifications}
        toggleNotification={() => {}}
        lang={lang}
        setLang={setLang}
        entryMode={entryMode}
        setEntryMode={handleSetEntryMode}
        useCase={useCase}
        setUseCase={handleSetUseCase}
        onReplayOnboarding={() => setShowOnboarding(true)}
        onSwitchRole={handleSwitchRole}
        currentRole={currentRole}
        t={t}
      />

      {selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onDelete={async (id) => {
            if (isSaving) return; // Prevent double-tap
            setIsSaving(true);
            await db.deleteTransaction(id);
            loadData(currentRole);
            setSelectedTransaction(null);
            setTimeout(() => setIsSaving(false), 1000);
          }}
        />
      )}

      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {/* Accounts Modal */}
      {showAccounts && (
        <Accounts
          onClose={() => setShowAccounts(false)}
          organizationId={session?.user?.id}
          userId={session?.user?.id || "guest"}
          t={t}
        />
      )}

      {/* Categories Modal */}
      {showCategories && (
        <Categories
          onClose={() => setShowCategories(false)}
          organizationId={session?.user?.id}
          userId={session?.user?.id || "guest"}
          t={t}
        />
      )}

      {/* Budgets Modal */}
      {showBudgets && (
        <Budgets
          onClose={() => setShowBudgets(false)}
          organizationId={session?.user?.id}
          userId={session?.user?.id || "guest"}
          transactions={transactions}
          t={t}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        active={activeNavItem}
        onNavigate={handleBottomNavNavigate}
        hasNewActivity={transactions.length > 0}
      />
    </div>
  );

  function renderToasts() {
    return <ToastContainer toasts={toasts} removeToast={removeToast} />;
  }
};

export default App;
