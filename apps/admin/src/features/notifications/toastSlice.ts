import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  title: string;
  message: string;
}

const initialState: { items: Toast[] } = { items: [] };

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    pushToast: (state, action: PayloadAction<Toast>) => {
      if (state.items.some((t) => t.id === action.payload.id)) return;
      state.items.unshift(action.payload);
      state.items = state.items.slice(0, 4);
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, dismissToast } = toastSlice.actions;
