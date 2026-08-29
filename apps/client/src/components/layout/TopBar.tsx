import { Link } from 'react-router-dom';

export function TopBar() {
  return (
    <div className="bg-gray-900 text-white text-xs sm:text-sm py-1.5 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center flex-wrap gap-1">
        <span className="text-gray-300">
          🎮 Free delivery on all digital game codes & masterclasses over $50!
        </span>
        <div className="flex gap-4 sm:gap-6">
          <Link 
            to="/sell" 
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            Sell on GoMyCode
          </Link>
          <Link 
            to="/support" 
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
