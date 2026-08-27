// apps/client/src/pages/Home.tsx
import { HeroSection } from '../components/home/HeroSection';
import { FlashSaleSection } from '../components/home/FlashSaleSection';
import { CategorySection } from '../components/home/CategorySection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { Newsletter } from '../components/home/Newsletter';

export function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <HeroSection />
      <FlashSaleSection />
      <CategorySection />
      <FeaturedSection />
      <WhyChooseUs />
      <Newsletter />
    </div>
  );
}