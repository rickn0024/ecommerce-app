import ProductList from '@/components/shared/product/product-list';
import {
  getLatestProducts,
  getFeaturedProducts,
} from '@/lib/actions/product.actions';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';
import ProductCarousel from '@/components/shared/product/product-carousel';
import ViewAllProductsButton from '@/components/view-all-products-button';

export default async function HomePage() {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList
        data={latestProducts}
        title="Newest Arrivals"
        limit={LATEST_PRODUCTS_LIMIT}
      />
      <ViewAllProductsButton />
    </>
  );
}
