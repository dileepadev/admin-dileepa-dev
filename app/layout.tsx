import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AlertProvider } from '@/components/providers/alert-provider';
import SessionWatcher from '@/components/Auth/SessionWatcher';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Admin | Dileepa Bandara',
  description: 'Admin dashboard for dileepa.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AlertProvider>
              {/* SessionWatcher runs on the client and will auto-logout when the token expires */}
              {/* Placing it here ensures it is active on all pages */}
              <SessionWatcher />
              {children}
            </AlertProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
