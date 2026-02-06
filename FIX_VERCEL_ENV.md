# 🔧 Fix Vercel Environment Variables

## ❌ Current Problem

Vercel has duplicate/conflicting Supabase variables from auto-integration.
Your Vite app needs `VITE_*` prefix, but Vercel added `ejoxrgdtanevltyziwaf_*` and `NEXT_PUBLIC_*`.

## ✅ Solution: Add Missing VITE Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

### Add These 2 Variables:

**1. VITE_SUPABASE_URL**
```
Value: https://clywzojxthjpqpvttpvu.supabase.co
Environment: All (Production, Preview, Development)
```

**2. VITE_SUPABASE_ANON_KEY**
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseXd6b2p4dGhqcHFwdnR0cHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzI5MzMsImV4cCI6MjA4NTk0ODkzM30.BUEGDk0l2B2LGwNv3xg1N-q9uIhjzvj9FGYjbhYkgQU
Environment: All (Production, Preview, Development)
```

**3. VITE_GEMINI_API_KEY** ✅ Already added!
```
Value: AIzaSyDC2zaLZDBo6ITOlISWh8i3cn-QDm17oCs
Environment: All (Production, Preview, Development)
```

## 🧹 Optional: Clean Up Old Variables

You can DELETE these (they're not used by our Vite app):
- ❌ All `ejoxrgdtanevltyziwaf_*` variables
- ❌ All `NEXT_PUBLIC_*` variables (we're using Vite, not Next.js)
- ❌ Old `SUPABASE_URL` and `SUPABASE_ANON_KEY` (without VITE_ prefix)

But you can also just leave them - they won't hurt anything.

## 🚀 After Adding Variables

1. Click "Save"
2. Vercel will show: "Changes require redeployment"
3. Click "Redeploy" or just trigger new deployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

## ✅ Final Check

After deployment, your Environment Variables should include:
```
VITE_SUPABASE_URL = https://clywzojxthjpqpvttpvu.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...BUEGDk0l...
VITE_GEMINI_API_KEY = AIzaSyDC...17oCs
```

All three with `VITE_` prefix for Vite to recognize them!

## 🧪 Test After Deployment

1. Visit your Vercel URL
2. Open browser DevTools → Console
3. You should NOT see any Supabase connection errors
4. Try to sign up - should work!
