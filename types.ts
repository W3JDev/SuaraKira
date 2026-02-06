
export type TransactionType = 'sale' | 'expense';
export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  estimatedUnitCost?: number; // Inferred from AI for profitability analysis
}

export interface ReceiptDetails {
  merchantName?: string;
  merchantAddress?: string;
  invoiceNo?: string;
  date?: string; // String format from receipt e.g. "03-07-22"
  subtotal?: number;
  tax?: number;
  serviceCharge?: number;
  rounding?: number;
  items: ReceiptItem[];
}

export interface Transaction {
  id: string;
  item: string; // Acts as the "Title" or Merchant Name
  category?: string;
  quantity: number; // usually 1 for a full receipt
  price: number; // Total amount
  total: number; // Total amount
  type: TransactionType;
  timestamp: number;
  originalTranscript?: string;
  receipt?: ReceiptDetails; // New detailed structure
  createdBy: string; // 'admin' or staff ID
  attachment?: string; // Base64 string of image/pdf
}

export interface DailyStats {
  totalSales: number;
  transactionCount: number;
  totalExpenses: number;
}

export interface Anomaly {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface ItemMetric {
  name: string;
  value: string; // e.g. "RM 500" or "45 units"
}

export interface ItemProfitability {
  name: string;
  avgSellingPrice: number;
  estimatedCost: number; // Inferred by AI
  marginPercent: number;
  advice: string;
}

export interface FinancialInsight {
  financialHealth: string; // Executive summary
  anomalies: Anomaly[];
  bestSellers: {
    byRevenue: ItemMetric[];
    byQuantity: ItemMetric[];
  };
  itemProfitability: ItemProfitability[]; // New detailed metric
  margins: {
    overall: number;
    highestMarginItem: string;
    lowestMarginItem: string;
  };
  cashFlowAnalysis: string; // Text description of trends
  actionableAdvice: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  relatedTransactionId?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  ANALYZING = 'ANALYZING',
  CHATTING = 'CHATTING'
}
