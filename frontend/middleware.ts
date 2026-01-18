import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request)
  
  // Helper function to create redirect with cookies preserved
  const createRedirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    // Copy all Set-Cookie headers from the original response to preserve
    // session refresh cookies with their full attributes (httpOnly, secure, etc.)
    const setCookieHeaders = response.headers.getSetCookie()
    setCookieHeaders.forEach((cookieHeader) => {
      redirectResponse.headers.append('Set-Cookie', cookieHeader)
    })
    return redirectResponse
  }
  
  // Protect /app routes - redirect to /auth if not authenticated
  if (request.nextUrl.pathname.startsWith('/app')) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      return createRedirectWithCookies(url)
    }
  }
  
  // Redirect authenticated users away from /auth to /app
  if (request.nextUrl.pathname === '/auth') {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/app'
      return createRedirectWithCookies(url)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
