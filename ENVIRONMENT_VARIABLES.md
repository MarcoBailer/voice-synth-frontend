# ============================================================
# NEXTAUTH (OIDC Integration with web_site_service)
# ============================================================
# URL base do servidor de autenticação (sem trailing slash)
OIDC_ISSUER=http://localhost:5085

# Client criado no painel admin do web_site_service
OIDC_CLIENT_ID=voice-cloner
OIDC_CLIENT_SECRET=DBLdkGOciu_QgcmiV0yU2GudQKn4iNZQ8yd6p5ittbA

# Gere com: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here

# URL pública deste app Next.js (onde NextAuth registra o callback)
NEXTAUTH_URL=http://localhost:3000

# ============================================================
# Authentication API (web_site_service)
# ============================================================
NEXT_PUBLIC_AUTH_API_URL=http://localhost:5085/api

# ============================================================
# Voice API (text_voice_api)
# ============================================================
NEXT_PUBLIC_VOICE_API_URL=http://localhost:8000

# ============================================================
# Application Settings
# ============================================================
NEXT_PUBLIC_APP_NAME=Voice Synth AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
