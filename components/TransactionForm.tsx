
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { XIcon, ReceiptIcon } from './Icons';

interface TransactionFormProps {
  initialData: Partial<Transaction> | null;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
  currentUser: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSave, onCancel, currentUser }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'sale',
    quantity: 1,
    price: 0,
    total: 0,
    category: 'Food',
    item: '',
    timestamp: Date.now(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Auto-calculate total when price or quantity changes
  useEffect(() => {
    const qty = formData.quantity || 0;
    const price = formData.price || 0;
    // Only auto-calc if total seems inconsistent or zero, 
    // but don't overwrite if user manually set a specific total different from unit*qty logic (e.g. discounts)
    // For simplicity, we enforce Total = Price * Qty in this form logic
    setFormData(prev => ({ ...prev, total: qty * price }));
  }, [formData.quantity, formData.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.total) return;

    const finalTransaction: Transaction = {
      id: formData.id || Date.now().toString(),
      item: formData.item,
      category: formData.category || 'Uncategorized',
      quantity: formData.quantity || 1,
      price: formData.price || 0,
      total: formData.total,
      type: formData.type as TransactionType,
      timestamp: formData.timestamp || Date.now(),
      createdBy: formData.createdBy || currentUser,
      originalTranscript: formData.originalTranscript || "Manual Entry",
      receipt: formData.receipt
    };

    onSave(finalTransaction);
  };

  const handleChange = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-emerald-600" />
            {initialData?.id ? 'Review Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <XIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Type Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleChange('type', 'sale')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'sale' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sale (In)
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'expense')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-red-400' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Expense (Out)
              </button>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Item / Description</label>
              <input
                type="text"
                required
                value={formData.item || ''}
                onChange={(e) => handleChange('item', e.target.value)}
                placeholder="e.g. Nasi Lemak Ayam"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <input
                type="text"
                list="categories"
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <datalist id="categories">
                <option value="Food" />
                <option value="Beverage" />
                <option value="Ingredients" />
                <option value="Packaging" />
                <option value="Utilities" />
                <option value="Salary" />
                <option value="Rent" />
              </datalist>
            </div>

            {/* Qty & Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit Price (RM)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-right"
                />
              </div>
            </div>

            {/* Total */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Amount (RM)</label>
              <div className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white text-right font-mono text-xl font-bold flex justify-between items-center">
                 <span className="text-sm text-slate-400 font-sans">Calculated</span>
                 <span>{(formData.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Date */}
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
               <input 
                 type="date"
                 value={new Date(formData.timestamp || Date.now()).toISOString().split('T')[0]}
                 onChange={(e) => {
                   const date = new Date(e.target.value);
                   handleChange('timestamp', date.getTime());
                 }}
                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
               />
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="transaction-form"
            className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-[0.98] transition-all"
          >
            Confirm & Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default TransactionForm;
