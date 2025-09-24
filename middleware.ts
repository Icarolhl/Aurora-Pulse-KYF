import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  if (!isAdminRoute) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const allowed = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
  const userEmail = token?.email

  if (!token || !userEmail || !allowed.includes(userEmail)) {
    const url = req.nextUrl.clone()
    url.pathname = '/403'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
