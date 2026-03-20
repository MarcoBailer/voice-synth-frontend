export { default } from 'next-auth/middleware';

export const config = {
  // Protect these routes — unauthenticated users are redirected to sign-in
  matcher: ['/chat/:path*', '/synthesize/:path*', '/voices/custom/:path*'],
};
