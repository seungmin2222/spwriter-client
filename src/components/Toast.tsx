import React, { useEffect, useState } from 'react';

interface ToastProps {
  id: number;
  message: string;
  onClose: (id: number) => void;
}

function Toast({ id, message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 10);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 1500);
    }, 1500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, onClose]);

  return (
    <div
      data-testid="toast"
      className={`fixed bottom-16 left-[63%] z-50 -translate-x-1/2 transform rounded-[1rem] bg-[#241f3a] px-4 py-2 font-bold text-white shadow-lg transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
}

export default Toast;
