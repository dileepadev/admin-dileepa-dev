import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AlertProvider } from '@/components/providers/alert-provider';
import SessionWatcher from '@/components/Auth/SessionWatcher';
import { APP } from '@/lib/constants';
import './globals.css';

// Load only the brand's three weights. Components must explicitly use 400,
// 500 or 700; relying on font-weight substitution would change the hierarchy.
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
  // The same icon set the website serves. `app/favicon.ico` is a file
  // convention that Next serves and links itself, so it has no entry here. The
  // web-app manifest is copied with the set but not linked: it describes the
  // website, and this app is not installable.
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' }],
  },
  // This app runs on localhost and is never deployed. Telling a crawler not to
  // index it costs nothing and is correct if that ever changes.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
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
          defaultTheme="system"
          enableSystem
          storageKey="dileepa-theme"
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
