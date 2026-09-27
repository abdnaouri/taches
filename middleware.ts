import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['fr', 'ar', 'en', 'es'];
const DEFAULT_LOCALE = 'fr';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip Next.js internal files, API routes, and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Check if pathname already starts with a supported locale (/fr, /en, /ar, /es)
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 3. Handle root / -> redirect to default /fr
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${search}`, request.url));
  }

  // 4. Handle direct /task/:slug -> redirect to /fr/task/:slug
  if (pathname.startsWith('/task/')) {
    const slug = pathname.replace('/task/', '');
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/task/${slug}${search}`, request.url));
  }

  // 5. Default redirect for other un-prefixed routes to /fr/pathname
  return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}${search}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
