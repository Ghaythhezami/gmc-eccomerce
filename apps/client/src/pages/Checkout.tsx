// apps/client/src/pages/Checkout.tsx
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Lock, ShoppingCart } from 'lucide-react';
import { useGetCartQuery } from '../features/cart/cartApi';
import { cartApi } from '../features/cart/cartApi';
import { useCreateOrderMutation } from '../features/orders/ordersApi';
import { useAppDispatch } from '../store/hooks';
import { useToast } from '../components/Toast';

const money = (value: number) => `$${value.toFixed(2)}`;

function apiMessage(error: unknown, fallback: string): string {
  const message = (error as { data?: { message?: string | string[] } })?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message ?? fallback;
}

export function Checkout() {
  const { data: cart, isLoading, isError, refetch } = useGetCartQuery();
  const [createOrder, { isLoading: isPlacing }] = useCreateOrderMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const placeOrder = async () => {
    const items = (cart?.items ?? []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    if (items.length === 0) return;

    try {
      const order = await createOrder({ items }).unwrap();
      // The server empties the ordered lines, so the cached cart is now stale.
      // It lives in a different API slice, so RTK Query cannot invalidate it for us.
      dispatch(cartApi.util.invalidateTags([{ type: 'Cart', id: 'ME' }]));
      toast.success('Order placed. Thank you!');
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (error) {
      // Typically "Only N left of X" when stock moved while the cart sat open.
      toast.error(apiMessage(error, 'Could not place your order.'));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[#e8e4da]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="h-56 animate-pulse rounded-lg bg-[#e8e4da] lg:col-span-2" />
          <div className="h-56 animate-pulse rounded-lg bg-[#e8e4da]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
          <AlertTriangle size={28} className="mx-auto mb-3 text-red-500" />
          <h1 className="text-lg font-bold text-red-900">Checkout could not be loaded</h1>
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

  // Reachable by typing the URL, or after the last line is removed in another tab.
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
        <ShoppingCart size={36} className="mx-auto mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-gray-600">Your cart is empty, so there is no order to place.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-[#a34f32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <header className="mb-6">
        <p className="eyebrow">Customer / Checkout</p>
        <h1 className="text-3xl font-bold">Review and place your order</h1>
        <p className="mt-1 text-sm text-gray-600">
          Prices are confirmed by the server when the order is placed.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="checkout-items">
          <h2 id="checkout-items" className="mb-3 font-bold">
            {cart!.itemCount} item{cart!.itemCount === 1 ? '' : 's'}
          </h2>
          <ul className="divide-y divide-[#e6e2d8] rounded-lg border border-[#c8c4b9] bg-white">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 p-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-md border border-[#c8c4b9] object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-[#c8c4b9] bg-[#f5f1e8] text-gray-400">
                    <ShoppingCart size={16} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{item.name}</h3>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {money(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-bold text-[#a34f32]">{money(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/cart"
            className="mt-3 inline-block text-sm font-semibold text-[#a34f32] underline-offset-2 hover:underline"
          >
            ← Edit your cart
          </Link>
        </section>

        <aside className="h-fit rounded-lg border border-[#c8c4b9] bg-white p-5">
          <h2 className="mb-4 border-b border-[#c8c4b9] pb-3 font-bold">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
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

          <button
            type="button"
            onClick={placeOrder}
            disabled={isPlacing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#a34f32] py-3 text-sm font-bold text-white transition hover:bg-[#8b3f25] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPlacing ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {isPlacing ? 'Placing your order…' : 'Place order'}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Digital codes are delivered to your account. No payment is taken in this demo.
          </p>
        </aside>
      </div>
    </div>
  );
}
