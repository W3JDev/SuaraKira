import React, { useState, useEffect } from 'react';
import { Budget, BudgetAlert, Transaction } from '../types';
import { PlusIcon, TrashIcon, EditIcon, AlertTriangleIcon } from './Icons';

interface BudgetsProps {
  onClose: () => void;
  organizationId?: string;
  userId: string;
  transactions: Transaction[];
  t: any;
}

const Budgets: React.FC<BudgetsProps> = ({ onClose, organizationId, userId, transactions, t }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'alerts'>('active');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    amount: 0,
    period: 'monthly' as Budget['period'],
    alertThreshold: 80,
  });

  useEffect(() => {
    loadBudgets();
    loadAlerts();
  }, []);

  useEffect(() => {
    // Recalculate budget spending when transactions change
    recalculateBudgets();
  }, [transactions, budgets.length]);

  const loadBudgets = () => {
    const stored = localStorage.getItem('suarakira_budgets');
    if (stored) {
      setBudgets(JSON.parse(stored));
    }
  };

  const loadAlerts = () => {
    const stored = localStorage.getItem('suarakira_budget_alerts');
    if (stored) {
      setAlerts(JSON.parse(stored));
    }
  };

  const recalculateBudgets = () => {
    const now = new Date();

    const updatedBudgets = budgets.map(budget => {
      if (!budget.isActive) return budget;

      // Calculate date range based on period
      let startDate: Date;
      let endDate: Date = now;

      switch (budget.period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(budget.startDate);
      }

      // Filter transactions for this budget period
      const relevantTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.timestamp);
        const isInPeriod = txnDate >= startDate && txnDate <= endDate;
        const isExpense = txn.type === 'expense';
        const matchesCategory = !budget.categoryId || txn.category === budget.categoryId;

        return isInPeriod && isExpense && matchesCategory;
      });

      // Calculate spent amount
      const spent = relevantTransactions.reduce((sum, txn) => sum + txn.total, 0);
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      // Check for alerts
      if (percentage >= budget.alertThreshold && percentage < 100) {
        checkAndCreateAlert(budget, percentage, 'warning');
      } else if (percentage >= 100) {
        checkAndCreateAlert(budget, percentage, 'critical');
      }

      return {
        ...budget,
        spent,
        remaining,
      };
    });

    setBudgets(updatedBudgets);
    localStorage.setItem('suarakira_budgets', JSON.stringify(updatedBudgets));
  };

  const checkAndCreateAlert = (budget: Budget, percentage: number, severity: 'warning' | 'critical') => {
    // Check if alert already exists for this budget today
    const today = new Date().toDateString();
    const existingAlert = alerts.find(
      alert => alert.budgetId === budget.id && new Date(alert.timestamp).toDateString() === today
    );

    if (!existingAlert) {
      const newAlert: BudgetAlert = {
        id: Date.now().toString(),
        budgetId: budget.id,
        message: severity === 'critical'
          ? `Budget "${budget.name}" exceeded! ${percentage.toFixed(0)}% spent.`
          : `Budget "${budget.name}" alert: ${percentage.toFixed(0)}% spent.`,
        severity,
        percentage,
        timestamp: Date.now(),
        isRead: false,
      };

      const updatedAlerts = [newAlert, ...alerts];
      setAlerts(updatedAlerts);
      localStorage.setItem('suarakira_budget_alerts', JSON.stringify(updatedAlerts));
    }
  };

  const handleSaveBudget = () => {
    if (!formData.name.trim() || formData.amount <= 0) return;

    const now = Date.now();

    if (editingBudget) {
      // Update existing budget
      const updated = budgets.map(budget =>
        budget.id === editingBudget.id
          ? { ...budget, ...formData }
          : budget
      );
      setBudgets(updated);
      localStorage.setItem('suarakira_budgets', JSON.stringify(updated));
    } else {
      // Add new budget
      const newBudget: Budget = {
        id: Date.now().toString(),
        ...formData,
        startDate: now,
        spent: 0,
        remaining: formData.amount,
        isActive: true,
        createdAt: now,
        organizationId,
        createdBy: userId,
      };
      const updated = [...budgets, newBudget];
      setBudgets(updated);
      localStorage.setItem('suarakira_budgets', JSON.stringify(updated));
    }

    resetForm();
    recalculateBudgets();
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      const updated = budgets.filter(budget => budget.id !== id);
      setBudgets(updated);
      localStorage.setItem('suarakira_budgets', JSON.stringify(updated));
    }
  };

  const handleToggleBudgetActive = (id: string) => {
    const updated = budgets.map(budget =>
      budget.id === id ? { ...budget, isActive: !budget.isActive } : budget
    );
    setBudgets(updated);
    localStorage.setItem('suarakira_budgets', JSON.stringify(updated));
  };

  const markAlertAsRead = (id: string) => {
    const updated = alerts.map(alert =>
      alert.id === id ? { ...alert, isRead: true } : alert
    );
    setAlerts(updated);
    localStorage.setItem('suarakira_budget_alerts', JSON.stringify(updated));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    localStorage.setItem('suarakira_budget_alerts', JSON.stringify([]));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      amount: 0,
      period: 'monthly',
      alertThreshold: 80,
    });
    setEditingBudget(null);
    setShowAddForm(false);
  };

  const startEdit = (budget: Budget) => {
    setFormData({
      name: budget.name,
      categoryId: budget.categoryId || '',
      amount: budget.amount,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    });
    setEditingBudget(budget);
    setShowAddForm(true);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const activeBudgets = budgets.filter(b => b.isActive);
  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              💵 Budgets
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeBudgets.length} Active • {unreadAlerts.length} Unread Alerts
            </p>
          </div>
          <div className="flex gap-2">
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

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Active Budgets
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'alerts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Alerts
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'active' ? (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentage = (budget.spent / budget.amount) * 100;
                const progressColor = getProgressColor(percentage);

                return (
                  <div
                    key={budget.id}
                    className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border ${
                      budget.isActive ? 'border-slate-200 dark:border-slate-700' : 'border-slate-300 dark:border-slate-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {budget.name}
                          </h3>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full capitalize">
                            {budget.period}
                          </span>
                          {!budget.isActive && (
                            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {budget.categoryId || 'All Categories'} • Alert at {budget.alertThreshold}%
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleBudgetActive(budget.id)}
                          className={`px-2 py-1 text-xs rounded-lg ${
                            budget.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {budget.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => startEdit(budget)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          RM {budget.spent.toFixed(2)} / RM {budget.amount.toFixed(2)}
                        </span>
                        <span className={`font-bold ${percentage >= 100 ? 'text-red-600' : percentage >= 80 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Remaining: RM {Math.max(budget.remaining, 0).toFixed(2)}</span>
                        {percentage >= budget.alertThreshold && (
                          <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <AlertTriangleIcon className="w-3 h-3" />
                            Alert threshold reached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {budgets.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No budgets created yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    Create Your First Budget
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.length > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={clearAllAlerts}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.isRead
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      : alert.severity === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {alert.severity === 'critical' ? '🚨' : '⚠️'}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          alert.isRead
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No alerts</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Monthly Food Budget"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    placeholder="Leave empty for all categories"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Budget Amount (RM)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as Budget['period'] })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 80 })}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Get notified when spending reaches this percentage
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBudget}
                    disabled={!formData.name.trim() || formData.amount <= 0}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingBudget ? 'Update' : 'Create Budget'}
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

export default Budgets;
