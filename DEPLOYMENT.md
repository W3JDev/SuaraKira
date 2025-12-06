# 🚀 Vercel Deployment Guide for SuaraKira

## Quick Deploy Steps

### 1️⃣ Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Secure API key configuration"
git push origin main
```

### 2️⃣ Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Select your **SuaraKira** repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3️⃣ Add Environment Variable

In the Vercel project settings:

1. Go to **Settings → Environment Variables**
2. Add new variable:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** Your Gemini API key from https://aistudio.google.com/app/apikey
   - **Environments:** Production, Preview, Development (check all)
3. Click **Save**

### 4️⃣ Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**

## ✅ Verify Deployment

1. Open your deployed URL (e.g., `https://suarakira.vercel.app`)
2. Try recording a voice transaction
3. Check browser console for any errors

## 🔒 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ No hardcoded API keys in code
- ✅ Using `import.meta.env.VITE_GEMINI_API_KEY`
- ✅ API key set in Vercel environment variables
- ✅ Never commit `.env` file to Git

## 🐛 Troubleshooting

### "Gemini API key not configured" error
- Check that you added `VITE_GEMINI_API_KEY` in Vercel settings
- Make sure you redeployed after adding the variable
- Verify the key is valid at https://aistudio.google.com/app/apikey

### App loads but AI features don't work
- Open browser console (F12) to see error messages
- Check if the API key has proper permissions
- Try regenerating your Gemini API key

## 📝 Local Development

For local development, create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` and add your key:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Run dev server:
```bash
npm run dev
```

## 🔄 Continuous Deployment

Every push to `main` branch will automatically redeploy on Vercel!

```bash
git add .
git commit -m "Update feature"
git push origin main
# ✨ Auto-deploys to Vercel
```

---

**Need help?** Check Vercel docs: https://vercel.com/docs
