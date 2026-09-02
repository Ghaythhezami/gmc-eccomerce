import { useGetProductsQuery } from '../../features/catalog/catalogApi';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

export function FlashSaleSection() {
  // "On sale" means the admin set a compare-at price above the selling price.
  const { data, isLoading } = useGetProductsQuery({ onSale: true, limit: 4, sort: 'price-asc' });
  const products = data?.items ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">⚡ Flash Sale</h2>
        <div className="flex items-center gap-1 font-mono text-sm">
          <span>Ends in:</span>
          <span className="rounded bg-gray-800 px-2 py-1 text-white">04</span>:
          <span className="rounded bg-gray-800 px-2 py-1 text-white">32</span>:
          <span className="rounded bg-gray-800 px-2 py-1 text-white">15</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
