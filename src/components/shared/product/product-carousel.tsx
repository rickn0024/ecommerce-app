'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Product } from '@/types';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function ProductCarousel({ data }: { data: Product[] }) {
  return (
    <Carousel
      className="w-full mb-12"
      opts={{ loop: true }}
      plugins={[
        Autoplay({
          delay: 4000,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {data.map((product: Product) => (
          <CarouselItem key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className="relative mx-auto">
                <Image
                  src={product.banner!}
                  alt={product.name}
                  height="0"
                  width="0"
                  sizes="100vw"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-end justify-center">
                  <h2 className="bg-gray-900 bg-opasity-50 text-2xl font-bold px-2 text-white">
                    {product.name}
                  </h2>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
