import React from 'react';
import { ThemeProvider } from '../components/ThemeProvider';
import { Suspense } from 'react';
import { WebSocketProvider } from '../context/WebSocketContext';
import ClientLayout from './ClientLayout';
import ChunkErrorBoundary from '../components/ChunkErrorBoundary';

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <ChunkErrorBoundary>
          <WebSocketProvider>
            <ThemeProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <ClientLayout>
                  <div className="min-h-screen">
                    <main>{children}</main>
                  </div>
                </ClientLayout>
              </Suspense>
            </ThemeProvider>
          </WebSocketProvider>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
