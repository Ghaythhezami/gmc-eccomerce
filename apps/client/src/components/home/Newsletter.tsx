import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSubscribeNewsletterMutation } from '../../features/storefront/storefrontApi';
import { useToast } from '../Toast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();
  const toast = useToast();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await subscribe({ email: email.trim(), source: 'home-newsletter' }).unwrap();
      // The API is idempotent, so a repeat sign-up lands here too - the message
      // deliberately does not reveal whether the address was already on the list.
      toast.success('You are on the list. Watch your inbox for the next drop.');
      setEmail('');
    } catch (error) {
      const message = (error as { data?: { message?: string | string[] } })?.data?.message;
      toast.error(
        Array.isArray(message) ? message.join(', ') : (message ?? 'Could not sign you up. Please try again.'),
      );
    }
  };

  return (
    <section className="mt-12 rounded-lg bg-[#a34f32] p-8 text-center text-white">
      <h2 className="mb-4 text-2xl font-bold">Join the Gaming Revolution</h2>
      <p className="mx-auto mb-6 max-w-md text-sm text-white/90">
        Subscribe to get exclusive deals, early access to sales, and free game dev tips.
      </p>
      <form onSubmit={submit} className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="min-w-0 flex-1 rounded-md bg-[#f2efe8] px-4 py-3 text-sm font-semibold text-[#20231f] focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md bg-[#20231f] px-6 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          {isLoading ? 'Signing up…' : 'Subscribe'}
        </button>
      </form>
    </section>
  );
}
