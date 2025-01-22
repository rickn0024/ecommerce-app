import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { cookies } from 'next/headers';

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

        // If user has no name, use email as the name
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // Update the database with email as the name
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
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
