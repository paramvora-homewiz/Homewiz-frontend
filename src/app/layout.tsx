import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeWiz - Find Your Perfect Home",
  description: "Fast, easy rental application for your next home. Upload documents, complete your profile, and get approved quickly.",
  keywords: "rental, housing, apartment, application",
  authors: [{ name: "HomeWiz Team" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
