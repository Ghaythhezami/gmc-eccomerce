import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../features/catalog/catalogApi';

export function CategorySection() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <Link
          to="/products"
          className="rounded-md border border-[#a34f32] px-4 py-2 text-sm font-bold text-[#a34f32] transition hover:bg-[#a34f32] hover:text-white"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-[132px] animate-pulse rounded-lg bg-[#e8e4da]" />
            ))
          : categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center rounded-lg border border-[#c8c4b9] bg-white p-6 text-center transition hover:shadow-lg"
              >
                <div className="mb-3 text-4xl">{category.icon || '🎁'}</div>
                <h3 className="mb-1 text-sm font-bold">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.productCount} items</p>
              </Link>
            ))}
      </div>
    </section>
  );
}
