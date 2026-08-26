// src/pages/Home.tsx
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <p className="eyebrow">Student commerce platform</p>
        <h1>
          Build the store
          <br />
          feature by feature.
        </h1>
        <p>
          A vertical-slice starter for five people learning to ship
          production-style commerce. Start with a clean base, then add
          products, carts, and checkouts one ticket at a time.
        </p>
        <Link className="button" to="/products">
          Browse catalog
        </Link>
      </section>

      {/* FEATURED CATEGORIES STRIP */}
      <section className="content" style={{ paddingTop: '0' }}>
        <p className="eyebrow">Featured Categories</p>
        <h2>Start your shopping journey</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
          <div className="card">
            <h3>Electronics</h3>
            <p>Explore the latest gadgets and tech essentials.</p>
            <Link to="/products" style={{ color: '#a34f32', fontWeight: 'bold' }}>Shop now →</Link>
          </div>
          <div className="card">
            <h3>Apparel</h3>
            <p>Discover stylish clothing for every season.</p>
            <Link to="/products" style={{ color: '#a34f32', fontWeight: 'bold' }}>Shop now →</Link>
          </div>
          <div className="card">
            <h3>Home & Living</h3>
            <p>Upgrade your space with modern essentials.</p>
            <Link to="/products" style={{ color: '#a34f32', fontWeight: 'bold' }}>Shop now →</Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="content">
        <p className="eyebrow">Why Atelier / Commerce</p>
        <h2>Built for learning, designed for scale</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '32px' }}>
          <div className="card">
            <h3>Vertical Slices</h3>
            <p>Tackle features end-to-end. From database to UI, you own the whole stack.</p>
          </div>
          <div className="card">
            <h3>Production Ready</h3>
            <p>Real authentication, real state management, and real API architecture.</p>
          </div>
          <div className="card">
            <h3>Role Based</h3>
            <p>Learn to implement customer, admin, and seller roles with ease.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="content" style={{ textAlign: 'center', paddingBottom: '8vh' }}>
        <p className="eyebrow">Ready to start?</p>
        <h2>Join the platform today.</h2>
        <p style={{ maxWidth: '500px', margin: '0 auto 20px' }}>
          Register as a customer to start building your shopping experience, or log in to continue where you left off.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link className="button" to="/register">
            Create account
          </Link>
          <Link className="button" to="/login" style={{ background: 'transparent', color: '#a34f32', border: '1px solid #a34f32' }}>
            Sign in
          </Link>
        </div>
      </section>
    </>
  );
}