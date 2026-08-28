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
          <li key={item.id} className="flex items-center justify-between py-3 text-sm">
            <span>
              Product {item.productId.slice(-6)} × {item.quantity}
            </span>
            <span className="font-medium">${item.unitPrice}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg font-bold text-[#a34f32]">Total ${order.total}</p>
    </section>
  );
}
