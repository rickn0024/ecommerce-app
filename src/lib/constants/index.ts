export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Merch App';
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Buy our merch!';
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT = Number(
  process.env.LATEST_PRODUCTS_LIMIT || 4,
);

export const shippingAddressDefaultValues = {
  fullName: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export const PAYMENT_METHODS = (process.env.NEXT_PUBLIC_PAYMENT_METHODS?.split(
  ',',
) as string[]) || ['PayPal', 'CreditCard', 'CashOnDelivery'];

export const DEFAULT_PAYMENT_METHOD =
  process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD || 'PayPal';

export const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE || 12);

export const productDefaultValues = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: '0',
  stock: 0,
  rating: '0',
  numReviews: '0',
  isFeatured: false,
  banner: null,
};
