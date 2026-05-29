# Lens View — AI Response Transparency Interface

> A ChatGPT-accurate chat interface that flags uncertain claims, assumptions, and verified facts inline — giving users a transparency layer over AI-generated content.

**Graduation Project · Preetha Narasimmalu**

---

## Live Demo

🔗 **[lens-view-chatgpt.vercel.app](https://lens-view-chatgpt.vercel.app)**

---

## What is Lens View?

Large language models present all output with equal confidence — whether a claim is a well-established fact, an uncertain statistic, or an unverified assumption. This makes it difficult for users to critically evaluate AI-generated content.

**Lens View** solves this by augmenting AI responses with a transparency overlay. Each sentence in a response is annotated by the model itself and rendered with a visual signal:

| Signal | Meaning | Visual |
|--------|---------|--------|
| No decoration | Verified fact | Plain text |
| ⚠ Dotted amber underline | Uncertain claim | Statistical or unverified |
| ~ Dashed blue underline | Assumption | Inferred or extrapolated |

Users can click any flagged claim to see the reason, and open a **Rationale panel** showing sources and a full list of assumptions made in the response.

---

## Key Features

- **ChatGPT-accurate UI** — sidebar, message bubbles, typing animation, preset questions, dark/light mode
- **Lens View toggle** — switch between plain and annotated mode instantly with no re-fetch
- **Claim tooltips** — click any flagged text to see why it was flagged
- **Rationale panel** — slide-up panel showing top sources and all assumptions per response
- **Word-by-word streaming** — responses stream in real time via Groq's API
- **Accessible** — colorblind-safe (pattern + icon alongside color), keyboard navigable, ARIA compliant
- **Secure** — API key never exposed to browser; proxied via Vercel Edge Function

---

## Research Contribution

This project proposes and implements a novel UI pattern for **epistemic transparency in AI interfaces** — the idea that AI systems should not only answer questions but visually communicate their own confidence and reasoning at the sentence level.

The core technique is **structured self-annotation via prompt engineering**: the system prompt instructs `llama-3.3-70b-versatile` to return a JSON array where each text segment carries an epistemic label (`VERIFIED`, `UNCERTAIN`, or `ASSUMPTION`) with a concise reason. This eliminates the need for a second classification API call.

---

## Architecture

```
Browser (React SPA)
├── UI Layer        — ChatGPT-accurate components
├── State Layer     — React Context + useReducer
├── Hook Layer      — useChat, useGroq
└── Service Layer   — fetch('/api/chat')
        │
        │  HTTPS (streaming)
        ▼
Vercel Edge Function  (/api/chat)
└── GROQ_API_KEY secured server-side
        │
        ▼
Groq API  —  llama-3.3-70b-versatile
```

Full architecture documentation: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
Deep technical explainer: [`docs/TECHNICAL.md`](./docs/TECHNICAL.md)

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 + Vite | Concurrent rendering for smooth streaming |
| Styling | Tailwind CSS v3 | Dark mode, custom underline patterns |
| AI Model | llama-3.3-70b-versatile (Groq) | Fast inference, structured output |
| Backend | Vercel Edge Function | Zero cold start, API key secured server-side |
| Testing | Vitest + React Testing Library | Native Vite integration |

---

## Build Phases

The project was built in 6 structured phases, each tested before proceeding:

| Phase | What was built |
|-------|---------------|
| 1 — Foundation | React + Vite + Tailwind setup, ChatGPT-accurate UI shell |
| 2 — Chat Interface | Message bubbles, typing animation, Lens View toggle pill |
| 3 — Groq Integration | Edge Function proxy, real streaming, error handling |
| 4 — Lens View Core | JSON parsing, inline claim rendering, instant toggle |
| 5 — Interactions | Rationale panel, claim tooltips, smooth animations |
| 6 — Polish | Accessibility, light mode, edge cases, mobile responsive |

---

## Test Coverage

```
Test Files  17 passed (17)
     Tests  156 passed (156)
```

Tests cover: component rendering, theme toggle, message state, streaming logic, JSON parsing (including all failure modes), Lens View rendering, tooltip interactions, Rationale panel, accessibility attributes, edge cases (empty responses, API errors, long content).

---

## Running Locally

**Prerequisites:** Node.js 18+, a Groq API key from [console.groq.com](https://console.groq.com)

```bash
# 1. Clone the repo
git clone https://github.com/PreethaNarasimmalu/Lens-View-ChatGPT.git
cd Lens-View-ChatGPT

# 2. Install dependencies
npm install

# 3. Add your Groq API key
cp .env.example .env.local
# Edit .env.local and set GROQ_API_KEY=your_key_here

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:5173
```

**Running tests:**
```bash
npm test
```

**Production build:**
```bash
npm run build
```

---

## Project Structure

```
Lens-View-ChatGPT/
├── api/
│   └── chat.js                  # Vercel Edge Function — Groq proxy
├── src/
│   ├── components/
│   │   ├── chat/                # ChatArea, MessageBubble, EmptyState, TypingIndicator
│   │   ├── input/               # ChatInput, LensTogglePill
│   │   ├── layout/              # Sidebar, TopBar
│   │   ├── lens/                # LensText, LensResponse, ClaimTooltip, RationalePanel
│   │   └── ui/                  # ThemeToggle, ErrorBanner
│   ├── context/                 # ThemeContext, ChatContext
│   ├── hooks/                   # useChat, useScrollToBottom
│   ├── services/                # groqService (fetch client)
│   └── utils/                   # parseLensResponse, constants
├── tests/
│   ├── phase1/ through phase6/  # 17 test files, 156 tests
└── docs/
    ├── ARCHITECTURE.md          # Full system design document
    ├── TECHNICAL.md             # Deep technical explainer
    └── STATUS.md                # Build progress log
```

---

## Deployment

Deployed on **Vercel** — frontend and Edge Function in a single project.

Environment variable required:
```
GROQ_API_KEY=your_groq_api_key
```

Every push to `main` triggers an automatic redeploy.

---

## Accessibility

Lens View is designed to be usable without relying on color alone (WCAG 2.1 AA):

- **UNCERTAIN** claims: amber color + dotted underline pattern + ⚠ icon
- **ASSUMPTION** claims: blue color + dashed underline pattern + ~ glyph
- All interactive elements keyboard navigable (Enter/Space to open, Escape to close)
- `aria-label`, `role="tooltip"`, `role="dialog"`, `aria-modal`, `aria-pressed` throughout
- `role="alert"` on error banner

---

## Limitations & Future Work

| Limitation | Future solution |
|-----------|----------------|
| No persistent chat history | Add a database (e.g. Supabase) |
| Single shared API key | Per-user auth + individual rate limiting |
| Sources are model-generated, not web-fetched | Integrate a web search API (Tavily, Brave) |
| No user accounts | Auth system (Clerk, NextAuth) |
| LLM may not always return valid JSON | Already handled with fallback — could improve with structured outputs API |
