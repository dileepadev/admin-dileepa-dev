import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * The API sets its own (see `app/core/rate_limit.py` in `api-dileepa-dev`);
 * this app set none at all, so every one of these was missing on every
 * response. They are listed here rather than at the edge so the posture ships
 * with the code and survives a change of host.
 *
 * `Strict-Transport-Security` deliberately omits `includeSubDomains`. Sibling
 * hosts under `dileepa.dev` are not all served over TLS — `blog.dileepa.dev`
 * is retired and currently resolves to a registrar forward with no
 * certificate — and a directive set here would be honoured for those too.
 *
 * **Development needs three things production must never get**, so they are
 * added only when `next dev` is the thing running:
 *
 * - `'unsafe-eval'` — React's development build calls `eval()` to rebuild
 *   callstacks across environments and for other debugging features. Without
 *   it the console fills with "eval() is not supported in this environment".
 *   React never calls `eval()` in a production build, so production keeps the
 *   stricter policy and loses nothing.
 * - `ws:` and `wss:` on `connect-src` — hot module replacement is a WebSocket.
 * - `blob:` on `script-src` and `worker-src` — Turbopack loads some chunks as
 *   blob-backed workers.
 *
 * Gated on `NODE_ENV` rather than on a flag someone can forget to unset.
 */
function securityHeaders() {
  const isDev = process.env.NODE_ENV === 'development';
  const devScript = isDev ? " 'unsafe-eval' blob:" : '';
  const devConnect = isDev ? ' ws: wss:' : '';

  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'accelerometer=(), camera=(), geolocation=(), microphone=(), payment=()',
    },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    {
      // The admin renders no third-party script and embeds no frame. `img-src`
      // allows Cloudinary because that is where every managed image lives, and
      // `data:` because next/image emits inline placeholders. The API is
      // reached from server actions, not from the browser, so `connect-src`
      // stays `'self'`.
      //
      // `'unsafe-inline'` on scripts is Next's hydration payload, which is an
      // inline `<script>` on every page. Removing it needs a per-request nonce,
      // and a nonce needs middleware on every route.
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${devScript}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://res.cloudinary.com",
        "font-src 'self' data:",
        `connect-src 'self'${devConnect}`,
        `worker-src 'self'${isDev ? ' blob:' : ''}`,
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'none'",
        "object-src 'none'",
      ].join('; '),
    },
  ];
}

const nextConfig: NextConfig = {
  // `X-Powered-By: Next.js` names the framework on every response and nothing
  // reads it.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Image uploads are posted through a server action, so this is the
      // effective upload ceiling for the media library.
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Cloudinary and nothing else. `dileepadev.blob.core.windows.net` was the
    // retired Azure Blob backend, dropped from the API in v2.0.0, and
    // `youtube.com` never served an image to `next/image` at all — recordings
    // are linked, not embedded. Both were left behind here, and each one was a
    // host the image optimiser would fetch arbitrary paths from on request.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders() }];
  },
};

export default nextConfig;
