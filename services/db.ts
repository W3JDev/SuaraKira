import { Transaction, DailyStats } from '../types';
import { getSalesFromSupabase, saveSaleToSupabase, deleteSaleFromSupabase, getCurrentUser } from './supabase';

const STORAGE_KEY = 'suarakira_transactions_v1';

// Helper: Convert Supabase sale to Transaction
const supabaseSaleToTransaction = (sale: any): Transaction => {
  return {
    id: sale.id,
    item: sale.item_name,
    category: sale.category,
    quantity: sale.quantity,
    price: sale.price,
    total: sale.total,
    type: sale.type,
    timestamp: new Date(sale.created_at).getTime(),
    originalTranscript: sale.voice_input,
    receipt: sale.receipt_data,
  };
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      // User is authenticated - fetch from Supabase
      const { data, error } = await getSalesFromSupabase();
      if (error) {
        console.error("Failed to load from Supabase:", error);
        // Fallback to localStorage
        return getLocalTransactions();
      }
      return data ? data.map(supabaseSaleToTransaction) : [];
    } else {
      // Not authenticated - use localStorage
      return getLocalTransactions();
    }
  } catch (e) {
    console.error("Failed to load transactions", e);
    return getLocalTransactions();
  }
};

// Local storage fallback
const getLocalTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Failed to load from localStorage", e);
    return [];
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      // Save to Supabase
      const { data, error } = await saveSaleToSupabase({
        item_name: transaction.item,
        category: transaction.category,
        quantity: transaction.quantity,
        price: transaction.price,
        total: transaction.total,
        type: transaction.type,
        voice_input: transaction.originalTranscript,
        receipt_data: transaction.receipt,
      });
      
      if (error) {
        console.error('Failed to save to Supabase:', error);
        // Fallback to localStorage
        return saveLocalTransaction(transaction);
      }
      
      // Return updated list from Supabase
      return await getTransactions();
    } else {
      // Not authenticated - use localStorage
      return saveLocalTransaction(transaction);
    }
  } catch (e) {
    console.error('Error saving transaction:', e);
    return saveLocalTransaction(transaction);
  }
};

const saveLocalTransaction = (transaction: Transaction): Transaction[] => {
  const current = getLocalTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateTransaction = (updatedTransaction: Transaction): Transaction[] => {
  const current = getTransactions();
  const index = current.findIndex(t => t.id === updatedTransaction.id);
  if (index !== -1) {
    current[index] = updatedTransaction;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return current;
};

export const clearTransactions = async (): Promise<void> => {
  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY);
  
  // Note: For Supabase, we keep cloud data intact
  // Users should delete individual transactions if needed
};

export const seedDemoData = (): Transaction[] => {
  const now = Date.now();
  const DAY_MS = 86400000;
  
  const demoTransactions: Transaction[] = [
    // Today
    { id: '1', item: 'Nasi Lemak Ayam', category: 'Food', quantity: 3, price: 12.00, total: 36.00, type: 'sale', timestamp: now - 3600000 },
    { id: '2', item: 'Teh Tarik', category: 'Beverage', quantity: 5, price: 2.50, total: 12.50, type: 'sale', timestamp: now - 7200000 },
    { id: '3', item: 'Plastic Bags Supplier', category: 'Packaging', quantity: 1, price: 45.00, total: 45.00, type: 'expense', timestamp: now - 10800000 },
    
    // Yesterday
    { id: '4', item: 'Nasi Lemak Biasa', category: 'Food', quantity: 10, price: 5.00, total: 50.00, type: 'sale', timestamp: now - DAY_MS - 3600000 },
    { id: '5', item: 'Chicken Stocks', category: 'Ingredients', quantity: 10, price: 15.00, total: 150.00, type: 'expense', timestamp: now - DAY_MS - 18000000 },
    
    // 2 Days ago
    { id: '6', item: 'Nasi Lemak Ayam', category: 'Food', quantity: 8, price: 12.00, total: 96.00, type: 'sale', timestamp: now - (DAY_MS * 2) - 5000000 },
    { id: '7', item: 'Milo Ais', category: 'Beverage', quantity: 4, price: 3.50, total: 14.00, type: 'sale', timestamp: now - (DAY_MS * 2) - 6000000 },
    
    // 3 Days ago
    { id: '8', item: 'Gas Cylinder', category: 'Utilities', quantity: 1, price: 30.00, total: 30.00, type: 'expense', timestamp: now - (DAY_MS * 3) },
    { id: '9', item: 'Nasi Lemak Ayam', category: 'Food', quantity: 15, price: 12.00, total: 180.00, type: 'sale', timestamp: now - (DAY_MS * 3) - 1000000 },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoTransactions));
  return demoTransactions;
};

export const getDailyStats = (transactions: Transaction[]): DailyStats => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const todayTransactions = transactions.filter(t => t.timestamp >= startOfDay);

  return todayTransactions.reduce((acc, curr) => {
    if (curr.type === 'sale') {
      acc.totalSales += curr.total;
    } else {
      acc.totalExpenses += curr.total;
    }
    acc.transactionCount += 1;
    return acc;
  }, { totalSales: 0, transactionCount: 0, totalExpenses: 0 } as DailyStats);
};