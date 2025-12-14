import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import InputBar from './components/VoiceRecorder';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import ReceiptModal from './components/ReceiptModal';
import AuthPage from './pages/AuthPage';
import ToastContainer, { useToast } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsIcon, ListIcon, ChartIcon } from './components/Icons';
import { AppState, Transaction, DailyStats, FinancialInsight } from './types';
import * as db from './services/db';
import * as gemini from './services/geminiService';
import { translations, Language } from './translations';

const App: React.FC = () => {
  // Session State
  const [session, setSession] = useState<{ user: { email: string } } | null>(null);
  
  // App State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DailyStats>({ totalSales: 0, transactionCount: 0, totalExpenses: 0 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [insightData, setInsightData] = useState<FinancialInsight | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Settings State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('suarakira_theme') === 'dark';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('suarakira_lang') as Language) || 'en';
  });
  const [notifications, setNotifications] = useState({
    lowStock: localStorage.getItem('suarakira_notif_lowstock') === 'true',
    dailySummary: localStorage.getItem('suarakira_notif_daily') === 'true',
  });

  const t = translations[lang];

  // Toast Hook
  const { toasts, showToast, removeToast } = useToast();

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('suarakira_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('suarakira_theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial data
  useEffect(() => {
    // Check for "mock" session
    const savedUser = localStorage.getItem('suarakira_user');
    if (savedUser) {
      setSession({ user: JSON.parse(savedUser) });
    }

    const loaded = db.getTransactions();
    setTransactions(loaded);
    setStats(db.getDailyStats(loaded));

    // Check onboarding
    const hasSeenOnboarding = localStorage.getItem('suarakira_onboarding_v1');
    if (!hasSeenOnboarding && savedUser) {
      setShowOnboarding(true);
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleSetLanguage = (l: Language) => {
    setLang(l);
    localStorage.setItem('suarakira_lang', l);
  };

  const handleToggleNotification = async (type: 'lowStock' | 'dailySummary') => {
    const newState = !notifications[type];
    
    if (newState) {
      // Request permission if enabling
      if (!('Notification' in window)) {
        showToast("Notifications not supported", "error");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast("Notification permission denied", "error");
        return;
      }
      // Send a test notification
      new Notification("SuaraKira", { body: `${type === 'lowStock' ? 'Low Stock' : 'Daily Summary'} alerts enabled!` });
    }

    setNotifications(prev => ({ ...prev, [type]: newState }));
    localStorage.setItem(type === 'lowStock' ? 'suarakira_notif_lowstock' : 'suarakira_notif_daily', String(newState));
  };

  const handleLogin = (email: string) => {
    const user = { email };
    localStorage.setItem('suarakira_user', JSON.stringify(user));
    setSession({ user });
    
    const hasSeenOnboarding = localStorage.getItem('suarakira_onboarding_v1');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('suarakira_user');
    setSession(null);
    showToast('Logged out successfully');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('suarakira_onboarding_v1', 'true');
    setShowOnboarding(false);
    
    if (transactions.length === 0) {
      handleLoadDemoData();
    }
  };

  const handleReplayOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleClearData = () => {
    db.clearTransactions();
    setTransactions([]);
    setStats({ totalSales: 0, transactionCount: 0, totalExpenses: 0 });
    setInsightData(null);
    showToast(t.clearData, 'info');
  };

  const handleLoadDemoData = () => {
    const data = db.seedDemoData();
    setTransactions(data);
    setStats(db.getDailyStats(data));
    showToast('Demo data loaded', 'success');
  };

  // --- PRICE HISTORY & ANOMALY DETECTION ---
  const checkPriceAnomaly = (newItem: Transaction) => {
    if (newItem.type !== 'expense') return;

    // Find history of this item (fuzzy match)
    const history = transactions.filter(t => 
      t.type === 'expense' && 
      t.item.toLowerCase().includes(newItem.item.toLowerCase())
    );

    if (history.length < 2) return; // Need some history

    // Calculate Average Unit Price
    let totalUnitCost = 0;
    let validCount = 0;
    history.forEach(h => {
       const qty = h.quantity || 1;
       const unitCost = qty > 0 ? (h.total || 0) / qty : 0;
       if (unitCost > 0) {
         totalUnitCost += unitCost;
         validCount++;
       }
    });

    if (validCount === 0) return;

    const avg = totalUnitCost / validCount;
    const currentQty = newItem.quantity || 1;
    const currentUnit = currentQty > 0 ? (newItem.total || 0) / currentQty : 0;
    
    if (currentUnit === 0) return;

    // Check Deviation (e.g., 20% threshold)
    if (currentUnit > avg * 1.2) {
       const percent = Math.round(((currentUnit - avg) / avg) * 100);
       const msg = t.priceWarningDesc
         .replace('{price}', (currentUnit || 0).toFixed(2))
         .replace('{item}', newItem.item)
         .replace('{percent}', percent.toString())
         .replace('{avg}', (avg || 0).toFixed(2));
       
       showToast(msg, 'error'); // Red toast for alert
    } else if (currentUnit < avg * 0.8) {
       const percent = Math.round(((avg - currentUnit) / avg) * 100);
       const msg = t.greatDealDesc
         .replace('{price}', (currentUnit || 0).toFixed(2))
         .replace('{item}', newItem.item)
         .replace('{percent}', percent.toString());

       showToast(msg, 'success'); // Green toast for deal
    }
  };

  const processTransactionResult = (result: any) => {
    let mainItemName = result.merchantName || result.item || "Unknown Item";
    if (result.items && result.items.length > 0 && !result.merchantName) {
        mainItemName = result.items[0].description;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      item: mainItemName,
      category: result.category || 'Uncategorized',
      quantity: 1, 
      price: result.grandTotal,
      total: result.grandTotal,
      type: result.type,
      timestamp: Date.now(),
      originalTranscript: "Input",
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
      }
    };

    // Run Price Check BEFORE saving (so we compare against history excluding self)
    checkPriceAnomaly(newTransaction);

    const updatedTransactions = db.saveTransaction(newTransaction);
    setTransactions(updatedTransactions);
    setStats(db.getDailyStats(updatedTransactions));
    setAppState(AppState.SUCCESS);
    setProcessingMessage("");
    showToast(`Added: ${mainItemName}`, 'success');
    
    setTimeout(() => setAppState(AppState.IDLE), 1000);
  };

  const handleAudioSubmit = async (audioBlob: Blob) => {
    const timeoutId = setTimeout(() => {
      setAppState(AppState.ERROR);
      setProcessingMessage("Request timed out");
      showToast("Request timed out", "error");
      setTimeout(() => setAppState(AppState.IDLE), 2000);
    }, 15000);

    setAppState(AppState.PROCESSING);
    setProcessingMessage(t.processing);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          const mime = audioBlob.type || 'audio/webm';
          const result = await gemini.processTransactionInput({ audio: base64Audio, mime }, true);
          clearTimeout(timeoutId);
          processTransactionResult(result);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error(error);
          setAppState(AppState.ERROR);
          showToast("Could not understand audio. Try again.", "error");
          setAppState(AppState.IDLE);
        }
      };
      reader.onerror = () => {
        clearTimeout(timeoutId);
        setAppState(AppState.ERROR);
        showToast("Audio file error", "error");
        setAppState(AppState.IDLE);
      };
    } catch (e) {
      clearTimeout(timeoutId);
      setAppState(AppState.IDLE);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setAppState(AppState.PROCESSING);
    setProcessingMessage(t.processing);
    try {
      const result = await gemini.processTransactionInput(text, false);
      processTransactionResult(result);
    } catch (e) {
      setAppState(AppState.ERROR);
      showToast("Could not understand text.", "error");
      setAppState(AppState.IDLE);
    }
  };

  const handleImageSubmit = async (file: File) => {
    const timeoutId = setTimeout(() => {
       if (appState === AppState.PROCESSING) {
         setAppState(AppState.ERROR);
         setProcessingMessage("Analysis timed out");
         showToast("Image analysis timed out", "error");
         setAppState(AppState.IDLE);
       }
    }, 30000);

    setAppState(AppState.PROCESSING);
    setProcessingMessage("Deep Scanning Image..."); 
    
    try {
       const reader = new FileReader();
       reader.readAsDataURL(file);
       
       reader.onloadend = async () => {
         try {
           if (!reader.result) throw new Error("File reading failed");
           const base64Image = (reader.result as string).split(',')[1];
           const result = await gemini.processImageTransaction(base64Image, file.type);
           
           clearTimeout(timeoutId);
           processTransactionResult(result);
         } catch (e) {
           console.error(e);
           clearTimeout(timeoutId);
           setAppState(AppState.ERROR);
           showToast("Could not analyze receipt.", "error");
           setAppState(AppState.IDLE);
         }
       };

       reader.onerror = () => {
         clearTimeout(timeoutId);
         setAppState(AppState.ERROR);
         showToast("Failed to read image", "error");
         setAppState(AppState.IDLE);
       };

    } catch (e) {
      clearTimeout(timeoutId);
      console.error(e);
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerateInsights = async () => {
    if (transactions.length < 3) {
      showToast("Need 3+ transactions for insights", "info");
      return;
    }
    setAppState(AppState.ANALYZING);
    setProcessingMessage(t.aiThinking);
    try {
      const insight = await gemini.generateInsights(transactions);
      setInsightData(insight);
      setAppState(AppState.IDLE);
    } catch (e) {
      setAppState(AppState.ERROR);
      showToast("Failed to generate report", "error");
      setAppState(AppState.IDLE);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    localStorage.setItem('suarakira_transactions_v1', JSON.stringify(updated));
    setTransactions(updated);
    setStats(db.getDailyStats(updated));
    setSelectedTransaction(null);
    showToast("Transaction deleted", "info");
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------

  // 1. Toast Container (Global)
  const renderToasts = () => <ToastContainer toasts={toasts} removeToast={removeToast} />;

  // 2. Auth State Check
  if (!session) {
    return (
      <ErrorBoundary>
        {renderToasts()}
        <AuthPage onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  // 3. Main App (Authenticated)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-emerald-100 pb-20 transition-colors duration-300">
      
      {renderToasts()}
      
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
            SuaraKira
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">PRO</span>
          </h1>
          <a href="https://w3jdev.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            by w3jdev
          </a>
        </div>
        
        <div className="flex items-center gap-2">
           {/* View Switcher */}
           <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center mr-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                 onClick={() => setViewMode('analytics')}
                 className={`p-1.5 rounded-md transition-all ${viewMode === 'analytics' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <ChartIcon className="w-4 h-4" />
              </button>
           </div>
           
           <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="p-6">
        <ErrorBoundary>
        {viewMode === 'list' ? (
           <>
            <Dashboard 
              stats={stats} 
              recentTransactions={transactions}
              onGenerateInsights={handleGenerateInsights}
              onEditTransaction={setSelectedTransaction}
              insightData={insightData}
              onCloseInsight={() => setInsightData(null)}
              isAnalyzing={appState === AppState.ANALYZING}
              t={t}
            />
            {transactions.length === 0 && (
              <div className="mt-8 text-center">
                 <button onClick={handleLoadDemoData} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium underline">
                   {t.loadDemo}
                 </button>
              </div>
            )}
           </>
        ) : (
          <Analytics transactions={transactions} isDark={isDarkMode} t={t} />
        )}
        </ErrorBoundary>
      </main>

      <InputBar 
        onAudioSubmit={handleAudioSubmit}
        onTextSubmit={handleTextSubmit}
        onImageSubmit={handleImageSubmit}
        appState={appState} 
        customStatus={processingMessage}
        t={t}
      />

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onClearData={handleClearData}
        isDarkMode={isDarkMode}
        toggleTheme={handleToggleTheme}
        notifications={notifications}
        toggleNotification={handleToggleNotification}
        lang={lang}
        setLang={handleSetLanguage}
        onReplayOnboarding={handleReplayOnboarding}
        t={t}
      />
      
      {/* Logout button hidden inside Settings, but logic is here */}
      {isSettingsOpen && (
        <div className="fixed bottom-6 left-6 z-[70]">
           <button 
            onClick={handleLogout}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 underline"
           >
             Log Out
           </button>
        </div>
      )}

      {selectedTransaction && (
        <ReceiptModal 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)}
          onDelete={handleDeleteTransaction}
        />
      )}
      
    </div>
  );
};

export default App;