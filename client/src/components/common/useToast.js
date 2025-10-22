import { useContext } from 'react';
import ToastContext from './toastContext';

// Hook to access toast methods
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}

export default useToast;
