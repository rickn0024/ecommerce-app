import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import HeaderMenu from './menu';
import CategoryDrawer from './category-drawer';
import Search from './search';

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <CategoryDrawer />
          <Link className="flex-start ml-4" href="/">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={48}
              height={48}
              priority={true}
            />
            <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="hidden md:block">
          <Search />
        </div>
        <HeaderMenu />
      </div>
    </header>
  );
}
