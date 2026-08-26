// apps/admin/src/pages/Placeholder.tsx
import { useState } from 'react';

interface PlaceholderProps {
  name: string;
}

export function Placeholder({ name }: PlaceholderProps) {
  const [ticket, setTicket] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend when endpoint is ready
    alert(`Feature ticket for "${name}" submitted!`);
  };

  return (
    <section>
      <p className="eyebrow">Admin / {name}</p>
      <h1>{name}</h1>
      <p>This page is intentionally a clean foundation for its feature ticket.</p>

      <div className="todo" style={{ marginTop: '24px' }}>
        <h3 style={{ marginTop: 0 }}>Feature Ticket</h3>
        <p>Describe the next feature you want to build for this module.</p>
        <form onSubmit={submit} style={{ marginTop: '12px' }}>
          <input 
            type="text" 
            placeholder="e.g., Add product creation form" 
            value={ticket} 
            onChange={(e) => setTicket(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" className="button">Submit Ticket</button>
        </form>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '32px' }}>0</h3>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Total {name}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '32px' }}>0</h3>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Pending Actions</p>
        </div>
      </div>
    </section>
  );
}