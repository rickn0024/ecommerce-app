'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

export default function ProductImages({ images }: { images: string[] }) {
  const [currentImage, setCurrentImage] = React.useState(images[0]);

  return (
    <div className="space-y-4">
      <Image
        src={currentImage}
        alt="product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />
      <div className="flex gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => setCurrentImage(image)}
            className={cn(
              'border hover:border-gray-900 cursor-pointer',
              currentImage === image && 'border-gray-700',
            )}
          >
            <Image src={image} alt="product" width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
}
