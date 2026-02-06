# 🔧 NLP Data Entry Troubleshooting Guide

## Problem: "Sorry, I lost connection. Please try again."

This error appears when the Gemini AI API fails to process your NLP (Natural Language Processing) input. Here's how to fix it.

---

## 🔍 Quick Diagnosis

Run the diagnostic script first:
```bash
node check-api.js
```

This will check your configuration and tell you exactly what's wrong.

---

## ✅ Step-by-Step Fixes

### **Fix 1: Check Your API Key**

#### 1.1 Verify `.env.local` exists
```bash
# In your project root (SuaraKira folder)
ls -la .env.local
```

If it doesn't exist:
```bash
cp .env.example .env.local
```

#### 1.2 Get a Gemini API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza`)

#### 1.3 Add to `.env.local`
Open `.env.local` and add:
```env
VITE_GEMINI_API_KEY=AIzaSy... (your actual key here)
VITE_SUPABASE_URL=https://clywzojxthjpqpvttpvu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (your Supabase key)
```

**Important Notes:**
- ✅ Use `VITE_GEMINI_API_KEY` (with VITE_ prefix)
- ❌ Don't use quotes around the key
- ❌ Don't commit this file to Git (it's in .gitignore)

---

### **Fix 2: Restart Development Server**

After changing `.env.local`:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

Environment variables are only loaded on startup!

---

### **Fix 3: Check API Key Validity**

#### Test your key:
```bash
# Create a test file: test-api.js
cat > test-api.js << 'EOF'
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.VITE_GEMINI_API_KEY;
console.log('Testing API Key:', apiKey?.substring(0, 10) + '...');

const ai = new GoogleGenAI({ apiKey });

ai.models.generateContent({
  model: 'gemini-2.5-flash-lite',
  contents: { parts: [{ text: 'Say hello' }] }
})
.then(r => console.log('✅ API Key works!', r.text))
.catch(e => console.error('❌ API Error:', e.message));
EOF

node test-api.js
```

**Common API Errors:**
- `API key not valid` → Get a new key
- `Quota exceeded` → You've hit the free tier limit (wait 24h or upgrade)
- `Model not found` → Check model name in `geminiService.ts`

---

### **Fix 4: Check Browser Console**

1. Open your app in browser
2. Press `F12` (Developer Tools)
3. Go to **Console** tab
4. Try NLP data entry again
5. Look for red error messages

**What to look for:**
- `❌ GEMINI API KEY MISSING` → Fix .env.local
- `📤 Sending message to Gemini` → Good! API is being called
- `📥 Received response` → API is working
- `401` or `403` → Bad API key
- `429` → Quota exceeded
- `Network error` → Internet/firewall issue

---

### **Fix 5: Verify Model Access**

The app uses these Gemini models:
- `gemini-2.5-flash` (for audio)
- `gemini-2.5-flash-lite` (for text)
- `gemini-3-pro-preview` (for images/insights)

**Check model availability:**
1. Go to: https://aistudio.google.com/
2. Try generating content with each model
3. If blocked → Model not available in your region/tier

**Fallback:** Edit `SuaraKira/services/geminiService.ts`:
```typescript
// Change to older stable models:
model: "gemini-1.5-flash" // instead of gemini-2.5-flash
model: "gemini-1.5-pro"   // instead of gemini-3-pro-preview
```

---

### **Fix 6: Network/Firewall Issues**

#### Test Gemini API accessibility:
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=YOUR_API_KEY"
```

If this fails:
- Check your firewall
- Try different network (mobile hotspot)
- Use VPN if in restricted region

---

### **Fix 7: Clear Cache**

Sometimes old cached code causes issues:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite dist

# Restart dev server
npm run dev
```

In browser:
1. Press `Ctrl+Shift+Delete`
2. Clear **Cached images and files**
3. Hard reload: `Ctrl+Shift+R`

---

## 🧪 Test NLP Entry

Once fixed, test with these inputs:

### **Text Input (Chat Assistant):**
- ✅ "I spend 20rm in mamak"
- ✅ "sold 5 nasi lemak 25 ringgit"
- ✅ "grab 15.50"
- ✅ "paid rent 800"

### **Voice Input (Microphone):**
1. Click microphone icon
2. Say: "Saya jual lima nasi lemak dua puluh lima ringgit"
3. Should auto-save transaction

### **Expected Behavior:**
- ✅ Shows "✅ SAVED! Sale: RM 25.00..."
- ✅ Transaction appears in list immediately
- ✅ No review form (direct save)

---

## 📊 Monitoring & Debugging

### Enable Detailed Logs

The updated `geminiService.ts` now logs:
- ✅ API key validation on startup
- 📤 Every message sent
- 📥 Every response received
- ❌ Detailed error info

**Check logs in browser console:**
```
✅ Gemini API Key found: AIzaSyDC2z...
📤 Sending message to Gemini: I spend 20rm
📥 Received response: @@TRANSACTION_START@@...
✅ SAVED!
```

### Common Log Patterns

**Good (Working):**
```
✅ Gemini API Key found: AIzaSy...
🔍 Parsing simple transaction: I spend 20rm
✅ Parse successful
```

**Bad (API Key Missing):**
```
❌ GEMINI API KEY MISSING! Check your .env.local file.
```

**Bad (Quota Exceeded):**
```
❌ Chat Error Details: { status: 429 }
⚠️ API quota exceeded. Please try again later...
```

---

## 🆘 Still Not Working?

### Check These:

1. **API Key Format:**
   ```bash
   # Should look like this:
   VITE_GEMINI_API_KEY=AIzaSyDC2zaLZDBo6ITOlISWh8i3cn-QDm17oCs

   # NOT like this:
   VITE_GEMINI_API_KEY="AIzaSy..."  # ❌ No quotes
   GEMINI_API_KEY=AIzaSy...         # ❌ Missing VITE_ prefix
   ```

2. **Server Running:**
   ```bash
   # Should see:
   VITE v6.2.0  ready in 500 ms
   ➜  Local:   http://localhost:3000/
   ```

3. **Browser Compatibility:**
   - Use Chrome, Edge, or Firefox (latest)
   - Enable JavaScript
   - Allow microphone permissions (for voice)

4. **Supabase Connection:**
   ```bash
   # Test Supabase separately
   # Check browser Network tab for errors
   ```

---

## 📞 Get Help

### Collect This Info:

1. **Error Message:**
   - Copy exact text from browser console
   - Screenshot if helpful

2. **Environment:**
   ```bash
   node --version
   npm --version
   cat .env.local | grep VITE  # Don't share full keys!
   ```

3. **Check API Output:**
   ```bash
   node check-api.js > diagnosis.txt
   ```

4. **Browser Console Log:**
   - Press F12 → Console
   - Copy all red errors
   - Copy 📤 and 📥 log messages

### Resources:

- 🔗 Gemini API Docs: https://ai.google.dev/docs
- 🔗 Supabase Docs: https://supabase.com/docs
- 🔗 Project Readme: `QUICK_START.md`

---

## ✨ Success Checklist

- [ ] `.env.local` exists with valid keys
- [ ] `node check-api.js` shows all ✅
- [ ] Dev server restarted after .env changes
- [ ] Browser console shows `✅ Gemini API Key found`
- [ ] Test input "I spend 20rm" saves transaction
- [ ] No red errors in browser console

---

## 🔐 Security Notes

**Never:**
- ❌ Commit `.env.local` to Git
- ❌ Share your API keys publicly
- ❌ Use production keys in development

**Always:**
- ✅ Use environment variables
- ✅ Rotate keys if exposed
- ✅ Set up API key restrictions in Google Cloud Console

---

## 🚀 Performance Tips

1. **Free Tier Limits:**
   - Gemini Flash: 15 requests/min
   - 1,500 requests/day
   - Monitor at: https://aistudio.google.com/

2. **Reduce API Calls:**
   - Use simple parser first (faster, cheaper)
   - Chat API used for complex queries only
   - Images use premium model (limited quota)

3. **Optimize Prompts:**
   - Keep transaction history context small
   - App automatically limits to last 100 transactions

---

**Last Updated:** February 2024
**Version:** 1.0
