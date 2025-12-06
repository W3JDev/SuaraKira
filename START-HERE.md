# ✅ Supabase Integration - Quick Start

## 🚀 What You Need to Do RIGHT NOW

### 1️⃣ Get Supabase Keys (2 minutes)

Go to: **https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/settings/api**

Copy these two values:
- **Project URL**: `https://dpdpcyzpjvtrslwzrped.supabase.co`
- **Anon Public Key**: `eyJhbGc...` (long string)

### 2️⃣ Update Your `.env` File

Open `.env` and replace this line:
```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

With your actual key:
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZHBjeXpwanZ0cnNsd3pycGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQwNjY1MTksImV4cCI6MTk4OTY0MjUxOX0.YOUR_ACTUAL_KEY
```

### 3️⃣ Create Database Tables (3 minutes)

1. Go to: **https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/editor**
2. Click **"New Query"** button
3. Open `supabase-setup.sql` in this folder
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (play button)
7. Wait for ✅ "Success" message

### 4️⃣ Test It!

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click **"Sign up"**
3. Create account: `test@example.com` / `password123`
4. Record voice: "Nasi lemak 12 ringgit"
5. Check Supabase: https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/editor
   - Open `suarakira_sales` table
   - You should see your transaction! 🎉

## 🎯 That's It!

Your app now has:
- ✅ Real authentication (sign up/sign in)
- ✅ Cloud database (PostgreSQL)
- ✅ Data syncs across devices
- ✅ Secure (Row Level Security enabled)

## 📝 Deploy to Vercel

Add these environment variables in Vercel:
```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=https://dpdpcyzpjvtrslwzrped.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

Then deploy:
```bash
git add .
git commit -m "Add Supabase authentication & database"
git push origin main
```

---

**Questions?** Check `SUPABASE-SETUP.md` for detailed guide.
