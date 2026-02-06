
import React, { useState, useEffect, useRef } from 'react';
import { MicIcon, SparklesIcon, XIcon, ListIcon } from './Icons';
import { ChatMessage, Transaction } from '../types';
import * as gemini from '../services/geminiService';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userRole: string;
  userName: string;
  onTransactionAdd: (data: any) => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  isOpen, onClose, transactions, userRole, userName, onTransactionAdd 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session on Open
  useEffect(() => {
    if (isOpen) {
      gemini.startFinancialChat(transactions, userRole, userName);
      if (messages.length === 0) {
        setMessages([{
          id: 'intro',
          role: 'model',
          text: `Hello ${userName}! I'm your Finance Assistant. Ask me about your sales, expenses, or tell me to add a new transaction.`,
          timestamp: Date.now()
        }]);
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
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const { text, transactionData } = await gemini.sendChatMessage(userMsg.text);
      
      if (transactionData) {
        onTransactionAdd(transactionData);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

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
              <p className="text-[10px] text-emerald-100 opacity-90">Financial Assistant • Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700'}
              `}>
                {msg.text.split('\n').map((line, i) => <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>)}
                <p className={`text-[9px] mt-1 text-right opacity-60`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask 'Total sales today?' or 'Sold 1 burger RM5'..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               <SparklesIcon className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            AI can make mistakes. Please verify important financial data.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ChatAssistant;
