import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from '../components/ui/toast'
import { ThemeProvider } from '../contexts/ThemeContext'
import { RootAuthProvider } from '../components/auth/RootAuthProvider'
import { ConnectionStatusBanner } from '../components/ui/ConnectionStatusBanner'
import config from '../lib/config'
import "./globals.css";
import "../styles/design-system.css";
import "../styles/professional-light-theme.css";

// Load Supabase debug utilities in development
// Commented out to prevent chunk loading issues
// if (process.env.NODE_ENV === 'development') {
//   import('../utils/supabaseDebug')
// }

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${config.app.name} - Find Your Perfect Home`,
  description: "Fast, easy rental application for your next home. Upload documents, complete your profile, and get approved quickly.",
  keywords: "rental, housing, apartment, application",
  authors: [{ name: "HomeWiz Team" }],
  robots: config.isProduction ? "index, follow" : "noindex, nofollow",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light">
          <RootAuthProvider>
            <ToastProvider>
              {config.app.demoMode && (
                <div className="demo-mode-banner bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
                  🎭 Demo Mode - Authentication Disabled
                </div>
              )}
              <ConnectionStatusBanner />
              {children}
            </ToastProvider>
          </RootAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
