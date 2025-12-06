import React from 'react';
import { Transaction } from '../types';
import { XIcon, ReceiptIcon } from './Icons';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose, onDelete }) => {
  const { receipt, type } = transaction;

  // Formatting helpers
  const formatCurrency = (val?: number) => val ? `RM ${val.toFixed(2)}` : '-';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Actions */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-slate-300" />
            <span className="font-semibold text-sm">Digital Receipt</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Content */}
        <div className="overflow-y-auto p-4 custom-scrollbar">
          {/* Paper Effect Container */}
          <div className="bg-white p-6 shadow-sm relative text-slate-900 font-mono text-xs sm:text-sm">
            
            {/* Jagged Top Edge (Visual only) */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_50%,#fff_50%)] bg-[length:10px_10px] -mt-2 rotate-180"></div>

            {/* Merchant Info */}
            <div className="text-center mb-6">
              <h2 className="font-bold text-lg uppercase mb-2">{receipt?.merchantName || transaction.item}</h2>
              {receipt?.merchantAddress && (
                <p className="text-slate-500 text-[10px] leading-tight mb-2 max-w-[200px] mx-auto">
                  {receipt.merchantAddress}
                </p>
              )}
              <div className="flex justify-center gap-4 text-[10px] text-slate-400 mt-2 border-b border-dashed border-slate-300 pb-4">
                {receipt?.date && <span>Date: {receipt.date}</span>}
                {receipt?.invoiceNo && <span>Inv: {receipt.invoiceNo}</span>}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full">
                <thead className="text-[10px] text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="text-left pb-1 font-normal">Item</th>
                    <th className="text-center pb-1 font-normal">Qty</th>
                    <th className="text-right pb-1 font-normal">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-slate-100">
                  {receipt?.items ? (
                    receipt.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-1">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-[10px] text-slate-400">@{item.unitPrice.toFixed(2)}</div>
                        </td>
                        <td className="py-2 text-center align-top">{item.quantity}</td>
                        <td className="py-2 text-right align-top font-medium">{item.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    // Fallback if no deep receipt data exists
                    <tr>
                      <td className="py-2 font-medium">{transaction.item}</td>
                      <td className="py-2 text-center">{transaction.quantity}</td>
                      <td className="py-2 text-right">{transaction.total.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
              {receipt?.subtotal && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(receipt.subtotal)}</span>
                </div>
              )}
              {receipt?.tax ? (
                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span>{formatCurrency(receipt.tax)}</span>
                </div>
              ) : null}
              {receipt?.serviceCharge ? (
                <div className="flex justify-between text-slate-500">
                  <span>Service Chg</span>
                  <span>{formatCurrency(receipt.serviceCharge)}</span>
                </div>
              ) : null}
              {receipt?.rounding ? (
                <div className="flex justify-between text-slate-500 italic">
                  <span>Rounding</span>
                  <span>{formatCurrency(receipt.rounding)}</span>
                </div>
              ) : null}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-900 mt-2">
                <span>Total</span>
                <span>RM {transaction.total.toFixed(2)}</span>
              </div>
              
              <div className="text-center mt-6">
                 <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                   type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                 }`}>
                   {type === 'sale' ? 'Paid (In)' : 'Paid (Out)'}
                 </span>
              </div>
            </div>

             {/* Jagged Bottom Edge (Visual only) */}
             <div className="absolute bottom-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_50%,#fff_50%)] bg-[length:10px_10px] -mb-2"></div>
          </div>
          
          <div className="text-center mt-4">
             <p className="text-[10px] text-slate-400">Generated by SuaraKira AI</p>
             <p className="text-[10px] text-slate-300">{transaction.id}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0">
          {onDelete && (
             <button 
               onClick={() => onDelete(transaction.id)}
               className="w-full py-3 text-red-600 font-semibold text-sm bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
             >
               Delete Transaction
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
