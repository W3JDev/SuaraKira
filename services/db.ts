import { supabase, getProfile } from "./supabase";
import { Transaction, DailyStats, UserRole } from "../types";

// Cache for current user profile
let currentUserProfile: any = null;

export const getCurrentRole = async (): Promise<UserRole> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "staff";

    if (!currentUserProfile || currentUserProfile.id !== user.id) {
      currentUserProfile = await getProfile(user.id);
    }

    return currentUserProfile?.role || "staff";
  } catch (e) {
    console.error("Error getting role:", e);
    return "staff";
  }
};

export const setCurrentRole = async (role: UserRole) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({ role }).eq("id", user.id);

    if (error) throw error;
    currentUserProfile = null; // Clear cache
  } catch (e) {
    console.error("Error setting role:", e);
  }
};

export const getCurrentUser = async (): Promise<string> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "Guest";

    if (!currentUserProfile || currentUserProfile.id !== user.id) {
      currentUserProfile = await getProfile(user.id);
    }

    return currentUserProfile?.full_name || user.email || "User";
  } catch (e) {
    console.error("Error getting user:", e);
    return "Guest";
  }
};

export const getTransactions = async (role?: UserRole): Promise<Transaction[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const profile = await getProfile(user.id);
    const userRole = role || profile.role;

    let query = supabase.from("transactions").select("*").order("timestamp", { ascending: false });

    // Staff only see their own transactions
    if (userRole === "staff") {
      query = query.eq("created_by", user.id);
    }
    // Admin sees all in organization
    else if (profile.organization_id) {
      query = query.eq("organization_id", profile.organization_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform from DB format to app format
    return (data || []).map(transformDbToTransaction);
  } catch (e) {
    console.error("Failed to load transactions:", e);
    return [];
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<Transaction[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const profile = await getProfile(user.id);

    // Transform to DB format - let Supabase generate UUID if id is a timestamp
    const dbTransaction: any = {
      item: transaction.item,
      category: transaction.category,
      quantity: transaction.quantity,
      price: transaction.price,
      total: transaction.total,
      type: transaction.type,
      original_transcript: transaction.originalTranscript,
      receipt_data: transaction.receipt,
      attachment: transaction.attachment,
      created_by: user.id,
      organization_id: profile.organization_id,
      timestamp: new Date(transaction.timestamp).toISOString(),

      // New fields (optional, backward compatible)
      source_channel: transaction.sourceChannel || "LEGACY",
      direction: transaction.type === "sale" ? "SALE_IN" : "EXPENSE_OUT",
      payment_method: transaction.paymentMethod || "CASH",
      is_business: transaction.isBusiness ?? true,
      status: transaction.status || "CONFIRMED",
    };

    // Only include id if it's a valid UUID (for updates)
    // Otherwise let DB generate new UUID
    if (transaction.id && transaction.id.includes("-")) {
      dbTransaction.id = transaction.id;
    }

    const { error } = await supabase.from("transactions").insert(dbTransaction);

    if (error) throw error;

    // Return updated list
    return await getTransactions();
  } catch (e) {
    console.error("Failed to save transaction:", e);
    throw e;
  }
};

export const updateTransaction = async (
  updatedTransaction: Transaction,
): Promise<Transaction[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const dbTransaction = {
      item: updatedTransaction.item,
      category: updatedTransaction.category,
      quantity: updatedTransaction.quantity,
      price: updatedTransaction.price,
      total: updatedTransaction.total,
      type: updatedTransaction.type,
      original_transcript: updatedTransaction.originalTranscript,
      receipt_data: updatedTransaction.receipt,
      attachment: updatedTransaction.attachment,
      timestamp: new Date(updatedTransaction.timestamp).toISOString(),
    };

    const { error } = await supabase
      .from("transactions")
      .update(dbTransaction)
      .eq("id", updatedTransaction.id);

    if (error) throw error;

    return await getTransactions();
  } catch (e) {
    console.error("Failed to update transaction:", e);
    throw e;
  }
};

export const deleteTransaction = async (id: string): Promise<Transaction[]> => {
  try {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) throw error;

    return await getTransactions();
  } catch (e) {
    console.error("Failed to delete transaction:", e);
    throw e;
  }
};

export const clearTransactions = async (): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Only delete user's own transactions (staff) or all in org (admin)
    const profile = await getProfile(user.id);

    let query = supabase.from("transactions").delete();

    if (profile.role === "staff") {
      query = query.eq("created_by", user.id);
    } else if (profile.organization_id) {
      query = query.eq("organization_id", profile.organization_id);
    }

    const { error } = await query.neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all matching

    if (error) throw error;
  } catch (e) {
    console.error("Failed to clear transactions:", e);
  }
};

export const seedDemoData = async (): Promise<Transaction[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const profile = await getProfile(user.id);
    const now = Date.now();
    const DAY_MS = 86400000;

    const demoTransactions = [
      // Today
      {
        item: "Nasi Lemak Ayam",
        category: "Food",
        quantity: 3,
        price: 12.0,
        total: 36.0,
        type: "sale" as const,
        timestamp: now - 3600000,
      },
      {
        item: "Teh Tarik",
        category: "Beverage",
        quantity: 5,
        price: 2.5,
        total: 12.5,
        type: "sale" as const,
        timestamp: now - 7200000,
      },
      {
        item: "Plastic Bags Supplier",
        category: "Packaging",
        quantity: 1,
        price: 45.0,
        total: 45.0,
        type: "expense" as const,
        timestamp: now - 10800000,
      },

      // Yesterday
      {
        item: "Nasi Lemak Biasa",
        category: "Food",
        quantity: 10,
        price: 5.0,
        total: 50.0,
        type: "sale" as const,
        timestamp: now - DAY_MS - 3600000,
      },
      {
        item: "Chicken Stocks",
        category: "Ingredients",
        quantity: 10,
        price: 15.0,
        total: 150.0,
        type: "expense" as const,
        timestamp: now - DAY_MS - 18000000,
      },

      // 2 Days ago
      {
        item: "Nasi Lemak Ayam",
        category: "Food",
        quantity: 8,
        price: 12.0,
        total: 96.0,
        type: "sale" as const,
        timestamp: now - DAY_MS * 2 - 5000000,
      },
      {
        item: "Milo Ais",
        category: "Beverage",
        quantity: 4,
        price: 3.5,
        total: 14.0,
        type: "sale" as const,
        timestamp: now - DAY_MS * 2 - 6000000,
      },

      // 3 Days ago
      {
        item: "Gas Cylinder",
        category: "Utilities",
        quantity: 1,
        price: 30.0,
        total: 30.0,
        type: "expense" as const,
        timestamp: now - DAY_MS * 3,
      },
      {
        item: "Nasi Lemak Ayam",
        category: "Food",
        quantity: 15,
        price: 12.0,
        total: 180.0,
        type: "sale" as const,
        timestamp: now - DAY_MS * 3 - 1000000,
      },
    ];

    for (const txn of demoTransactions) {
      const dbTransaction = {
        item: txn.item,
        category: txn.category,
        quantity: txn.quantity,
        price: txn.price,
        total: txn.total,
        type: txn.type,
        created_by: user.id,
        organization_id: profile.organization_id,
        timestamp: new Date(txn.timestamp).toISOString(),
      };

      await supabase.from("transactions").insert(dbTransaction);
    }

    return await getTransactions();
  } catch (e) {
    console.error("Failed to seed data:", e);
    return [];
  }
};

export const getDateRangeStats = (
  transactions: Transaction[],
  useCase: "personal" | "business" = "business",
  startDate?: Date,
  endDate?: Date,
): DailyStats => {
  let filteredTransactions = transactions;

  if (startDate && endDate) {
    const start = startDate.getTime();
    const end = endDate.getTime();
    filteredTransactions = transactions.filter((t) => t.timestamp >= start && t.timestamp <= end);
  }

  const todayTransactions = filteredTransactions;

  const stats = todayTransactions.reduce(
    (acc, curr) => {
      if (curr.type === "sale") {
        acc.totalSales += curr.total;
        acc.totalIncome += curr.total;
        acc.incomeCount += 1;
      } else {
        acc.totalExpenses += curr.total;
        acc.totalSpent += curr.total;
        acc.expenseCount += 1;
      }
      acc.transactionCount += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalExpenses: 0,
      totalIncome: 0,
      totalSpent: 0,
      netAmount: 0,
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0,
    } as DailyStats,
  );

  // Calculate net amount based on use case
  if (useCase === "business") {
    stats.netAmount = stats.totalSales - stats.totalExpenses;
  } else {
    stats.netAmount = stats.totalIncome - stats.totalSpent;
  }

  return stats;
};

// Helper: Get stats for today only
export const getDailyStats = (
  transactions: Transaction[],
  useCase: "personal" | "business" = "business",
): DailyStats => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  return getDateRangeStats(transactions, useCase, startOfDay, endOfDay);
};

// Helper: Get stats for this week
export const getWeekStats = (
  transactions: Transaction[],
  useCase: "personal" | "business" = "business",
): DailyStats => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return getDateRangeStats(transactions, useCase, startOfWeek, endOfWeek);
};

// Helper: Get stats for this month
export const getMonthStats = (
  transactions: Transaction[],
  useCase: "personal" | "business" = "business",
): DailyStats => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return getDateRangeStats(transactions, useCase, startOfMonth, endOfMonth);
};

// Helper: Get stats for this year
export const getYearStats = (
  transactions: Transaction[],
  useCase: "personal" | "business" = "business",
): DailyStats => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  return getDateRangeStats(transactions, useCase, startOfYear, endOfYear);
};

// Realtime subscription helper
export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void) => {
  const channel = supabase
    .channel("transactions-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
      },
      async () => {
        // Reload transactions when any change occurs
        const transactions = await getTransactions();
        callback(transactions);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Helper to transform DB format to App format
function transformDbToTransaction(dbRow: any): Transaction {
  return {
    id: dbRow.id,
    item: dbRow.item,
    category: dbRow.category,
    quantity: Number(dbRow.quantity),
    price: Number(dbRow.price),
    total: Number(dbRow.total),
    type: dbRow.type,
    timestamp: new Date(dbRow.timestamp).getTime(),
    originalTranscript: dbRow.original_transcript,
    receipt: dbRow.receipt_data,
    attachment: dbRow.attachment,
    createdBy: dbRow.created_by,
  };
}
