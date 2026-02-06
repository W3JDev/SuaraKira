import { GoogleGenAI, Type, Chat } from "@google/genai";
import { TransactionType, Transaction, FinancialInsight, ChatMessage } from "../types";

let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI API KEY MISSING! Check your .env.local file.");
      throw new Error(
        "API Key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.",
      );
    }
    console.log("✅ Gemini API Key found:", apiKey.substring(0, 10) + "...");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

// Helper to sanitize JSON response from LLM
const cleanAndParseJSON = (text: string) => {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error. Raw Text:", text);
    throw new Error("Failed to parse AI response. Please try speaking more clearly.");
  }
};

const RECEIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    merchantName: { type: Type.STRING },
    merchantAddress: { type: Type.STRING },
    invoiceNo: { type: Type.STRING },
    date: { type: Type.STRING },
    category: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
          estimatedUnitCost: { type: Type.NUMBER },
        },
      },
    },
    subtotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER },
    serviceCharge: { type: Type.NUMBER },
    rounding: { type: Type.NUMBER },
    grandTotal: { type: Type.NUMBER },
    type: { type: Type.STRING, enum: ["sale", "expense"] },
    originalTranscript: { type: Type.STRING },
  },
  required: ["grandTotal", "type", "items"],
};

// --- CHAT AGENT (New) ---
let chatSession: Chat | null = null;

export const startFinancialChat = (
  transactions: Transaction[],
  userRole: string,
  userName: string,
) => {
  // Compress transaction history for context window
  const contextData = transactions
    .map(
      (t) =>
        `${t.receipt?.date || new Date(t.timestamp).toLocaleDateString()}: ${t.type.toUpperCase()} - ${t.item} (${t.quantity}x) = RM${t.total.toFixed(2)}`,
    )
    .join("\n");

  const SYSTEM_INSTRUCTION = `
  You are 'SuaraKira', a dedicated Financial AI Assistant for a Malaysian business.
  User Role: ${userRole} (${userName}).

  YOUR CAPABILITIES:
  1. QUERY: Answer questions about the provided transaction history (e.g., "How much satay sold yesterday?").
  2. ENTRY: If the user wants to add a transaction, EXTRACT the details into a specific JSON format.
  3. ADVICE: Provide brief financial advice if asked.

  CONTEXT (Current Data):
  ${contextData}

  RULES:
  - Language: Adapt to the user's language (English, Malay, Manglish, Tamil, Mandarin).
  - Currency: RM (Ringgit Malaysia).
  - Accuracy: If specific data is missing for a query, say "I don't have that record."
  - Transaction Entry: If the user input looks like a transaction (e.g., "Sold 5 nasi lemak"), respond with a SPECIAL JSON BLOCK:
    @@TRANSACTION_START@@
    { ...valid JSON matching RECEIPT_SCHEMA ... }
    @@TRANSACTION_END@@
    And also provide a polite confirmation text outside the block.
  - Ambiguity: If a transaction is unclear (e.g., "Sold food"), ASK for details (price, quantity) before generating the JSON.
  `;

  chatSession = getAi().chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const sendChatMessage = async (
  message: string,
): Promise<{ text: string; transactionData?: ParsedResult }> => {
  if (!chatSession) {
    console.error("❌ Chat session not initialized");
    throw new Error("Chat session not started");
  }

  try {
    console.log("📤 Sending message to Gemini:", message);
    const response = await chatSession.sendMessage({ message });
    const rawText = response.text || "";
    console.log("📥 Received response:", rawText.substring(0, 100) + "...");

    // Check for extraction block
    const transactionMatch = rawText.match(/@@TRANSACTION_START@@([\s\S]*?)@@TRANSACTION_END@@/);

    let transactionData: ParsedResult | undefined;
    let displayText = rawText;

    if (transactionMatch) {
      try {
        const parsed = cleanAndParseJSON(transactionMatch[1]);
        // Ensure the data has proper structure for Transaction type
        transactionData = {
          ...parsed,
          // Don't include id - let the database generate it
          grandTotal: parsed.grandTotal || parsed.total || 0,
          items: parsed.items || [
            {
              description: parsed.merchantName || "Item",
              quantity: 1,
              unitPrice: parsed.grandTotal || 0,
              total: parsed.grandTotal || 0,
            },
          ],
        };
        // Remove the JSON block from the display text so the user doesn't see code
        displayText = rawText.replace(transactionMatch[0], "").trim();
        if (!displayText) displayText = "Transaction recorded!";
      } catch (e) {
        console.error("Chat JSON extraction failed", e);
      }
    }

    return { text: displayText, transactionData };
  } catch (e: any) {
    console.error("❌ Chat Error Details:", {
      message: e?.message,
      status: e?.status,
      statusText: e?.statusText,
      error: e,
    });

    // More specific error messages
    let errorMsg = "Sorry, I lost connection. Please try again.";

    if (e?.message?.includes("API key")) {
      errorMsg = "❌ API Key error. Please check your VITE_GEMINI_API_KEY in .env.local";
    } else if (e?.message?.includes("quota") || e?.message?.includes("429")) {
      errorMsg = "⚠️ API quota exceeded. Please try again later or check your API key limits.";
    } else if (e?.message?.includes("network") || e?.message?.includes("fetch")) {
      errorMsg = "🌐 Network error. Please check your internet connection.";
    } else if (e?.status === 403 || e?.status === 401) {
      errorMsg = "🔒 Authentication failed. Please verify your API key is valid.";
    }

    return { text: errorMsg, transactionData: undefined };
  }
};

// Simple text-based transaction parser (for quick entry like "I spend 20rm in grab")
export const parseSimpleTransaction = async (text: string): Promise<ParsedResult> => {
  const SIMPLE_PARSER_PROMPT = `
You are a Malaysian transaction parser. Extract transaction details from casual text.

Examples:
- "I spend 20rm in mamak" → {type: "expense", grandTotal: 20, merchantName: "Mamak", category: "Food"}
- "sold 5 nasi lemak 25 ringgit" → {type: "sale", grandTotal: 25, merchantName: "Nasi Lemak", category: "Food", items: [{description: "Nasi Lemak", quantity: 5, unitPrice: 5, total: 25}]}
- "grab 15.50" → {type: "expense", grandTotal: 15.50, merchantName: "Grab", category: "Transport"}
- "paid rent 800" → {type: "expense", grandTotal: 800, merchantName: "Rent", category: "Rent"}

Rules:
- "spend/beli/pay/bayar" = expense
- "sold/jual/dapat" = sale
- Auto-detect category: mamak/food/makan=Food, grab/taxi=Transport, rent=Rent, etc.
- Default currency: RM
- Return valid JSON only
`;

  try {
    console.log("🔍 Parsing simple transaction:", text);
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: { parts: [{ text: `Extract transaction: "${text}"` }] },
      config: {
        systemInstruction: SIMPLE_PARSER_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RECEIPT_SCHEMA,
      },
    });

    if (!response.text) {
      console.error("❌ Empty response from Gemini");
      throw new Error("No response");
    }
    console.log("✅ Parse successful");
    const parsed = cleanAndParseJSON(response.text);

    // Ensure proper structure
    return {
      ...parsed,
      grandTotal: parsed.grandTotal || parsed.total || 0,
      items: parsed.items || [
        {
          description: parsed.merchantName || parsed.item || "Item",
          quantity: parsed.quantity || 1,
          unitPrice: (parsed.grandTotal || parsed.total || 0) / (parsed.quantity || 1),
          total: parsed.grandTotal || parsed.total || 0,
        },
      ],
      originalTranscript: text,
    };
  } catch (error: any) {
    console.error("❌ Simple parser error:", {
      message: error?.message,
      error,
    });

    if (error?.message?.includes("API key")) {
      throw new Error(
        "API Key error. Please check your .env.local file has VITE_GEMINI_API_KEY set.",
      );
    }

    throw new Error(
      "Couldn't understand that. Try: 'I spend 20rm in mamak' or 'sold 5 items for 100rm'",
    );
  }
};

// 1. Single Shot Input (Legacy/Quick)
export const processTransactionInput = async (
  input: string | { audio: string; mime: string },
  isAudio: boolean,
): Promise<ParsedResult> => {
  const modelName = isAudio ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";
  const SYSTEM_PROMPT_SIMPLE = `
  You are SuaraKira, an expert Malaysian accountant assistant.
  Extract transaction details. Default to RM (Ringgit).
  "Sold/Jual" = sale, "Bought/Beli/Pay" = expense.
  Round to 2 decimal places.
  JSON Only.
  `;

  try {
    console.log("🎙️ Processing transaction input (audio:", isAudio, ")");
    const contents = isAudio
      ? {
          parts: [
            { inlineData: { mimeType: (input as any).mime, data: (input as any).audio } },
            { text: "Extract transaction details." },
          ],
        }
      : { parts: [{ text: `Extract details: "${input}"` }] };

    const response = await getAi().models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT_SIMPLE,
        responseMimeType: "application/json",
        responseSchema: RECEIPT_SCHEMA,
      },
    });

    if (!response.text) {
      console.error("❌ No response from Gemini");
      throw new Error("No response");
    }
    console.log("✅ Transaction input processed");
    return cleanAndParseJSON(response.text) as ParsedResult;
  } catch (error: any) {
    console.error("❌ Gemini Input Processing Error:", {
      message: error?.message,
      isAudio,
      error,
    });

    if (error?.message?.includes("API key")) {
      throw new Error("API Key error. Check your .env.local file.");
    }

    throw new Error("Failed to process input. Please try again.");
  }
};

// 2. Image Processing (Document AI)
export const processImageTransaction = async (
  base64Image: string,
  mimeType: string,
): Promise<ParsedResult> => {
  const OCR_SYSTEM_PROMPT = `
  You are an advanced Financial Document AI for Malaysia.
  Analyze the image (Receipt, Invoice, or Handwritten Note).

  1. Extract Merchant, Date, Invoice No.
  2. Extract Line Items (Description, Qty, Price).
  3. Categorize (Sale vs Expense).
  4. Output strictly valid JSON.
  `;

  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-pro-preview", // Strongest vision model
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: "Extract financial data from this document." },
        ],
      },
      config: {
        systemInstruction: OCR_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RECEIPT_SCHEMA,
      },
    });

    if (!response.text) throw new Error("No response");
    return cleanAndParseJSON(response.text) as ParsedResult;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

// 3. Insights (Unchanged)
export const generateInsights = async (transactions: Transaction[]): Promise<FinancialInsight> => {
  try {
    const simpleData = transactions.map((t) => ({
      item: t.item,
      total: t.total,
      type: t.type,
      category: t.category,
      date: new Date(t.timestamp).toLocaleDateString(),
    }));

    const dataContext = JSON.stringify(simpleData.slice(0, 100));

    const response = await getAi().models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            text: `Act as a CFO for a Malaysian Hawker. Analyze: ${dataContext}`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            financialHealth: { type: Type.STRING },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
                },
              },
            },
            bestSellers: {
              type: Type.OBJECT,
              properties: {
                byRevenue: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, value: { type: Type.STRING } },
                  },
                },
                byQuantity: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, value: { type: Type.STRING } },
                  },
                },
              },
            },
            itemProfitability: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  avgSellingPrice: { type: Type.NUMBER },
                  estimatedCost: { type: Type.NUMBER },
                  marginPercent: { type: Type.NUMBER },
                  advice: { type: Type.STRING },
                },
              },
            },
            margins: {
              type: Type.OBJECT,
              properties: {
                overall: { type: Type.NUMBER },
                highestMarginItem: { type: Type.STRING },
                lowestMarginItem: { type: Type.STRING },
              },
            },
            cashFlowAnalysis: { type: Type.STRING },
            actionableAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (!response.text) throw new Error("No insight response");
    return cleanAndParseJSON(response.text) as FinancialInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    throw new Error("Failed to generate insights.");
  }
};

export interface ParsedResult {
  merchantName: string;
  merchantAddress?: string;
  invoiceNo?: string;
  date?: string;
  category: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    estimatedUnitCost?: number;
  }>;
  subtotal?: number;
  tax?: number;
  serviceCharge?: number;
  rounding?: number;
  grandTotal: number;
  type: TransactionType;
  originalTranscript?: string;
}
