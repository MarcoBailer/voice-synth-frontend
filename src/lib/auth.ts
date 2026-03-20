import { NextAuthOptions } from 'next-auth';

const OIDC_ISSUER = process.env.OIDC_ISSUER!;
const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID!;
const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET!;
const OIDC_API_SCOPE = process.env.OIDC_API_SCOPE ?? 'text-voice-api';
const OIDC_SCOPE = `openid profile email roles offline_access ${OIDC_API_SCOPE}`;

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch(`${OIDC_ISSUER}/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
        client_id: OIDC_CLIENT_ID,
        client_secret: OIDC_CLIENT_SECRET,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) throw tokens;

    return {
      ...token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in as number),
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return { ...token, error: 'RefreshAccessTokenError' as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'voice-cloner',
      name: 'Voice Cloner',
      type: 'oauth',
      wellKnown: `${OIDC_ISSUER}/.well-known/openid-configuration`,
      clientId: OIDC_CLIENT_ID,
      clientSecret: OIDC_CLIENT_SECRET,
      authorization: {
        params: {
          scope: OIDC_SCOPE,
          response_type: 'code',
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.email,
          email: profile.email,
        };
      },
    },
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // First sign-in: persist tokens from the OAuth provider response
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.roles = (profile as Record<string, unknown>)?.roles as string[] ?? [];
      }

      // Return token if still valid
      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt * 1000 - 60_000) {
        return token;
      }

      // Access token expired — try to refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      if (session.user) {
        (session.user as Record<string, unknown>).roles =
          (token.roles as string[]) ?? [];
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Revoke tokens on the Identity Provider when the user signs out
      if (token?.accessToken) {
        try {
          await fetch(`${OIDC_ISSUER}/connect/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              token: token.accessToken as string,
              client_id: OIDC_CLIENT_ID,
              client_secret: OIDC_CLIENT_SECRET,
            }),
          });
        } catch (err) {
          console.error('Token revocation failed', err);
        }
      }
    },
  },

  pages: {
    error: '/auth/error',
  },
};
