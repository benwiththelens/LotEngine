import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ⚠️ LOTENGINE CORE INFRASTRUCTURE ⚠️
 * MULTI-TENANT DYNAMIC PROXY
 * 
 * This middleware acts as the network edge for the entire platform. 
 * It determines whether a user is looking at the global SaaS marketing site 
 * or a specific dealership's "Digital Twin" showroom based on the hostname.
 * 
 * Routing Rules:
 * 1. Static/Internal paths (_next, api, favicon) are ignored.
 * 2. If on the marketing domain AND the path is NOT a multi-tenant path 
 *    (like /login, /admin, /inventory), serve the Marketing Site `app/(marketing)`.
 * 3. All other requests are rewritten to `/[hostname]/path`, which maps to 
 *    the `app/(tenant)/[domain]` route group.
 * 
 * @example
 * Request: lot-engine.com/about -> Serves: app/(marketing)/about/page.tsx
 * Request: lot-engine.com/login -> Rewrites to: /[lot-engine.com]/login -> Serves: app/(tenant)/[domain]/login/page.tsx
 * Request: dealer-a.com/inventory -> Rewrites to: /[dealer-a.com]/inventory -> Serves: app/(tenant)/[domain]/inventory/page.tsx
 */
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

  const isMultiTenantPath = 
    url.pathname.startsWith('/login') || 
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/inventory');

  if (isMarketingDomain && !isMultiTenantPath) {
    // Standard routing for marketing site core pages
    return NextResponse.next();
  }

  // Multi-tenant routing for all other cases (tenant domains OR auth/admin paths on marketing domain)
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
