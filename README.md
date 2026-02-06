# SuaraKira - AI Voice Accountant

> **Crafted by [w3jdev](https://w3jdev.com)**
> _Enterprise-Grade AI Architecture_

SuaraKira is a mobile-first PWA designed for Malaysian hawkers. It leverages **Google Gemini 2.5 Flash** to translate Manglish voice commands ("Boss, one nasi lemak 12 ringgit") into structured financial records instantly.

## ✨ Status: PRODUCTION READY

✅ **Database:** Supabase PostgreSQL with real-time sync
✅ **Auth:** Multi-user authentication (Admin/Staff roles)
✅ **Deployment:** Vercel-ready with zero-config
✅ **Build:** Passing with no errors

## 🚀 Features

- **🎤 Voice-to-Ledger:** Speak naturally in English/Malay/Manglish
- **📸 Visual Intelligence:** Snap photos of receipts for instant digitization
- **💬 AI Chat Assistant:** Ask questions about your finances
- **📊 CFO Insights:** Automated profit margin analysis and anomaly detection
- **👥 Multi-User:** Real-time collaboration with staff/admin roles
- **⚡ Real-time Sync:** Live updates across all devices
- **🔐 Secure:** Row-level security with Supabase

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **Database:** Supabase (PostgreSQL 17) with real-time subscriptions
- **Auth:** Supabase Auth with RLS policies
- **AI:** Google GenAI SDK (Gemini 2.5 Flash / 3.0 Pro)
- **Charts:** Recharts
- **Hosting:** Vercel (deployment-ready)

## 📦 Quick Start

### Option 1: Deploy to Vercel (5 minutes)

```bash
npm install
npm run build
vercel --prod
```

Set environment variables in Vercel:

- `VITE_SUPABASE_URL` = `https://bziksmjvlltzobtgjpyb.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (provided in deployment docs)
- `VITE_GEMINI_API_KEY` = (get from https://ai.google.dev)

### Option 2: Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 📄 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Deploy in 5 minutes
- **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - Full feature overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide
- **[/docs](./docs)** - Architecture, PRDs, and runbooks

## 🏗️ Architecture

### Database Schema

- **profiles** - User accounts with role-based access
- **transactions** - Financial records with real-time sync
- Real-time subscriptions for live updates
- Row-level security for data isolation

### Key Components

- `services/supabase.ts` - Database & auth client
- `services/db.ts` - Transaction management
- `services/geminiService.ts` - AI processing
- `pages/AuthPage.tsx` - Authentication UI
- `components/` - React components

## 🔐 Security

- ✅ Supabase Row Level Security (RLS)
- ✅ JWT-based authentication
- ✅ Secure API key management
- ✅ Staff can only see own transactions
- ✅ Admin sees all organization data

## 💰 Cost

**Free Tier:** $0/month on Vercel + Supabase free tier

- 500MB database
- 50K monthly active users
- Real-time connections
- Unlimited deployments

## 📊 Database Access

- **Dashboard:** https://supabase.com/dashboard/project/bziksmjvlltzobtgjpyb
- **Region:** Asia Pacific (Singapore)
- **Real-time:** Enabled

## 🎯 Next Steps

1. Deploy to Vercel (see QUICK_START.md)
2. Configure Supabase auth settings
3. Get Gemini API key for AI features
4. Create admin account
5. Test real-time sync with staff account

---

**Maintained by w3jdev**
[LinkedIn](https://linkedin.com/in/w3jdev) · [GitHub](https://github.com/w3jdev) · [Website](https://w3jdev.com)
