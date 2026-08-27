import { flashSaleGames } from './data';
import { ProductCard } from './ProductCard';

export function FlashSaleSection() {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">⚡ Flash Sale</h2>
        <div className="flex items-center gap-1 text-sm font-mono">
          <span>Ends in:</span>
          <span className="rounded bg-gray-800 px-2 py-1 text-white">04</span>:
          <span className="rounded bg-gray-800 px-2 py-1 text-white">32</span>:
          <span className="rounded bg-gray-800 px-2 py-1 text-white">15</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {flashSaleGames.map((game) => (
          <ProductCard key={game.id} {...game} />
        ))}
      </div>
    </section>
  );
}