'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject, formatErrors } from '@/lib/utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Get latest product data from the database
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return convertToPlainObject(data);
}

// Get single product data by slug
export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findUnique({
    where: {
      slug,
    },
  });
  return convertToPlainObject(data);
}

// Get single product data by id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  });
  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== 'all' ? { category } : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== 'all'
      ? {
          price: {
            gte: Number(price.split('-')[0]),
            lte: Number(price.split('-')[1]),
          },
        }
      : {};

  // Rating filter
  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== 'all'
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy:
      sort === 'lowest'
        ? { price: 'asc' }
        : sort === 'highest'
        ? { price: 'desc' }
        : sort === 'rating'
        ? { rating: 'desc' }
        : { createdAt: 'desc' },
  });
  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a product by id
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!productExists) {
      throw new Error('Product is not found');
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({
      data: product,
    });

    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);

    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    if (!productExists) {
      throw new Error('Product is not found');
    }

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: product,
    });

    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Get all categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
  });
  return data;
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return convertToPlainObject(data);
}
