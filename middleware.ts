import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth'

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value
  const isAuthed = cookie === '1'

  if (isAuthed) {
    return NextResponse.next()
  }

  if (isAdminApi) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
