<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SuaraKira - Voice-Powered Fintech for Malaysian Hawkers

Voice-first Progressive Web App for tracking sales using Gemini AI. Built for street vendors and micro-entrepreneurs.

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. **Clone and install:**
   ```bash
   git clone https://github.com/W3JDev/SuaraKira.git
   cd SuaraKira
   npm install
   ```

2. **Configure API Key:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   Get your key: https://aistudio.google.com/app/apikey

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## 📦 Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy SuaraKira"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable:
     - **Key:** `VITE_GEMINI_API_KEY`
     - **Value:** Your Gemini API key
   - Click Deploy

3. **Important:** Never commit your `.env` file to Git!

## 🔒 Security Notes

- API keys are loaded via `import.meta.env.VITE_GEMINI_API_KEY`
- Keys are never exposed in the client bundle when using Vercel environment variables
- Always use Vercel's environment variable settings for production
- The `.env` file is git-ignored by default

## 🛠 Tech Stack

- React 18 + TypeScript + Vite
- Google Gemini AI (2.5 Flash & 3 Pro)
- Supabase (PostgreSQL + Auth)
- Recharts + Framer Motion
- Tailwind CSS

## 🔐 Supabase Setup

**NEW!** This app now uses Supabase for authentication and cloud database.

📖 **Quick start:** See `START-HERE.md`
📘 **Full guide:** See `SUPABASE-SETUP.md`

You'll need:
1. Supabase project credentials (URL + Anon Key)
2. Run the SQL script in `supabase-setup.sql`
3. Update `.env` with your keys
