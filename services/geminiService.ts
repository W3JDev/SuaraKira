import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType, Transaction, FinancialInsight } from "../types";

let ai: GoogleGenAI | null = null;

const getApiKey = (): string => {
  // Check Vite environment variable
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!key || key === 'your_api_key_here') {
    throw new Error(
      'Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file or Vercel environment variables.'
    );
  }
  
  return key;
};

const getAi = () => {
  if (!ai) {
    try {
      const apiKey = getApiKey();
      ai = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      throw error;
    }
  }
  return ai;
};

// Robust Helper to sanitize and parse JSON response from LLM
const cleanAndParseJSON = (text: string) => {
  if (!text) {
    throw new Error("AI returned empty response.");
  }

  let cleaned = text.trim();

  try {
    // 1. Remove markdown code blocks (inclusive of json tag or not)
    cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Locate the outer-most JSON object bounds
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else {
       // Fallback: Check for array if object not found (though schema usually enforces object)
       const firstSquare = cleaned.indexOf('[');
       const lastSquare = cleaned.lastIndexOf(']');
       if (firstSquare !== -1 && lastSquare !== -1) {
          cleaned = cleaned.substring(firstSquare, lastSquare + 1);
       } else {
          // No valid brackets found
          throw new Error("No JSON object or array found in text.");
       }
    }

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error Details:", e);
    console.error("Raw Text:", text);
    console.error("Cleaned Text:", cleaned);
    
    // Create a user-friendly error snippet
    const snippet = cleaned.length > 100 ? cleaned.substring(0, 100) + "..." : cleaned;
    throw new Error(`Failed to parse receipt data. syntax error: ${(e as Error).message}. Snippet: ${snippet}`);
  }
};

// Complex Receipt Schema
const RECEIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    merchantName: { type: Type.STRING, description: "Name of the shop/merchant" },
    merchantAddress: { type: Type.STRING, description: "Address if available" },
    invoiceNo: { type: Type.STRING, description: "Invoice/Receipt Number" },
    date: { type: Type.STRING, description: "Date printed on receipt" },
    category: { 
      type: Type.STRING, 
      description: "Category: 'Ingredients', 'Packaging', 'Utilities', 'Rent', 'Wages', 'Equipment', 'Stock', 'Food', 'Beverage'." 
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          total: { type: Type.NUMBER }
        }
      }
    },
    subtotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER, description: "Total tax amount (SST/GST)" },
    serviceCharge: { type: Type.NUMBER },
    rounding: { type: Type.NUMBER },
    grandTotal: { type: Type.NUMBER, description: "Final total amount paid" },
    type: { type: Type.STRING, enum: ["sale", "expense"], description: "Transaction type" }
  },
  required: ["merchantName", "grandTotal", "type", "items"]
};

interface ParsedResult {
  merchantName?: string;
  merchantAddress?: string;
  invoiceNo?: string;
  date?: string;
  category?: string;
  items?: any[];
  subtotal?: number;
  tax?: number;
  serviceCharge?: number;
  rounding?: number;
  grandTotal: number;
  type: TransactionType;
}

// 1. Text/Audio Processing (Simple Schema)
export const processTransactionInput = async (input: string | { audio: string, mime: string }, isAudio: boolean): Promise<ParsedResult> => {
  const SYSTEM_PROMPT_SIMPLE = `
  You are SuaraKira, an expert Malaysian accountant assistant. 
  Extract structured data.
  If the input implies multiple items, summarize them into the 'items' array.
  Infer category and transaction type.
  `;

  try {
    const contents = isAudio 
      ? {
          parts: [
            { inlineData: { mimeType: (input as any).mime, data: (input as any).audio } },
            { text: "Extract transaction details." }
          ]
        }
      : { parts: [{ text: `Extract transaction details from this text: "${input}"` }] };

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT_SIMPLE,
        responseMimeType: "application/json",
        responseSchema: RECEIPT_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response text from AI");
    return cleanAndParseJSON(response.text) as ParsedResult;

  } catch (error) {
    console.error("Gemini Input Processing Error:", error);
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Failed to process input.");
  }
};

// 2. Image Processing (Using Flash for Speed & Reliability)
export const processImageTransaction = async (base64Image: string, mimeType: string): Promise<ParsedResult> => {
  const SYSTEM_PROMPT_VISION = `
  You are an expert OCR accountant.
  Analyze this receipt image.
  Extract: merchant name, total amount, date, and line items.
  Categorize the expense.
  Return STRICTLY valid JSON.
  `;

  try {
    // Using gemini-2.5-flash for Vision as it is faster and more lenient with standard image payloads than Pro
    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: "Extract all receipt data into JSON." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT_VISION,
        responseMimeType: "application/json",
        responseSchema: RECEIPT_SCHEMA
      }
    });

    if (!response.text) throw new Error("AI returned empty text response");
    
    const parsed = cleanAndParseJSON(response.text);

    // Additional validation layer
    if (typeof parsed !== 'object' || parsed === null) {
        throw new Error("AI returned invalid data structure (not an object)");
    }

    return parsed as ParsedResult;

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Propagate the specific error message from cleanAndParseJSON or the API
    if (error instanceof Error) {
        throw new Error(`Receipt Scan Failed: ${error.message}`);
    }
    throw new Error("Receipt Scan Failed: Unknown error occurred.");
  }
};

// 3. Financial Insights (Complex Reasoning - Using Pro Model)
export const generateInsights = async (transactions: Transaction[]): Promise<FinancialInsight> => {
  // Limit context window by taking last 50 transactions if list is too long
  const recentTx = transactions.slice(0, 50);

  const SYSTEM_PROMPT_INSIGHTS = `
  You are an expert CFO for a Malaysian Hawker Stall.
  Analyze the provided transaction history JSON.
  
  Output a JSON object with:
  1. financialHealth: A 1-sentence summary of the business status.
  2. anomalies: Array of objects {title, description, severity: 'critical'|'warning'|'info'}. Look for unusual expenses or price drops.
  3. bestSellers: Analyze sales items.
  4. itemProfitability: Infer cost of goods sold (COGS) for food items. E.g., if Nasi Lemak sells for RM12, estimate RM5 cost. Calculate margin %.
  5. margins: Calculate overall net margin %. Identify highest/lowest margin items.
  6. cashFlowAnalysis: A paragraph describing money in vs money out trends.
  7. actionableAdvice: 3 specific bullet points to increase profit.

  Use Malaysian Ringgit (RM) context.
  `;

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for complex reasoning
      contents: {
        parts: [{ text: JSON.stringify(recentTx) }]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT_INSIGHTS,
        responseMimeType: "application/json",
        // We let the model structure it freely as JSON, or we could define a strict schema.
        // For insights, allowing flexible JSON is often better, but let's try strict to match our interface.
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             financialHealth: { type: Type.STRING },
             anomalies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, description: {type: Type.STRING}, severity: {type: Type.STRING} } } },
             bestSellers: { type: Type.OBJECT, properties: { byRevenue: { type: Type.ARRAY, items: {type: Type.OBJECT, properties: { name: {type: Type.STRING}, value: {type: Type.STRING}}}}, byQuantity: { type: Type.ARRAY, items: {type: Type.OBJECT, properties: { name: {type: Type.STRING}, value: {type: Type.STRING}}}} } },
             itemProfitability: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, avgSellingPrice: {type: Type.NUMBER}, estimatedCost: {type: Type.NUMBER}, marginPercent: {type: Type.NUMBER}, advice: {type: Type.STRING} } } },
             margins: { type: Type.OBJECT, properties: { overall: {type: Type.NUMBER}, highestMarginItem: {type: Type.STRING}, lowestMarginItem: {type: Type.STRING} } },
             cashFlowAnalysis: { type: Type.STRING },
             actionableAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }
           }
        }
      }
    });

    if (!response.text) throw new Error("No response text from AI");
    return cleanAndParseJSON(response.text) as FinancialInsight;

  } catch (error) {
    console.error("Gemini Insights Error:", error);
    if (error instanceof Error) throw new Error(`Insights Failed: ${error.message}`);
    throw new Error("Failed to generate insights.");
  }
};