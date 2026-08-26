// apps/admin/src/pages/Dashboard.tsx
import { useGetUsersQuery } from '../features/auth/authApi';

export function Dashboard() {
  const { data: users, isLoading, error } = useGetUsersQuery();

  return (
    <section>
      <p className="eyebrow">Operations</p>
      <h1>Admin Dashboard</h1>
      <p>Choose a feature ticket and build it vertically across the platform.</p>

      <div style={{ marginTop: '32px', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '32px' }}>{isLoading ? '...' : users?.length}</h3>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Total Users</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '32px' }}>0</h3>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Total Products</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '32px' }}>0</h3>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Total Orders</p>
        </div>
      </div>
    </section>
  );
}