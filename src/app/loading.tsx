import React from 'react';
import loader from '@/assets/spinner.gif';
import Image from 'next/image';

export default function LoadingPage() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* <LoaderCircle className="max-h-10 max-w-10 animate-spin" /> */}
      <Image src={loader} alt="Loading..." height="100" width="100" />
    </div>
  );
}
