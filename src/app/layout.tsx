import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voice Synth AI - Voice Cloning & AI Chat",
  description: "Clone voices and chat with AI using natural voice synthesis",
  keywords: ["voice cloning", "AI chat", "text to speech", "voice synthesis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <VoiceProvider>
            <ChatProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "var(--card)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                  },
                }}
              />
            </ChatProvider>
          </VoiceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
