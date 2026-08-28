import { useParams } from 'react-router-dom';
import { useGetProductQuery } from '../features/products/productsApi';
import { ProductReviews } from '../features/reviews/ProductReviews';

export function ProductDetail() {
  const { id = '' } = useParams();
  const { data: product, isLoading, isError } = useGetProductQuery(id, { skip: !id });

  if (isLoading) {
    return <section className="mx-auto max-w-4xl px-4 py-10">Loading…</section>;
  }
  if (isError || !product) {
    return <section className="mx-auto max-w-4xl px-4 py-10">Product not found.</section>;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <img
          src={product.imageUrl ?? 'https://placehold.co/600x400?text=No+image'}
          alt={product.name}
          className="w-full rounded-lg border border-[#c8c4b9] object-cover"
        />
        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-xl font-bold text-[#a34f32]">${product.price}</p>
          <p className="mt-4 text-sm text-gray-700">{product.description}</p>
          <p className="mt-4 text-xs text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </section>
  );
}
