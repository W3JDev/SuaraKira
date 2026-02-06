import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';

interface CategoriesProps {
  onClose: () => void;
  organizationId?: string;
  userId: string;
  t: any;
}

const Categories: React.FC<CategoriesProps> = ({ onClose, organizationId, userId, t }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'both' as Category['type'],
    icon: '📦',
    color: '#10b981',
    budgetLimit: 0,
  });

  const categoryIcons = [
    '🍔', '🍕', '☕', '🛒', '🏠', '💡', '🚗', '⛽', '🏥', '💊',
    '📚', '🎓', '🎬', '🎮', '✈️', '🏨', '👕', '👟', '💄', '📱',
    '💻', '🖨️', '🎁', '💐', '🐕', '🐱', '🌳', '🔧', '🔨', '🎨',
    '📦', '📄', '💰', '💳', '🏦', '📊', '📈', '💼', '🏢', '🏭',
  ];

  const categoryColors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  // Default system categories
  const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'organizationId' | 'createdBy'>[] = [
    // Income Categories
    { name: 'Sales', type: 'income', icon: '💰', color: '#10b981', isSystem: true },
    { name: 'Services', type: 'income', icon: '🛠️', color: '#3b82f6', isSystem: true },
    { name: 'Investment', type: 'income', icon: '📈', color: '#8b5cf6', isSystem: true },
    { name: 'Salary', type: 'income', icon: '💼', color: '#10b981', isSystem: true },
    { name: 'Other Income', type: 'income', icon: '💵', color: '#14b8a6', isSystem: true },

    // Expense Categories
    { name: 'Food & Beverage', type: 'expense', icon: '🍔', color: '#f59e0b', isSystem: true },
    { name: 'Ingredients', type: 'expense', icon: '🛒', color: '#ef4444', isSystem: true },
    { name: 'Packaging', type: 'expense', icon: '📦', color: '#8b5cf6', isSystem: true },
    { name: 'Utilities', type: 'expense', icon: '💡', color: '#3b82f6', isSystem: true },
    { name: 'Transport', type: 'expense', icon: '🚗', color: '#14b8a6', isSystem: true },
    { name: 'Rent', type: 'expense', icon: '🏠', color: '#ef4444', isSystem: true },
    { name: 'Salary & Wages', type: 'expense', icon: '👥', color: '#f97316', isSystem: true },
    { name: 'Marketing', type: 'expense', icon: '📢', color: '#ec4899', isSystem: true },
    { name: 'Equipment', type: 'expense', icon: '🔧', color: '#8b5cf6', isSystem: true },
    { name: 'Maintenance', type: 'expense', icon: '🔨', color: '#f59e0b', isSystem: true },
    { name: 'Other Expenses', type: 'expense', icon: '💳', color: '#ef4444', isSystem: true },

    // Both
    { name: 'Uncategorized', type: 'both', icon: '❓', color: '#6b7280', isSystem: true },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const stored = localStorage.getItem('suarakira_categories');
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      // Initialize with default categories
      const initialCategories: Category[] = defaultCategories.map((cat, idx) => ({
        ...cat,
        id: `system-${idx}`,
        createdAt: Date.now(),
        organizationId,
        createdBy: 'system',
      }));
      setCategories(initialCategories);
      localStorage.setItem('suarakira_categories', JSON.stringify(initialCategories));
    }
  };

  const handleSaveCategory = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      // Update existing category
      const updated = categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, ...formData }
          : cat
      );
      setCategories(updated);
      localStorage.setItem('suarakira_categories', JSON.stringify(updated));
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        createdAt: Date.now(),
        organizationId,
        createdBy: userId,
      };
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem('suarakira_categories', JSON.stringify(updated));
    }

    resetForm();
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category?.isSystem) {
      alert('Cannot delete system categories');
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter(cat => cat.id !== id);
      setCategories(updated);
      localStorage.setItem('suarakira_categories', JSON.stringify(updated));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'both',
      icon: '📦',
      color: '#10b981',
      budgetLimit: 0,
    });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const startEdit = (category: Category) => {
    if (category.isSystem) {
      alert('Cannot edit system categories');
      return;
    }

    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || '📦',
      color: category.color || '#10b981',
      budgetLimit: category.budgetLimit || 0,
    });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  const filteredCategories = categories.filter(cat => {
    if (filterType === 'all') return true;
    return cat.type === filterType || cat.type === 'both';
  });

  const incomeCount = categories.filter(c => c.type === 'income' || c.type === 'both').length;
  const expenseCount = categories.filter(c => c.type === 'expense' || c.type === 'both').length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              🏷️ Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {incomeCount} Income • {expenseCount} Expense
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

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              💰 Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === 'expense'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              💳 Expense
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {category.name}
                        {category.isSystem && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            System
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {category.type === 'both' ? 'Income & Expense' : category.type}
                      </p>
                      {category.budgetLimit && category.budgetLimit > 0 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          Budget: RM {category.budgetLimit.toFixed(2)}/month
                        </p>
                      )}
                    </div>
                  </div>
                  {!category.isSystem && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No categories found</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 my-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Office Supplies"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Category['type'] })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="income">💰 Income</option>
                    <option value="expense">💳 Expense</option>
                    <option value="both">💰💳 Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {categoryIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          formData.icon === icon ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500' : ''
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {categoryColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-full border-2 ${formData.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'} transition-transform`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Budget Limit (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData({ ...formData, budgetLimit: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Set to 0 for no limit
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
                    onClick={handleSaveCategory}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                  >
                    {editingCategory ? 'Update' : 'Add Category'}
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

export default Categories;
