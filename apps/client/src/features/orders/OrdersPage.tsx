import { Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from './ordersApi';

export function OrdersPage() {
  const { data: orders, isLoading } = useGetMyOrdersQuery();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">My orders</h1>

      {isLoading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
      {!isLoading && !orders?.length && (
        <p className="mt-4 text-sm text-gray-500">You have no orders yet.</p>
      )}

      <ul className="mt-6 space-y-3">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              to={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-[#c8c4b9] px-4 py-3 hover:bg-[#faf8f2]"
            >
              <span>
                <span className="block text-sm font-medium">Order #{order.id.slice(-6).toUpperCase()}</span>
                <span className="block text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                </span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold text-[#a34f32]">${order.total}</span>
                <span className="block text-[10px] uppercase tracking-wide text-gray-400">
                  {order.status}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
