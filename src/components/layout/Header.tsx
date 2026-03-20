'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Coins, 
  Settings,
  Mic
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function Header() {
  const { user, credits, isAuthenticated, login, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Voice Synth AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/chat" 
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Chat
            </Link>
            <Link 
              href="/voices" 
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Voices
            </Link>
            <Link 
              href="/synthesize" 
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Synthesize
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-[var(--muted)] animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                {/* Credits Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)]">
                  <Coins className="w-4 h-4 text-[var(--warning)]" />
                  <span className="text-sm font-medium">
                    {credits?.current ?? user.credits} credits
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm">
                      {user.name || user.email}
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
                      <div className="p-3 border-b border-[var(--border)]">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary)] transition-colors w-full text-left text-[var(--destructive)]"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={login}
                className="btn btn-primary"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--secondary)]"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)]">
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="/chat"
              className="block px-4 py-3 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
            <Link
              href="/voices"
              className="block px-4 py-3 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Voices
            </Link>
            <Link
              href="/synthesize"
              className="block px-4 py-3 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Synthesize
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
