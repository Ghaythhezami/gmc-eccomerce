// apps/client/src/pages/NotFound.tsx
import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * Replaces the previous catch-all redirect to "/". Silently bouncing users home
 * hid genuine dead links (the cart and help routes among them).
 */
export function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center lg:px-8">
      <Compass size={40} className="mx-auto mb-4 text-[#a34f32]" />
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-1 text-3xl font-bold">This page does not exist</h1>
      <p className="mt-2 text-sm text-gray-600">
        Nothing is published at <code className="rounded bg-[#f5f1e8] px-1.5 py-0.5 text-[#7a3a22]">{pathname}</code>.
        It may be part of a feature the team has not shipped yet.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-md bg-[#a34f32] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
        >
          Back to home
        </Link>
        <Link
          to="/products"
          className="rounded-md border border-[#a34f32] px-5 py-2.5 text-sm font-bold text-[#a34f32] transition hover:bg-[#a34f32] hover:text-white"
        >
          Browse the catalog
        </Link>
      </div>
    </div>
  );
}
