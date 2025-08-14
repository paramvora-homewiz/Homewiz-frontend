'use client';

import React from 'react';
import { SimpleToastProvider } from '../components/ui/SimpleToast';
import { ThemeProvider } from '../contexts/ThemeContext';
import { RootAuthProvider } from '../components/auth/RootAuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <RootAuthProvider>
        <SimpleToastProvider>
          {children}
        </SimpleToastProvider>
      </RootAuthProvider>
    </ThemeProvider>
  );
}