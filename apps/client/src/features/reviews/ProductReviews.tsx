import { useState, type FormEvent } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  useCreateReviewMutation,
  useGetProductReviewsQuery,
  useGetReviewEligibilityQuery,
} from './reviewsApi';

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="text-[#a34f32]" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(full)}
      <span className="text-gray-300">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const user = useAppSelector((s) => s.auth.user);
  const { data: page } = useGetProductReviewsQuery({ productId });
  const { data: eligibility } = useGetReviewEligibilityQuery(productId, { skip: !user });
  const [createReview, { isLoading, error }] = useCreateReviewMutation();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await createReview({ productId, rating, comment: comment.trim() || undefined }).unwrap();
    setComment('');
  };

  return (
    <section className="mt-10">
      <h3 className="text-lg font-bold">Customer reviews</h3>
      <div className="mt-2 flex items-center gap-2">
        <Stars value={page?.averageRating ?? 0} />
        <span className="text-sm text-gray-600">
          {page?.averageRating ? page.averageRating.toFixed(1) : '—'} ({page?.total ?? 0})
        </span>
      </div>

      {user && eligibility?.eligible && (
        <form onSubmit={submit} className="mt-4 rounded-lg border border-[#c8c4b9] p-4">
          <label className="block text-sm font-medium" htmlFor="review-rating">
            Your rating
          </label>
          <select
            id="review-rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 rounded border border-[#c8c4b9] px-2 py-1 text-sm"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you think (optional)"
            rows={3}
            className="mt-3 w-full rounded border border-[#c8c4b9] px-3 py-2 text-sm"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">Could not submit your review.</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 rounded-md bg-[#a34f32] px-4 py-2 text-sm font-bold text-white hover:bg-[#8b3f25] disabled:opacity-60"
          >
            {isLoading ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}

      {user && eligibility && !eligibility.eligible && (
        <p className="mt-4 text-sm text-gray-500">
          Only customers who purchased this product can review it.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {page?.items.map((r) => (
          <li key={r.id} className="rounded-lg border border-[#e6e2d8] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {r.user ? `${r.user.firstName} ${r.user.lastName.charAt(0)}.` : 'Customer'}
              </span>
              <Stars value={r.rating} />
            </div>
            {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
            <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
        {!page?.items.length && (
          <li className="text-sm text-gray-500">No reviews yet — be the first.</li>
        )}
      </ul>
    </section>
  );
}
