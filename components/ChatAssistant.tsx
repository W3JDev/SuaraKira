import React, { useState, useEffect, useRef, useCallback } from "react";
import { MicIcon, SparklesIcon, XIcon, ListIcon } from "./Icons";
import { ChatMessage, Transaction } from "../types";
import * as gemini from "../services/geminiService";

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userRole: string;
  userName: string;
  onTransactionAdd: (data: any) => void;
  entryMode: "expense-only" | "income-only" | "both";
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  isOpen,
  onClose,
  transactions,
  userRole,
  userName,
  onTransactionAdd,
  entryMode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initialize Chat Session on Open
  useEffect(() => {
    if (isOpen) {
      gemini.startFinancialChat(transactions, userRole, userName);
      if (messages.length === 0) {
        let introText = `Hello ${userName}! I'm your Finance Assistant.\n\nYou can:\n`;

        if (entryMode === "expense-only") {
          introText += `• Say "I spend 20rm in mamak" to add expense\n• Say "grab 15" or "petrol 50"\n• Ask "how much did I spend today?"`;
        } else if (entryMode === "income-only") {
          introText += `• Say "sold 5 nasi lemak 25rm" to record sale\n• Say "total sales 100"\n• Ask "how much did I sell today?"`;
        } else {
          introText += `• Say "I spend 20rm in mamak" to add expense\n• Say "sold 5 nasi lemak 25rm" to record sale\n• Ask "how much did I sell today?"\n• Or chat normally!`;
        }

        setMessages([
          {
            id: "intro",
            role: "model",
            text: introText,
            timestamp: Date.now(),
          },
        ]);
      }
    }
  }, [isOpen, transactions, userRole, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Try simple transaction parser first for quick entry
      const isTransactionLike =
        /\b(spend|spent|pay|paid|bought|beli|bayar|sold|jual|dapat)\b/i.test(userInput);

      if (isTransactionLike) {
        try {
          const transactionData = await gemini.parseSimpleTransaction(userInput);

          // Filter based on entry mode
          if (entryMode === "expense-only" && transactionData.type === "sale") {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "model",
                text: "⚠️ You're in Expense-Only mode. Sales tracking is disabled. Change mode in Settings if needed.",
                timestamp: Date.now(),
              },
            ]);
            return;
          }

          if (entryMode === "income-only" && transactionData.type === "expense") {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "model",
                text: "⚠️ You're in Income-Only mode. Expense tracking is disabled. Change mode in Settings if needed.",
                timestamp: Date.now(),
              },
            ]);
            return;
          }

          // DIRECT SAVE - No review form!
          const transaction = {
            id: undefined, // Let DB generate UUID
            item:
              transactionData.merchantName ||
              transactionData.items?.[0]?.description ||
              "Transaction",
            category: transactionData.category || "Uncategorized",
            quantity: transactionData.items?.[0]?.quantity || 1,
            price: transactionData.grandTotal || 0,
            total: transactionData.grandTotal || 0,
            type: transactionData.type,
            timestamp: Date.now(),
            createdBy: userName,
            rawTextInput: userInput,
            sourceChannel: "CHAT_TEXT" as const,
            paymentMethod: "CASH" as const,
            isBusiness: true,
            status: "CONFIRMED" as const,
          };

          // Direct save - no confirmation needed!
          await onTransactionAdd(transaction);

          const confirmMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: `✅ SAVED! ${transactionData.type === "sale" ? "Sale" : "Expense"}: RM ${transactionData.grandTotal.toFixed(2)} ${transactionData.merchantName ? `at ${transactionData.merchantName}` : ""} ${transactionData.category ? `(${transactionData.category})` : ""}\n\nAnything else?`,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, confirmMsg]);
          return;
        } catch (parseError) {
          // If simple parser fails, fall back to chat
          console.log("Simple parser failed, using chat:", parseError);
        }
      }

      // Fall back to chat for queries or complex inputs
      const { text, transactionData } = await gemini.sendChatMessage(userInput);

      if (transactionData) {
        // DIRECT SAVE for chat extraction too
        const transaction = {
          id: undefined,
          item:
            transactionData.merchantName ||
            transactionData.items?.[0]?.description ||
            "Transaction",
          category: transactionData.category || "Uncategorized",
          quantity: transactionData.items?.[0]?.quantity || 1,
          price: transactionData.grandTotal || 0,
          total: transactionData.grandTotal || 0,
          type: transactionData.type,
          timestamp: Date.now(),
          createdBy: userName,
          rawTextInput: userInput,
          sourceChannel: "CHAT_TEXT" as const,
          paymentMethod: "CASH" as const,
          isBusiness: true,
          status: "CONFIRMED" as const,
        };
        await onTransactionAdd(transaction);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "I'm having trouble connecting right now. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 128000 };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4", audioBitsPerSecond: 128000 };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        // Convert to base64 and process with Gemini
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          setIsTyping(true);

          try {
            const result = await gemini.processTransactionInput(
              { audio: base64Audio, mime: mimeType },
              true,
            );

            // DIRECT SAVE from voice
            const transaction = {
              id: undefined,
              item: result.merchantName || result.items?.[0]?.description || "Voice Entry",
              category: result.category || "Uncategorized",
              quantity: result.items?.[0]?.quantity || 1,
              price: result.grandTotal || 0,
              total: result.grandTotal || 0,
              type: result.type,
              timestamp: Date.now(),
              createdBy: userName,
              sourceChannel: "CHAT_VOICE" as const,
              paymentMethod: "CASH" as const,
              isBusiness: true,
              status: "CONFIRMED" as const,
            };
            await onTransactionAdd(transaction);

            const confirmMsg: ChatMessage = {
              id: Date.now().toString(),
              role: "model",
              text: `✅ SAVED! Voice entry: ${result.type === "sale" ? "Sale" : "Expense"} RM ${result.grandTotal.toFixed(2)}`,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, confirmMsg]);
          } catch (err) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "model",
                text: "Sorry, couldn't process the audio. Please try again or type instead.",
                timestamp: Date.now(),
              },
            ]);
          } finally {
            setIsTyping(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Error:", err);
      alert("Microphone access required. Please check permissions.");
    }
  }, [onTransactionAdd]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg h-full sm:h-[80vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">SuaraKira AI</h3>
              <p className="text-[10px] text-emerald-100 opacity-90">
                Financial Assistant • Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700"
                }
              `}
              >
                {msg.text.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-1" : ""}>
                    {line}
                  </p>
                ))}
                <p className={`text-[9px] mt-1 text-right opacity-60`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            {/* Voice Record Button - PREVENT DOUBLE TAP */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isTyping || isRecording}
              className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-500 text-white scale-110 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              title="Hold to record voice"
            >
              <MicIcon className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isRecording
                  ? "Recording..."
                  : isTyping
                    ? "Saving..."
                    : entryMode === "expense-only"
                      ? "Try: 'I spend 20rm in mamak' or 'grab 15'"
                      : entryMode === "income-only"
                        ? "Try: 'sold 5 nasi lemak 25rm' or 'total sales 100'"
                        : "Try: 'I spend 20rm in mamak' or 'sold 5 items 100rm'"
              }
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white disabled:opacity-70"
              autoFocus
              disabled={isRecording || isTyping}
            />
            {/* PREVENT DOUBLE TAP on submit */}
            <button
              type="submit"
              disabled={!input.trim() || isTyping || isRecording}
              className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            {isRecording ? (
              <span className="text-red-500 font-semibold animate-pulse">
                🎤 Recording... Release to send
              </span>
            ) : entryMode === "expense-only" ? (
              "💡 Type or hold mic: 'spend 50 grab' or 'mamak 20'"
            ) : entryMode === "income-only" ? (
              "💡 Type or hold mic: 'sold 10 coffee 35rm' or 'total sales 100'"
            ) : (
              "💡 Type or hold mic to speak: 'spend 50 grab' or 'sold 10 coffee 35rm'"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
