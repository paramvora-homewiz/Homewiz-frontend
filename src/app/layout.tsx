import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from '../components/ui/toast'
import { ThemeProvider } from '../contexts/ThemeContext'
import { RootAuthProvider } from '../components/auth/RootAuthProvider'
import config from '../lib/config'
import "./globals.css";
// import "../styles/design-system.css";
// import "../styles/professional-light-theme.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${config.app.name} - Find Your Perfect Home`,
  description: "Fast, easy onboarding for your next rental home. Upload documents, complete your profile, and get approved quickly.",
  keywords: "rental, housing, apartment, onboarding, application",
  authors: [{ name: "HomeWiz Team" }],
  robots: config.isProduction ? "index, follow" : "noindex, nofollow",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light">
          <RootAuthProvider>
            <ToastProvider>
              {config.app.demoMode && (
                <div className="demo-mode-banner bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
                  🎭 Demo Mode - Authentication Disabled
                </div>
              )}
              {children}
            </ToastProvider>
          </RootAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
