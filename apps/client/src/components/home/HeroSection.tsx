import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetCategoriesQuery } from '../../features/catalog/catalogApi';

const HERO_SLIDES = [
  {
    id: 'summer-sale',
    badge: '🎮 Exclusive Deal',
    title: 'Summer Gaming Sale',
    description: 'Up to 70% off on AAA titles, indie gems, and masterclasses.',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80',
    accentColor: 'text-[#f5a623]',
  },
  {
    id: 'masterclass-pass',
    badge: '🚀 New Release',
    title: 'Game Dev Masterclass',
    description: 'Learn Unreal Engine 5 & Unity from industry veterans.',
    ctaText: 'Explore Pass',
    ctaLink: '/category/game-dev-courses',
    bgImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80',
    accentColor: 'text-sky-300',
  },
  {
    id: 'pre-orders',
    badge: '🔥 Coming Soon',
    title: 'Pre-Order Major Titles',
    description: 'Lock in exclusive skin packs, early access, and bonus content.',
    ctaText: 'View Titles',
    ctaLink: '/products?sort=newest',
    bgImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
    accentColor: 'text-[var(--color-danger)]',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { data: categories = [] } = useGetCategoriesQuery();

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="space-y-4 lg:space-y-0 font-sans">
      {/* Mobile & Tablet Category Pill Carousel */}
      <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-none flex items-center gap-2 py-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="rounded-full bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] text-gray-600">
              {cat.productCount}
            </span>
          </Link>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Left Sidebar - Categories (Desktop Only) */}
        <aside className="hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm lg:block lg:col-span-1">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] font-display">
            All Categories
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    {cat.name}
                  </span>
                  <span className="text-xs font-normal text-gray-500">{cat.productCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Hero Banner (Interactive Image Carousel) */}
        <div 
          className="relative overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-2 min-h-[320px] sm:min-h-[380px] bg-[var(--color-text)]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center text-white transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Zoom effect */}
                <img 
                  src={slide.bgImage} 
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-10000 linear ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Dark Contrast Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

                {/* Badge */}
                <span className="relative z-10 mb-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-inner">
                  <Sparkles size={14} className={slide.accentColor} />
                  {slide.badge}
                </span>

                {/* Title */}
                <h1 className="relative z-10 mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl drop-shadow-md font-display">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="relative z-10 mb-6 max-w-md text-sm sm:text-base text-gray-200 font-medium drop-shadow-sm">
                  {slide.description}
                </p>

                {/* CTA */}
                <Link
                  to={slide.ctaLink}
                  className="group relative z-10 inline-flex items-center gap-2.5 rounded-xl bg-[#20231f] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:bg-black hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-amber-300/40"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight 
                    size={18} 
                    className="text-amber-400 transition-transform duration-300 group-hover:translate-x-1" 
                  />
                </Link>
              </div>
            );
          })}

          {/* Prev / Next Controls */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 focus:outline-none"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 focus:outline-none"
          >
            <ChevronRight size={22} />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side Promo Cards */}
        <aside className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2 lg:col-span-1 lg:flex lg:flex-col">
          {/* Card 1 */}
          <div className="flex flex-1 flex-col justify-between rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white shadow-sm">
            <div>
              <h3 className="mb-1 text-base font-bold sm:text-lg font-display">🎓 Master Game Dev</h3>
              <p className="mb-4 text-xs sm:text-sm opacity-90">Learn from industry experts with hands-on courses.</p>
            </div>
            <Link 
              to="/category/game-dev-courses" 
              className="self-start rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              Explore Courses
            </Link>
          </div>

          {/* Card 2 */}
          <div className="flex flex-1 flex-col justify-between rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 p-5 text-white shadow-sm">
            <div>
              <h3 className="mb-1 text-base font-bold sm:text-lg font-display">🏆 Pre-Orders</h3>
              <p className="mb-4 text-xs sm:text-sm opacity-90">Get exclusive in-game bonuses and early access.</p>
            </div>
            <Link 
              to="/products?sort=newest" 
              className="self-start rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              View Titles
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}