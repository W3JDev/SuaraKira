import React, { useState } from 'react';
import { CalendarIcon } from './Icons';

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateRangeSelectorProps {
  selected: DateRange;
  onSelect: (range: DateRange, customStart?: Date, customEnd?: Date) => void;
  customStart?: Date;
  customEnd?: Date;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selected,
  onSelect,
  customStart,
  customEnd,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStart, setTempStart] = useState<string>(
    customStart ? customStart.toISOString().split('T')[0] : ''
  );
  const [tempEnd, setTempEnd] = useState<string>(
    customEnd ? customEnd.toISOString().split('T')[0] : ''
  );

  const ranges = [
    { id: 'today' as DateRange, label: 'Today', icon: '📅' },
    { id: 'week' as DateRange, label: 'Week', icon: '📆' },
    { id: 'month' as DateRange, label: 'Month', icon: '🗓️' },
    { id: 'year' as DateRange, label: 'Year', icon: '📊' },
    { id: 'custom' as DateRange, label: 'Custom', icon: '⚙️' },
  ];

  const handleCustomApply = () => {
    if (tempStart && tempEnd) {
      const start = new Date(tempStart);
      const end = new Date(tempEnd);
      end.setHours(23, 59, 59, 999); // End of day
      onSelect('custom', start, end);
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="w-full">
      {/* Range Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 px-4 py-2 min-w-max">
          {ranges.map((range) => (
            <button
              key={range.id}
              onClick={() => {
                if (range.id === 'custom') {
                  setShowCustomPicker(true);
                } else {
                  onSelect(range.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selected === range.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-sm">{range.icon}</span>
              <span>{range.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker Modal */}
      {showCustomPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-600" />
                  Custom Date Range
                </h3>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  min={tempStart}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomApply}
                  disabled={!tempStart || !tempEnd}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display Selected Custom Range */}
      {selected === 'custom' && customStart && customEnd && (
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>
              {customStart.toLocaleDateString()} - {customEnd.toLocaleDateString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
