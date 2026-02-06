# 🚀 Quick Start: Dashboard Improvements

## What Changed?

Your dashboard now shows **real financial insights** with context-aware calculations!

---

## ✨ Key Features

### 1. **Net Amount Display**
- See your actual profit/balance at a glance
- Green for positive, red for negative
- No more mental math!

### 2. **Personal vs Business Mode**
Choose your context in Settings:

| Mode | Shows | Best For |
|------|-------|----------|
| 👤 **Personal** | Income & Spent → Balance | Personal budgeting, household expenses |
| 🏢 **Business** | Sales & Expenses → Net Profit | Shop owners, small businesses |

### 3. **Cash Flow Breakdown**
- Visual bar chart of money in vs out
- Transaction counts (income vs expenses)
- Percentage breakdown

---

## 🎯 How to Use

### Step 1: Choose Your Mode
1. Tap **Settings** (gear icon)
2. Scroll to "Use Case Context"
3. Select:
   - **Personal Finance** - if tracking your own money
   - **Business** - if running a shop/business

### Step 2: View Dashboard
The dashboard will automatically update to show:

**Personal Mode:**
```
┌────────────────────────┐
│ BALANCE Today          │
│ + RM 1,250.00         │
│ 8 transactions • Personal
│                        │
│ ✅ Income  + RM 2,000  │
│ ❌ Spent   - RM 750    │
│ ▓▓▓▓▓▓░░ (73%)        │
│ 5 income • 3 expenses  │
└────────────────────────┘
```

**Business Mode:**
```
┌────────────────────────┐
│ NET PROFIT Today       │
│ + RM 350.00           │
│ 12 transactions • Business
│                        │
│ ✅ Sales     + RM 850  │
│ ❌ Expenses  - RM 500  │
│ ▓▓▓▓▓░░░ (63%)        │
│ 8 sales • 4 costs      │
└────────────────────────┘
```

### Step 3: Add Transactions
Your entries will be calculated based on your mode:
- Type = "sale" → counted as Income (personal) or Sales (business)
- Type = "expense" → counted as Spent (personal) or Expenses (business)

---

## 🔧 Settings Guide

### Entry Mode (Who can enter what?)
- **💸 Expense Only** - For staff who only track costs
- **💰 Income Only** - For cashiers who only record sales
- **📊 Both** - Full access (admins, owners)

### Use Case (How to view data?)
- **👤 Personal Finance** - Home budgeting context
- **🏢 Business** - Profit/loss analysis

**Pro Tip:** You can combine these! Example:
- Entry Mode: **Both** (track everything)
- Use Case: **Personal** (see it as income/expenses)

---

## 📊 What Gets Calculated?

### All Modes Calculate:
- ✅ Total positive amount (sales/income)
- ❌ Total negative amount (expenses/spent)
- 💰 Net amount (positive - negative)
- 📈 Transaction counts
- 📊 Visual proportions

### Formula:
```
Personal Mode:
  Net Balance = Total Income - Total Spent

Business Mode:
  Net Profit = Total Sales - Total Expenses
```

---

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🟢 Green | Positive balance/profit |
| 🔴 Red | Negative balance/loss |
| 🔵 Blue | Neutral/informational |
| 🟣 Purple | AI insights available |

---

## ❓ Common Questions

### Q: Why does my dashboard show RM 0.00?
**A:** You have no transactions for **today**. The dashboard only shows today's totals. Yesterday's transactions appear in Recent Activity but don't count in today's stats.

### Q: Can I switch between Personal and Business modes?
**A:** Yes! Change anytime in Settings. Your data stays the same—only the labels and calculations change.

### Q: What's the difference between Entry Mode and Use Case?
**A:**
- **Entry Mode** = What type of transactions you CAN add
- **Use Case** = How the dashboard DISPLAYS your data

### Q: Does changing modes delete my data?
**A:** No! Your transactions are safe. Only the dashboard view changes.

### Q: Why do I see "Sales" instead of "Income"?
**A:** You're in Business mode. Switch to Personal in Settings → Use Case.

---

## 🚨 Troubleshooting

### Dashboard shows zero but I have transactions
1. Check the transaction timestamps (might be from previous days)
2. Verify transactions are for TODAY
3. Recent Activity shows all transactions, but stats are TODAY only

### Labels don't match my use case
1. Open Settings
2. Check "Use Case Context"
3. Select the correct mode (Personal or Business)

### Cash flow bar looks wrong
1. Verify your transaction types are correct (sale vs expense)
2. Check if you have both types (need at least one of each for the bar)

---

## 💡 Pro Tips

1. **Daily Reset:** Stats reset at midnight (start of new day)
2. **Persistence:** Your mode choice is saved—no need to set it daily
3. **Visual Feedback:** Watch for color changes when net amount goes positive/negative
4. **AI Insights:** Click "Generate Financial Report" for deeper analysis (Admin only)
5. **Transaction Details:** Tap any Recent Activity item to view/edit

---

## 🎯 Best Practices

### For Personal Finance Users:
- Set Use Case to **Personal**
- Track all income sources (salary, side gigs, etc.)
- Log all spending (groceries, bills, entertainment)
- Review balance daily to stay on budget

### For Business Owners:
- Set Use Case to **Business**
- Record all sales transactions
- Log all costs (supplies, rent, utilities)
- Monitor net profit to ensure profitability

### For Mixed Use:
- Choose the mode that matches your PRIMARY purpose
- Use Entry Mode to restrict access if needed
- Switch modes when reviewing data from different angles

---

## 📚 Related Docs

- [Full Dashboard Fixes Documentation](./DASHBOARD_FIXES.md)
- [Data Storage Guide](./DATA_STORAGE_EXPLAINED.md)
- [Database Security](./DATA_ISOLATION_FIX.md)

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Verify you're logged in
3. Check Settings → Use Case is set
4. Try refreshing the page
5. Clear cache and reload if issues persist

---

**Made with 💚 by w3jdev**

*Last updated: Feb 2025*
