export function Newsletter() {
  return (
    <section className="mt-12 rounded-lg bg-[#a34f32] p-8 text-center text-white">
      <h2 className="mb-4 text-2xl font-bold">Join the Gaming Revolution</h2>
      <p className="mx-auto mb-6 max-w-md text-sm text-white/90">
        Subscribe to get exclusive deals, early access to sales, and free game dev tips.
      </p>
      <form className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
        <input 
          type="email" 
          placeholder="Enter your email"
          className="flex-1 rounded-md bg-[#f2efe8] px-4 py-3 text-sm font-semibold text-[#20231f] focus:outline-none focus:border-white"
        />
        <button type="submit" className="rounded-md bg-[#20231f] px-6 py-3 text-sm font-bold text-white transition hover:bg-black">
          Subscribe
        </button>
      </form>
    </section>
  );
}