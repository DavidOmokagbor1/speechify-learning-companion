import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-lg shadow-lg border max-w-sm ${
            toast.type === 'error'
              ? 'bg-red-900/90 border-red-600 text-red-100'
              : 'bg-blue-900/90 border-blue-600 text-blue-100'
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={hideToast}
            className="mt-1 text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {}, hideToast: () => {} };
  return ctx;
}
