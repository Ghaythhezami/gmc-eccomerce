// src/components/auth/UnauthorizedView.tsx
import { LogOut } from 'lucide-react';

interface UnauthorizedViewProps {
  onSignOut: () => void;
}

export function UnauthorizedView({ onSignOut }: UnauthorizedViewProps) {
  return (
    <main>
      <nav style={{ justifyContent: 'center', padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
        <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
          GoMyCodeGames
        </strong>
      </nav>
      <section className="content" style={{ textAlign: 'center', marginTop: '10vh', padding: '0 7vw' }}>
        <p className="eyebrow">Session Invalid</p>
        <h2>Your session is not valid for this storefront.</h2>
        <p style={{ color: '#666', marginTop: '12px' }}>
          Please log out and try again with a different account.
        </p>
        <button 
          onClick={onSignOut} 
          className="button"
          style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={18} /> Log out
        </button>
      </section>
    </main>
  );
}