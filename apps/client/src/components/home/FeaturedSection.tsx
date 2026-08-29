import { Link } from 'react-router-dom';
import { featuredGames } from './data';
import { ProductCard } from './ProductCard';

export function FeaturedSection() {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Games</h2>
        <Link to="/products" className="rounded-md border border-[#a34f32] px-4 py-2 text-sm font-bold text-[#a34f32] transition hover:bg-[#a34f32] hover:text-white">
          Browse All
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredGames.map((game) => (
          <ProductCard key={game.id} {...game} />
        ))}
      </div>
    </section>
  );
}