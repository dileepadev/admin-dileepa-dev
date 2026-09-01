import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AlertProvider } from '@/components/providers/alert-provider';
import SessionWatcher from '@/components/Auth/SessionWatcher';
import { APP } from '@/lib/constants';
import './globals.css';

// Weights 400, 500 and 700 only. The brand permits no 600 — it muddies the
// distinction between emphasis and heading — so the weight is not loaded at
// all, which makes a stray `font-semibold` render as 500 rather than silently
// synthesising a bolder face.
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP.name,
    template: `%s · ${APP.name}`,
  },
  description: APP.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon-180x180.png',
  },
  // This app runs on localhost and is never deployed. Telling a crawler not to
  // index it costs nothing and is correct if that ever changes.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
    { media: '(prefers-color-scheme: light)', color: '#F7F7F7' },
  ],
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}>
        {/* `data-theme`, not `class` — the token sheet keys its light overrides
            off the attribute, and the storage key is shared across every
            surface so the theme follows a visitor between them. */}
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          storageKey="dileepa-theme"
          disableTransitionOnChange
        >
          <ToastProvider>
            <AlertProvider>
              {/* Runs on the client and signs out when the token expires, so a
                  dead session fails at the door rather than on the first save. */}
              <SessionWatcher />
              {children}
            </AlertProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
