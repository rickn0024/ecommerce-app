import React from 'react';
import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SignUpForm from './_components/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl || '/');
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={100}
              height={100}
              className=""
              priority={true}
            />
          </Link>
          <CardTitle className="flex-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Fill out the information below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
