import React from 'react';
import CartTable from './_components/cart-table';
import { getMyCart } from '@/lib/actions/cart.actions';

export const metadata = {
  name: 'Shopping Cart',
};

export default async function CartPage() {
  const cart = await getMyCart();

  return (
    <div>
      <CartTable cart={cart} />
    </div>
  );
}
