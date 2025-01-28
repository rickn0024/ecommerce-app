import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';

const currency = z
  .string()
  .refine(
    value => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decmial places',
  );

// inserting product schema here
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  slug: z.string().min(3, 'Slug must be at least 3 characters long'),
  category: z.string().min(3, 'Category must be at least 3 characters long'),
  brand: z.string().min(3, 'Brand must be at least 3 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for updating products
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'Product ID is required'),
});

// Schema for sign in
export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Schema for sign up
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Cart Schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  quantity: z.number().int().nonnegative('Quantity must be a positive number'),
  image: z.string().min(1, 'Image is required'),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  taxPrice: currency,
  shippingPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart ID is required'),
  userId: z.string().optional().nullable(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Full Name is required'),
  streetAddress: z.string().min(3, 'Address is required'),
  city: z.string().min(3, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal Code is required'),
  country: z.string().min(3, 'Country is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// export const paymentMethodSchema = z
//   .object({
//     type: z.string().min(1, 'Payment method is required'),
//   })
//   .refine(data => PAYMENT_METHODS.includes(data.type), {
//     path: ['type'],
//     message: 'Invalid payment method',
//   });
export const paymentMethodSchema = z.object({
  type: z.enum(PAYMENT_METHODS as [string, ...string[]], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method',
  }),
});

// Schema for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine(data => PAYMENT_METHODS.includes(data), {
    message: 'Invalid payment method',
  }),
  shippingAddress: shippingAddressSchema,
});

// Schema for inserting order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  quantity: z.number(),
});

// Schema for updating PayPal paymentResult
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  price_paid: z.string(),
});

// Schema for updating user profile
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
});

// Schema to update users
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'ID is required'),
  role: z.string().min(1, 'Role is required'),
});

// Schema for inserting reviews
export const insertReviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(3, 'Comment must be at least 3 characters long'),
  productId: z.string().min(1, 'Product is required'),
  userId: z.string().min(1, 'User is required'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});
