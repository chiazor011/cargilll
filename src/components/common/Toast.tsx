import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-24 right-6 z-[80] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id}>
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icon = toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
               toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
               <Info className="w-5 h-5 text-blue-500" />;

  const borderColor = toast.type === 'success' ? 'border-green-200' :
                      toast.type === 'error' ? 'border-red-200' :
                      'border-blue-200';

  return (
    <div className={`pointer-events-auto flex items-start gap-3 bg-white border ${borderColor} shadow-lg rounded-lg px-4 py-3 min-w-[280px] max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-300`}>
      {icon}
      <p className="text-sm text-gray-800 flex-1 leading-relaxed">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
