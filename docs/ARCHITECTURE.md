# Lens View — Architecture Document

## Overview

Lens View is a ChatGPT-accurate chat interface that augments AI responses with a "Lens View" mode — a transparency layer that flags claims as VERIFIED, UNCERTAIN, or ASSUMPTION using inline visual signals, tooltips, and sourcing rationale. The goal is to help users critically evaluate AI-generated content.

---

## 1. Tech Stack Decisions

### Core Framework: React 18 + Vite

**Why React 18:**
- Concurrent rendering enables smooth streaming text updates without layout thrashing
- `useTransition` and `useDeferredValue` let us update Lens View overlays without blocking the typing animation
- Mature ecosystem for component-based UI matching ChatGPT's complexity

**Why Vite:**
- Sub-second HMR for rapid iteration on UI polish
- Native ESM, no webpack overhead
- Built-in env variable handling for `VITE_GROQ_API_KEY`

### Styling: Tailwind CSS v3

**Why Tailwind:**
- Utility-first matches the density of ChatGPT's design system
- Dark mode with `class` strategy gives instant toggle without flash
- Arbitrary values (`underline decoration-[#F59E0B]`) needed for Lens View custom underlines

### AI Integration: Groq SDK (groq-sdk) via Vercel Edge Function proxy

**Why a Vercel Edge Function proxy:**
- The app is deployed publicly (embedded in Substack via iframe) — the Groq API key must never reach the browser
- A Vercel Edge Function (`/api/chat`) acts as a thin proxy: the React app posts messages to it, it adds the key server-side and forwards to Groq
- The key lives in Vercel Environment Variables, never in the browser bundle
- Edge Functions run at Vercel's CDN edge — latency overhead is minimal (~5ms)
- Groq's streaming API (`stream: true`) is forwarded as a `ReadableStream` response, preserving word-by-word rendering
- `llama-3.3-70b-versatile` is fast enough for real-time streaming at acceptable latency

**Deployment: Vercel (free tier)**
- Zero-config deployment for Vite projects
- `git push` triggers automatic redeploy
- Substack embed: `<iframe src="https://your-app.vercel.app" />` in a Substack post
- Custom domain supported on free tier

### No State Management Library

**Why no Redux/Zustand:**
- Scope is a single-page app with one primary concern: chat messages + Lens View state
- React's built-in `useState`, `useReducer`, and `useContext` are sufficient
- Adding a library would introduce unnecessary complexity for this prototype

### Testing: Vitest + React Testing Library

**Why Vitest:**
- Native Vite integration — zero config
- Same syntax as Jest, fast parallel execution
- RTL for component behavior tests, not implementation details

---

## 2. Phase-by-Phase Build Plan

| Phase | Goal | Key Deliverable | Test Gate |
|-------|------|-----------------|-----------|
| 1 | Foundation | Static ChatGPT shell, sidebar, dark/light toggle | Renders, toggle works, responsive |
| 2 | Chat Interface | Message bubbles, typing animation, input + toggle pill | Messages render, animation, scroll |
| 3 | Groq Integration | Real streaming responses via Groq API | Response for each preset, streaming works |
| 4 | Lens View Core | JSON parsing, inline VERIFIED/UNCERTAIN/ASSUMPTION rendering | All three types render, toggle hides/shows |
| 5 | Interactions | Tooltips on click, Rationale panel with sources | All interactions, animations smooth |
| 6 | Polish | A11y patterns, mobile, edge cases, pixel-perfect | Mobile, errors, visual match |

---

## 3. File and Folder Structure

```
Lens-View-ChatGPT/
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   ├── TECHNICAL.md             # Deep technical explanation of the project
│   └── STATUS.md                # Live build status tracker
│
├── public/
│   └── vite.svg
│
├── src/
│   ├── main.jsx                 # React root, ThemeProvider wrap
│   ├── App.jsx                  # Root layout: Sidebar + ChatArea
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx              # Recent chats, new chat button
│   │   │   ├── SidebarChatItem.jsx      # Individual recent chat entry
│   │   │   └── TopBar.jsx               # Mobile header, model name
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatArea.jsx             # Scrollable message container
│   │   │   ├── EmptyState.jsx           # Welcome screen + preset questions
│   │   │   ├── MessageBubble.jsx        # Single message (user or assistant)
│   │   │   ├── TypingIndicator.jsx      # Animated 3-dot loader
│   │   │   └── PresetQuestion.jsx       # Clickable preset question card
│   │   │
│   │   ├── input/
│   │   │   ├── ChatInput.jsx            # Textarea + send button + Lens toggle
│   │   │   └── LensTogglePill.jsx       # ON/OFF pill switch for Lens View
│   │   │
│   │   ├── lens/
│   │   │   ├── LensText.jsx             # Renders a response segment with styling
│   │   │   ├── ClaimTooltip.jsx         # Tooltip shown on claim click
│   │   │   └── RationalePanel.jsx       # Slide-up panel: sources + assumptions
│   │   │
│   │   └── ui/
│   │       ├── ThemeToggle.jsx          # Dark/light moon-sun icon button
│   │       └── IconButton.jsx           # Reusable accessible icon button
│   │
│   ├── context/
│   │   ├── ThemeContext.jsx             # Dark/light mode state + toggle
│   │   └── ChatContext.jsx             # Messages, lensView on/off, streaming state
│   │
│   ├── hooks/
│   │   ├── useGroq.js                  # Groq streaming call, returns chunks
│   │   ├── useChat.js                  # Orchestrates send → stream → parse
│   │   └── useScrollToBottom.js        # Auto-scroll chat on new messages
│   │
│   ├── services/
│   │   └── groqService.js              # Groq SDK client init + stream helpers
│   │
│   ├── utils/
│   │   ├── parseLensResponse.js        # JSON parsing of Groq Lens View output
│   │   └── constants.js                # Preset questions, fake sidebar data
│   │
│   └── styles/
│       └── index.css                   # Tailwind directives + custom CSS vars
│
├── tests/
│   ├── phase1/
│   │   ├── App.test.jsx
│   │   ├── Sidebar.test.jsx
│   │   └── ThemeToggle.test.jsx
│   ├── phase2/
│   │   ├── MessageBubble.test.jsx
│   │   ├── TypingIndicator.test.jsx
│   │   └── ChatInput.test.jsx
│   ├── phase3/
│   │   ├── groqService.test.js
│   │   └── useGroq.test.js
│   ├── phase4/
│   │   ├── parseLensResponse.test.js
│   │   └── LensText.test.jsx
│   ├── phase5/
│   │   ├── ClaimTooltip.test.jsx
│   │   └── RationalePanel.test.jsx
│   └── phase6/
│       └── accessibility.test.jsx
│
├── .env.example                        # VITE_GROQ_API_KEY=your_key_here
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 4. Data Flow Diagram

```
USER ACTION
    │
    ▼
[ChatInput] ──────────────────────────────────────────────────────────┐
    │  user types message or clicks PresetQuestion                     │
    │                                                                  │
    ▼                                                                  │
[useChat hook]                                                         │
    │  1. append user message to messages[]                            │
    │  2. set isStreaming = true                                        │
    │  3. call groqService.streamResponse()                            │
    │                                                                  │
    ▼                                                                  │
[groqService.js]                                                       │
    │  • initialise Groq SDK with VITE_GROQ_API_KEY                    │
    │  • if lensView ON → inject Lens View system prompt               │
    │  • if lensView OFF → plain system prompt                         │
    │  • call groq.chat.completions.create({ stream: true })           │
    │                                                                  │
    ▼                                                                  │
[Groq API]  ◄── llama-3.3-70b-versatile                               │
    │  streams chunks back as SSE delta tokens                         │
    │                                                                  │
    ▼                                                                  │
[useGroq hook]                                                         │
    │  • accumulates token chunks into buffer string                   │
    │  • on each chunk → calls onChunk(buffer) callback                │
    │  • on stream end → calls onComplete(fullText)                    │
    │                                                                  │
    ▼                                                                  │
[useChat hook]                                                         │
    │  • updates assistantMessage.rawText in real time (streaming)     │
    │  • on complete:                                                   │
    │      if lensView ON  → parseLensResponse(fullText) → segments[]  │
    │      if lensView OFF → store as plain text                        │
    │  • set isStreaming = false                                        │
    │                                                                  │
    ▼                                                                  │
[ChatContext]                                                          │
    │  messages[] updated → React re-renders                           │
    │                                                                  │
    ▼                                                                  │
[ChatArea] → [MessageBubble]                                           │
    │  • lensView OFF → renders rawText as plain paragraph             │
    │  • lensView ON  → maps segments[] through [LensText]             │
    │                                                                  │
    ▼                                                                  │
[LensText] per segment                                                 │
    │  • type=VERIFIED   → plain span                                  │
    │  • type=UNCERTAIN  → amber dotted underline + ⚠ icon             │
    │  • type=ASSUMPTION → blue dashed underline                        │
    │  • onClick → open [ClaimTooltip] with segment.reason             │
    │                                                                  │
    ▼                                                                  │
[RationalePanel]  (triggered by "Rationale" button)                    │
    │  • shows top 3 sources per response                              │
    │  • lists assumptions with amber dot badges                       │
    │  • slide-up animation from bottom                                │
    └──────────────────────────────────────────────────────────────────┘
```

---

## 5. Groq API Integration Plan

### Vercel Edge Function — `/api/chat.js`

```js
// api/chat.js  (Vercel Edge Function)
import Groq from 'groq-sdk';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { messages, lensView } = await req.json();
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // server-side only

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: lensView ? LENS_SYSTEM_PROMPT : STANDARD_SYSTEM_PROMPT },
      ...messages
    ],
    stream: true,
    max_tokens: 1024,
  });

  // Forward the SSE stream directly to the browser
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

### Browser Client

```js
// src/services/groqService.js
// No API key here — all calls go through /api/chat
async function* streamResponse({ messages, lensView }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, lensView })
  });
  // Read SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}
```

### System Prompts

**Standard mode:**
```
You are a helpful AI assistant. Answer clearly and concisely.
```

**Lens View mode:**
```
You are an AI assistant. When responding, return a JSON object with this structure:
{"response": [{"text": string, "type": "VERIFIED"|"UNCERTAIN"|"ASSUMPTION", "reason": string|null, "sources": [{"title": string, "url": string, "snippet": string}]|null}]}
Mark any statistical claims, percentages, or unverified facts as UNCERTAIN with a reason.
Mark any inferred or extrapolated information as ASSUMPTION with a reason.
Mark confirmed facts as VERIFIED. Keep reasons concise, 1-2 sentences.
```

### Streaming Call

```js
async function* streamResponse({ messages, lensView }) {
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: lensView ? LENS_SYSTEM_PROMPT : STANDARD_SYSTEM_PROMPT },
      ...messages
    ],
    stream: true,
    max_tokens: 1024,
    temperature: 0.7
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) yield delta;
  }
}
```

### Error Handling Strategy

| Error | Handling |
|-------|----------|
| Missing API key | Show inline error: "Groq API key not configured" |
| Network timeout | Retry once, then show "Connection failed. Try again." |
| Invalid JSON (Lens mode) | Fall back to rendering rawText as plain text with a warning badge |
| Rate limit (429) | Show "Too many requests — please wait a moment" |
| Model unavailable | Show generic error, log to console |

---

## 6. Component Tree

```
<App>
├── <ThemeContext.Provider>
│   └── <ChatContext.Provider>
│       ├── <Sidebar>
│       │   ├── <IconButton>  (new chat)
│       │   ├── <ThemeToggle>
│       │   └── <SidebarChatItem> × N  (fake recent chats)
│       │
│       └── <main>
│           ├── <TopBar>              (mobile only)
│           │   └── <ThemeToggle>
│           │
│           ├── <ChatArea>
│           │   ├── <EmptyState>      (shown when messages=[])
│           │   │   └── <PresetQuestion> × 4
│           │   │
│           │   └── <MessageBubble> × N
│           │       ├── [user]   plain text paragraph
│           │       └── [assistant]
│           │           ├── <TypingIndicator>   (while streaming)
│           │           ├── plain text          (lensView OFF)
│           │           └── <LensText> × N      (lensView ON)
│           │               └── <ClaimTooltip>  (on click)
│           │
│           ├── <RationalePanel>      (slide-up, conditionally rendered)
│           │
│           └── <ChatInput>
│               ├── <textarea>
│               ├── <LensTogglePill>
│               └── <IconButton>  (send)
```

---

## 7. State Management Approach

### ThemeContext

```
state:  theme = 'dark' | 'light'
action: toggleTheme()
effect: adds/removes 'dark' class on <html> element
```

### ChatContext

```
state:
  messages        Message[]          — full chat history
  isStreaming     boolean            — true while Groq is responding
  lensViewActive  boolean            — Lens View mode on/off
  rationaleOpen   boolean            — RationalePanel visibility
  activeMessage   Message | null     — message whose rationale panel is open

actions:
  sendMessage(text)                  — append user msg, trigger Groq call
  appendStreamChunk(chunk)           — update last assistant msg in real time
  finaliseMessage(segments)          — replace rawText with parsed segments
  toggleLensView()                   — flip lensViewActive
  openRationale(messageId)           — set rationaleOpen + activeMessage
  closeRationale()                   — hide panel
  clearChat()                        — reset messages[]
```

### Message Shape

```ts
interface Segment {
  text:    string
  type:    'VERIFIED' | 'UNCERTAIN' | 'ASSUMPTION'
  reason:  string | null
  sources: { title: string; url: string; snippet: string }[] | null
}

interface Message {
  id:        string           // crypto.randomUUID()
  role:      'user' | 'assistant'
  rawText:   string           // full text (streaming target)
  segments:  Segment[] | null // null until Lens parse complete
  timestamp: number
}
```

### Local state (component-level)

- `ChatInput`: controlled textarea value, send-disabled flag
- `ClaimTooltip`: open/closed per segment (managed in LensText with useState)
- `RationalePanel`: slide animation state

---

## 8. Testing Plan

### Phase 1 — Foundation

| Test | What | How |
|------|------|-----|
| App renders | `<App>` mounts without crash | RTL render + assert no errors |
| Sidebar present | Sidebar renders with N fake chat items | Assert sidebar element + chat item count |
| Theme toggle | Click toggle → html class switches dark↔light | fireEvent.click + assert className |
| Responsive layout | Sidebar hidden on mobile viewport | jsdom viewport resize + assert CSS classes |

### Phase 2 — Chat Interface

| Test | What | How |
|------|------|-----|
| User message renders right | MessageBubble role=user has `justify-end` | RTL + assert class |
| Assistant message renders left | MessageBubble role=assistant has `justify-start` | RTL + assert class |
| Typing indicator shows | isStreaming=true renders TypingIndicator | Mock context, assert presence |
| Preset click → user message | Click PresetQuestion → message appended | fireEvent.click + assert messages |
| Auto-scroll | New message triggers scroll to bottom | Mock scrollIntoView, assert called |

### Phase 3 — Groq Integration

| Test | What | How |
|------|------|-----|
| Stream produces response | useGroq hook yields chunks | Mock Groq SDK, assert onChunk called |
| Full text assembled | All chunks concatenated correctly | Mock 3 chunks, assert final string |
| API key missing | Error state shown | Remove env var, assert error message |
| Network error | Graceful error message | Mock rejection, assert error UI |

### Phase 4 — Lens View Core

| Test | What | How |
|------|------|-----|
| parseLensResponse valid JSON | Returns segments array | Unit test pure function |
| parseLensResponse malformed | Returns fallback plain segment | Unit test with bad JSON |
| UNCERTAIN renders amber underline | LensText type=UNCERTAIN has correct class | RTL + assert className |
| ASSUMPTION renders blue underline | LensText type=ASSUMPTION has correct class | RTL + assert className |
| VERIFIED renders plain | LensText type=VERIFIED has no underline class | RTL + assert no special class |
| Lens toggle hides flags | lensViewActive=false → segments not rendered | Toggle context, assert plain text |

### Phase 5 — Interactions

| Test | What | How |
|------|------|-----|
| Click UNCERTAIN → tooltip | Click flagged text → ClaimTooltip visible | fireEvent.click + assert tooltip |
| Tooltip shows reason | Tooltip text matches segment.reason | Assert text content |
| Rationale button present | Each assistant message has Rationale button | Assert button existence |
| Rationale panel opens | Click Rationale → RationalePanel visible | fireEvent.click + assert panel |
| Panel shows sources | Sources list rendered | Assert source count |
| Panel closes | Click close or outside → panel hidden | fireEvent.click + assert absence |

### Phase 6 — Polish

| Test | What | How |
|------|------|-----|
| No color-only signals | Each flag has a pattern/icon alongside color | Assert icon presence in LensText |
| Empty response handled | Empty string from Groq → no crash | Mock empty response, assert no error |
| API error UI | 500 from Groq → error message shown | Mock error, assert error element |
| Long response scrollable | ChatArea scrolls for long content | Overflow CSS assertion |
| Mobile layout | At 375px, sidebar collapses | Viewport test + assert mobile class |

---

## Design Decisions & Trade-offs

| Decision | Chosen | Alternative | Why |
|----------|--------|-------------|-----|
| Direct browser Groq calls | Yes (dangerouslyAllowBrowser) | Express proxy | Prototype speed; key exposed in browser — not for production |
| JSON Lens format | Segment array | Markdown with annotations | Structured parsing is reliable; markdown parsing is fragile |
| No streaming in Lens mode | Stream raw, parse on complete | Stream JSON segments | Streaming partial JSON is extremely fragile; UX: show typing then reveal Lens overlay |
| useContext not Zustand | Context API | Zustand/Redux | Prototype scope; avoid dependency overhead |
| Vitest not Jest | Vitest | Jest | Native Vite integration, faster |

---

## Deployment Architecture

```
Substack post
└── <iframe src="https://lens-view.vercel.app">
        │
        ▼
    Vercel CDN (serves React SPA)
        │  POST /api/chat  (JSON: messages[], lensView bool)
        ▼
    Vercel Edge Function  (/api/chat.js)
        │  GROQ_API_KEY in Vercel env vars (never leaves server)
        │  Forwards SSE stream back to browser
        ▼
    Groq API  (llama-3.3-70b-versatile)
```

**Environment variables:**

| Variable | Where | Value |
|----------|-------|-------|
| `GROQ_API_KEY` | Vercel project settings | Your Groq key |

No `.env` file needed in the repo. The browser has zero access to the key.

---

*Document version: 1.1 — updated with Vercel proxy deployment, awaiting Phase 1 approval*
