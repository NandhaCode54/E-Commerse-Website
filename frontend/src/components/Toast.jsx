import React, { useEffect } from 'react';

/**
 * Transient notification shown bottom-right. Auto-dismisses after a few seconds.
 */
const Toast = ({ message, onClose, duration = 2800 }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] animate-slide-in">
      <div className="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-xl">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-green-500 text-sm font-bold">✓</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => onClose && onClose()}
          className="ml-2 text-gray-400 transition-colors hover:text-white"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
