import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line } from 'recharts';
import { Transaction } from '../types';
import { ReceiptIcon } from './Icons';

interface AnalyticsProps {
  transactions: Transaction[];
}

const INCOME_COLOR = '#10b981'; // Emerald 500
const EXPENSE_COLOR = '#ef4444'; // Red 500
const NET_COLOR = '#6366f1'; // Indigo 500
const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

const Analytics: React.FC<AnalyticsProps> = ({ transactions }) => {
  
  // 1. Prepare Data for Sales & Cash Flow Trend (Last 7 Days)
  const trendData = useMemo(() => {
    const last7Days = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { 
        date: d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }), 
        income: 0,
        expense: 0,
        net: 0 
      };
    }).reverse();

    transactions.forEach(t => {
      const tDate = new Date(t.timestamp).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
      const day = last7Days.find(d => d.date === tDate);
      if (day) {
        if (t.type === 'sale') {
          day.income += t.total;
        } else {
          day.expense += t.total;
        }
      }
    });

    // Calculate Net
    last7Days.forEach(day => {
      day.net = day.income - day.expense;
    });

    return last7Days;
  }, [transactions]);

  // 2. Income vs Expense
  const pieData = useMemo(() => {
    const income = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.total, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.total, 0);
    return [
      { name: 'Income', value: income },
      { name: 'Expense', value: expense }
    ];
  }, [transactions]);

  // 3. Best Sellers (Top 5 by Quantity)
  const bestSellersData = useMemo(() => {
    const itemMap = new Map<string, number>();
    transactions.filter(t => t.type === 'sale').forEach(t => {
      const current = itemMap.get(t.item) || 0;
      itemMap.set(t.item, current + t.quantity);
    });
    
    return Array.from(itemMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [transactions]);

  // 4. Expense Breakdown by Category
  const expenseCategoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Uncategorized';
      const current = catMap.get(cat) || 0;
      catMap.set(cat, current + t.total);
    });

    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 opacity-50">
         <ReceiptIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
         <p>No data to analyze yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      
      {/* Cash Flow Analysis Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-6">Cash Flow Trend (Last 7 Days)</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => `RM ${value.toFixed(2)}`}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} barSize={12} fillOpacity={0.8} />
              <Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} barSize={12} fillOpacity={0.8} />
              <Line type="monotone" dataKey="net" name="Net Flow" stroke={NET_COLOR} strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income vs Expense */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Income vs Expense</h3>
          <div className="h-48 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? INCOME_COLOR : EXPENSE_COLOR} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     formatter={(value: number) => `RM ${value.toFixed(2)}`} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Expenses by Category</h3>
          {expenseCategoryData.length > 0 ? (
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => `RM ${value.toFixed(2)}`} 
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                  </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              No expenses recorded
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Top Items Sold (Qty)</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellersData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                   {bestSellersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;