# Lens View — Technical Deep Dive

This document explains the technical internals of the Lens View prototype in detail: how each system works, why specific choices were made, and what happens under the hood at each layer.

---

## 1. What is Lens View?

Lens View is a transparency overlay for AI chat responses. Instead of presenting AI output as a monolithic block of text, it breaks each response into **labelled segments** — pieces of text that carry epistemic metadata:

- **VERIFIED** — the model considers this a well-established fact
- **UNCERTAIN** — the model has low confidence (statistics, unverified claims, outdated data)
- **ASSUMPTION** — the model is inferring or extrapolating, not stating direct fact

This is achieved by **prompt engineering**: the system prompt instructs the model to return structured JSON rather than prose. The frontend parses this JSON and renders each segment with a corresponding visual treatment.

---

## 2. Architecture Overview

```
Browser (React SPA)
├── UI Layer          — React components rendering chat + Lens overlays
├── State Layer       — React Context (no external store)
├── Hook Layer        — useChat, useGroq, useScrollToBottom
└── Service Layer     — groqService.js (Groq SDK)
        │
        │  HTTPS / Server-Sent Events (SSE)
        ▼
Groq Cloud API
└── llama-3.3-70b-versatile (inference)
```

There is **no backend**. The Groq SDK is called directly from the browser using `dangerouslyAllowBrowser: true`. This is acceptable for a prototype but would expose the API key in production — a real deployment would proxy through a server.

---

## 3. Streaming: How Word-by-Word Rendering Works

Groq supports **Server-Sent Events (SSE)** streaming for chat completions. Instead of waiting for the full response, the API sends small token chunks (typically 1–5 words each) as they are generated.

### How it flows:

1. `groqService.streamResponse()` calls `groq.chat.completions.create({ stream: true })`
2. This returns an async iterable — a stream of `ChatCompletionChunk` objects
3. Each chunk contains `choices[0].delta.content` — a small string fragment
4. The `useGroq` hook iterates this with `for await...of`, yielding each delta
5. `useChat` accumulates deltas into a `buffer` string and writes it to `message.rawText` on every chunk
6. React's state update triggers a re-render, and the `MessageBubble` updates its visible text
7. When the stream ends (chunk with `finish_reason: 'stop'`), `onComplete(fullText)` fires

### Why stream even in Lens View mode?

In Lens View mode, the model returns JSON. Streaming partial JSON cannot be rendered as segments mid-stream. The solution is:
- **During streaming**: show the raw token stream in a `<pre>` or hidden buffer (users see the typing animation / raw text appearing)
- **On complete**: call `parseLensResponse(fullText)` and **replace** the raw text with the rendered segment array

This gives the feel of a live response while still showing the structured Lens overlay once complete.

---

## 4. Prompt Engineering for Lens View

The Lens View system prompt is the core of the feature. It transforms the model's output format from prose to structured JSON.

### System Prompt (Lens View ON):

```
You are an AI assistant. When responding, return a JSON object with this structure:
{"response": [{"text": string, "type": "VERIFIED"|"UNCERTAIN"|"ASSUMPTION", "reason": string|null, "sources": [{"title": string, "url": string, "snippet": string}]|null}]}
Mark any statistical claims, percentages, or unverified facts as UNCERTAIN with a reason.
Mark any inferred or extrapolated information as ASSUMPTION with a reason.
Mark confirmed facts as VERIFIED. Keep reasons concise, 1-2 sentences.
```

### Why this works:

`llama-3.3-70b-versatile` is instruction-tuned and follows structured output instructions reliably. The key design decisions in the prompt:

- **Array of segments, not one JSON blob**: allows fine-grained inline rendering
- **`reason` field**: gives the tooltip content without a second API call
- **`sources` field**: grounds rationale panel without requiring web search
- **Type as an enum string**: trivial to switch on in React

### Failure modes and mitigations:

| Failure | Cause | Mitigation in parseLensResponse.js |
|---------|-------|-------------------------------------|
| Model wraps JSON in markdown fences | Instruction-following quirk | Strip ` ```json ` ... ` ``` ` before parsing |
| Model returns prose instead of JSON | Prompt ignored | Try JSON.parse; on failure, return `[{text: fullText, type: 'VERIFIED', reason: null}]` |
| Malformed JSON (truncated) | Max tokens hit | Try/catch with same fallback |
| Empty response array | Edge case | Return a single VERIFIED segment with rawText |

---

## 5. State Architecture

### Why Context instead of Zustand/Redux?

For this prototype, the state tree has exactly two concerns:
1. Theme (dark/light) — a single boolean
2. Chat session (messages array + streaming flags + Lens mode) — a flat object

Both fit comfortably in React Context with `useReducer`. Adding Zustand or Redux would introduce a dependency, devtools setup, and boilerplate that adds no value at this scale.

### ChatContext Reducer Actions

```
SEND_MESSAGE      → appends {role:'user', text, id, timestamp} to messages[]
STREAM_CHUNK      → updates last assistant message's rawText by concatenating chunk
FINALISE_MESSAGE  → replaces last assistant message's rawText with parsed segments[]
TOGGLE_LENS_VIEW  → flips lensViewActive boolean
OPEN_RATIONALE    → sets rationaleOpen=true, activeMessage=message
CLOSE_RATIONALE   → sets rationaleOpen=false
CLEAR_CHAT        → resets messages to []
SET_STREAMING     → sets isStreaming boolean
SET_ERROR         → sets error string | null
```

### Why useReducer over useState for ChatContext?

Multiple related state fields (messages, isStreaming, lensViewActive, rationaleOpen) that update in coordinated ways benefit from a reducer. It also makes testing trivial — you can unit-test the reducer as a pure function independently of React.

---

## 6. Lens View Rendering Pipeline

```
rawText (string)
    │
    ▼
parseLensResponse(rawText)
    │  1. Strip markdown code fences if present
    │  2. JSON.parse(text)
    │  3. Validate structure (array with text+type fields)
    │  4. On failure → fallback segment
    │
    ▼
segments: Segment[]
    │
    ▼
<MessageBubble segments={segments} lensViewActive={bool}>
    │
    ├── lensViewActive = false → join segment.text → plain <p>
    │
    └── lensViewActive = true
        │
        └── segments.map(seg => <LensText segment={seg} />)
            │
            ├── type=VERIFIED   → <span>{seg.text}</span>
            ├── type=UNCERTAIN  → <span class="underline decoration-dotted decoration-amber-500">
            │                       ⚠ {seg.text}
            │                    </span>
            └── type=ASSUMPTION → <span class="underline decoration-dashed decoration-blue-400">
                                    {seg.text}
                                  </span>
```

### Toggle Behaviour

When `lensViewActive` flips, the component re-renders instantly — no API call, no re-parse. The segments are already in state. This is intentional: the toggle is a **view filter**, not a data fetch.

---

## 7. Tooltip and Rationale Panel

### ClaimTooltip

- Rendered inline within `LensText`, hidden by default
- On click: `useState` in `LensText` sets `tooltipOpen = true`
- Shows `segment.reason` text
- Dismissed by clicking outside (a `useEffect` adds a `document` click listener that closes it)
- Positioned with CSS: `absolute` relative to the parent span, with `z-index` to float above text

### RationalePanel

- A full-width slide-up panel anchored to the bottom of the chat area
- Triggered by a "Rationale" button in each assistant `MessageBubble`
- Content: the assistant message's segments filtered for non-null sources
- Shows top 3 sources as cards with title, snippet, and URL
- Lists all ASSUMPTION segments with amber dot badges
- Animation: CSS `transform: translateY` transition from `100%` to `0`

---

## 8. Accessibility Strategy (Phase 6)

Color alone cannot convey meaning for users with color vision deficiency. Lens View uses color + a secondary signal for each type:

| Type | Color | Secondary signal |
|------|-------|-----------------|
| UNCERTAIN | Amber | Dotted underline pattern + ⚠ icon |
| ASSUMPTION | Blue | Dashed underline pattern |
| VERIFIED | None | No decoration (baseline) |

Additional a11y measures:
- All interactive elements have `aria-label`
- `role="tooltip"` on ClaimTooltip
- `aria-expanded` on Lens toggle pill
- Keyboard navigation: tooltip opens on Enter/Space, closes on Escape
- Focus management: RationalePanel traps focus when open

---

## 9. Security Considerations

| Concern | Risk | Mitigation |
|---------|------|------------|
| API key in browser | Key visible in DevTools network tab | Acceptable for prototype; production would use a server proxy |
| Rendered HTML from AI | XSS if innerHTML used | All AI text rendered via React's `{text}` (escaped by default — never dangerouslySetInnerHTML) |
| JSON injection | Malicious JSON in response | Strict schema validation in parseLensResponse before using any field |
| CORS | Groq API may reject browser origin | Groq explicitly supports browser calls with `dangerouslyAllowBrowser` |

---

## 10. Performance Considerations

### Streaming updates

React re-renders on every stream chunk. To avoid layout thrash:
- `useTransition` wraps the `STREAM_CHUNK` dispatch so it doesn't block the input
- The ChatArea scrolls via `useScrollToBottom` which calls `scrollIntoView({ behavior: 'smooth' })` debounced to 60fps

### Lens overlay rendering

Segments are rendered as plain `<span>` elements — no virtualisation needed. Even a 1000-word response with 50 segments is well within React's synchronous render budget.

### Theme switching

The `ThemeContext` toggles a class on `<html>`. Tailwind's `dark:` variants then switch via CSS — zero JS re-renders of child components.

---

## 11. Environment Variables

```
VITE_GROQ_API_KEY=your_key_here
```

Vite exposes only variables prefixed with `VITE_` to the browser bundle. This prevents accidental exposure of server-only secrets. The `.env.example` file is committed; the actual `.env` is gitignored.

---

## 12. Testing Philosophy

Tests in this project follow the principle: **test behaviour, not implementation**.

- Tests use React Testing Library (RTL) which queries by accessible roles and text, not CSS selectors or internal state
- No snapshot tests — they are brittle and don't test behaviour
- Pure utility functions (parseLensResponse, reducer) are unit-tested directly
- Hooks are tested via `renderHook` from RTL
- Groq SDK is mocked in all tests — no real API calls in the test suite

---

*Document version: 1.0*
