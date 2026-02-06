import React, { useState, useEffect } from 'react';
import { Account } from '../types';
import { PlusIcon, TrashIcon, EditIcon, ArrowRightIcon } from './Icons';

interface AccountsProps {
  onClose: () => void;
  organizationId?: string;
  userId: string;
  t: any;
}

const Accounts: React.FC<AccountsProps> = ({ onClose, organizationId, userId, t }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as Account['type'],
    currency: 'MYR',
    balance: 0,
    icon: '💵',
    color: '#10b981',
  });

  // Transfer form state
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    note: '',
  });

  const accountIcons = {
    cash: '💵',
    bank: '🏦',
    credit: '💳',
    ewallet: '📱',
    other: '💰',
  };

  const accountColors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const stored = localStorage.getItem('suarakira_accounts');
    if (stored) {
      setAccounts(JSON.parse(stored));
    } else {
      // Create default account
      const defaultAccount: Account = {
        id: Date.now().toString(),
        name: 'Cash',
        type: 'cash',
        currency: 'MYR',
        balance: 0,
        icon: '💵',
        color: '#10b981',
        isDefault: true,
        createdAt: Date.now(),
        organizationId,
        createdBy: userId,
      };
      setAccounts([defaultAccount]);
      localStorage.setItem('suarakira_accounts', JSON.stringify([defaultAccount]));
    }
  };

  const handleSaveAccount = () => {
    if (!formData.name.trim()) return;

    if (editingAccount) {
      // Update existing account
      const updated = accounts.map(acc =>
        acc.id === editingAccount.id
          ? { ...acc, ...formData }
          : acc
      );
      setAccounts(updated);
      localStorage.setItem('suarakira_accounts', JSON.stringify(updated));
    } else {
      // Add new account
      const newAccount: Account = {
        id: Date.now().toString(),
        ...formData,
        createdAt: Date.now(),
        organizationId,
        createdBy: userId,
      };
      const updated = [...accounts, newAccount];
      setAccounts(updated);
      localStorage.setItem('suarakira_accounts', JSON.stringify(updated));
    }

    resetForm();
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length === 1) {
      alert('Cannot delete the last account');
      return;
    }

    if (confirm('Are you sure you want to delete this account?')) {
      const updated = accounts.filter(acc => acc.id !== id);
      setAccounts(updated);
      localStorage.setItem('suarakira_accounts', JSON.stringify(updated));
    }
  };

  const handleTransfer = () => {
    if (!transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0) {
      return;
    }

    const updated = accounts.map(acc => {
      if (acc.id === transferData.fromAccountId) {
        return { ...acc, balance: acc.balance - transferData.amount };
      }
      if (acc.id === transferData.toAccountId) {
        return { ...acc, balance: acc.balance + transferData.amount };
      }
      return acc;
    });

    setAccounts(updated);
    localStorage.setItem('suarakira_accounts', JSON.stringify(updated));
    setShowTransferForm(false);
    setTransferData({ fromAccountId: '', toAccountId: '', amount: 0, note: '' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cash',
      currency: 'MYR',
      balance: 0,
      icon: '💵',
      color: '#10b981',
    });
    setEditingAccount(null);
    setShowAddForm(false);
  };

  const startEdit = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      icon: account.icon || accountIcons[account.type],
      color: account.color || '#10b981',
    });
    setEditingAccount(account);
    setShowAddForm(true);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              💰 Accounts
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Balance: <span className="font-bold text-emerald-600">RM {totalBalance.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransferForm(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <ArrowRightIcon className="w-4 h-4 inline mr-1" />
              Transfer
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              <PlusIcon className="w-4 h-4 inline mr-1" />
              Add
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Account List */}
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                style={{ borderLeftWidth: '4px', borderLeftColor: account.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{account.icon || accountIcons[account.type]}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {account.name}
                        {account.isDefault && (
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {account.type} • {account.currency}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {account.currency} {account.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(account)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    {!account.isDefault && (
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Cash Wallet, Bank Account"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'], icon: accountIcons[e.target.value as Account['type']] })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="bank">🏦 Bank</option>
                    <option value="credit">💳 Credit Card</option>
                    <option value="ewallet">📱 E-Wallet</option>
                    <option value="other">💰 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {accountColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAccount}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                  >
                    {editingAccount ? 'Update' : 'Add Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Form Modal */}
        {showTransferForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                💸 Transfer Between Accounts
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    From Account
                  </label>
                  <select
                    value={transferData.fromAccountId}
                    onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name} - {acc.currency} {acc.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center">
                  <ArrowRightIcon className="w-6 h-6 mx-auto text-slate-400 rotate-90" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    To Account
                  </label>
                  <select
                    value={transferData.toAccountId}
                    onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select account</option>
                    {accounts.filter(acc => acc.id !== transferData.fromAccountId).map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name} - {acc.currency} {acc.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={transferData.note}
                    onChange={(e) => setTransferData({ ...transferData, note: e.target.value })}
                    placeholder="e.g., Monthly savings"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowTransferForm(false);
                      setTransferData({ fromAccountId: '', toAccountId: '', amount: 0, note: '' });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;
