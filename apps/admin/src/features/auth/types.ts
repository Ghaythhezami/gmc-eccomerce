// apps/admin/src/features/auth/types.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}