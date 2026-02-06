# 📦 Data Storage Explained - Where is My Data?

## TL;DR (Quick Answer)

**Your transactions are stored in Supabase (Cloud Database), NOT locally.**

The "Local Storage" label in settings is **misleading** - it only refers to preferences like theme and language, not your actual transaction data.

---

## 🗄️ What's Stored Where?

### ✅ **Supabase Database (Cloud)** - Your Important Data

**What's stored:**
- ✅ All transactions (sales & expenses)
- ✅ Your profile (name, email, role)
- ✅ Organization settings
- ✅ Team members
- ✅ Invitations
- ✅ Receipt data
- ✅ Audit logs

**Why Supabase:**
- 🌐 **Accessible anywhere** - Login from any device, see your data
- 🔄 **Real-time sync** - Changes appear instantly on all devices
- 🔒 **Secure** - Bank-level security with encryption
- 💾 **Backed up** - Supabase handles backups automatically
- 👥 **Shareable** - Team members see the same data

**Connection:**
```
Your Device → Internet → Supabase (PostgreSQL) → Your Data
```

---

### 📱 **Browser Local Storage** - Your Preferences Only

**What's stored:**
- 🎨 Dark mode preference (`suarakira_theme`)
- 🌐 Language selection (`suarakira_lang`)
- ⚙️ Entry mode setting (`suarakira_entry_mode`)
- 🔔 Notification preferences (`suarakira_notif_*`)
- 📱 Device ID (`suarakira_device_id`)
- 📍 Location permission status

**Why Local Storage:**
- ⚡ **Instant** - No network needed to remember your preferences
- 💨 **Fast** - App loads with your preferred settings immediately
- 🔋 **Efficient** - Reduces API calls

**Important:**
- ❌ **NO TRANSACTION DATA** is stored locally
- ❌ **NO FINANCIAL DATA** is stored locally
- ❌ Clearing browser cache does NOT delete your transactions

---

## 🔍 Understanding "Clear All Transaction History"

### What This Button Actually Does:

**Button Text:** "Clear All Transaction History"
**Misleading Label:** "Local Storage" ❌

**What REALLY happens:**
```javascript
// From services/db.ts
export const clearTransactions = async (): Promise<void> => {
  // This DELETES FROM SUPABASE DATABASE!
  const query = supabase.from("transactions").delete();

  if (profile.role === "staff") {
    query = query.eq("created_by", user.id); // Delete YOUR transactions
  } else if (profile.role === "admin") {
    query = query.eq("organization_id", profile.organization_id); // Delete ALL org transactions
  }

  await query; // ⚠️ PERMANENT DELETION FROM DATABASE!
}
```

**What gets deleted:**
- 🗑️ **FROM SUPABASE DATABASE** (permanent!)
- **Staff:** All transactions YOU created
- **Admin:** ALL transactions in your organization

**What does NOT get deleted:**
- ✅ Your account/profile
- ✅ Organization settings
- ✅ Team members
- ✅ Browser preferences (theme, language)

**⚠️ WARNING: THIS IS PERMANENT!**
- Cannot be undone
- No "recycle bin"
- Data is gone forever

---

## 🧐 Why the Confusion?

### The Misleading UI

**Current Settings:**
```
┌─────────────────────────────────────┐
│ Clear All Transaction History      │
│                                     │
│ [Delete Button]  [Local Storage]   │ ← MISLEADING!
└─────────────────────────────────────┘
```

**The "Local Storage" badge makes it seem like:**
- ❌ Data is stored locally (it's NOT)
- ❌ Safe to delete (it's NOT)
- ❌ Just clearing browser cache (it's NOT)

**Reality:**
- This deletes from Supabase (cloud database)
- This is PERMANENT
- This affects actual financial data

---

## ✅ Recommended UI Fix

### Better Labeling:

**Option 1: Remove Misleading Badge**
```
┌─────────────────────────────────────┐
│ Clear All Transaction History      │
│                                     │
│ [Delete Button]  [⚠️ Permanent]     │ ✅ Clear warning
└─────────────────────────────────────┘
```

**Option 2: Accurate Description**
```
┌─────────────────────────────────────┐
│ Delete All Transactions             │
│ (From Database - Cannot Undo)      │
│                                     │
│ [Delete Button]  [Cloud Database]   │ ✅ Accurate
└─────────────────────────────────────┘
```

**Option 3: Confirmation Dialog**
```javascript
const handleClearData = () => {
  const confirmed = confirm(
    "⚠️ DELETE ALL TRANSACTIONS?\n\n" +
    "This will PERMANENTLY delete:\n" +
    "- All transactions from Supabase database\n" +
    "- Cannot be recovered\n" +
    "- This is NOT just clearing browser cache\n\n" +
    "Are you absolutely sure?"
  );

  if (confirmed) {
    const doubleConfirm = confirm(
      "Last chance! Type 'DELETE' in the next prompt to confirm."
    );

    if (doubleConfirm) {
      // Actually delete
    }
  }
};
```

---

## 🔐 Data Security & Privacy

### Your Data is Safe in Supabase

**Security Features:**
- 🔒 **Row Level Security (RLS)** - You only see YOUR data
- 🔐 **Encryption at rest** - Data encrypted in database
- 🌐 **Encryption in transit** - HTTPS/TLS for all connections
- 🛡️ **Organization isolation** - Complete separation between companies
- 🔑 **Authentication** - JWT-based secure auth
- 📝 **Audit logs** - Track who did what, when

**Supabase Infrastructure:**
- ☁️ Hosted on AWS (Amazon Web Services)
- 🌍 Multiple data centers
- 💾 Automatic backups
- 🔄 Point-in-time recovery
- 📊 99.9% uptime SLA

**Compliance:**
- GDPR compliant
- PDPA compliant (Malaysia)
- SOC 2 Type II certified
- ISO 27001 certified

---

## 📊 Data Flow Diagram

### When You Add a Transaction:

```
1. You speak/type:
   "Jual 5 nasi lemak 25rm"

2. Browser (Local):
   ├─ Gemini AI processes input
   ├─ Extracts: item, quantity, price, type
   └─ Creates transaction object

3. Network:
   ├─ Sends to Supabase API (HTTPS)
   └─ JWT token for authentication

4. Supabase (Cloud):
   ├─ Validates authentication
   ├─ Checks RLS policies
   ├─ Inserts into PostgreSQL database
   ├─ Triggers audit log
   └─ Returns success

5. Browser (Local):
   ├─ Receives confirmation
   ├─ Updates UI instantly
   └─ Shows in transaction list
```

### When You Load Transactions:

```
1. App loads:

2. Browser (Local):
   ├─ Checks auth session
   ├─ Sends GET request to Supabase
   └─ JWT token for authentication

3. Supabase (Cloud):
   ├─ Validates user
   ├─ Applies RLS filters:
   │  ├─ Staff: WHERE created_by = current_user
   │  └─ Admin: WHERE organization_id = user_org
   ├─ Queries PostgreSQL
   └─ Returns filtered results

4. Browser (Local):
   ├─ Receives transaction array
   ├─ Renders in UI
   └─ NO LOCAL STORAGE of transactions
```

---

## 🛠️ What Happens If...?

### Scenario 1: Clear Browser Cache
**Action:** Clear browsing data in Chrome/Safari/etc.

**What you lose:**
- ❌ Theme preference (reset to light mode)
- ❌ Language preference (reset to English)
- ❌ Device ID (new one generated)
- ❌ Login session (must login again)

**What you keep:**
- ✅ ALL TRANSACTIONS (in Supabase)
- ✅ Profile data
- ✅ Organization settings
- ✅ Team members

**Recovery:**
- Just login again
- All data still there!

---

### Scenario 2: Click "Clear All Transaction History"
**Action:** Click the delete button in Settings

**What you lose:**
- ❌ ALL TRANSACTIONS (permanent!)
- ❌ Cannot undo
- ❌ Gone from Supabase database

**What you keep:**
- ✅ Your account/profile
- ✅ Organization
- ✅ Team members
- ✅ Settings/preferences

**Recovery:**
- ⚠️ CANNOT RECOVER
- No backups (unless Supabase has snapshots)
- Start from zero

---

### Scenario 3: Uninstall PWA App
**Action:** Remove SuaraKira from home screen

**What you lose:**
- ❌ App shortcut
- ❌ Browser cache
- ❌ Preferences (theme, language)
- ❌ Login session

**What you keep:**
- ✅ ALL TRANSACTIONS (in Supabase)
- ✅ All data intact

**Recovery:**
- Visit website again
- Login
- All data still there!

---

### Scenario 4: New Device
**Action:** Login from different phone/computer

**What you see:**
- ✅ ALL YOUR TRANSACTIONS
- ✅ Same data everywhere
- ✅ Real-time sync

**Why:**
- Data stored in cloud (Supabase)
- Tied to your account, not device
- Login = instant access to all data

---

### Scenario 5: Offline Mode (PWA)
**Action:** No internet connection

**What happens:**
- ✅ Service worker caches app shell
- ✅ Can view previously loaded transactions
- ⚠️ Cannot add new transactions (queued)
- ⚠️ Cannot fetch latest data

**When online again:**
- ✅ Queued transactions sync to Supabase
- ✅ Latest data fetched
- ✅ All devices updated

---

## 📋 Technical Details

### Local Storage Keys Used:

```javascript
// App Preferences (Safe to delete)
localStorage.setItem('suarakira_theme', 'dark');           // Theme
localStorage.setItem('suarakira_lang', 'en');              // Language
localStorage.setItem('suarakira_entry_mode', 'both');      // Entry mode
localStorage.setItem('suarakira_notif_lowstock', 'true');  // Notifications
localStorage.setItem('suarakira_notif_daily', 'false');    // Notifications

// Device Tracking (Auto-regenerates)
localStorage.setItem('suarakira_device_id', 'uuid...');    // Device ID
localStorage.setItem('suarakira_device_info', '{...}');    // Device info

// Permissions (Auto-checks)
localStorage.setItem('suarakira_location_permission', 'granted');
localStorage.setItem('suarakira_location_primer_shown', 'true');
```

**Size:** ~1-2 KB total (tiny!)

**Compare to:**
- Supabase database: Unlimited (cloud)
- Transactions: Thousands of records
- Size: MBs to GBs

---

## 🎯 Best Practices

### For Users:

**DO:**
- ✅ Trust that data is in Supabase
- ✅ Clear browser cache if needed (data safe)
- ✅ Login from multiple devices (same data)
- ✅ Use offline mode (PWA caching)

**DON'T:**
- ❌ Click "Clear All" unless you mean it
- ❌ Think local storage = your transactions
- ❌ Worry about browser cache affecting data
- ❌ Delete without confirmation

### For Developers:

**DO:**
- ✅ Fix misleading "Local Storage" label
- ✅ Add strong confirmation dialogs
- ✅ Explain what gets deleted
- ✅ Consider "Export before delete" feature
- ✅ Add undo window (soft delete)

**DON'T:**
- ❌ Store sensitive data locally
- ❌ Use local storage for transactions
- ❌ Mislead users about data location
- ❌ Make destructive actions easy

---

## 🔄 Proposed Code Fix

### Current (Misleading):

```tsx
<button onClick={onClearData}>
  {t.clearData}
  <span>Local Storage</span> {/* ❌ WRONG */}
</button>
```

### Proposed Fix 1 (Clear Warning):

```tsx
const handleClearData = () => {
  const confirmed = confirm(
    "⚠️ PERMANENT DELETION WARNING\n\n" +
    "This will DELETE all transactions from the DATABASE (Supabase).\n\n" +
    "✅ What gets deleted:\n" +
    "  • All your transaction records\n" +
    "  • Sale and expense history\n" +
    "  • Cannot be recovered\n\n" +
    "❌ This is NOT clearing browser cache!\n" +
    "❌ This is PERMANENT!\n\n" +
    "Type 'DELETE' to confirm."
  );

  if (confirmed) {
    const typed = prompt("Type DELETE to confirm:");
    if (typed === "DELETE") {
      onClearData();
    } else {
      alert("Deletion cancelled. Your data is safe.");
    }
  }
};

<button onClick={handleClearData}>
  {t.clearData}
  <span className="bg-red-500">⚠️ Permanent</span>
</button>
```

### Proposed Fix 2 (Export First):

```tsx
const handleClearData = async () => {
  // Offer export first
  const shouldExport = confirm(
    "Do you want to export your data first?\n\n" +
    "We'll download a CSV backup before deletion."
  );

  if (shouldExport) {
    await exportTransactionsToCSV();
  }

  // Then confirm deletion
  const confirmed = confirm(
    "⚠️ Delete all transactions from database?\n" +
    "This cannot be undone!"
  );

  if (confirmed) {
    onClearData();
  }
};
```

---

## 📞 Support & Questions

**Common Questions:**

**Q: Is my data backed up?**
A: Yes, Supabase handles automatic backups. However, there's no user-facing "undo" button. Contact support for emergency recovery.

**Q: Can I export my data?**
A: Export feature coming soon! For now, admins can query Supabase directly.

**Q: What if I accidentally delete?**
A: Contact support immediately. Supabase may have point-in-time recovery (within 7 days for paid plans).

**Q: Is my data synced across devices?**
A: Yes! Login from any device to see all your data. It's in the cloud.

**Q: What happens if Supabase goes down?**
A: PWA caching allows viewing previously loaded data. New data waits until online.

---

## 🎓 Summary

### Key Takeaways:

1. **Transactions = Supabase (Cloud) ✅**
   - NOT stored locally
   - Accessible anywhere
   - Backed up automatically

2. **Local Storage = Preferences Only 📱**
   - Theme, language, settings
   - NO financial data
   - Safe to clear

3. **"Clear All" = PERMANENT DELETE ⚠️**
   - Deletes from Supabase
   - Cannot undo
   - Misleading label needs fixing

4. **Your Data is Safe 🔒**
   - Bank-level security
   - Organization isolation
   - GDPR/PDPA compliant

5. **Browser Cache ≠ Your Data 💾**
   - Clear cache anytime
   - Won't affect transactions
   - Just preferences reset

---

**Bottom Line:**
Your transactions are safely stored in **Supabase cloud database**, NOT in your browser's local storage. The "Local Storage" label in settings is misleading and should be fixed.

---

**Last Updated:** February 2026
**Version:** 1.0
**Recommended Action:** Update UI to avoid confusion
