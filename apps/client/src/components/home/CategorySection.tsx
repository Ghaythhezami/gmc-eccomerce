import { Link } from 'react-router-dom';
import { categories } from './data';

export function CategorySection() {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <Link to="/categories" className="rounded-md border border-[#a34f32] px-4 py-2 text-sm font-bold text-[#a34f32] transition hover:bg-[#a34f32] hover:text-white">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/category/${cat.name.toLowerCase().replace(' ', '-')}`}
            className="flex flex-col items-center rounded-lg border border-[#c8c4b9] bg-white p-6 text-center transition hover:shadow-lg"
          >
            <div className="mb-3 text-4xl">{cat.icon}</div>
            <h3 className="mb-1 text-sm font-bold">{cat.name}</h3>
            <p className="text-xs text-gray-500">{cat.count} items</p>
          </Link>
        ))}
      </div>
    </section>
  );
}