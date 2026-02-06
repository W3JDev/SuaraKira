# SuaraKira 2.0 - Implementation Guide
## Full "No-Excuse" Audit & Fast Entry System

**Date:** 2026-02-06
**Version:** 2.0.0
**Status:** ✅ Schema Migrated | 🚧 Services In Progress | ⏳ UI Pending

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Implementation Progress](#implementation-progress)
4. [Architecture Changes](#architecture-changes)
5. [Mode 1: Fast Entry Flow](#mode-1-fast-entry-flow)
6. [Mode 2: Natural Language Entry](#mode-2-natural-language-entry)
7. [Service Layer](#service-layer)
8. [UI Components](#ui-components)
9. [Testing Checklist](#testing-checklist)
10. [Deployment Steps](#deployment-steps)

---

## Overview

### Goals
- **Entry time:** < 20 seconds for any transaction
- **"No-excuse" logging:** Every transaction captures timestamp, device, user, and (if allowed) location
- **Receipt binding:** Live camera only (no gallery picker)
- **AI-powered:** Staff don't need accounting knowledge

### Two Entry Modes

#### Mode 1: Fast Form Flow (Tap + Scan)
- Big buttons: "Sale In" | "Expense Out"
- Auto-focused amount field with numeric keypad
- Payment method: Cash, bKash, Bank, Other (segmented buttons)
- Optional: Category, Note, Receipt
- Target: 5-10 seconds without receipt, 15-20 seconds with receipt

#### Mode 2: Natural-Language Text/Voice
- Chat interface: "I spend 20rm in mamak"
- AI extracts: amount, merchant, type, payment method
- Confirmation flow with inline edit buttons
- Voice input with ASR → text confirmation

---

## Database Schema

### ✅ Migrated Tables

#### `transactions` (Extended)
**New columns added:**
```sql
device_id TEXT                    -- Browser fingerprint
source_channel TEXT               -- FORM | CHAT_TEXT | CHAT_VOICE | FAST_ENTRY_SALE | etc.
direction TEXT                    -- SALE_IN | EXPENSE_OUT
payment_method TEXT DEFAULT 'CASH' -- CASH | BKASH | BANK | OTHER
is_business BOOLEAN DEFAULT true
location_id UUID                  -- FK to locations
has_receipt_image BOOLEAN
receipt_image_id UUID             -- FK to files
ai_parsed_payload JSONB
ai_confidence_score NUMERIC
merchant_name TEXT
merchant_type TEXT
raw_text_input TEXT
occurred_at TIMESTAMPTZ           -- Actual transaction time
status TEXT DEFAULT 'CONFIRMED'   -- PENDING_REVIEW | CONFIRMED | FLAGGED | VOID
app_version TEXT
gps_missing_reason TEXT           -- PERMISSION_DENIED | NO_GPS | NOT_REQUESTED
receipt_required BOOLEAN
```

**Backward compatibility:** All new columns are nullable or have defaults. Existing transactions unaffected.

#### `locations` (New)
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  organization_id UUID,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  accuracy_meters NUMERIC,
  captured_at TIMESTAMPTZ,
  captured_by_user_id UUID,
  place_name TEXT,              -- From reverse geocoding
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ
);
```

**RLS:** Users see locations in their organization only.

#### `files` (New)
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  organization_id UUID,
  file_type TEXT,               -- RECEIPT_IMAGE | DOCUMENT | OTHER
  storage_bucket TEXT DEFAULT 'receipts',
  storage_path TEXT NOT NULL,
  storage_url TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  hash_sha256 TEXT,             -- For duplicate detection
  created_at TIMESTAMPTZ,
  created_by_user_id UUID,
  source TEXT DEFAULT 'CAMERA_LIVE'
);
```

**Storage:** Supabase Storage bucket `receipts` (private).
**Migration plan:** Current base64 attachments stay in `transactions.attachment` for now; new receipts go to Storage.

#### `audit_log` (New)
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  transaction_id UUID,
  organization_id UUID,
  actor_type TEXT,              -- USER | SYSTEM
  actor_id UUID,
  action_type TEXT,             -- TRANSACTION_CREATED | UPDATED | etc.
  created_at TIMESTAMPTZ,
  ip_address INET,
  device_id TEXT,
  old_values JSONB,
  new_values JSONB,
  reason TEXT
);
```

**Append-only:** No updates or deletes. Auto-populated by trigger on `transactions` INSERT/UPDATE.

### Automatic Audit Trigger
```sql
CREATE TRIGGER audit_transaction_changes
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_transaction_audit();
```

Every transaction save automatically creates an audit log entry.

---

## Implementation Progress

### ✅ Phase 1: Database Schema (COMPLETE)
- [x] Extend `transactions` table with 20+ columns
- [x] Create `locations`, `files`, `audit_log` tables
- [x] Add foreign keys and indexes
- [x] Enable RLS on new tables
- [x] Create audit trigger function
- [x] Apply migrations to `clywzojxthjpqpvttpvu` project

### ✅ Phase 2: Core Services (IN PROGRESS)
- [x] `services/deviceId.ts` - Browser fingerprinting
- [x] `services/locationService.ts` - GPS capture with permission handling
- [x] `types.ts` - Extended type definitions
- [ ] `services/auditLogger.ts` - Audit logging wrapper
- [ ] `services/receiptStorage.ts` - Supabase Storage upload
- [ ] Update `services/db.ts` - Auto-capture metadata

### ⏳ Phase 3: Fast Entry UI (PENDING)
- [ ] `components/FastEntry.tsx` - Main entry point
- [ ] `components/ExpenseForm.tsx` - Quick expense flow
- [ ] `components/SaleForm.tsx` - Quick sale flow
- [ ] `components/LocationPrimer.tsx` - Permission request modal
- [ ] `components/CameraCapture.tsx` - Live camera only

### ⏳ Phase 4: Enhanced Chat (PENDING)
- [ ] Enhance `ChatAssistant.tsx` - Better NLP flow
- [ ] Add confirmation buttons in chat
- [ ] Integrate voice recorder in chat
- [ ] Add "Business vs Personal" quick toggle

### ⏳ Phase 5: Receipt Enforcement (PENDING)
- [ ] Update `ReceiptModal.tsx` - Force live camera
- [ ] Remove gallery picker
- [ ] Add receipt upload to Storage
- [ ] Generate file hash (SHA-256)

### ⏳ Phase 6: Integration (PENDING)
- [ ] Update `App.tsx` - Add Fast Entry route
- [ ] Update `db.ts` - Auto-capture device/location
- [ ] Add location permission flow on first use
- [ ] Update transaction form to show new fields

### ⏳ Phase 7: Admin Dashboard Enhancements (PENDING)
- [ ] Staff compliance metrics (% with receipt, GPS, etc.)
- [ ] Audit log viewer for admins
- [ ] Flag transactions with missing data
- [ ] Entry delay histogram

---

## Architecture Changes

### Current Flow (Before)
```
User Input (Voice/Manual/Image)
  ↓
AI Processing (Gemini)
  ↓
Review Form (TransactionForm.tsx)
  ↓
db.saveTransaction() → LocalStorage/Supabase
  ↓
Update UI
```

### New Flow (After)
```
User Input (Voice/Manual/Fast Entry/Chat)
  ↓
Capture Metadata (device, location, timestamp)
  ↓
AI Processing (Gemini) + Confidence Score
  ↓
Review Form (with new fields)
  ↓
db.saveTransaction() → Supabase
  ├─ Insert transaction
  ├─ Insert location (if captured)
  ├─ Upload receipt to Storage (if attached)
  └─ Trigger creates audit_log entry
  ↓
Update UI + Realtime sync
```

### New Service Layer

```
services/
├── supabase.ts          [existing] Auth & client
├── db.ts                [updated]  Transaction CRUD + auto-metadata
├── geminiService.ts     [existing] AI processing
├── deviceId.ts          [new]      Browser fingerprint
├── locationService.ts   [new]      GPS + permission
├── auditLogger.ts       [new]      Manual audit logging
└── receiptStorage.ts    [new]      Supabase Storage upload
```

---

## Mode 1: Fast Entry Flow

### UI Structure

```
┌─────────────────────────────────────┐
│  ⚡ Fast Entry                       │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────┐  ┌───────────┐    │
│   │ SALE IN   │  │EXPENSE OUT│    │
│   │   💰      │  │   💸       │    │
│   └───────────┘  └───────────┘    │
│                                     │
│   Scan Receipt Only                │
│                                     │
└─────────────────────────────────────┘
```

### Expense Out Flow

**Screen 1: Quick Expense**
```
┌─────────────────────────────────────┐
│  ← Back        Expense Out           │
├─────────────────────────────────────┤
│                                     │
│  Amount (RM) *                      │
│  ┌─────────────────────────────┐   │
│  │  [  50.00  ]  ← auto-focus  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Payment Method *                   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│  │Cash│ │bKsh│ │Bank│ │Othr│         │
│  └───┘ └───┘ └───┘ └───┘         │
│                                     │
│  ▼ More details (collapsed)         │
│                                     │
│  📷 Attach Receipt (if any)         │
│                                     │
├─────────────────────────────────────┤
│           [  SAVE  ]  ✓             │
└─────────────────────────────────────┘
```

**Behavior:**
- On mount: Auto-capture timestamp, device ID, user ID, app version
- If location permission granted: Silent GPS capture
- If user taps "Attach Receipt": Open live camera
- On Save: Create transaction with `source_channel = 'FAST_ENTRY_EXPENSE'`

**Expanded "More details":**
```
  Category
  ┌─────────────────────────────┐
  │ Food  Rent  Transport  Other│ ← Pills
  └─────────────────────────────┘

  Note (optional)
  ┌─────────────────────────────┐
  │ "Mamak lunch"         🎤    │
  └─────────────────────────────┘
```

### Sale In Flow
Same UX, just:
- Header: "Sale In"
- Default payment method: "Cash"
- Optional: Quantity & Unit Price fields
- `source_channel = 'FAST_ENTRY_SALE'`

### Receipt Capture Sub-Flow

**Camera Screen:**
```
┌─────────────────────────────────────┐
│  Cancel                             │
│                                     │
│   ┌───────────────────────────┐    │
│   │                           │    │
│   │   [Camera viewfinder]     │    │
│   │                           │    │
│   │   ┌─────────────────┐     │    │
│   │   │  Frame overlay  │     │    │
│   │   └─────────────────┘     │    │
│   │                           │    │
│   └───────────────────────────┘    │
│                                     │
│   Point at receipt. Auto-snap.      │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**
```tsx
<input
  type="file"
  accept="image/*"
  capture="environment"  // Force camera on mobile
/>
```

**Or use React Camera library:**
```tsx
import { Camera } from 'react-camera-pro';

<Camera
  ref={cameraRef}
  facingMode="environment"
  aspectRatio={3/4}
/>
```

**After snap:**
```
┌─────────────────────────────────────┐
│                                     │
│   [Receipt preview image]           │
│                                     │
│   ┌──────────┐  ┌──────────┐       │
│   │ Retake   │  │ Use This │       │
│   └──────────┘  └──────────┘       │
└─────────────────────────────────────┘
```

**On confirm:**
- Back to Screen 1 with thumbnail + "Receipt attached ✓"
- File stored in memory, uploaded on Save

---

## Mode 2: Natural Language Entry

### Chat Entry Screen

```
┌─────────────────────────────────────┐
│  SuaraKira AI • Online       [X]    │
├─────────────────────────────────────┤
│                                     │
│  [Bot] Hello! I'm your assistant.   │
│  Tell me about your transaction.    │
│                                     │
│  [You] I spend 20rm in mamak        │
│                                     │
│  [Bot] I understood:                │
│  • Type: Expense Out                │
│  • Amount: RM 20                    │
│  • Merchant: Mamak (Food/Meal)      │
│  • Payment: Cash                    │
│  • Location: [if captured]          │
│                                     │
│  Is this correct?                   │
│  ┌────────┐┌────────┐┌────────┐   │
│  │Correct ││ Amount ││ Method │   │
│  └────────┘└────────┘└────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Describe your transaction... 🎤 📷 │
└─────────────────────────────────────┘
```

### NLP Flow

**User input:** "I spend 20rm in mamak"

**AI Processing:**
```typescript
// services/geminiService.ts - new function
export async function parseNaturalLanguageInput(text: string) {
  const prompt = `
Extract transaction details from this text:
"${text}"

Return JSON:
{
  "type": "sale" | "expense",
  "amount": number,
  "currency": "MYR",
  "merchant": string,
  "merchantType": "food" | "transport" | "rent" | etc.,
  "paymentMethod": "CASH" | "BKASH" | "BANK" | "OTHER",
  "confidence": 0-1,
  "isBusiness": true | false
}
`;

  const result = await gemini.generateContent(prompt);
  return JSON.parse(cleanJsonResponse(result.text()));
}
```

**Chat response:**
```typescript
if (aiResponse.confidence > 0.8) {
  // High confidence: show confirmation
  return {
    message: "I understood: Expense Out, RM 20, ...",
    needsConfirmation: true,
    buttons: ['Correct', 'Change amount', 'Change method']
  };
} else {
  // Low confidence: ask clarifying question
  return {
    message: "Did you mean RM 20 or RM 2.00?",
    needsConfirmation: true,
    buttons: ['RM 20', 'RM 2.00', 'Type again']
  };
}
```

### Voice Input in Chat

**User taps mic icon:**

1. Show prompt: "Say it like: I spent 20 ringgit at mamak"
2. Record audio (max 10 seconds)
3. Send to ASR (browser Web Speech API or Gemini)
4. Show recognized text inline:
   ```
   You said: "I spend 20rm in mamak"
   ┌──────┐  ┌────────┐
   │ Edit │  │Confirm │
   └──────┘  └────────┘
   ```
5. On confirm: Run NLP pipeline (same as text)

**Implementation:**
```typescript
// Use browser Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-MY'; // Malaysian English
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  setRecognizedText(transcript);
};
```

### Business vs Personal

**After AI understanding:**
```
[Bot] Is this for business or personal?
┌─────────┐  ┌─────────┐  ┌──────┐
│Business │  │ Personal│  │ Skip │
│  (✓)    │  │         │  │      │
└─────────┘  └─────────┘  └──────┘
```

- Default: "Business" pre-selected
- Sets `is_business` field
- Staff can skip (defaults to true)

---

## Service Layer

### `services/deviceId.ts` ✅

**Purpose:** Generate persistent device identifier

**Key functions:**
```typescript
export async function getDeviceId(): Promise<string>
export function getDeviceInfo(): DeviceInfo | null
export function getAppVersion(): string
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop'
export async function getDeviceMetadata(): Promise<object>
```

**Storage:** `localStorage.suarakira_device_id`

**Format:** `SK_[fingerprint]_[timestamp]`

### `services/locationService.ts` ✅

**Purpose:** GPS capture with permission management

**Key functions:**
```typescript
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus>
export async function requestLocationPermission(): Promise<LocationPermissionStatus>
export async function captureLocation(): Promise<LocationData | null>
export async function captureAndSaveLocation(): Promise<string | null> // Returns location_id
export async function getGpsMissingReason(): Promise<'PERMISSION_DENIED' | 'NO_GPS' | 'NOT_REQUESTED' | null>
export async function reverseGeocode(lat, lng): Promise<{place_name, city, country} | null>
```

**Permission flow:**
1. Check `localStorage.suarakira_location_permission`
2. If not set, request permission (after primer modal)
3. If denied, log to `audit_log` with `action_type = 'LOCATION_PERMISSION_DENIED'`
4. Silent capture on every transaction if granted

### `services/auditLogger.ts` (TODO)

**Purpose:** Manual audit logging (in addition to automatic trigger)

```typescript
export async function logLocationCaptured(transactionId: string, locationId: string)
export async function logReceiptAttached(transactionId: string, fileId: string)
export async function logCategoryManuallyChanged(transactionId: string, oldCategory: string, newCategory: string, reason?: string)
export async function logAIParseRetry(transactionId: string, reason: string)
```

### `services/receiptStorage.ts` (TODO)

**Purpose:** Upload receipts to Supabase Storage

```typescript
export async function uploadReceipt(
  file: File,
  organizationId: string,
  userId: string
): Promise<{ fileId: string; storageUrl: string } | null>

export async function generateFileHash(file: File): Promise<string>
export async function checkDuplicateReceipt(hash: string): Promise<string | null> // Returns existing file_id if duplicate
```

**Implementation:**
```typescript
// 1. Generate SHA-256 hash
const hash = await generateFileHash(file);

// 2. Check for duplicate
const existingFileId = await checkDuplicateReceipt(hash);
if (existingFileId) {
  return { fileId: existingFileId, storageUrl: '...' };
}

// 3. Upload to Supabase Storage
const path = `${organizationId}/${userId}/${Date.now()}_${file.name}`;
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(path, file);

// 4. Get public URL (or signed URL if private)
const { data: { publicUrl } } = supabase.storage
  .from('receipts')
  .getPublicUrl(path);

// 5. Save file metadata to `files` table
const { data: fileRecord } = await supabase.from('files').insert({
  organization_id: organizationId,
  file_type: 'RECEIPT_IMAGE',
  storage_path: path,
  storage_url: publicUrl,
  file_size_bytes: file.size,
  mime_type: file.type,
  hash_sha256: hash,
  created_by_user_id: userId,
  source: 'CAMERA_LIVE'
}).select('id').single();

return { fileId: fileRecord.id, storageUrl: publicUrl };
```

### Updated `services/db.ts`

**Changes needed:**

```typescript
export const saveTransaction = async (transaction: Transaction): Promise<Transaction[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const profile = await getProfile(user.id);

    // ✨ NEW: Auto-capture metadata
    const deviceId = await getDeviceId();
    const locationId = await captureAndSaveLocation(); // Returns null if permission denied
    const gpsMissingReason = locationId ? null : await getGpsMissingReason();
    const appVersion = getAppVersion();

    // ✨ NEW: Upload receipt if attached (new transactions only)
    let receiptImageId = transaction.receiptImageId;
    if (transaction.attachment && !receiptImageId) {
      // TODO: Upload base64 to Storage and get file ID
      // For now, keep base64 in attachment field
    }

    // Transform to DB format
    const dbTransaction = {
      id: transaction.id,
      item: transaction.item,
      category: transaction.category,
      quantity: transaction.quantity,
      price: transaction.price,
      total: transaction.total,
      type: transaction.type,

      // ✨ NEW: Audit fields
      device_id: deviceId,
      source_channel: transaction.sourceChannel || 'LEGACY',
      direction: transaction.type === 'sale' ? 'SALE_IN' : 'EXPENSE_OUT',
      payment_method: transaction.paymentMethod || 'CASH',
      is_business: transaction.isBusiness ?? true,
      location_id: locationId,
      has_receipt_image: !!transaction.attachment || !!receiptImageId,
      receipt_image_id: receiptImageId,
      ai_parsed_payload: transaction.aiParsedPayload,
      ai_confidence_score: transaction.aiConfidenceScore,
      merchant_name: transaction.merchantName,
      merchant_type: transaction.merchantType,
      raw_text_input: transaction.rawTextInput,
      occurred_at: transaction.occurredAt ? new Date(transaction.occurredAt).toISOString() : null,
      status: transaction.status || 'CONFIRMED',
      app_version: appVersion,
      gps_missing_reason: gpsMissingReason,
      receipt_required: false, // TODO: Implement policy rules

      // Existing fields
      original_transcript: transaction.originalTranscript,
      receipt_data: transaction.receipt,
      attachment: transaction.attachment,
      created_by: user.id,
      organization_id: profile.organization_id,
      timestamp: new Date(transaction.timestamp).toISOString(),
    };

    const { error } = await supabase.from("transactions").upsert(dbTransaction);

    if (error) throw error;

    // Audit log entry is automatically created by trigger

    // Return updated list
    return await getTransactions();
  } catch (e) {
    console.error("Failed to save transaction:", e);
    throw e;
  }
};
```

---

## UI Components

### `components/FastEntry.tsx` (TODO)

```tsx
import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import SaleForm from './SaleForm';

type EntryType = 'sale' | 'expense' | 'scan' | null;

const FastEntry: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [entryType, setEntryType] = useState<EntryType>(null);

  if (entryType === 'expense') {
    return <ExpenseForm onBack={() => setEntryType(null)} onClose={onClose} />;
  }

  if (entryType === 'sale') {
    return <SaleForm onBack={() => setEntryType(null)} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900">
      <header className="p-4 border-b">
        <button onClick={onClose}>← Back to Dashboard</button>
        <h1 className="text-2xl font-bold">⚡ Fast Entry</h1>
      </header>

      <main className="p-6 space-y-4">
        <button
          onClick={() => setEntryType('sale')}
          className="w-full h-32 bg-emerald-500 text-white rounded-2xl text-2xl font-bold"
        >
          💰 SALE IN
        </button>

        <button
          onClick={() => setEntryType('expense')}
          className="w-full h-32 bg-red-500 text-white rounded-2xl text-2xl font-bold"
        >
          💸 EXPENSE OUT
        </button>

        <button
          onClick={() => setEntryType('scan')}
          className="w-full py-4 border-2 border-slate-300 rounded-xl"
        >
          📷 Scan Receipt Only
        </button>
      </main>
    </div>
  );
};

export default FastEntry;
```

### `components/ExpenseForm.tsx` (TODO)

```tsx
import React, { useState, useEffect } from 'react';
import { getDeviceId, getAppVersion } from '../services/deviceId';
import { captureAndSaveLocation, getGpsMissingReason } from '../services/locationService';
import CameraCapture from './CameraCapture';

const ExpenseForm: React.FC<{ onBack: () => void; onClose: () => void }> = ({ onBack, onClose }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BKASH' | 'BANK' | 'OTHER'>('CASH');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Metadata (captured on mount)
  const [metadata, setMetadata] = useState({
    deviceId: '',
    locationId: null as string | null,
    gpsMissingReason: null as string | null,
    appVersion: '',
    occurredAt: Date.now(),
  });

  useEffect(() => {
    captureMetadata();
  }, []);

  const captureMetadata = async () => {
    const deviceId = await getDeviceId();
    const locationId = await captureAndSaveLocation();
    const gpsMissingReason = locationId ? null : await getGpsMissingReason();
    const appVersion = getAppVersion();

    setMetadata({ deviceId, locationId, gpsMissingReason, appVersion, occurredAt: Date.now() });
  };

  const handleSave = async () => {
    const transaction = {
      id: Date.now().toString(),
      item: category || 'Expense',
      category,
      quantity: 1,
      price: parseFloat(amount),
      total: parseFloat(amount),
      type: 'expense' as const,
      timestamp: Date.now(),
      sourceChannel: 'FAST_ENTRY_EXPENSE' as const,
      paymentMethod,
      deviceId: metadata.deviceId,
      locationId: metadata.locationId,
      gpsMissingReason: metadata.gpsMissingReason,
      appVersion: metadata.appVersion,
      occurredAt: metadata.occurredAt,
      rawTextInput: note,
      // TODO: Upload receipt file if attached
    };

    // TODO: Call db.saveTransaction(transaction)
    onClose();
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={(file) => {
          setReceiptFile(file);
          setShowCamera(false);
        }}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col">
      <header className="p-4 border-b flex justify-between items-center">
        <button onClick={onBack}>← Back</button>
        <h1 className="text-xl font-bold">Expense Out</h1>
        <div></div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-4">
        {/* Amount field - auto-focused */}
        <div>
          <label className="block text-sm font-semibold mb-2">Amount (RM) *</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
            className="w-full text-2xl p-4 border-2 rounded-xl"
          />
        </div>

        {/* Payment method - segmented buttons */}
        <div>
          <label className="block text-sm font-semibold mb-2">Payment Method *</label>
          <div className="grid grid-cols-4 gap-2">
            {(['CASH', 'BKASH', 'BANK', 'OTHER'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-lg font-semibold ${
                  paymentMethod === method
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {method === 'BKASH' ? 'bKash' : method}
              </button>
            ))}
          </div>
        </div>

        {/* More details (collapsible) */}
        <button
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="text-sm text-slate-600"
        >
          {showMoreDetails ? '▼' : '▶'} More details
        </button>

        {showMoreDetails && (
          <div className="space-y-3 pl-4 border-l-2">
            <div>
              <label className="block text-sm mb-1">Category</label>
              <div className="flex flex-wrap gap-2">
                {['Food', 'Rent', 'Transport', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      category === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Mamak lunch"
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Receipt attachment */}
        <button
          onClick={() => setShowCamera(true)}
          className="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2"
        >
          📷 {receiptFile ? 'Receipt attached ✓' : 'Attach receipt (if any)'}
        </button>

        {/* Metadata display (for debugging) */}
        {metadata.locationId && (
          <p className="text-xs text-slate-400">📍 Location captured</p>
        )}
        {metadata.gpsMissingReason && (
          <p className="text-xs text-amber-600">⚠️ Location: {metadata.gpsMissingReason}</p>
        )}
      </main>

      <footer className="p-4 border-t">
        <button
          onClick={handleSave}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg disabled:opacity-50"
        >
          SAVE ✓
        </button>
      </footer>
    </div>
  );
};

export default ExpenseForm;
```

### `components/LocationPrimer.tsx` (TODO)

```tsx
import React from 'react';
import { requestLocationPermission, markLocationPrimerShown } from '../services/locationService';

const LocationPrimer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const handleAllow = async () => {
    markLocationPrimerShown();
    await requestLocationPermission();
    onClose();
  };

  const handleDeny = () => {
    markLocationPrimerShown();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm">
        <div className="text-6xl text-center mb-4">📍</div>
        <h2 className="text-xl font-bold text-center mb-3">Enable Location?</h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Kami guna lokasi untuk buktikan mana tempat perbelanjaan ini berlaku
          dan lindungi awak dari salah tanggung.
        </p>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          We use location to prove where this expense happened and protect you from blame.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleAllow}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold"
          >
            Allow Location
          </button>
          <button
            onClick={handleDeny}
            className="w-full py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold"
          >
            Not Now
          </button>
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
};

export default LocationPrimer;
```

---

## Testing Checklist

### Database & Schema
- [ ] Verify all new tables exist in Supabase
- [ ] Test RLS policies (staff can't see other staff's transactions)
- [ ] Test audit trigger (insert transaction → check audit_log)
- [ ] Test foreign key constraints

### Services
- [ ] `getDeviceId()` returns consistent ID across page reloads
- [ ] `captureLocation()` returns GPS coordinates (with permission)
- [ ] `captureLocation()` returns null when permission denied
- [ ] Location permission primer shows on first use
- [ ] Audit log entries created for permission denial

### Fast Entry Flow
- [ ] "Sale In" button opens SaleForm
- [ ] "Expense Out" button opens ExpenseForm
- [ ] Amount field auto-focuses on form open
- [ ] Payment method buttons toggle correctly
- [ ] "More details" expands/collapses
- [ ] Receipt camera opens (live camera only)
- [ ] Save creates transaction with all metadata
- [ ] Entry time < 20 seconds (measure with stopwatch)

### Chat Entry Flow
- [ ] Chat input accepts text
- [ ] AI parses "I spend 20rm in mamak" correctly
- [ ] Confirmation buttons appear
- [ ] "Correct" saves transaction
- [ ] "Change amount" shows inline edit
- [ ] Voice icon records and transcribes
- [ ] Receipt camera can be opened from chat

### Receipt Capture
- [ ] Camera opens (not gallery)
- [ ] "Retake" button works
- [ ] "Use this" saves file to memory
- [ ] Receipt uploads to Supabase Storage on save
- [ ] File hash generated and saved
- [ ] Duplicate receipts detected (same hash)

### Location
- [ ] Permission primer shows on first transaction
- [ ] "Allow" grants permission and captures GPS
- [ ] "Not Now" closes modal, logs denial
- [ ] Transactions show location icon if captured
- [ ] Transactions show warning icon if denied
- [ ] Reverse geocoding fills place_name (optional)

### Audit & Compliance
- [ ] Every transaction has audit_log entry
- [ ] Audit log shows old/new values on update
- [ ] Admin can view audit logs in dashboard
- [ ] Staff compliance metrics calculated correctly
- [ ] Flag transactions missing receipt (when required)

### Realtime
- [ ] Staff A adds transaction → Staff B sees it instantly
- [ ] Admin dashboard updates in real-time

### Edge Cases
- [ ] Offline: Show error message
- [ ] No GPS hardware: gps_missing_reason = 'NO_GPS'
- [ ] Permission denied: gps_missing_reason = 'PERMISSION_DENIED'
- [ ] Large receipt file: Handle upload progress
- [ ] Duplicate device ID: Handle collision

---

## Deployment Steps

### 1. Local Development
```bash
# Install dependencies (if any new packages added)
npm install

# Run local dev server
npm run dev

# Test in browser
# Open http://localhost:5173
```

### 2. Environment Variables (Vercel)
Ensure these are set:
```
VITE_SUPABASE_URL=https://clywzojxthjpqpvttpvu.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_GEMINI_API_KEY=<your-gemini-key>
VITE_APP_VERSION=2.0.0
```

### 3. Create Supabase Storage Bucket
In Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `receipts`
3. Set to **Private** (not public)
4. Add RLS policies:
   ```sql
   -- Allow users to upload
   CREATE POLICY "Users can upload receipts"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'receipts' AND
     auth.uid() IS NOT NULL
   );

   -- Allow users to view receipts in their org
   CREATE POLICY "Users can view org receipts"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'receipts' AND
     auth.uid() IN (
       SELECT id FROM profiles WHERE organization_id = (
         SELECT organization_id FROM profiles WHERE id = auth.uid()
       )
     )
   );
   ```

### 4. Build & Deploy
```bash
# Build production bundle
npm run build

# Test production build locally
npm run preview

# Commit changes
git add .
git commit -m "feat: Add Fast Entry, Location Tracking, and Audit System"
git push origin main

# Vercel will auto-deploy
```

### 5. Post-Deploy Verification
- [ ] Visit production URL
- [ ] Sign in as admin
- [ ] Test Fast Entry flow
- [ ] Test Chat entry
- [ ] Test receipt upload
- [ ] Check Supabase database for new fields
- [ ] Check audit_log table for entries
- [ ] Test on mobile device (real phone, not emulator)

### 6. Migration from Base64 to Storage (Optional)
If you want to migrate existing base64 attachments:
```sql
-- Script to migrate base64 to Storage
-- Run as background job or manually
```

---

## Known Issues & Limitations

### Current Limitations
1. **Base64 migration:** Existing transactions with base64 attachments will continue to work but won't be in Storage. New transactions use Storage.
2. **Reverse geocoding:** Free tier (Nominatim) has rate limits. Consider caching or paid service for production.
3. **Device fingerprinting:** Not 100% unique; users clearing localStorage will get new device ID.
4. **Location accuracy:** GPS accuracy varies by device and environment (indoor vs outdoor).

### Browser Compatibility
- **Camera capture:** `capture="environment"` works on iOS Safari 11+, Android Chrome 53+
- **Geolocation API:** Supported in all modern browsers, requires HTTPS in production
- **Web Speech API:** Chrome, Edge, Safari (limited); fallback to Gemini ASR for unsupported browsers

### Performance Considerations
- **Receipt upload:** Large images (>5MB) may take 10+ seconds on slow connections
  - **Mitigation:** Compress images client-side before upload (use `canvas.toBlob()` with quality parameter)
- **Reverse geocoding:** External API call adds 500-2000ms latency
  - **Mitigation:** Run async after transaction save, don't block user

---

## Future Enhancements

### Phase 8 (Future)
- [ ] Offline mode with IndexedDB queue
- [ ] Barcode scanner for products
- [ ] Bulk upload receipts (email forwarding)
- [ ] ML-powered fraud detection
- [ ] Biometric authentication (fingerprint/face)
- [ ] WhatsApp bot for transaction entry
- [ ] Receipt OCR with itemized extraction
- [ ] Expense categorization learning (per-user AI)
- [ ] Multi-currency support
- [ ] Export audit logs to PDF/CSV

### Admin Dashboard Enhancements
- [ ] Heat map of transaction locations
- [ ] Staff compliance leaderboard
- [ ] Anomaly detection alerts (e.g., same receipt used twice)
- [ ] Entry delay trends (are staff entering on time?)
- [ ] Device usage analytics (which devices used most?)

---

## Support & Troubleshooting

### Common Issues

**Q: Transactions not saving**
A: Check browser console for errors. Ensure Supabase connection is working and RLS policies allow insert.

**Q: Location not capturing**
A: 1) Check HTTPS (geolocation requires secure context), 2) Check browser permissions, 3) Check console for errors.

**Q: Receipt upload fails**
A: 1) Check Supabase Storage bucket exists, 2) Check RLS policies, 3) Check file size (max 50MB default).

**Q: Audit log not populating**
A: Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'audit_transaction_changes';`

**Q: Device ID changes on every page load**
A: Check localStorage is not being cleared. Ensure cookies/localStorage allowed in browser.

### Debug Mode
Add to `localStorage` for verbose logging:
```javascript
localStorage.setItem('suarakira_debug', 'true');
```

Then check console for detailed logs from services.

---

## Appendix

### Schema Reference

**Full `transactions` table schema:**
See Supabase Dashboard or `supabase/migrations/20260206_extend_transactions.sql`

### API Reference

**Gemini API endpoints used:**
- `generateContent` - Text generation
- `startChat` - Chat sessions
- OCR via multi-modal input (image + text prompt)

**Supabase APIs used:**
- `supabase.auth` - Authentication
- `supabase.from('transactions')` - CRUD
- `supabase.from('audit_log')` - Append-only logs
- `supabase.storage.from('receipts')` - File upload
- Realtime subscriptions

### Performance Benchmarks

**Target metrics:**
- Fast Entry (no receipt): 5-10 seconds
- Fast Entry (with receipt): 15-20 seconds
- Chat entry: 10-15 seconds
- Location capture: <2 seconds
- Receipt upload: <5 seconds (on good connection)

**Measure with:**
```javascript
const start = Date.now();
// ... perform action
const duration = Date.now() - start;
console.log(`Action took ${duration}ms`);
```

---

## License & Credits

**SuaraKira 2.0**
Voice Accounting for Rural Malaysia

**Tech Stack:**
- React 18 + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage + Realtime)
- Google Gemini AI
- Geolocation API
- Web Speech API

**Credits:**
- w3jdev branding (must not be removed)
- Built with ❤️ for Malaysian small businesses

---

**End of Implementation Guide**

*Last updated: 2026-02-06*
*Version: 2.0.0*
*Status: Schema ✅ | Services 🚧 | UI ⏳*
