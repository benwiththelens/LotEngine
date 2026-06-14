import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'lot-engine.com';

  // Exclude internal paths from rewriting
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/icon') ||
    url.pathname.includes('.') // for static files in public/
  ) {
    return NextResponse.next();
  }

  const isMarketingDomain = 
    hostname === 'localhost:3000' || 
    hostname === 'lot-engine.com' || 
    hostname === 'www.lot-engine.com';

  if (isMarketingDomain) {
    // Standard routing for marketing site
    return NextResponse.next();
  }

  // Multi-tenant routing for other domains
  // Rewrite everything to /(tenant)/[domain]/...
  // This maps / to /(tenant)/[domain]/page.tsx
  url.pathname = `/${hostname}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
