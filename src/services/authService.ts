/**
 * authService — thin helpers kept for backward compatibility.
 * Login / logout are now handled by NextAuth via AuthContext.
 * Direct calls are only needed for server-side or one-off usages.
 */
import { signIn, signOut } from 'next-auth/react';

export const authService = {
  redirectToLogin(): void {
    signIn('voice-cloner');
  },

  redirectToLogout(): void {
    signOut({ callbackUrl: '/' });
  },
};

export default authService;
