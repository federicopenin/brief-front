import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BriefAI - PSD Layer Editor",
  description: "AI-powered PSD layer modification tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(24, 24, 27, 0.95)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              },
              classNames: {
                error: "!border-red-500/50 !text-red-300",
                success: "!border-emerald-500/50 !text-emerald-300",
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
