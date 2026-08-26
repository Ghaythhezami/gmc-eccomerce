import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from './types';

const saved = localStorage.getItem('adminAuth');

const initialState: { user: User | null; accessToken: string | null } = saved 
  ? JSON.parse(saved) 
  : { user: null, accessToken: null };

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('adminAuth', JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('adminAuth');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;