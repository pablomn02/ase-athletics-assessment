import { createContext, useContext, useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4500);
    },
    [removeToast]
  );

  toast.success = (message) => toast(message, 'success');
  toast.error = (message) => toast(message, 'error');

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[min(100vw-2rem,360px)]"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            t.type === 'error'
              ? 'border-red-500/50 bg-red-500/10 text-red-200'
              : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          {t.type === 'success' ? (
            <Check size={20} className="flex-shrink-0 text-emerald-400" />
          ) : (
            <X size={20} className="flex-shrink-0 text-red-400" />
          )}
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return ctx;
};
