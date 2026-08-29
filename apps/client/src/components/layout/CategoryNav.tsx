import { Link } from 'react-router-dom';

const categories = [
  { name: 'All Games', path: '/' },
  { name: 'PC Games', path: '/category/pc' },
  { name: 'PlayStation', path: '/category/playstation' },
  { name: 'Xbox', path: '/category/xbox' },
  { name: 'Nintendo', path: '/category/nintendo' },
  { name: '🎓 Game Dev Masterclasses', path: '/category/masterclass', highlight: true },
  { name: 'Accessories', path: '/category/accessories' },
];

export function CategoryNav() {
  return (
    <nav className="category-nav">
      <div className="container">
        {categories.map((cat) => (
          <Link 
            key={cat.name} 
            to={cat.path} 
            className={`cat-link ${cat.highlight ? 'active' : ''}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}