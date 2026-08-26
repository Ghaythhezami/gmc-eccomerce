import { useGetUsersQuery, useDeleteUserMutation } from '../features/auth/authApi';

export function Users() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error fetching users.</p>;

  return (
    <section>
      <p className="eyebrow">Admin / Users</p>
      <h1>User Management</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>Role</th>
            <th style={{ textAlign: 'left' }}>Created</th>
            <th style={{ textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt || '').toLocaleDateString()}</td>
              <td>
                <button onClick={() => deleteUser(user.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}