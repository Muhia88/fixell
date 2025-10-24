import React, { useState, useCallback } from 'react';
import ToastContext from './toastContext';

let idCounter = 1;

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = String(Date.now()) + String(idCounter++);
    const toast = { id, type, title, message };
    setToasts((t) => [toast, ...t]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  const value = {
    show,
    info: (opts) => show({ ...(typeof opts === 'string' ? { message: opts } : opts), type: 'info' }),
    success: (opts) => show({ ...(typeof opts === 'string' ? { message: opts } : opts), type: 'success' }),
    error: (opts) => show({ ...(typeof opts === 'string' ? { message: opts } : opts), type: 'error' }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full rounded-lg shadow px-4 py-3 border flex flex-col gap-1 break-words ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-800'
          }`}>
            {t.title && <div className="font-semibold text-sm">{t.title}</div>}
            {t.message && <div className="text-sm">{t.message}</div>}
            <div className="text-xs self-end mt-1">
              <button onClick={() => dismiss(t.id)} className="underline">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
