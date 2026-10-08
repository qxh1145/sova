import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (!request.nextUrl.searchParams.has('s')) {
    return NextResponse.next();
  }

  const s = request.nextUrl.searchParams.get('s') ?? '';
  const pathname = request.nextUrl.pathname;
  let page = '1';

  const pageMatch = pathname.match(/^\/page\/([^/]+)\/?$/);
  if (pageMatch) {
    page = pageMatch[1];
  }

  const destination = new URL('/tim-kiem/', request.nextUrl.origin);
  destination.searchParams.set('s', s);
  destination.searchParams.set('page', page);

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: ['/', '/page/:page/'],
};
