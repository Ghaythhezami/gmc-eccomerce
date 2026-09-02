// apps/client/src/pages/Help.tsx
import { Link } from 'react-router-dom';
import { CreditCard, KeyRound, LifeBuoy, PackageSearch, ShieldCheck, Store } from 'lucide-react';

const FAQS = [
  {
    icon: KeyRound,
    question: 'When do I get my game key?',
    answer:
      'Digital keys are issued the moment payment clears and appear in your order history. Nothing is shipped physically.',
  },
  {
    icon: PackageSearch,
    question: 'Where do I track an order?',
    answer:
      'Order history lives under your account. Order tracking is being built as part of the orders feature and is not live yet.',
  },
  {
    icon: CreditCard,
    question: 'Which payment methods are accepted?',
    answer:
      'This is a student training platform, so checkout runs in test mode only. No real payment is ever taken.',
  },
  {
    icon: ShieldCheck,
    question: 'Are the keys genuine?',
    answer: 'Every key in the catalog is sourced from the publisher or an authorised distributor.',
  },
];

const SECTIONS: Record<string, { title: string; blurb: string }> = {
  help: { title: 'Help Centre', blurb: 'Answers to the questions we get asked most.' },
  support: { title: 'Support', blurb: 'Cannot find what you need? Here is how to reach a human.' },
  sell: { title: 'Sell on GoMyCode', blurb: 'How publishers and creators list their titles with us.' },
};

export function Help({ section = 'help' }: { section?: keyof typeof SECTIONS }) {
  const meta = SECTIONS[section] ?? SECTIONS.help;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow">Support</p>
        <h1 className="text-3xl font-bold">{meta.title}</h1>
        <p className="mt-1 text-gray-600">{meta.blurb}</p>
      </header>

      {section === 'sell' ? (
        <section className="rounded-lg border border-[#c8c4b9] bg-white p-6">
          <Store size={26} className="mb-3 text-[#a34f32]" />
          <h2 className="text-lg font-bold">Partner with us</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            We work with publishers, indie studios and course creators. Send a catalogue and a short description of
            your titles and the merchandising team will get back to you. Listings are curated rather than
            self-service, so every product is reviewed before it reaches the storefront.
          </p>
          <p className="mt-4 text-sm text-gray-700">
            Partnerships:{' '}
            <a className="font-semibold text-[#a34f32] hover:underline" href="mailto:partners@gomycodegames.tn">
              partners@gomycodegames.tn
            </a>
          </p>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map((faq) => {
              const Icon = faq.icon;
              return (
                <section key={faq.question} className="rounded-lg border border-[#c8c4b9] bg-white p-5">
                  <Icon size={20} className="mb-2.5 text-[#a34f32]" />
                  <h2 className="font-bold">{faq.question}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{faq.answer}</p>
                </section>
              );
            })}
          </div>

          <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#f5f1e8] p-6">
            <div className="flex gap-3">
              <LifeBuoy size={22} className="mt-0.5 shrink-0 text-[#a34f32]" />
              <div>
                <h2 className="font-bold">Still stuck?</h2>
                <p className="mt-0.5 text-sm text-gray-700">
                  Email{' '}
                  <a className="font-semibold text-[#a34f32] hover:underline" href="mailto:support@gomycodegames.tn">
                    support@gomycodegames.tn
                  </a>{' '}
                  and include your order reference.
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="rounded-md bg-[#a34f32] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#8b3f25]"
            >
              Back to shopping
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
