import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['fr', 'ar', 'en', 'es', 'ru'];
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

  // Redirect /tasks/new to /task/new across all locales
  if (pathname.includes('/tasks/new')) {
    const fixedPath = pathname.replace('/tasks/new', '/task/new');
    return NextResponse.redirect(new URL(`${fixedPath}${search}`, request.url));
  }

  // 2. Check if pathname is an admin page (/admin, /:locale/admin, /:locale/admin/*)
  const isAdminRoute = pathname.includes('/admin');
  if (isAdminRoute) {
    const savedCookie = request.cookies.get('taches_locale')?.value;
    const targetLocale = (savedCookie && LOCALES.includes(savedCookie)) ? savedCookie : DEFAULT_LOCALE;
    const isAdminCookie = request.cookies.get('taches_is_admin')?.value === 'true';

    // If accessing root /admin directly without locale, redirect with locale
    if (pathname === '/admin' || pathname === '/admin/') {
      return NextResponse.redirect(new URL(`/${targetLocale}/admin/payouts${search}`, request.url));
    }

    // Check if user has admin cookie
    if (!isAdminCookie) {
      // Redirect unauthorized users to localized home page with auth parameter
      return NextResponse.redirect(
        new URL(`/${targetLocale}?auth=admin_required&redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  // 3. Check if pathname already starts with a supported locale (/fr, /en, /ar, /es)
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 4. Handle root / -> redirect to preferred locale or default /fr
  const savedCookie = request.cookies.get('taches_locale')?.value;
  const targetLocale = (savedCookie && LOCALES.includes(savedCookie)) ? savedCookie : DEFAULT_LOCALE;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${targetLocale}${search}`, request.url));
  }

  // 5. Handle direct /task/:slug -> redirect to /:locale/task/:slug
  if (pathname.startsWith('/task/')) {
    const slug = pathname.replace('/task/', '');
    return NextResponse.redirect(new URL(`/${targetLocale}/task/${slug}${search}`, request.url));
  }

  // 6. Default redirect for other un-prefixed routes (e.g. /tasks) to /:locale/pathname
  return NextResponse.redirect(new URL(`/${targetLocale}${pathname}${search}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
