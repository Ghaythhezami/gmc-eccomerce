import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { dismissToast } from './toastSlice';

export function ToastHost() {
  const toasts = useAppSelector((s) => s.toast.items);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="w-80 rounded-lg border border-[#c8c4b9] bg-white p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#20231f]">{t.title}</p>
              <p className="mt-1 text-sm text-gray-600">{t.message}</p>
            </div>
            <button
              onClick={() => dispatch(dismissToast(t.id))}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
