import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/design-system.css";
import "../styles/professional-light-theme.css";

// Dynamically import components to avoid compilation issues
import dynamic from 'next/dynamic';

const ToastProvider = dynamic(
  () => import('../components/ui/toast').then(mod => ({ default: mod.ToastProvider })),
  { ssr: false }
);

const ThemeProvider = dynamic(
  () => import('../contexts/ThemeContext').then(mod => ({ default: mod.ThemeProvider })),
  { ssr: false }
);

const RootAuthProvider = dynamic(
  () => import('../components/auth/RootAuthProvider').then(mod => ({ default: mod.RootAuthProvider })),
  { ssr: false }
);

const ConnectionStatusBanner = dynamic(
  () => import('../components/ui/ConnectionStatusBanner').then(mod => ({ default: mod.ConnectionStatusBanner })),
  { ssr: false }
);

import config from '../lib/config';

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
  viewport: "width=device-width, initial-scale=1",
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

              {!config.api.disabled && <ConnectionStatusBanner />}
              {children}
            </ToastProvider>
          </RootAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
