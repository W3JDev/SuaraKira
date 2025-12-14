import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from './Icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className="pointer-events-auto"
          >
            <div className={`
              flex items-center gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md
              ${toast.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100' : ''}
              ${toast.type === 'error' ? 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100' : ''}
              ${toast.type === 'info' ? 'bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100' : ''}
            `}>
              <div className={`
                w-2 h-2 rounded-full shrink-0
                ${toast.type === 'success' ? 'bg-emerald-500' : ''}
                ${toast.type === 'error' ? 'bg-red-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
              `} />
              
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export default ToastContainer;