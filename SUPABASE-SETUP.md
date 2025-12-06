# 🚀 Supabase Integration Setup Guide

## ✅ What's Been Done

Your SuaraKira app now has **full Supabase integration**:

1. ✅ **Authentication** - Real sign up/sign in with Supabase Auth
2. ✅ **Database** - PostgreSQL cloud storage for all transactions
3. ✅ **Real-time sync** - Data persists across devices
4. ✅ **Row Level Security** - Each user can only see their own data

## 📋 Setup Steps (5 minutes)

### Step 1: Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/settings/api
2. Copy two values:
   - **Project URL** (starts with `https://dpdpcyzpjvtrslwzrped.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

### Step 2: Update Your `.env` File

Open `.env` and replace `your_supabase_anon_key_here`:

```env
VITE_SUPABASE_URL=https://dpdpcyzpjvtrslwzrped.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Your actual key
```

### Step 3: Create Database Tables

1. Go to: https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/editor
2. Click **"New Query"**
3. Copy the entire contents of `supabase-setup.sql`
4. Paste and click **"Run"**
5. You should see: ✅ Success! 3 tables created

The script creates:
- `suarakira_users` - User profiles
- `suarakira_sales` - All transactions (sales & expenses)
- `suarakira_receipts` - Receipt details with images

### Step 4: Configure Authentication (Optional but Recommended)

1. Go to: https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/auth/providers
2. **Email Auth Settings:**
   - Enable "Confirm email" (optional - turn off for testing)
   - Set "Site URL" to your deployed URL (e.g., `https://suarakira.vercel.app`)
3. **Optional: Enable Google OAuth** for "Sign in with Google" button

### Step 5: Test Locally

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click **"Sign up"**
3. Create account with email/password
4. Try adding a voice transaction
5. Check Supabase dashboard → Table Editor to see your data!

## 🔄 What Changed in Your Code

### New Files:
- `services/supabase.ts` - Supabase client & auth functions
- `supabase-setup.sql` - Database schema
- `SUPABASE-SETUP.md` - This guide

### Modified Files:
- `pages/AuthPage.tsx` - Real authentication (no more mock login)
- `services/db.ts` - Now saves to Supabase + localStorage fallback
- `App.tsx` - Session management with Supabase
- `.env` - Added Supabase credentials

## 🎯 How It Works Now

### Before (localStorage only):
```
User → Voice Input → Gemini AI → Save to Browser
                                   ❌ Data lost on clear cache
```

### After (Supabase):
```
User → Voice Input → Gemini AI → Save to Supabase Cloud
                                   ✅ Data syncs across devices
                                   ✅ Secure & persistent
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **JWT Authentication** - Secure session tokens
- **Encrypted connections** - All data transmitted over HTTPS
- **Password hashing** - Passwords never stored in plain text

## 📊 Database Structure

```sql
suarakira_users
├── id (UUID, from auth.users)
├── email
├── business_name
└── created_at

suarakira_sales
├── id (UUID)
├── user_id (FK → suarakira_users)
├── item_name
├── category
├── quantity
├── price
├── total
├── type (sale | expense)
├── voice_input (original transcript)
├── receipt_data (JSON)
└── created_at

suarakira_receipts
├── id (UUID)
├── sale_id (FK → suarakira_sales)
├── receipt_data (JSON)
└── created_at
```

## 🚀 Deploy to Vercel

### Update Environment Variables:

1. Go to Vercel project → Settings → Environment Variables
2. Add these (in addition to GEMINI key):

```
VITE_SUPABASE_URL=https://dpdpcyzpjvtrslwzrped.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

3. Redeploy!

## 🧪 Testing Checklist

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Add voice transaction
- [ ] Add image receipt scan
- [ ] View transaction in Supabase dashboard
- [ ] Log out and log back in (data persists)
- [ ] Try on different device (data syncs)

## 🐛 Troubleshooting

### "Failed to initialize Supabase" error
- Check that `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure you restarted dev server after editing `.env`

### "Failed to sign up" error
- Run the SQL script in Supabase SQL Editor
- Check that tables exist in Table Editor
- Verify RLS policies are enabled

### Data not syncing
- Check browser console for errors
- Verify you're logged in (check session)
- Check Supabase logs: https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/logs/explorer

### Sign up works but no data in table
- The trigger should auto-create user record
- If not, manually insert: `INSERT INTO suarakira_users (id, email) VALUES (auth.uid(), 'test@example.com');`

## 📚 Next Steps

### Enable Real-time Subscriptions (Optional):
```typescript
// In App.tsx - listen for new sales in real-time
const channel = supabase
  .channel('sales-changes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'suarakira_sales' },
    (payload) => {
      console.log('New sale!', payload);
      // Update UI automatically
    }
  )
  .subscribe();
```

### Add Profile Picture Upload:
```typescript
// Use Supabase Storage for profile pictures
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);
```

---

**Status:** ✅ Supabase integration complete!
**What's next?** Get your Supabase credentials and run the SQL script.
