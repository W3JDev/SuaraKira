import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType, Transaction, FinancialInsight } from "../types";

let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

// Helper to sanitize JSON response from LLM
const cleanAndParseJSON = (text: string) => {
  try {
    // 1. Remove markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Find the *first* '{' and the *last* '}' to extract the JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 3. Remove non-printable characters that might break JSON.parse
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error. Raw Text:", text);
    throw new Error("Failed to parse AI response. Please try speaking more clearly.");
  }
};

// Complex Receipt Schema
const RECEIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    merchantName: { type: Type.STRING, description: "Name of the shop, OR the main item name if this is a single voice command." },
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
          total: { type: Type.NUMBER },
          estimatedUnitCost: { type: Type.NUMBER, description: "Infer approximate cost price for this item based on Malaysian market context (only if unknown)." }
        }
      }
    },
    subtotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER, description: "Total tax amount (SST/GST)" },
    serviceCharge: { type: Type.NUMBER },
    rounding: { type: Type.NUMBER },
    grandTotal: { type: Type.NUMBER, description: "Final total amount. MUST NOT BE 0 if a price is mentioned." },
    type: { type: Type.STRING, enum: ["sale", "expense"], description: "Transaction type" }
  },
  required: ["merchantName", "grandTotal", "type", "items"]
};

// 1. Text/Audio Processing (Simple Schema)
export const processTransactionInput = async (input: string | { audio: string, mime: string }, isAudio: boolean): Promise<ParsedResult> => {
  const SYSTEM_PROMPT_SIMPLE = `
  You are SuaraKira, an expert Malaysian accountant assistant. 
  
  CORE RULES:
  1. ANALYZE intent: "Sold/Jual" = sale, "Bought/Beli/Pay" = expense.
  2. IF AUDIO/TEXT says "One Nasi Lemak 12 ringgit" or "Sold 1 Nasi Lemak":
     - merchantName: "Nasi Lemak" (Use the item name as the merchant/title if no shop name is spoken)
     - items: [{ description: "Nasi Lemak", quantity: 1, unitPrice: 12.00, total: 12.00 }]
     - grandTotal: 12.00
     - type: "sale"
  3. NEVER return grandTotal: 0.00 if a price is mentioned.
  4. Infer specific category (e.g., "Food", "Beverage") based on the item.
  5. OUTPUT VALID JSON ONLY. Do not add markdown formatting or explanations.
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

    if (!response.text) throw new Error("No response");
    return cleanAndParseJSON(response.text) as ParsedResult;

  } catch (error) {
    console.error("Gemini Input Processing Error:", error);
    throw new Error("Failed to process input.");
  }
};

// 2. Image Processing (Multi-Shot / Iterative Reasoning)
export const processImageTransaction = async (base64Image: string, mimeType: string): Promise<ParsedResult> => {
  
  // Advanced Multi-Shot Prompt for "Iterative Inspection" behavior
  const OCR_SYSTEM_PROMPT = `
  You are an advanced Financial OCR Engine with Malaysian context awareness.
  Your goal is to digitize the physical receipt perfectly.

  Use the following thought process to analyze the image, but output ONLY the final JSON object.

  1. GLOBAL CONTEXT & HEADER: 
     - Aggressively search for Invoice/Receipt Numbers (keywords: "Inv", "No", "Rec", "#"). 
     - Extract Date (check top and bottom of receipt).
     - Identify Merchant Name.

  2. LINE ITEMS: 
     - Extract every line item (Description, Qty, Price, Total). Handle alignments carefully.
     - FALLBACK: If line items are blurry, grouped, or unclear, INFER them based on context (e.g., "Mixed Groceries") or create a single item "Consolidated Items" with the verified subtotal. Do NOT return an empty items array.
     - ESTIMATE COST: If possible, infer a likely 'estimatedUnitCost' (cost price) for items based on Malaysian market knowledge to help with profit analysis later.

  3. MATH CHECK: 
     - Verify that sum(items) + tax/service charge matches the Grand Total.
     - CRITICAL: Ensure 'grandTotal' is the FINAL amount paid, distinguishing it from subtotal or cash tendered.

  4. CLASSIFICATION: 
     - Determine if this is a 'sale' or 'expense'.
     - Assign a relevant category.

  Return strictly valid JSON.
  `;

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview', // Strongest vision model for complex layouts
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: "Digitize this receipt." }
        ]
      },
      config: {
        systemInstruction: OCR_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RECEIPT_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response");
    return cleanAndParseJSON(response.text) as ParsedResult;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

// 3. Financial Insights (Unchanged)
export const generateInsights = async (transactions: Transaction[]): Promise<FinancialInsight> => {
  try {
    // Simplify transaction object for token limit, but keep item names
    const simpleData = transactions.map(t => ({
      item: t.item,
      total: t.total,
      type: t.type,
      category: t.category,
      date: new Date(t.timestamp).toLocaleDateString()
    }));

    const dataContext = JSON.stringify(simpleData.slice(0, 100));
    
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [{ 
          text: `Act as a CFO for a Malaysian Hawker. Analyze these transactions deeply.
          
          TASK 1: PROFITABILITY & MARGINS
          - Analyze the top selling items.
          - ESTIMATE the Cost of Goods Sold (COGS) for each item based on typical Malaysian ingredients prices.
          - Calculate the Profit Margin %.
          - Provide specific advice for each item.

          TASK 2: CASH FLOW
          - Analyze the flow of money in vs money out.
          - Identify days with negative cash flow.

          TASK 3: ADVICE
          - Provide strict, actionable business advice based on the metrics.
          
          Data: ${dataContext}` 
        }]
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
                  severity: { type: Type.STRING, enum: ['critical', 'warning', 'info'] }
                }
              }
            },
            bestSellers: {
              type: Type.OBJECT,
              properties: {
                byRevenue: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING }
                    }
                  }
                },
                byQuantity: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            itemProfitability: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  avgSellingPrice: { type: Type.NUMBER },
                  estimatedCost: { type: Type.NUMBER, description: "Estimated cost of ingredients per unit" },
                  marginPercent: { type: Type.NUMBER },
                  advice: { type: Type.STRING }
                }
              }
            },
            margins: {
              type: Type.OBJECT,
              properties: {
                overall: { type: Type.NUMBER },
                highestMarginItem: { type: Type.STRING },
                lowestMarginItem: { type: Type.STRING }
              }
            },
            cashFlowAnalysis: { type: Type.STRING },
            actionableAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (!response.text) throw new Error("No insight response");
    return cleanAndParseJSON(response.text) as FinancialInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    throw new Error("Failed to generate insights.");
  }
};

// Updated Interface to match Schema
interface ParsedResult {
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
}