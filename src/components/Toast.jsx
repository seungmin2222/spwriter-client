import React, { useEffect, useState } from 'react';

function Toast({ id, message, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#1f77b4] font-semibold text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
}

export default Toast;
