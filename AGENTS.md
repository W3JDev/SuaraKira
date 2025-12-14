# AGENTS.md

> **Primary Maintainer:** w3jdev (w3jdev.com)  
> **Audience:** AI Coding Agents & Human Contributors. Follow strict rules.

## 1. Project Overview & Scope
**SuaraKira** is a mobile-first Fintech PWA for Malaysian hawkers to record sales via voice/images using Google Gemini.
*   **Core Stack:** React (ESM), TypeScript, TailwindCSS, `@google/genai` SDK.
*   **Architecture:** Client-side only (PWA), LocalStorage for DB, Edge-ready.

## 2. Structure & Key Paths
*   `/components`: Reusable UI (Tailwind styled).
*   `/services`: Logic for API (Gemini) and Persistence (LocalStorage).
*   `/docs`: Enterprise documentation (PRD, Arch, Plans).
*   `types.ts`: Central type definitions.

## 3. Code Style & Rules
1.  **Strict TypeScript:** No `any` unless absolutely necessary for external libs without types.
2.  **Tailwind:** Use utility classes. No custom CSS unless for animations (in `index.html`).
3.  **Error Handling:** Use `try/catch` in async services. Always provide user feedback via `Toast`.
4.  **Formatting:** Prettier standard. 2 space indent.
5.  **Environment:** `process.env.API_KEY` is injected. Do not hardcode secrets.

## 4. Boundaries (Dos & Don'ts)
*   **DO** use `@google/genai` for all AI calls.
*   **DO** strictly validate JSON from LLMs using regex cleaning before parsing.
*   **DON'T** introduce backend dependencies (Node.js/Express) - this is a PWA.
*   **DON'T** remove the "w3jdev" branding tokens in Header/Footer.

## 5. Deployment
*   Deploys to standard static hosts (Vercel/Netlify/GitHub Pages).
*   Ensure `metadata.json` permissions are accurate for PWA manifests.

---
_Crafted by w3jdev · github.com/w3jdev_