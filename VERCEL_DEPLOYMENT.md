# 🚀 SuaraKira - Vercel Deployment Guide

## ✅ READY TO DEPLOY

**Supabase Project:** clywzojxthjpqpvttpvu (US East 1)
**Status:** Database configured, RLS enabled, Build passing

---

## 📋 Environment Variables for Vercel

Since you opened this Supabase project via Vercel, most env vars should already be set. 
**Verify these are present in your Vercel project settings:**

```env
VITE_SUPABASE_URL=https://clywzojxthjpqpvttpvu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseXd6b2p4dGhqcHFwdnR0cHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzI5MzMsImV4cCI6MjA4NTk0ODkzM30.BUEGDk0l2B2LGwNv3xg1N-q9uIhjzvj9FGYjbhYkgQU
```

**Additional variable needed (ADD THIS):**
```env
VITE_GEMINI_API_KEY=<your_gemini_api_key>
```

Get Gemini key from: https://ai.google.dev/

---

## 🚀 Deploy via GitHub (CI/CD)

Since you have CI/CD setup:

```bash
# 1. Check current branch
git branch

# 2. Add all changes
git add .

# 3. Commit
git commit -m "feat: Add Supabase backend integration

- Migrate from localStorage to Supabase PostgreSQL
- Add real-time transaction sync
- Implement authentication with RLS
- Add multi-user support (admin/staff)
- Configure edge functions
- Production ready"

# 4. Push to trigger auto-deploy
git push origin main  # or your current branch

# Vercel will auto-deploy in ~2 minutes
```

---

## ⚙️ Supabase Configuration Required

### 1. Disable Email Confirmation (For Testing)

Go to: https://supabase.com/dashboard/project/clywzojxthjpqpvttpvu/auth/providers

**Settings to change:**
- ✅ **Disable** "Confirm email" 
- ✅ Set "Site URL" to your Vercel domain
- ✅ Add Vercel domain to "Redirect URLs"

### 2. Enable Realtime (Should already be on)

Go to: https://supabase.com/dashboard/project/clywzojxthjpqpvttpvu/database/replication

**Ensure these are enabled:**
- ✅ Realtime for `transactions` table
- ✅ Realtime for `profiles` table

---

## ✅ What's Configured in Supabase

### Database Schema
✅ **Tables created:**
- `profiles` - User accounts with admin/staff roles
- `transactions` - Financial records

✅ **RLS Policies enabled:**
- Staff can only see their own transactions
- Admin sees all org transactions
- Automatic user ID injection

✅ **Triggers configured:**
- Auto-create profile on signup
- Auto-update timestamps

✅ **Indexes created:**
- Performance optimized queries
- Fast filtering by user, type, date

### Security
✅ Row Level Security (RLS) enabled
✅ JWT-based authentication
✅ Secure data isolation
✅ API keys properly scoped

---

## 🧪 Post-Deployment Testing

### 1. Visit Your Vercel URL
Example: `https://suarakira.vercel.app`

### 2. Create Admin Account
- Click "Sign up"
- Enter email & password
- Full name: "Boss"
- Select role: "Admin / Owner"
- Create account ✅

### 3. Test Features
- ✅ Add manual transaction
- ✅ Test voice input (needs Gemini key)
- ✅ Test receipt scan (needs Gemini key)
- ✅ View analytics dashboard
- ✅ Use AI chat

### 4. Test Multi-User Real-time
- Open app in incognito/private window
- Create new account as "Staff"
- Add transaction as staff
- **Should appear instantly in admin dashboard!** ⚡

---

## 📊 Monitor Your Deployment

### Vercel Dashboard
- Deployments: https://vercel.com/dashboard
- Check build logs
- View analytics
- Monitor errors

### Supabase Dashboard
- **Main:** https://supabase.com/dashboard/project/clywzojxthjpqpvttpvu
- **Database:** https://supabase.com/dashboard/project/clywzojxthjpqpvttpvu/editor
- **Auth Users:** https://supabase.com/dashboard/project/clywzojxthjpqpvttpvu/auth/users
- **Logs:** https://supabase.com/dashboard/project/clywzojxthjpqpvttpvu/logs

---

## 🔍 Verify Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your SuaraKira project
3. Go to **Settings** → **Environment Variables**
4. Verify these exist:
   - `VITE_SUPABASE_URL` ✅
   - `VITE_SUPABASE_ANON_KEY` ✅
   - `VITE_GEMINI_API_KEY` ❓ (ADD IF MISSING)

---

## 🐛 Troubleshooting

### Build fails in Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies in package.json
- Verify Node version compatibility

### "Cannot connect to database"
- Check env vars are set in Vercel
- Redeploy after adding env vars
- Check Supabase project is active

### "Email confirmation required"
- Go to Supabase Auth settings
- Disable email confirmation
- Try signup again

### Real-time not working
- Check Realtime is enabled in Supabase
- Verify WebSocket connections allowed
- Check browser console for errors

---

## 📝 Database Schema Reference

### profiles table
```sql
id              UUID (PK, FK → auth.users)
email           TEXT UNIQUE
full_name       TEXT
role            TEXT ('admin' | 'staff')
organization_id UUID
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### transactions table
```sql
id                 UUID (PK)
item               TEXT
category           TEXT
quantity           NUMERIC
price              NUMERIC
total              NUMERIC
type               TEXT ('sale' | 'expense')
original_transcript TEXT
receipt_data       JSONB
attachment         TEXT
created_by         UUID (FK → profiles.id)
organization_id    UUID
timestamp          TIMESTAMPTZ
created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ
```

---

## ✨ You're Ready!

1. ✅ Database configured
2. ✅ RLS policies set
3. ✅ Build passing
4. ✅ Code updated
5. 🚀 **Just push to GitHub!**

The CI/CD pipeline will handle the rest.

---

**Project configured by w3jdev AI Agent**
