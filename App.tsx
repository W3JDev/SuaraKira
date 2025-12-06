import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import InputBar from './components/VoiceRecorder';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import ReceiptModal from './components/ReceiptModal';
import AuthPage from './pages/AuthPage';
import ToastContainer, { useToast } from './components/Toast';
import { SettingsIcon, XIcon, ListIcon, ChartIcon } from './components/Icons';
import { AppState, Transaction, DailyStats, FinancialInsight } from './types';
import * as db from './services/db';
import * as gemini from './services/geminiService';
import { getCurrentSession, signOut } from './services/supabase';

// Utility: Compress Image to avoid Payload Too Large errors
const compressImage = (file: File): Promise<{ base64: string, mime: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Limit width to 1024px
        const scaleSize = MAX_WIDTH / img.width;
        
        // Only resize if bigger than max
        if (scaleSize < 1) {
             canvas.width = MAX_WIDTH;
             canvas.height = img.height * scaleSize;
        } else {
             canvas.width = img.width;
             canvas.height = img.height;
        }
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to standard JPEG 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        resolve({
            base64: dataUrl.split(',')[1],
            mime: 'image/jpeg'
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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
  
  // Toast Hook
  const { toasts, showToast, removeToast } = useToast();

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      // Check for Supabase session
      const supabaseSession = await getCurrentSession();
      if (supabaseSession?.user) {
        setSession({ user: { email: supabaseSession.user.email || '' } });
      } else {
        // Fallback: Check for local session
        const savedUser = localStorage.getItem('suarakira_user');
        if (savedUser) {
          setSession({ user: JSON.parse(savedUser) });
        }
      }

      // Load transactions (async)
      const loaded = await db.getTransactions();
      setTransactions(loaded);
      setStats(db.getDailyStats(loaded));

      // Check onboarding
      const hasSeenOnboarding = localStorage.getItem('suarakira_onboarding_v1');
      if (!hasSeenOnboarding && (supabaseSession?.user || savedUser)) {
        setShowOnboarding(true);
      }
    };
    
    initializeApp();
  }, []);

  const handleLogin = async (email: string) => {
    const user = { email };
    localStorage.setItem('suarakira_user', JSON.stringify(user));
    setSession({ user });
    
    // Reload transactions after login
    const loaded = await db.getTransactions();
    setTransactions(loaded);
    setStats(db.getDailyStats(loaded));
    
    const hasSeenOnboarding = localStorage.getItem('suarakira_onboarding_v1');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('suarakira_user');
    setSession(null);
    setTransactions([]);
    showToast('Logged out successfully');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('suarakira_onboarding_v1', 'true');
    setShowOnboarding(false);
    
    if (transactions.length === 0) {
      handleLoadDemoData();
    }
  };

  const handleClearData = async () => {
    await db.clearTransactions();
    setTransactions([]);
    setStats({ totalSales: 0, transactionCount: 0, totalExpenses: 0 });
    setInsightData(null);
    showToast('All data cleared', 'info');
  };

  const handleLoadDemoData = () => {
    const data = db.seedDemoData();
    setTransactions(data);
    setStats(db.getDailyStats(data));
    showToast('Demo data loaded', 'success');
  };

  const processTransactionResult = async (result: any) => {
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

    const updatedTransactions = await db.saveTransaction(newTransaction);
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
    setProcessingMessage("Listening & Transcribing...");
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          const mime = audioBlob.type || 'audio/webm';
          const result = await gemini.processTransactionInput({ audio: base64Audio, mime }, true);
          clearTimeout(timeoutId);
          await processTransactionResult(result);
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
    setProcessingMessage("Reading text...");
    try {
      const result = await gemini.processTransactionInput(text, false);
      await processTransactionResult(result);
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
    }, 45000); // Increased timeout for images

    setAppState(AppState.PROCESSING);
    setProcessingMessage("Compressing & Scanning..."); 
    
    try {
       // 1. Compress Image first
       const { base64, mime } = await compressImage(file);
       
       // 2. Send to API
       try {
         const result = await gemini.processImageTransaction(base64, mime);
         clearTimeout(timeoutId);
         await processTransactionResult(result);
       } catch (e) {
         console.error(e);
         clearTimeout(timeoutId);
         setAppState(AppState.ERROR);
         showToast("Could not analyze receipt. Try getting closer.", "error");
         setAppState(AppState.IDLE);
       }

    } catch (e) {
      clearTimeout(timeoutId);
      console.error(e);
      setAppState(AppState.ERROR);
      showToast("Failed to process image file", "error");
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerateInsights = async () => {
    if (transactions.length < 3) {
      showToast("Need 3+ transactions for insights", "info");
      return;
    }
    setAppState(AppState.ANALYZING);
    setProcessingMessage("AI CFO is thinking...");
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

  const handleDeleteTransaction = async (id: string) => {
    // Delete from Supabase if user is authenticated
    try {
      const { deleteSaleFromSupabase } = await import('./services/supabase');
      await deleteSaleFromSupabase(id);
    } catch (e) {
      console.error('Failed to delete from Supabase:', e);
    }
    
    // Update local state and localStorage
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
      <>
        {renderToasts()}
        <AuthPage onLogin={handleLogin} />
      </>
    );
  }

  // 3. Main App (Authenticated)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 pb-20">
      
      {renderToasts()}
      
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-200/50">
        <h1 className="text-xl font-bold tracking-tight text-emerald-900 flex items-center gap-2">
          SuaraKira
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">PRO</span>
        </h1>
        <div className="flex items-center gap-2">
           {/* View Switcher */}
           <div className="bg-slate-100 p-1 rounded-lg flex items-center mr-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                 onClick={() => setViewMode('analytics')}
                 className={`p-1.5 rounded-md transition-all ${viewMode === 'analytics' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
              >
                <ChartIcon className="w-4 h-4" />
              </button>
           </div>
           
           <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 -mr-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="p-6">
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
            />
            {transactions.length === 0 && (
              <div className="mt-8 text-center">
                 <button onClick={handleLoadDemoData} className="text-sm text-emerald-600 font-medium underline">
                   Tap here to load Demo Data
                 </button>
              </div>
            )}
           </>
        ) : (
          <Analytics transactions={transactions} />
        )}
      </main>

      <InputBar 
        onAudioSubmit={handleAudioSubmit}
        onTextSubmit={handleTextSubmit}
        onImageSubmit={handleImageSubmit}
        appState={appState} 
        customStatus={processingMessage}
      />

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onClearData={handleClearData}
      />
      
      {/* Logout button hidden inside Settings, but logic is here */}
      {isSettingsOpen && (
        <div className="fixed bottom-6 left-6 z-[70]">
           <button 
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-500 underline"
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