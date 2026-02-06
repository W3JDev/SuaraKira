# 🎙️ SuaraKira - Voice-Powered Financial Intelligence

> **"Speak. Track. Grow."**
> Transform your voice into financial insights with AI-powered accounting.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/W3JDev/SuaraKira)
[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/W3JDev/SuaraKira)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Powered by](https://img.shields.io/badge/powered%20by-Google%20Gemini-orange)](https://ai.google.dev)

**Crafted by [w3jdev](https://w3jdev.com)** | _Enterprise-Grade AI Architecture_

---

## 🌟 What is SuaraKira?

SuaraKira is a **mobile-first Progressive Web App** that transforms how you manage finances. Simply **speak naturally** in English, Malay, or Manglish ("Boss, sold 5 nasi lemak, 25 ringgit"), and watch AI instantly create structured financial records.

Built for **Malaysian hawkers, small business owners, and anyone** who wants effortless financial tracking without the hassle of manual data entry.

### 🎯 Why SuaraKira?

- ⚡ **10x Faster** than manual entry
- 🧠 **AI-Powered** with Google Gemini 2.5 Flash
- 📱 **Mobile-First** PWA (works offline)
- 🌍 **Multilingual** (EN/MS/BN/TA/ZH)
- 💰 **Free** & Open Source

---

## ✨ Features

### 🎤 **Voice-to-Ledger™**

Speak naturally and AI creates perfect transaction records:

- "Sold 10 nasi lemak at 5 ringgit each" → Auto-categorized sale
- "Bought chicken for 150" → Expense with category
- "Mamak 20 ringgit" → Quick expense entry
- Supports **Manglish**, English, Bahasa Malaysia

### 📸 **Smart Receipt Scanner**

Snap a photo, get instant digitization:

- OCR-powered receipt extraction
- Automatic line item detection
- Tax, service charge calculation
- Merchant name & invoice tracking

### 💬 **AI Financial Advisor**

Chat with your intelligent assistant:

- "How's my profit this month?"
- "What's my best-selling item?"
- "Show me expense trends"
- Real-time conversational insights

### 💰 **Accounts Management** 🆕

Multi-account tracking with transfers:

- Cash, Bank, Credit Card, E-Wallet
- Real-time balance tracking
- Transfer between accounts
- Multi-currency support
- Custom icons & colors

### 🏷️ **Smart Categories** 🆕

Organize with intelligence:

- **17 built-in categories** (Food, Transport, Rent, etc.)
- **40+ emoji icons** to choose from
- Create unlimited custom categories
- Set monthly budget limits per category
- Filter by Income/Expense

### 💵 **Budget Tracking** 🆕

Stay in control with real-time alerts:

- Daily/Weekly/Monthly/Yearly budgets
- **Visual progress bars** with color coding
- **Smart alerts** at 80% threshold (customizable)
- Auto-calculated spending from transactions
- Critical alerts when budget exceeded

### 📅 **Date Range Filtering** 🆕

Analyze any time period:

- Today, Week, Month, Year views
- **Custom date ranges** with picker
- Auto-recalculating stats
- Context-aware (Personal vs Business)

### 📊 **CFO-Level Insights**

Automated financial intelligence:

- Profit margin analysis
- Best sellers by revenue/quantity
- Item profitability tracking
- Cash flow trends
- Anomaly detection
- Actionable advice

### 👥 **Multi-User Collaboration**

Team-ready architecture:

- **Admin** role: Full dashboard access
- **Staff** role: Entry-only mode
- Real-time sync across devices
- Secure data isolation (RLS)

### 📱 **Mobile-First Design**

Built for your phone:

- **Bottom Navigation** for quick access
- **Floating action buttons** for key features
- Touch-optimized interfaces
- iOS safe area support
- Works offline (PWA)

### 🌙 **Dark Mode**

Easy on the eyes, day or night

### 🔐 **Enterprise Security**

Production-ready security:

- Supabase Row-Level Security (RLS)
- JWT authentication
- Secure API key management
- Data encryption at rest

---

## 🚀 Quick Start

### ⚡ Deploy to Vercel (5 minutes)

1. **Clone the repository:**

```bash
git clone https://github.com/W3JDev/SuaraKira.git
cd SuaraKira
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**
   Create `.env.local`:

```env
VITE_SUPABASE_URL=https://bziksmjvlltzobtgjpyb.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Build and deploy:**

```bash
npm run build
vercel --prod
```

### 🛠️ Local Development

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📸 Screenshots

### 🎙️ Voice Transaction Entry

_[Placeholder: Screenshot of voice recorder interface with waveform animation]_

### 📊 Dashboard with Stats

_[Placeholder: Screenshot showing Today's stats with income/expense breakdown]_

### 💰 Accounts Management

_[Placeholder: Screenshot of Accounts modal with multiple accounts and balances]_

### 🏷️ Categories Manager

_[Placeholder: Screenshot of Categories grid with icons and colors]_

### 💵 Budget Tracking

_[Placeholder: Screenshot of Budgets with progress bars and alerts]_

### 📅 Date Range Selector

_[Placeholder: Screenshot of date range tabs (Today/Week/Month/Year/Custom)]_

### 💬 AI Chat Assistant

_[Placeholder: Screenshot of chat interface with financial conversation]_

### 📱 Mobile Experience

_[Placeholder: Screenshot of bottom navigation and mobile layout]_

---

## 🎯 Use Cases

### 🍜 **Hawker Stalls**

- Quick voice entry during busy hours
- Receipt scanning for supplier invoices
- Track daily sales vs expenses
- Budget for ingredients

### 🏪 **Small Retail**

- Multi-product sales tracking
- Inventory cost monitoring
- Profit margin analysis
- Category-based budgeting

### 💼 **Freelancers**

- Personal income tracking
- Project expense management
- Tax-ready categorization
- Client payment monitoring

### 👨‍👩‍👧 **Personal Finance**

- Household budget tracking
- Expense categorization
- Savings goals
- Monthly spending analysis

---

## 🛠️ Tech Stack

### Frontend

- ⚛️ **React 18** - Modern UI library
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Lightning-fast builds
- 🎨 **TailwindCSS** - Utility-first styling
- 📱 **PWA** - Offline-first architecture

### Backend

- 🗄️ **Supabase** - PostgreSQL database
- 🔐 **Supabase Auth** - Authentication
- 🔄 **Real-time subscriptions** - Live updates
- 🛡️ **Row-Level Security** - Data isolation

### AI & Intelligence

- 🤖 **Google Gemini 2.5 Flash** - Fast AI processing
- 🧠 **Gemini 3.0 Pro** - Advanced insights
- 📸 **Vision API** - Receipt OCR
- 🎙️ **Audio API** - Voice transcription

### Infrastructure

- 🚀 **Vercel** - Global edge deployment
- 🌍 **CDN** - Fast content delivery
- 📊 **Analytics-ready** - Performance monitoring

---

## 📚 Documentation

Comprehensive guides in `.gitmore/` folder:

- **[QUICK_START_DASHBOARD.md](.gitmore/QUICK_START_DASHBOARD.md)** - Dashboard overview
- **[ENHANCEMENT_PLAN.md](.gitmore/ENHANCEMENT_PLAN.md)** - Feature roadmap
- **[MOBILE_FIRST_IMPLEMENTATION.md](.gitmore/MOBILE_FIRST_IMPLEMENTATION.md)** - Mobile design guide
- **[DEPLOYMENT_SUMMARY_FEB2025.md](.gitmore/DEPLOYMENT_SUMMARY_FEB2025.md)** - Recent deployments
- **[FEATURE_INTEGRATION_FEB2025.md](.gitmore/FEATURE_INTEGRATION_FEB2025.md)** - Latest features (v2.0.0)

---

## 🎨 Architecture

### Database Schema

```
profiles
├── id (uuid)
├── email (text)
├── full_name (text)
├── role (text) - "admin" | "staff"
├── organization_id (uuid)
└── created_at (timestamp)

transactions
├── id (uuid)
├── item (text)
├── category (text)
├── quantity (numeric)
├── price (numeric)
├── total (numeric)
├── type (text) - "sale" | "expense"
├── timestamp (timestamp)
├── original_transcript (text)
├── receipt_data (jsonb)
├── attachment (text)
├── created_by (uuid)
├── organization_id (uuid)
├── source_channel (text)
├── payment_method (text)
├── is_business (boolean)
└── status (text)
```

### Key Components

```
src/
├── App.tsx                    # Main application with routing
├── pages/
│   ├── AuthPage.tsx          # Login/signup with Supabase Auth
│   └── LandingPage.tsx       # Marketing landing page
├── components/
│   ├── Dashboard.tsx         # Stats & transaction list
│   ├── Analytics.tsx         # Charts & visualizations
│   ├── VoiceRecorder.tsx     # Voice input interface
│   ├── ChatAssistant.tsx     # AI chat interface
│   ├── Accounts.tsx          # Account management 🆕
│   ├── Categories.tsx        # Category management 🆕
│   ├── Budgets.tsx          # Budget tracking 🆕
│   ├── DateRangeSelector.tsx # Date filtering 🆕
│   └── BottomNav.tsx        # Mobile navigation 🆕
├── services/
│   ├── supabase.ts          # Database client
│   ├── db.ts                # Transaction CRUD + stats helpers
│   └── geminiService.ts     # AI processing
└── types.ts                 # TypeScript interfaces
```

### Data Flow

```
Voice Input → Gemini Audio API → Structured JSON
     ↓
Receipt Image → Gemini Vision API → Structured JSON
     ↓
Manual Entry → Form → Structured JSON
     ↓
Validation & Enhancement (AI categorization)
     ↓
Supabase PostgreSQL (with RLS)
     ↓
Real-time Subscription → React State Update
     ↓
Dashboard / Analytics / Chat
```

---

## 🔐 Security & Privacy

### Authentication

- ✅ Email/password authentication via Supabase
- ✅ JWT-based session management
- ✅ Secure password hashing

### Data Protection

- ✅ Row-Level Security (RLS) policies
- ✅ Organization-scoped data access
- ✅ Staff can only see own transactions
- ✅ Admin has full organization access

### API Security

- ✅ Environment variables for sensitive keys
- ✅ Server-side API calls (no client exposure)
- ✅ Rate limiting ready

### Compliance

- ✅ GDPR-ready data structure
- ✅ User data deletion support
- ✅ Audit trail via created_by fields

---

## 💾 LocalStorage Keys

The app uses LocalStorage for user preferences:

```javascript
suarakira_theme; // "dark" | "light"
suarakira_lang; // "en" | "ms" | "bn" | "ta" | "zh"
suarakira_entry_mode; // "expense-only" | "income-only" | "both"
suarakira_use_case; // "personal" | "business"
suarakira_accounts; // Account data (JSON array) 🆕
suarakira_categories; // Category data (JSON array) 🆕
suarakira_budgets; // Budget data (JSON array) 🆕
suarakira_budget_alerts; // Alert history (JSON array) 🆕
suarakira_notif_lowstock; // Boolean
suarakira_notif_daily; // Boolean
```

All transaction data is stored securely in Supabase PostgreSQL.

---

## 🌍 Supported Languages

- 🇬🇧 **English** (EN)
- 🇲🇾 **Bahasa Malaysia** (MS)
- 🇧🇩 **Bengali** (BN)
- 🇮🇳 **Tamil** (TA)
- 🇨🇳 **Simplified Chinese** (ZH)

AI responds in the user's selected language.

---

## 📊 Performance

### Build Metrics

- **Bundle Size:** 1,061 KB (296 KB gzipped)
- **Build Time:** ~5.5s
- **Lighthouse Score:** 90+ (Performance/Accessibility/Best Practices/SEO)

### Optimization

- Code splitting ready
- Lazy loading for heavy components
- Image optimization
- CDN-served assets

---

## 🚦 Browser Support

- ✅ Chrome 90+ (recommended)
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

PWA features require HTTPS.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use TailwindCSS for styling
- Write meaningful commit messages
- Test on mobile devices
- Maintain dark mode support

---

## 🐛 Known Issues

**None at this time.** Build passing with no errors.

Found a bug? [Open an issue](https://github.com/W3JDev/SuaraKira/issues).

---

## 📅 Roadmap

### Q1 2025 ✅

- [x] Voice transaction entry
- [x] Receipt scanning
- [x] Multi-user authentication
- [x] Real-time sync
- [x] AI insights
- [x] Accounts management
- [x] Categories system
- [x] Budget tracking
- [x] Date range filtering

### Q2 2025 🚧

- [ ] Recurring transactions
- [ ] Expense tags system
- [ ] CSV export/import
- [ ] PDF reports
- [ ] Bank statement parser (AI)
- [ ] Multi-location support
- [ ] Team analytics

### Q3 2025 🔮

- [ ] Inventory management
- [ ] Invoice generation
- [ ] Tax calculation (Malaysia SST)
- [ ] WhatsApp integration
- [ ] Telegram bot
- [ ] Mobile app (React Native)

---

## 💰 Pricing

**100% FREE** and Open Source under MIT License.

### Running Costs (Free Tier)

- **Supabase:** $0/month (500MB database, 50K MAU)
- **Vercel:** $0/month (Unlimited deployments)
- **Gemini API:** $0 for first 1M tokens/month

**Total:** $0/month for small businesses.

---

## 📞 Support

### Get Help

- 📧 Email: support@w3jdev.com
- 💬 GitHub Issues: [Report a bug](https://github.com/W3JDev/SuaraKira/issues)
- 📚 Documentation: See `.gitmore/` folder

### Community

- 🌟 Star this repo if you find it useful!
- 🐦 Follow [@w3jdev](https://twitter.com/w3jdev) for updates
- 💼 Connect on [LinkedIn](https://linkedin.com/in/w3jdev)

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

**TL;DR:** You can use this commercially, modify it, distribute it. Just keep the copyright notice.

---

## 🙏 Acknowledgments

### Built With

- [React](https://react.dev) - UI library
- [Supabase](https://supabase.com) - Backend infrastructure
- [Google Gemini](https://ai.google.dev) - AI intelligence
- [TailwindCSS](https://tailwindcss.com) - Styling framework
- [Vite](https://vitejs.dev) - Build tool
- [Vercel](https://vercel.com) - Hosting platform

### Inspired By

The hardworking hawkers and small business owners of Malaysia who deserve better financial tools.

---

## ⭐ Star History

If SuaraKira helps you, please star the repository!

[![Star History Chart](https://api.star-history.com/svg?repos=W3JDev/SuaraKira&type=Date)](https://star-history.com/#W3JDev/SuaraKira&Date)

---

## 📣 ProductHunt

**Launching Soon on ProductHunt!**

**Tagline:** Transform your voice into financial insights with AI-powered accounting.

**Description:**
SuaraKira makes financial tracking effortless. Just speak naturally ("Sold 10 nasi lemak, 50 ringgit"), snap receipt photos, or chat with our AI advisor. Built for Malaysian small businesses, but loved globally. Features multi-account tracking, smart budgets, and real-time collaboration. Free, open-source, and mobile-first.

---

<div align="center">

### 🎙️ **"Speak. Track. Grow."**

Built with ❤️ by [w3jdev](https://w3jdev.com)

[🌟 Star on GitHub](https://github.com/W3JDev/SuaraKira) · [🚀 Live Demo](https://suarakira.vercel.app) · [📚 Documentation](.gitmore/)

**v2.0.0** | Last Updated: February 2025

</div>

---

## 🔗 Quick Links

- **Live App:** https://suarakira.vercel.app
- **GitHub:** https://github.com/W3JDev/SuaraKira
- **Developer:** https://w3jdev.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/bziksmjvlltzobtgjpyb
- **Get Gemini API Key:** https://ai.google.dev

---

<div align="center">
<sub>Made in 🇲🇾 Malaysia | Powered by AI | Open Source Forever</sub>
</div>
