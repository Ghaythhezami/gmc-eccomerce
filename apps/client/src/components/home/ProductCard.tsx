import { Link } from 'react-router-dom';
import type { Product } from '../../features/catalog/catalogApi';

/** Renders the 0–5 rating as filled/empty stars rather than a fixed five-star string. */
function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span aria-label={`Rated ${rating} out of 5`} className="tracking-tight">
      {'★'.repeat(rounded)}
      <span className="text-gray-300">{'★'.repeat(5 - rounded)}</span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { name, slug, price, compareAtPrice, discountPercent, rating, reviewCount, imageUrl, stock } = product;
  const soldOut = stock === 0;

  return (
    <Link
      to={`/products/${slug}`}
      className="group flex flex-col rounded-lg border border-[#c8c4b9] bg-white p-4 transition hover:shadow-lg"
    >
      <div className="relative mb-4 overflow-hidden rounded-md bg-[#f5f1e8]">
        {discountPercent !== null && (
          <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
        {soldOut && (
          <span className="absolute right-2 top-2 z-10 rounded bg-gray-800 px-2 py-1 text-xs font-bold text-white">
            Sold out
          </span>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center text-sm text-gray-400">No image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col text-sm">
        <h3 className="mb-2 line-clamp-2 font-semibold">{name}</h3>
        <div className="mb-2 flex items-center gap-1 text-xs text-[#a34f32]">
          <Stars rating={rating} />
          <span className="text-gray-500">({reviewCount})</span>
        </div>
        <div className="mb-4 mt-auto flex items-center gap-2">
          <span className="text-lg font-bold text-[#a34f32]">${price.toFixed(2)}</span>
          {compareAtPrice !== null && (
            <span className="text-sm text-gray-400 line-through">${compareAtPrice.toFixed(2)}</span>
          )}
        </div>
        <button
          type="button"
          disabled={soldOut}
          className="w-full rounded-md bg-[#a34f32] py-2 text-sm font-bold text-white transition hover:bg-[#8b3f25] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {soldOut ? 'Out of stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

/** Matches the card footprint so grids do not jump while data loads. */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#c8c4b9] bg-white p-4">
      <div className="mb-4 h-48 w-full animate-pulse rounded-md bg-[#e8e4da]" />
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-[#e8e4da]" />
      <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-[#e8e4da]" />
      <div className="h-9 w-full animate-pulse rounded-md bg-[#e8e4da]" />
    </div>
  );
}
