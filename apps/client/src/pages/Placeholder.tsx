// src/pages/Placeholder.tsx

interface PlaceholderProps {
  name: string;
}

export function Placeholder({ name }: PlaceholderProps) {
  return (
    <section className="content">
      <p className="eyebrow">Customer / {name}</p>
      <h2>{name}</h2>
      <p>This page is a foundation for the corresponding vertical feature ticket.</p>
    </section>
  );
}