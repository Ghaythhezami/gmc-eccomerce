import { Link, useLocation } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../features/catalog/catalogApi';

export function CategoryNav() {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { pathname } = useLocation();

  return (
    <nav className="category-nav">
      <div className="container">
        <Link to="/products" className={`cat-link ${pathname === '/products' ? 'active' : ''}`}>
          All Products
        </Link>
        {categories.map((category) => {
          const path = `/category/${category.slug}`;
          return (
            <Link key={category.id} to={path} className={`cat-link ${pathname === path ? 'active' : ''}`}>
              {category.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
