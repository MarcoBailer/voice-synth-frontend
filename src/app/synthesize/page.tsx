'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { TextToSpeech } from '@/components/voice/TextToSpeech';
import { VoiceSelector } from '@/components/voice/VoiceSelector';
import { Volume2 } from 'lucide-react';

export default function SynthesizePage() {
  const { user, isLoading, login } = useAuth();

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

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="pt-32 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-6">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-[var(--muted-foreground)] mb-6">
              Please sign in to use the text-to-speech synthesizer.
            </p>
            <button onClick={login} className="btn btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-6">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Text to Speech</h1>
            <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
              Convert any text into natural-sounding speech using your selected voice.
              Perfect for creating audio content, voiceovers, and more.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Voice Selection */}
            <div className="card">
              <VoiceSelector />
            </div>

            {/* Text to Speech */}
            <TextToSpeech />
          </div>

          {/* Usage Tips */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <TipCard
              title="Best for Narration"
              description="Use longer sentences with natural pauses for the most lifelike narration."
            />
            <TipCard
              title="Multiple Languages"
              description="Select a voice matching your text's language for optimal results."
            />
            <TipCard
              title="Download & Share"
              description="Download synthesized audio as WAV files for use in your projects."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)]">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}
