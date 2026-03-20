# Voice Synth Frontend - Technical Documentation

## 1. Project Overview

Next.js 16.1.6 frontend for the Voice Synth AI platform. Provides TTS synthesis, voice cloning, and AI chat with voice response capabilities.

- **Stack**: React 19.2.3, TypeScript, Tailwind CSS 4
- **Backend**: Integrates with `text_voice_api` (FastAPI) for voice/chat operations
- **Auth**: NextAuth v4 with OIDC provider (shark-lock / web-auth)
- **Styling**: Dark theme with indigo/purple accents, glass morphism effects

---

## 2. Authentication

### NextAuth Configuration (`src/lib/auth.ts`)
- **Provider**: OIDC with client ID `voice-cloner`
- **Scopes**: `openid profile email roles offline_access text-voice-api`
- **Token refresh**: Automatic when expiring (1-minute buffer before expiration)
- **Token revocation**: On logout, tokens are revoked at the OIDC provider

### AuthContext (`src/contexts/AuthContext.tsx`)
Wraps `useSession()` from NextAuth and provides:
- `user`, `credits`, `isAuthenticated`, `accessToken`
- `refreshCredits()` — re-fetches credit balance from API
- `login()` → `signIn('voice-cloner')`
- `logout()` → `signOut()`

Auto-refreshes credits whenever auth state changes.

### Protected Routes (`src/middleware.ts`)
- `/chat/*`, `/synthesize/*`, `/voices/custom/*` — require authentication
- Unauthenticated users redirected to NextAuth sign-in
- Error page: `/auth/error` with typed error messages

### Token Injection (`src/lib/api.ts`)
The `voiceApi` Axios client auto-injects Bearer token from session via `getSession()?.accessToken`.

---

## 3. Page Structure & User Flows

### Home (`/`) — Public
Landing page with hero section, features showcase (Voice Cloning, AI Chat, Real-time Synthesis, Multi-language, Security, Quality), "How It Works" 3-step guide, and CTA sections. Shows "Login" or "Start Chatting" based on auth state.

### Chat (`/chat`) — Protected
- **Layout**: Header + collapsible Sidebar + Chat area + Settings panel
- **Sidebar**: Conversation list (from localStorage), "New Chat" button, collapse toggle
- **Chat area**: Message bubbles with optional audio playback, auto-scroll, typing indicator
- **Settings**: Voice selector for enabling voice responses
- Auto-creates a conversation on first load

### Synthesize (`/synthesize`) — Protected
- 2-column layout: voice selector + text input area
- Character counter (max 5000), copy button
- Synthesize button → plays audio automatically
- Download button (saves as `speech-{timestamp}.wav`)

### Voices (`/voices`) — Public (clone requires auth)
- Voice library with grid/list toggle
- Sections: "Default Voices" + "Your Cloned Voices"
- "Clone Voice" button opens VoiceCloner side panel

### Auth Error (`/auth/error`)
Handles: Configuration, AccessDenied, Verification, OAuth failures with descriptive messages.

---

## 4. State Management (3 React Contexts)

### AuthContext
```typescript
{ user, credits, isLoading, isAuthenticated, accessToken, refreshCredits(), login(), logout() }
```
Pulls data from NextAuth session. Credits: `{ current, used, total }`.

### ChatContext (`src/contexts/ChatContext.tsx`)
```typescript
{ conversations, currentConversation, isLoading,
  createConversation(), selectConversation(), deleteConversation(),
  addMessage(), updateMessage(), clearCurrentConversation() }
```
- **Persistence**: localStorage key `voice-synth-conversations`
- Auto-sets conversation title from first user message (first 50 chars)
- Generates UUIDs for conversations and messages

### VoiceContext (`src/contexts/VoiceContext.tsx`)
```typescript
{ voices, selectedVoice, customVoices, isLoadingVoices,
  setVoices(), setCustomVoices(), selectVoice(), addCustomVoice(), removeCustomVoice(), getAllVoices() }
```
- **Persistence**: localStorage for `selectedVoiceId`
- Combines default + custom voices in `getAllVoices()`

---

## 5. Component Architecture

### Layout
- **Header** (`src/components/layout/Header.tsx`): Fixed top nav, logo, nav links (Chat/Voices/Synthesize), credits badge, user dropdown menu. Glass morphism effect.
- **Sidebar** (`src/components/layout/Sidebar.tsx`): Fixed left panel (w-72 or w-16 collapsed), conversation list with timestamps, delete buttons, selected voice indicator.

### Chat Components (`src/components/chat/`)
- **ChatContainer**: Orchestrator — auto-scroll, conversation creation, API calls (`chatText`/`chatVoice`), credit refresh after calls, error handling (403 = insufficient credits, 401 = re-login)
- **ChatMessage**: Message bubble with avatar, text, optional audio player (play/pause, progress bar, duration). Converts base64 audio to playable Blob URL.
- **ChatInput**: Auto-expanding textarea, voice toggle button (active if voice selected), Shift+Enter for newline, Enter to send.

### Voice Components (`src/components/voice/`)
- **VoiceSelector**: Compact dropdown or full card grid mode. Groups default/custom voices. Persists selection to localStorage.
- **TextToSpeech**: Text input (5000 char max), synthesize button, audio player with wave animation, download as WAV.
- **VoiceCloner**: Form with name, language selector, drag-and-drop file upload (1-5 files, max 10MB, WAV/MP3/OGG). Progress bar, tips section, success/error toasts.

---

## 6. API Integration (`src/services/voiceService.ts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getVoices()` | GET `/voices` | List all voices |
| `getCustomVoices()` | GET `/voices/custom` | List user's cloned voices |
| `chatText(msg, lang, convId?)` | POST `/chat/text` | Text-only chat |
| `chatVoice(msg, voiceId, convId?)` | POST `/chat/voice` | Chat with voice response |
| `synthesize(text, voiceId)` | POST `/synthesize` | Text-to-speech |
| `cloneVoice(name, lang, files)` | POST `/voices/clone` | Clone voice (multipart) |
| `deleteVoice(voiceId)` | DELETE `/voices/{id}` | Delete custom voice |
| `getCredits()` | GET `/credits` | Get credit balance |
| `base64ToAudioUrl(base64)` | — | Utility: base64 → Blob URL |

### API Clients (`src/lib/api.ts`)
- **authApi**: Base URL = `NEXT_PUBLIC_AUTH_API_URL`, withCredentials
- **voiceApi**: Base URL = `NEXT_PUBLIC_VOICE_API_URL`, Bearer token injected from session
- Error handling: 401 → redirect to OIDC login, 403 → log forbidden warning

---

## 7. Audio Handling

- **Playback**: HTML5 `<audio>` element (not Wavesurfer.js, which is installed but unused)
- **Base64 conversion**: `voiceService.base64ToAudioUrl()` converts API response to Blob URL
- **Progress tracking**: `timeupdate` event → progress bar, `loadedmetadata` → duration
- **Download**: Creates anchor element with Blob URL, filename `speech-{timestamp}.wav`
- **Cleanup**: `URL.revokeObjectURL()` on component unmount to prevent memory leaks

### Visual Effects
- `.voice-wave`: 5 animated bars with staggered 1s wave animation
- `.typing-indicator`: 3 pulsing dots for loading state
- `.audio-progress`: Progress bar tracking current playback position

---

## 8. Styling

### Color Scheme (CSS variables in `globals.css`)
```
--background: #0a0a0a    --foreground: #ededed
--card: #141414           --primary: #6366f1 (indigo)
--secondary: #1e1e1e      --accent: #8b5cf6 (purple)
--destructive: #ef4444    --success: #22c55e
--warning: #f59e0b        --border: #27272a
```

### Custom Effects
- `.glass`: Backdrop blur 12px, 0.8 opacity
- `.gradient-text`: Linear gradient primary → accent on text
- `.message-enter`: fadeIn 0.3s animation for new messages

---

## 9. Environment Variables

```bash
# OIDC
OIDC_ISSUER=http://localhost:5085
OIDC_CLIENT_ID=voice-cloner
OIDC_CLIENT_SECRET=<from web-auth admin>
OIDC_API_SCOPE=text-voice-api

# NextAuth
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Public APIs (exposed to browser)
NEXT_PUBLIC_AUTH_API_URL=http://localhost:5085/api
NEXT_PUBLIC_VOICE_API_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_NAME=Voice Synth AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. TypeScript Types (`src/types/`)

### Core Types
- `User { id, email, name, credits, avatarUrl? }`
- `Voice { id, name, language, description?, previewUrl?, isDefault, isCustom, createdAt? }`
- `Message { id, role: 'user'|'assistant'|'system', content, audioUrl?, audioBase64?, timestamp, isLoading? }`
- `Conversation { id, title, messages, voiceId?, createdAt, updatedAt }`
- `CreditInfo { current, used, total }`

### API Types
- `ChatTextRequest/Response`, `ChatVoiceRequest/Response`
- `SynthesizeRequest/Response`
- `VoiceCloneRequest { name, language, samples: File[] }`

### NextAuth Extensions
- `Session { accessToken?, error?, user: { ... } }`
- `JWT { accessToken?, refreshToken?, expiresAt?, roles?, error? }`

---

## 11. Deployment

### Docker (Multi-stage)
- **Builder**: Install deps, build Next.js with standalone output
- **Runner**: Node 20 Alpine, non-root user (`nextjs:1001`), port 3000
- `HOSTNAME=0.0.0.0` for container networking
