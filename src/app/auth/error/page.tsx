'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link may have expired or already been used.',
  OAuthSignin: 'Could not start the sign-in flow. Please try again.',
  OAuthCallback: 'Could not complete sign-in. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Please try again.',
  Callback: 'Could not complete authentication callback.',
  Default: 'An unexpected error occurred during authentication.',
};

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Default';
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Authentication Error</h1>
        <p className="text-[var(--muted-foreground)] mb-8">{message}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn btn-secondary">
            Go Home
          </Link>
          <Link href="/api/auth/signin" className="btn btn-primary">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
