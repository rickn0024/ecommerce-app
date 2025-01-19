'use client';

import React, { useTransition } from 'react';

import { Cart, CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { ToastAction } from '@/components/ui/toast';
import { Minus, PlusIcon, Loader } from 'lucide-react';

export default function AddToCart({
  cart,
  item,
}: {
  cart?: Cart;
  item: CartItem;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleAddtoCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res?.success) {
        toast({
          variant: 'destructive',
          description: res?.message,
        });
        return;
      }

      toast({
        description: res?.message,
        action: (
          <ToastAction
            className="bg-primary text-white dark:text-muted hover:bg-gray-800 hover:dark:text-muted-foreground"
            altText="Go to cart"
            onClick={() => router.push('/cart')}
          >
            View Cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res?.success ? 'default' : 'destructive',
        description: res?.message,
      });
      return;
    });
  };

  // Check if item is already in cart
  const existingItem =
    cart && cart?.items.find(x => x.productId === item.productId);

  return existingItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existingItem.quantity}</span>
      <Button type="button" variant="outline" onClick={handleAddtoCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" onClick={handleAddtoCart}>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="h-4 w-4" />
      )}{' '}
      Add to cart
    </Button>
  );
}
