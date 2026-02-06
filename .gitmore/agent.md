# AI Agent Onboarding Overview

## System Identity
**Name:** SuaraKira (Enterprise Edition)
**Goal:** Minimalist, Multilingual, AI-First Accounting for Malaysia/South Asia.
**Current State:** Fully functional PWA with Voice/Image entry, now scaling to Enterprise features.

## Core Architecture
1.  **Frontend:** React (ESM) + Tailwind.
2.  **AI Layer:** Direct calls to Google Gemini via `@google/genai`.
    - `gemini-2.5-flash`: For high-speed chat, simple text, and voice.
    - `gemini-3-pro-preview`: For complex reasoning, image analysis, and financial insights.
3.  **Data Layer:** LocalStorage simulation of a multi-tenant DB (Staff vs Admin).

## Roadmap & Gaps
1.  **Natural Language Chat:** (Implemented in Phase 2) - Conversational agent for queries ("How much did I spend on Satay?").
2.  **Role-Based Access:** (Implemented in Phase 2) - Staff books vs Master Dashboard.
3.  **Document AI:** (Implemented in Phase 2) - Extract data from images/PDFs.
4.  **Backend Migration:** (Future Phase) - Move from LocalStorage to Supabase for real-time sync.

## Integration Points
- **Transactions:** `services/db.ts` -> `saveTransaction()`
- **AI Logic:** `services/geminiService.ts` -> `createFinancialChat()`
- **UI Components:** `components/ChatAssistant.tsx`

## Developer Notes
- The system uses a "Prompt Engineering" heavy approach. Logic is often defined in the System Instructions sent to Gemini.
- We simulate "Staff" and "Admin" roles using a simple local storage flag (`suarakira_role`).
