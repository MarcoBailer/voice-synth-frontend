'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { VoiceSelector } from '@/components/voice/VoiceSelector';
import { VoiceCloner } from '@/components/voice/VoiceCloner';
import { Mic, Plus, Grid, List } from 'lucide-react';

export default function VoicesPage() {
  const { user, isLoading, login } = useAuth();
  const [showCloner, setShowCloner] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Mic className="w-8 h-8 text-[var(--primary)]" />
                Voice Library
              </h1>
              <p className="text-[var(--muted-foreground)]">
                Select from default voices or create your own custom voice clones
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--secondary)]'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--secondary)]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Clone Button */}
              {user && (
                <button
                  onClick={() => setShowCloner(!showCloner)}
                  className="btn btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Clone Voice
                </button>
              )}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Voice Selector */}
            <div className={showCloner ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="card">
                <VoiceSelector />
              </div>

              {!user && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 border border-[var(--primary)]/30 text-center">
                  <h3 className="font-semibold mb-2">Want to clone your own voice?</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Sign in to create custom voice clones from your audio samples.
                  </p>
                  <button onClick={login} className="btn btn-primary">
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Voice Cloner */}
            {showCloner && user && (
              <div className="lg:col-span-1">
                <VoiceCloner onSuccess={() => setShowCloner(false)} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
