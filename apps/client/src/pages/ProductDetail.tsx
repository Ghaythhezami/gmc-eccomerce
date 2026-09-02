// apps/client/src/pages/ProductDetail.tsx
import { Link, useParams } from 'react-router-dom';
import { useGetProductQuery } from '../features/catalog/catalogApi';

export function ProductDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductQuery(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-lg bg-[#e8e4da]" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-[#e8e4da]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#e8e4da]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[#e8e4da]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-sm text-gray-600">It may have been unpublished or removed by the store team.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-[#a34f32] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  const soldOut = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#a34f32]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.category.slug}`} className="hover:text-[#a34f32]">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-[#c8c4b9] bg-white">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full max-h-[480px] w-full object-cover" />
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">No image</div>
          )}
        </div>

        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-[#a34f32]">{'★'.repeat(Math.round(product.rating))}</span>
            <span className="text-gray-500">
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#a34f32]">${product.price.toFixed(2)}</span>
            {product.compareAtPrice !== null && (
              <>
                <span className="text-lg text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
                <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-gray-700">{product.description}</p>

          <p className="mt-5 text-sm">
            {soldOut ? (
              <span className="font-bold text-red-600">Out of stock</span>
            ) : (
              <span className="font-semibold text-emerald-700">{product.stock} in stock</span>
            )}
          </p>

          <button
            type="button"
            disabled={soldOut}
            className="mt-6 w-full rounded-md bg-[#a34f32] py-3 text-sm font-bold text-white transition hover:bg-[#8b3f25] disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:px-10"
          >
            {soldOut ? 'Out of stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
