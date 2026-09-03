export type User = { 
    id: string; 
    firstName: string; 
    lastName: string; 
    email: string; 
    role: 'CUSTOMER' | 'ADMIN' 
};
export type AuthResponse = { user: User; accessToken: string };
