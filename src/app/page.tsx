'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { 
  Mic, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  Play
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--secondary)] border border-[var(--border)] mb-8">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm">AI-Powered Voice Synthesis</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Clone Any Voice,{' '}
            <span className="gradient-text">Chat with AI</span>
          </h1>

          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
            Transform your ideas into natural speech. Clone voices, chat with AI assistants, 
            and create stunning audio content with our advanced voice synthesis platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoading ? (
              <div className="btn btn-primary opacity-50">Loading...</div>
            ) : isAuthenticated ? (
              <Link href="/chat" className="btn btn-primary text-lg px-8 py-4">
                Start Chatting
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button onClick={login} className="btn btn-primary text-lg px-8 py-4">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <Link href="/voices" className="btn btn-secondary text-lg px-8 py-4">
              <Play className="w-5 h-5" />
              Explore Voices
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[var(--card)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-[var(--muted-foreground)]">
              Everything you need for professional voice synthesis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="w-6 h-6" />}
              title="Voice Cloning"
              description="Clone any voice with just a few audio samples. Create custom voices for your projects."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="AI Chat"
              description="Have natural conversations with AI assistants that respond in your chosen voice."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Real-time Synthesis"
              description="Generate high-quality speech in real-time with minimal latency."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Multi-language"
              description="Support for multiple languages including English, Portuguese, and more."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Your voice samples and conversations are encrypted and never shared."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="High Quality"
              description="State-of-the-art XTTS v2 model for natural, human-like voice synthesis."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-[var(--muted-foreground)]">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Choose or Clone a Voice"
              description="Select from our default voices or upload audio samples to clone a new voice."
            />
            <StepCard
              number="2"
              title="Start a Conversation"
              description="Chat with AI using text or voice input. Get intelligent responses instantly."
            />
            <StepCard
              number="3"
              title="Listen & Download"
              description="Hear responses in your chosen voice. Download audio for your projects."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 border-[var(--primary)]/30 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
              Join thousands of users creating amazing voice content with our platform.
            </p>
            {isAuthenticated ? (
              <Link href="/chat" className="btn btn-primary text-lg px-8 py-4">
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button onClick={login} className="btn btn-primary text-lg px-8 py-4">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-semibold">Voice Synth AI</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} Voice Synth AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="card hover:border-[var(--primary)]/50 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4 text-[var(--primary)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--muted-foreground)] text-sm">{description}</p>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--muted-foreground)] text-sm">{description}</p>
    </div>
  );
}
