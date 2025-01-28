'use server';

import { z } from 'zod';
import { insertReviewSchema } from '../validators';
import { formatErrors } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

// Create and updatee review
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>,
) {
  try {
    const session = await auth();

    if (!session) throw new Error('You must be logged in to leave a review');

    // Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    // Get the product being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error('Product not found');

    // Check if the user has already reviewed the product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: review.userId,
        productId: review.productId,
      },
    });

    prisma.$transaction(async tx => {
      if (existingReview) {
        // Update the existing review
        await tx.review.update({
          where: { id: existingReview.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create a new review
        await tx.review.create({ data: review });
      }

      // Get the average rating and number of reviews for the product
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // Update the product rating and number of reviews
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: 'Review updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { data };
}

// Get a review written by the current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session) throw new Error('User is not authenticated');

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session?.user?.id,
    },
  });
}
