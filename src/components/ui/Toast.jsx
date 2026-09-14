import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from './useToast';



export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3200) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded border shadow-xl animate-slide-in-right text-xs font-medium backdrop-blur-md ${
              t.type === 'error'
                ? 'bg-[#1e1315]/95 text-[#f87171] border-[#e2665f]/40'
                : t.type === 'info'
                ? 'bg-[#101924]/95 text-[#93c5fd] border-[#5b9bd5]/40'
                : 'bg-[#121c17]/95 text-[#6ee7b7] border-[#3fc9b0]/40'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#e2665f]" />
            ) : t.type === 'info' ? (
              <Info className="w-4 h-4 shrink-0 text-[#5b9bd5]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3fc9b0]" />
            )}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

