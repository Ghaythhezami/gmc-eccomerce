import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
}

export function ProductCard({ id, title, price, oldPrice, discount, rating, reviews, image }: ProductCardProps) {
  return (
    <Link to={`/products/${id}`} className="group rounded-lg border border-[#c8c4b9] bg-white p-4 transition hover:shadow-lg">
      <div className="relative mb-4 overflow-hidden rounded-md">
        {discount && (
          <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        <img 
          src={image} 
          alt={title} 
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="text-sm">
        <h3 className="mb-2 line-clamp-2 font-semibold">{title}</h3>
        <div className="mb-2 flex items-center gap-1 text-xs text-[#a34f32]">
          <span>★★★★★</span>
          <span className="text-gray-500">({reviews})</span>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg font-bold text-[#a34f32]">${price}</span>
          {oldPrice && <span className="text-sm text-gray-400 line-through">${oldPrice}</span>}
        </div>
        <button className="w-full rounded-md bg-[#a34f32] py-2 text-sm font-bold text-white transition hover:bg-[#8b3f25]">
          Add to Cart
        </button>
      </div>
    </Link>
  );
}