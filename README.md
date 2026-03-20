# Voice Synth AI Frontend

Modern Next.js frontend for AI-powered voice synthesis and cloning.

## Features

- 🤖 **AI Chat** - Converse with AI assistants
- 🎙️ **Voice Synthesis** - Convert text to natural speech
- 🎭 **Voice Cloning** - Create custom voices from audio samples
- 🌐 **Multi-language** - Support for English, Portuguese, and more
- 🔐 **Secure** - Authentication via external auth service
- 💳 **Credits System** - Usage-based credit management

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context
- **HTTP Client**: Axios
- **UI Components**: Custom components with Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Running instances of:
  - Authentication service (web_site_service)
  - Voice API (text_voice_api)

### Installation

```bash
# Clone the repository
git clone https://github.com/MarcoBailer/voice-synth-frontend.git
cd voice-synth-frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat interface
│   ├── voices/            # Voice library
│   ├── synthesize/        # Text-to-speech
│   └── layout.tsx         # Root layout
├── components/
│   ├── chat/              # Chat components
│   ├── layout/            # Layout components
│   └── voice/             # Voice-related components
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   ├── ChatContext.tsx    # Chat state
│   └── VoiceContext.tsx   # Voice state
├── lib/                   # Utilities
│   ├── api.ts             # API clients
│   └── utils.ts           # Helper functions
├── services/              # API services
│   ├── authService.ts     # Auth API calls
│   └── voiceService.ts    # Voice API calls
└── types/                 # TypeScript types
    └── index.ts
```

## Environment Variables

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for full documentation.

Key variables:
- `NEXT_PUBLIC_AUTH_API_URL` - Authentication API URL
- `NEXT_PUBLIC_VOICE_API_URL` - Voice synthesis API URL
- `NEXT_PUBLIC_AUTH_UI_URL` - Authentication UI URL (for redirects)

## API Integration

### Authentication
Uses cookie-based authentication from the web_site_service. Users are redirected to login when needed.

### Voice API
Communicates with text_voice_api for:
- Voice listing and selection
- Chat with AI (text and voice)
- Text-to-speech synthesis
- Voice cloning

## Docker Deployment

```bash
# Build Docker image
docker build -t voice-synth-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AUTH_API_URL=https://auth.example.com/api \
  -e NEXT_PUBLIC_VOICE_API_URL=https://voice-api.example.com \
  voice-synth-frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See [LICENSE](./LICENSE) for details.
