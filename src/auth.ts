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

export const config = {
  pages: {
    signIn: '/signin',
    error: '/signin',
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
        }
      }

      if (user?.name) {
        if (session.user) {
          session.user.name = user.name;
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
