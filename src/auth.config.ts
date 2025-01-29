import type { NextAuthConfig, Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const authConfig = {
  providers: [], // Required by NextAuthConfig type
  callbacks: {
    authorized({
      request,
      auth,
    }: {
      request: NextRequest;
      auth: Session | null;
    }) {
      // Array of regex patterns to match paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];
      // Check if the current path is protected from request URL pathname
      const { pathname } = request.nextUrl;
      // Check if the user is authenticated and access is allowed
      if (!auth && protectedPaths.some(path => path.test(pathname)))
        return false;
      // Check for session cart cookie
      if (!request.cookies.get('sessionCartId')) {
        // Generate a new session cart id cookie
        const sessionCartId = crypto.randomUUID();
        // Clone request headers
        const newRequestHeaders = new Headers(request.headers);
        // Create new request and add to new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        // Set newly generated sessionCartId in the response cookie
        response.cookies.set('sessionCartId', sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;
