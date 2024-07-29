import React, { useEffect, useState } from 'react';

function Toast({ id, message, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 10);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300);
    }, 1500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, onClose]);

  return (
    <div
      data-testid="toast"
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#241f3a] font-bold text-white px-4 py-2 rounded-[1rem] shadow-lg transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
      <button
        onClick={() => onClose(id)}
        aria-label="close"
        className="ml-4"
        data-testid="toast-close-button"
      >
        닫기
      </button>
    </div>
  );
}

export default Toast;
