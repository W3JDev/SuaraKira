import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicIcon, SparklesIcon, XIcon } from "./Icons";
import { ChatMessage, Transaction } from "../types";
import * as gemini from "../services/geminiService";
import IOSDesign from "../utils/iosDesignSystem";
import IOSAnimations from "../utils/iosAnimations";

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userRole: string;
  userName: string;
  onTransactionAdd: (data: any) => void;
  entryMode: "expense-only" | "income-only" | "both";
}

// iOS iMessage-style Typing Indicator
const TypingIndicator: React.FC = () => (
  <div className="flex gap-1 p-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full"
        style={{ background: IOSDesign.colors.light.textTertiary }}
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (isOpen) {
      gemini.startFinancialChat(transactions, userRole, userName);
      if (messages.length === 0) {
        let introText = `Hello ${userName}! 👋\n\nI'm your AI Finance Assistant.\n\n`;
        
        if (entryMode === "expense-only") {
          introText += `💸 Say "I spend 20rm in mamak"\n📝 Or "grab 15", "petrol 50"\n❓ Ask "how much did I spend today?"`;
        } else if (entryMode === "income-only") {
          introText += `💰 Say "sold 5 nasi lemak 25rm"\n📊 Or "total sales 100"\n❓ Ask "how much did I sell today?"`;
        } else {
          introText += `💸 Say "I spend 20rm" for expenses\n💰 Say "sold 5 items 25rm" for sales\n💬 Or just chat naturally!`;
        }

        setMessages([{
          id: "intro",
          role: "model",
          text: introText,
          timestamp: Date.now(),
        }]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    IOSDesign.haptics.light();
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
      const isTransactionLike = /\b(spend|spent|pay|paid|bought|beli|bayar|sold|jual|dapat)\b/i.test(userInput);

      if (isTransactionLike) {
        try {
          const transactionData = await gemini.parseSimpleTransaction(userInput);

          if (entryMode === "expense-only" && transactionData.type === "sale") {
            setMessages((prev) => [...prev, {
              id: Date.now().toString(),
              role: "model",
              text: "⚠️ You're in Expense-Only mode. Sales tracking is disabled.",
              timestamp: Date.now(),
            }]);
            setIsTyping(false);
            return;
          }

          if (entryMode === "income-only" && transactionData.type === "expense") {
            setMessages((prev) => [...prev, {
              id: Date.now().toString(),
              role: "model",
              text: "⚠️ You're in Income-Only mode. Expense tracking is disabled.",
              timestamp: Date.now(),
            }]);
            setIsTyping(false);
            return;
          }

          const transaction = {
            id: undefined,
            item: transactionData.merchantName || transactionData.items?.[0]?.description || "Transaction",
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
          IOSDesign.haptics.success();

          const confirmMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: `✅ Saved!\n\n${transactionData.type === "sale" ? "💰 Sale" : "💸 Expense"}: RM ${transactionData.grandTotal.toFixed(2)}\n${transactionData.merchantName ? `📍 ${transactionData.merchantName}` : ""}\n${transactionData.category ? `🏷️ ${transactionData.category}` : ""}\n\nAnything else?`,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, confirmMsg]);
          setIsTyping(false);
          return;
        } catch (parseError) {
          console.log("Parser fallback");
        }
      }

      const { text, transactionData } = await gemini.sendChatMessage(userInput);

      if (transactionData) {
        const transaction = {
          id: undefined,
          item: transactionData.merchantName || transactionData.items?.[0]?.description || "Transaction",
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
        IOSDesign.haptics.success();
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      IOSDesign.haptics.error();
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "model",
        text: "🤔 I'm having trouble connecting. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const glassStyle = IOSDesign.getGlassMorphismStyle('light', 'thick');

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: IOSDesign.colors.light.overlay }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Chat Container - iOS Message Style */}
        <motion.div
          className="relative w-full h-full flex flex-col"
          style={{ 
            background: IOSDesign.colors.light.background,
            maxWidth: '100vw',
          }}
          variants={IOSAnimations.modal.bottomSheet}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header - iOS Style */}
          <div
            className="shrink-0 px-4 py-3 flex items-center justify-between"
            style={{
              background: glassStyle.background,
              backdropFilter: glassStyle.backdropFilter,
              WebkitBackdropFilter: glassStyle.backdropFilter,
              borderBottom: `1px solid ${IOSDesign.colors.light.separator}`,
              boxShadow: IOSDesign.getIOSShadow('sm'),
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: IOSDesign.gradients.blue }}
              >
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base" style={{ color: IOSDesign.colors.light.textPrimary }}>
                  AI Assistant
                </h2>
                <p className="text-xs" style={{ color: IOSDesign.colors.light.textTertiary }}>
                  {isTyping ? 'typing...' : 'Online'}
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => {
                IOSDesign.haptics.light();
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: IOSDesign.colors.light.background }}
              whileTap={{ scale: 0.9 }}
              transition={IOSDesign.animations.spring}
            >
              <XIcon className="w-5 h-5" style={{ color: IOSDesign.colors.light.textSecondary }} />
            </motion.button>
          </div>

          {/* Messages Area - With proper bottom padding to avoid nav overlap */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 space-y-3"
            style={{ 
              background: IOSDesign.colors.light.background,
              scrollBehavior: 'smooth',
              paddingTop: '16px',
              paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', // Input bar height (72px) + extra spacing (8px)
            }}
          >
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                variants={IOSAnimations.chat.bubble}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <div
                  className="max-w-[75%] rounded-3xl px-4 py-3"
                  style={{
                    background: msg.role === 'user' 
                      ? IOSDesign.gradients.blue
                      : glassStyle.background,
                    backdropFilter: msg.role === 'model' ? glassStyle.backdropFilter : undefined,
                    WebkitBackdropFilter: msg.role === 'model' ? glassStyle.backdropFilter : undefined,
                    border: msg.role === 'model' ? glassStyle.border : undefined,
                    boxShadow: IOSDesign.getIOSShadow('sm'),
                  }}
                >
                  <p
                    className="text-base leading-relaxed whitespace-pre-wrap"
                    style={{
                      color: msg.role === 'user' ? '#FFFFFF' : IOSDesign.colors.light.textPrimary,
                      fontFamily: IOSDesign.typography.fontFamily.system,
                    }}
                  >
                    {msg.text}
                  </p>
                  <p
                    className="text-[10px] mt-1"
                    style={{
                      color: msg.role === 'user' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : IOSDesign.colors.light.textTertiary,
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="rounded-3xl"
                  style={{
                    background: glassStyle.background,
                    backdropFilter: glassStyle.backdropFilter,
                    WebkitBackdropFilter: glassStyle.backdropFilter,
                    border: glassStyle.border,
                  }}
                >
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Bar - iOS Keyboard Toolbar Style with Voice Button */}
          <div
            className="shrink-0 px-4 py-3"
            style={{
              background: glassStyle.background,
              backdropFilter: glassStyle.backdropFilter,
              WebkitBackdropFilter: glassStyle.backdropFilter,
              borderTop: `1px solid ${IOSDesign.colors.light.separator}`,
              boxShadow: `0 -4px 12px ${IOSDesign.colors.light.overlayLight}`,
            }}
          >
            <form onSubmit={handleSend} className="flex items-center gap-2">
              {/* Voice Input Button - Primary Feature (SuaraKira = Voice Count!) */}
              <motion.button
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                  boxShadow: '0 4px 12px rgba(52, 199, 89, 0.4), 0 2px 6px rgba(52, 199, 89, 0.3)',
                }}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={IOSDesign.animations.spring}
                onClick={() => {
                  IOSDesign.haptics.medium();
                  // TODO: Implement voice recording
                  alert('Voice recording will be implemented here!\n\nSuaraKira = Voice Count 🎤');
                }}
              >
                <MicIcon className="w-6 h-6 text-white" />
              </motion.button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or use voice..."
                className="flex-1 px-4 py-3 rounded-full text-base outline-none"
                style={{
                  background: IOSDesign.colors.light.backgroundSecondary,
                  border: `1px solid ${IOSDesign.colors.light.separator}`,
                  color: IOSDesign.colors.light.textPrimary,
                  fontFamily: IOSDesign.typography.fontFamily.system,
                }}
              />
              <motion.button
                type="submit"
                disabled={!input.trim()}
                className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-40"
                style={{
                  background: input.trim() ? IOSDesign.gradients.blue : IOSDesign.colors.light.textQuaternary,
                  boxShadow: input.trim() ? IOSDesign.getIOSShadow('md') : 'none',
                }}
                whileTap={{ scale: 0.9 }}
                transition={IOSDesign.animations.spring}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(45 12 12)" />
                </svg>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatAssistant;
