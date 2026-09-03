// apps/admin/src/pages/StorefrontAccess.tsx
import { useState, useEffect } from 'react';
import { 
  useGetStorefrontAccessQuery, 
  useUpdateStorefrontAccessMutation,
  useGetAllRolesQuery
} from '../features/storefront/storefrontApi';

export function StorefrontAccess() {
  const { data: accessData, isLoading } = useGetStorefrontAccessQuery();
  const { data: allRoles = [] } = useGetAllRolesQuery();
  const [updateAccess] = useUpdateStorefrontAccessMutation();
  const [roles, setRoles] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (accessData) setRoles(accessData.allowedRoles);
  }, [accessData]);

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    setShowSuccess(false);
    setShowError(false);
  };

  const handleSave = async () => {
    try {
      await updateAccess({ allowedRoles: roles });
      setShowSuccess(true);
      setShowError(false);
    } catch (error) {
      setShowError(true);
      setShowSuccess(false);
    }
  };

  if (isLoading || !allRoles.length) return <p>Loading roles...</p>;

  return (
    <section className="p-6">
      <p className="eyebrow">Admin / Storefront Access</p>
      <h1 className="text-2xl font-bold mb-4">Control Who Can Access the Storefront</h1>
      <p className="text-sm text-gray-600 mb-6">
        Select the roles that are allowed to browse and shop on the customer app.
      </p>

      {/* Custom Success / Error Message (Instead of native alert) */}
      {showSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-700">
          ✅ Storefront access updated successfully!
        </div>
      )}
      {showError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">
          ❌ Failed to update storefront access. Please try again.
        </div>
      )}

      <div className="space-y-2">
        {allRoles.map((role) => (
          <label key={role} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              type="checkbox" 
              checked={roles.includes(role)} 
              onChange={() => toggleRole(role)}
              className="w-4 h-4"
            />
            <span className="font-medium">{role}</span>
          </label>
        ))}
      </div>

      <button 
        onClick={handleSave} 
        className="mt-6 rounded-md bg-[#a34f32] px-6 py-3 text-white font-semibold hover:bg-[#8b3f25] transition"
      >
        Save Changes
      </button>
    </section>
  );
}