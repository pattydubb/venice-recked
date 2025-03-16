import { authMiddleware, redirectToSignIn } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const publicPaths = ['/', '/sign-in*', '/sign-up*', '/api/webhook*']

export default authMiddleware({
  publicRoutes: publicPaths,
  afterAuth(auth, req) {
    // Handle authenticated users
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Allow users to access protected routes if they're authenticated
    return NextResponse.next()
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
