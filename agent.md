# SuaraKira - Voice-Powered Fintech PWA for Malaysian Hawkers

## Project Context
Building a mobile-first Progressive Web App (PWA) for Malaysian hawkers to track sales via voice commands using Gemini AI. Target users are street vendors, food stall owners, and micro-entrepreneurs who need hands-free sales recording while serving customers.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **AI/Voice:** Google Gemini AI (@google/genai) for natural language processing
- **Database:** Supabase (PostgreSQL) for data persistence
- **UI/UX:** Framer Motion for animations, Recharts for analytics, clsx for styling
- **Deployment:** Vercel (PWA optimized)

## Code Style & Architecture
- Use TypeScript strict mode with proper type definitions
- Functional components with React hooks
- Mobile-first responsive design (focus on touch interactions)
- Offline-first architecture with IndexedDB fallback
- Component-based structure: `/components`, `/pages`, `/services`

## Voice Interface Guidelines
- Support mixed Bahasa Malaysia / English input (code-switching common)
- Example voice commands: "Nasi lemak RM5.50", "Teh tarik lima ringgit", "Coffee two fifty"
- Extract: item name + amount + currency (default MYR)
- Always confirm with voice/visual feedback
- Handle noisy hawker environment (background chatter, cooking sounds)

## Database Schema (Supabase)
Tables in project `dpdpcyzpjvtrslwzrped`:
- `suarakira_users`: id, email, business_name, created_at
- `suarakira_sales`: id, user_id, item_name, amount, currency, voice_input, created_at
- `suarakira_receipts`: id, sale_id, receipt_data, created_at

## Gemini AI Integration Best Practices
- Use structured prompts for sale extraction
- System prompt: "You are a sales tracker for Malaysian food vendors. Extract item name, price in MYR from voice input. Support Malay and English."
- Handle ambiguous inputs gracefully (ask for clarification)
- Cache common menu items per user for faster processing

## PWA Requirements
- Manifest.json with hawker-friendly branding
- Offline capability (service worker)
- Installable on Android/iOS home screen
- Fast load times (<3s on 3G)
- Touch-friendly buttons (min 44x44px)

## Hackathon Optimization
- Built with **Cursor AI** - emphasize rapid development, AI-assisted coding
- **Gemini focus** - showcase voice NLP, receipt generation, multilingual support
- **Mobile-first** - perfect for Mobbin UI/UX track
- **Fintech angle** - financial inclusion for micro-SMEs (Ryt Bank track)