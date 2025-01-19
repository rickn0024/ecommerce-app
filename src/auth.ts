// import NextAuth from 'next-auth';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import { prisma } from '@/db/prisma';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { compareSync } from 'bcrypt-ts-edge';
// import type { NextAuthConfig } from 'next-auth';

// export const config = {
//   pages: {
//     signIn: '/signin',
//     error: '/signin',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     CredentialsProvider({
//       credentials: {
//         email: { type: 'email' },
//         password: { type: 'password' },
//       },
//       async authorize(credentials) {
//         if (credentials == null) {
//           return null;
//         }
//         // Find user in database
//         const user = await prisma.user.findFirst({
//           where: {
//             email: credentials.email as string,
//           },
//         });
//         // check if user exists and password is correct

//         if (user && user.password && user.password === credentials.password) {
//           const isMatch = compareSync(
//             credentials.password as string,
//             user.password,
//           );

//           if (isMatch) {
//             return {
//               id: user.id,
//               name: user.name,
//               email: user.email,
//               role: user.role,
//             };
//           }
//         }
//         // If user does not exist or password is incorrect
//         return null;
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, user, trigger, token }: any) {
//       session.user.id = token.sub;

//       // If there is an update to the user's name
//       if (trigger === 'update') {
//         session.user.name = user.name;
//       }
//       return session;
//     },
//   },
// } satisfies NextAuthConfig;

// export const { handlers, auth, signIn, signOut } = NextAuth(config);

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });

        if (
          user &&
          user.password &&
          compareSync(credentials.password as string, user.password)
        ) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: User;
    }) {
      if (token.sub) {
        if (session.user) {
          session.user.id = token.sub;
          session.user.role = token.role;
          session.user.name = token.name;
        }
      }

      if (user?.name) {
        if (session.user) {
          session.user.name = user.name;
        }
      }

      return session;
    },
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user: User;
      trigger?: string;
      session?: Session;
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // If use has no name then use email as name
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // update the db with the email as name
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: token.name,
            },
          });
        }
        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId,
              },
            });
            if (sessionCart) {
              // Delete current user cart
              await prisma.cart.deleteMany({
                where: {
                  userId: user.id,
                },
              });
              await prisma.cart.update({
                where: {
                  id: sessionCart.id,
                },
                data: {
                  userId: user.id,
                },
              });
            }
          }
        }
      }

      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
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

export const { handlers, auth, signIn, signOut } = NextAuth(config);
