import React from 'react';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import HeaderMenu from '@/components/shared/header/menu';
import MainNav from './components/main-nav';
import AdminSearch from './components/admin-search';

export default function AdminLayout({
  children,
}: Readonly<{ children?: React.ReactNode }>) {
  return (
    <div>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/" className="w-22">
              <Image
                src="/images/logo.svg"
                alt={APP_NAME}
                height={48}
                width={48}
              />
            </Link>
            <MainNav className="mx-6" />
            <div className="ml-auto items-center flex space-x-4">
              <AdminSearch />
              <HeaderMenu />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
