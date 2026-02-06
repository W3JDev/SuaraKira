export type TransactionType = "sale" | "expense";
export type UserRole = "admin" | "staff";
export type EntryMode = "expense-only" | "income-only" | "both";
export type UseCase = "personal" | "business";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  entryMode?: EntryMode; // User's preferred entry mode
  useCase?: UseCase; // User's context: personal finance or business
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

  // New audit fields
  deviceId?: string;
  sourceChannel?:
    | "FORM"
    | "CHAT_TEXT"
    | "CHAT_VOICE"
    | "SCAN_ONLY"
    | "API"
    | "FAST_ENTRY_SALE"
    | "FAST_ENTRY_EXPENSE"
    | "LEGACY";
  direction?: "SALE_IN" | "EXPENSE_OUT" | "TRANSFER_IN" | "TRANSFER_OUT";
  paymentMethod?: "CASH" | "BKASH" | "BANK" | "OTHER";
  isBusiness?: boolean;
  locationId?: string;
  hasReceiptImage?: boolean;
  receiptImageId?: string;
  aiParsedPayload?: any;
  aiConfidenceScore?: number;
  merchantName?: string;
  merchantType?: string;
  rawTextInput?: string;
  occurredAt?: number;
  status?: "PENDING_REVIEW" | "CONFIRMED" | "FLAGGED" | "VOID";
  appVersion?: string;
  gpsMissingReason?: "PERMISSION_DENIED" | "NO_GPS" | "NOT_REQUESTED";
  receiptRequired?: boolean;
}

export interface DailyStats {
  totalSales: number; // For business: revenue from sales
  totalExpenses: number; // For business: costs/expenses
  totalIncome: number; // For personal: all money coming in
  totalSpent: number; // For personal: all money going out
  netAmount: number; // Sales - Expenses (business) or Income - Spent (personal)
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface Anomaly {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
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
  role: "user" | "model" | "system";
  text: string;
  timestamp: number;
  relatedTransactionId?: string;
}

export enum AppState {
  IDLE = "IDLE",
  RECORDING = "RECORDING",
  PROCESSING = "PROCESSING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  ANALYZING = "ANALYZING",
  CHATTING = "CHATTING",
  CAPTURING_LOCATION = "CAPTURING_LOCATION",
  UPLOADING_RECEIPT = "UPLOADING_RECEIPT",
}

// New types for audit and location tracking

export interface LocationData {
  id: string;
  organizationId?: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  capturedAt: string;
  capturedByUserId: string;
  placeName?: string;
  city?: string;
  country?: string;
}

export interface FileRecord {
  id: string;
  organizationId?: string;
  fileType: "RECEIPT_IMAGE" | "DOCUMENT" | "OTHER";
  storageBucket: string;
  storagePath: string;
  storageUrl?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  hashSha256?: string;
  createdAt: string;
  createdByUserId: string;
  source: "CAMERA_LIVE" | "EMAIL_FORWARD" | "UPLOAD" | "OTHER";
}

export interface AuditLogEntry {
  id: string;
  transactionId?: string;
  organizationId?: string;
  actorType: "USER" | "SYSTEM";
  actorId?: string;
  actionType:
    | "TRANSACTION_CREATED"
    | "TRANSACTION_UPDATED"
    | "TRANSACTION_STATUS_CHANGED"
    | "RECEIPT_ATTACHED"
    | "RECEIPT_REPLACED"
    | "CATEGORY_AUTO_ASSIGNED"
    | "CATEGORY_MANUALLY_CHANGED"
    | "LOCATION_CAPTURED"
    | "LOCATION_PERMISSION_DENIED"
    | "AI_PARSE_RETRY"
    | "TRANSACTION_DELETED"
    | "TRANSACTION_VOIDED";
  createdAt: string;
  ipAddress?: string;
  deviceId?: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
}

export type LocationPermissionStatus = "granted" | "denied" | "prompt" | "not_requested";
