import { Link, useParams } from 'react-router-dom';
import { useGetOrderQuery } from './ordersApi';

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const { data: order, isLoading, isError } = useGetOrderQuery(id, { skip: !id });

  if (isLoading) return <section className="mx-auto max-w-3xl px-4 py-10">Loading…</section>;
  if (isError || !order)
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <p>Order not found.</p>
        <Link to="/orders" className="text-sm text-[#a34f32] hover:underline">
          Back to my orders
        </Link>
      </section>
    );

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/orders" className="text-sm text-[#a34f32] hover:underline">
        ← My orders
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Order #{order.id.slice(-6).toUpperCase()}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Placed {new Date(order.createdAt).toLocaleString()} · Status{' '}
        <span className="font-semibold text-[#20231f]">{order.status}</span>
      </p>

      <ul className="mt-6 divide-y divide-[#e6e2d8] border-y border-[#e6e2d8]">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
            {item.product?.imageUrl && (
              <img
                src={item.product.imageUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-md border border-[#e6e2d8] object-cover"
              />
            )}
            <span className="min-w-0 flex-1">
              {item.product ? (
                <Link to={`/products/${item.product.slug}`} className="font-medium hover:underline">
                  {item.product.name}
                </Link>
              ) : (
                // The product row can be gone if the catalog was cleaned up later.
                <span className="text-gray-500">Product no longer available</span>
              )}
              <span className="block text-xs text-gray-500">
                ${item.unitPrice} × {item.quantity}
              </span>
            </span>
            <span className="font-medium">
              ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg font-bold text-[#a34f32]">Total ${order.total}</p>
    </section>
  );
}
