export function WhyChooseUs() {
  const features = [
    { icon: '⚡', title: 'Instant Delivery', desc: 'Get your game keys instantly via email.' },
    { icon: '🏆', title: 'Best Prices', desc: 'We match competitor prices daily.' },
    { icon: '🎮', title: '100% Genuine', desc: 'Official keys from publishers.' },
    { icon: '🎧', title: '24/7 Support', desc: 'Gaming experts always available.' },
  ];

  return (
    <section className="mt-12 rounded-lg border border-[#c8c4b9] bg-white p-8 text-center">
      <h2 className="mb-8 text-2xl font-bold">Why Choose GoMyCode Games?</h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#a34f32] text-2xl text-white">
              {feature.icon}
            </div>
            <h3 className="mb-2 font-bold">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}