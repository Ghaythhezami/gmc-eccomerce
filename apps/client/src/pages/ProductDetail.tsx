// apps/client/src/pages/ProductDetail.tsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAddItemMutation } from '../features/cart/cartApi';
import { useAppSelector } from '../store/hooks';
import { useToast } from '../components/Toast';
import { useGetProductQuery } from '../features/catalog/catalogApi';

export function ProductDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductQuery(slug);
  const user = useAppSelector((s) => s.auth.user);
  const [addItem, { isLoading: isAdding }] = useAddItemMutation();
  const toast = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const addToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.info('Sign in to start a cart.');
      navigate('/login');
      return;
    }
    try {
      await addItem({ productId: product.id, quantity }).unwrap();
      toast.success(`${quantity} × ${product.name} added to your cart.`);
    } catch (error) {
      const message = (error as { data?: { message?: string | string[] } })?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : (message ?? 'Could not add this to your cart.'));
    }
  };

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

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!soldOut && (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Qty</span>
                <input
                  type="number"
                  min={1}
                  // Never let the form offer more than the stock the API will accept.
                  max={product.stock}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)))
                  }
                  className="w-20 rounded-md border border-[#c8c4b9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a34f32]"
                />
              </label>
            )}

            <button
              type="button"
              onClick={addToCart}
              disabled={soldOut || isAdding}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#a34f32] py-3 text-sm font-bold text-white transition hover:bg-[#8b3f25] disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:px-10"
            >
              {isAdding && <Loader2 size={15} className="animate-spin" />}
              {soldOut ? 'Out of stock' : isAdding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
