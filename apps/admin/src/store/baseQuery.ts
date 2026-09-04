import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';
import type { RootState } from './index';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Shared base query for every admin endpoint.
 *
 * AdminRoute only reads the user out of localStorage, so a session whose JWT has
 * expired (they last a day) still renders the whole admin shell - every request then
 * fails with 401 and each page reports it as "the API is down". Clearing the stored
 * credentials on the first 401 sends the admin back to the login form, which is the
 * thing that actually fixes it.
 */
export const baseQueryWithAuthHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && (api.getState() as RootState).auth.accessToken) {
    api.dispatch(logout());
  }

  return result;
};
