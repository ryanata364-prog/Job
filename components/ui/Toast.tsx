'use client';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = {
    success: { icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50 border-green-200', text: 'text-green-800' },
    error: { icon: <XCircle className="w-5 h-5" />, bg: 'bg-red-50 border-red-200', text: 'text-red-800' },
    info: { icon: <Info className="w-5 h-5" />, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
    warning: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800' },
  };
  const { icon, bg, text } = config[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bg} ${text} animate-in slide-in-from-bottom-2`}>
      {icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </div>
  );
}
