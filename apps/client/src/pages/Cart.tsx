// apps/client/src/pages/Cart.tsx
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveItemMutation,
  useUpdateItemMutation,
} from '../features/cart/cartApi';
import { useToast } from '../components/Toast';

const money = (value: number) => `$${value.toFixed(2)}`;

function apiMessage(error: unknown, fallback: string): string {
  const message = (error as { data?: { message?: string | string[] } })?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message ?? fallback;
}

export function Cart() {
  const { data: cart, isLoading, isError, refetch } = useGetCartQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const [removeItem] = useRemoveItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const toast = useToast();

  const setQuantity = async (productId: string, name: string, quantity: number) => {
    // Dropping to zero is a removal, not an invalid quantity.
    if (quantity < 1) return remove(productId, name);
    try {
      await updateItem({ productId, quantity }).unwrap();
    } catch (error) {
      // Usually "Only N in stock" from the server, which is worth showing verbatim.
      toast.error(apiMessage(error, 'Could not update that line.'));
    }
  };

  const remove = async (productId: string, name: string) => {
    try {
      await removeItem(productId).unwrap();
      toast.success(`${name} removed from your cart.`);
    } catch (error) {
      toast.error(apiMessage(error, 'Could not remove that line.'));
    }
  };

  const empty = async () => {
    if (!window.confirm('Empty your whole cart?')) return;
    try {
      await clearCart().unwrap();
      toast.success('Your cart is now empty.');
    } catch (error) {
      toast.error(apiMessage(error, 'Could not empty your cart.'));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[#e8e4da]" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-[#e8e4da]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
          <AlertTriangle size={28} className="mx-auto mb-3 text-red-500" />
          <h1 className="text-lg font-bold text-red-900">Your cart could not be loaded</h1>
          <p className="mt-1 text-sm text-red-800">The storefront could not reach the API.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-md bg-[#a34f32] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
        <ShoppingCart size={36} className="mx-auto mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-600">Browse the catalog and add something you like.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-[#a34f32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your cart</p>
          <h1 className="text-3xl font-bold">
            {cart!.itemCount} item{cart!.itemCount === 1 ? '' : 's'}
          </h1>
        </div>
        <button
          type="button"
          onClick={empty}
          disabled={isClearing}
          className="text-sm font-semibold text-gray-600 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-60"
        >
          Empty cart
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-[#c8c4b9] bg-white p-4"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md border border-[#c8c4b9] object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-[#c8c4b9] bg-[#f5f1e8] text-gray-400">
                  <ShoppingCart size={18} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{item.name}</h2>
                <p className="mt-0.5 text-sm text-gray-600">{money(item.unitPrice)} each</p>
              </div>

              <div className="flex items-center gap-1.5" role="group" aria-label={`Quantity for ${item.name}`}>
                <button
                  type="button"
                  onClick={() => setQuantity(item.productId, item.name, item.quantity - 1)}
                  disabled={isUpdating}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="rounded-md border border-[#c8c4b9] p-1.5 transition hover:bg-[#f5f1e8] disabled:opacity-50"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(item.productId, item.name, item.quantity + 1)}
                  disabled={isUpdating}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="rounded-md border border-[#c8c4b9] p-1.5 transition hover:bg-[#f5f1e8] disabled:opacity-50"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="w-20 shrink-0 text-right font-bold text-[#a34f32]">{money(item.lineTotal)}</div>

              <button
                type="button"
                onClick={() => remove(item.productId, item.name)}
                aria-label={`Remove ${item.name} from cart`}
                className="shrink-0 rounded-md border border-[#c8c4b9] p-2 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-[#c8c4b9] bg-white p-5">
          <h2 className="mb-4 border-b border-[#c8c4b9] pb-3 font-bold">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              {/* Priced by the server from the database, never from the client. */}
              <dd className="font-semibold">{money(cart!.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Delivery</dt>
              <dd className="font-semibold text-emerald-700">Free</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-[#c8c4b9] pt-3">
            <span className="font-bold">Total</span>
            <span className="text-lg font-bold text-[#a34f32]">{money(cart!.subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#a34f32] py-3 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
          >
            {isUpdating && <Loader2 size={15} className="animate-spin" />}
            Proceed to checkout
          </Link>
          <Link
            to="/products"
            className="mt-2 block w-full rounded-md border border-[#c8c4b9] py-2.5 text-center text-sm font-semibold transition hover:bg-[#f5f1e8]"
          >
            Keep shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
