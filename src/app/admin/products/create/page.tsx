import React from 'react';
import { Metadata } from 'next';
import ProductForm from '../_components/product-form';

export const metadata: Metadata = {
  title: 'Create Product',
  description: 'Create a new product',
};

export default function CreateProductPage() {
  return (
    <div>
      <h2 className="h2-bold">Create Product</h2>
      <div className="my-8">
        <ProductForm type="Create" />
      </div>
    </div>
  );
}
