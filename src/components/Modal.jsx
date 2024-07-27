import React, { useEffect, useRef } from 'react';

function Modal({ showModal, handleClose, handleConfirm, message }) {
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (showModal) {
      modalContentRef.current.focus();
    }
  }, [showModal]);

  if (!showModal) return null;

  const handleBackgroundClick = () => {
    handleClose();
  };

  const handleContentClick = e => {
    e.stopPropagation();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') handleClose();
  };

  return (
    <div
      className="fixed inset-0 flex justify-center z-50 bg-black bg-opacity-50"
      data-testid="modal"
      onClick={handleBackgroundClick}
      tabIndex={-1}
    >
      <div
        className="relative top-96 w-[350px] h-[200px] bg-white rounded-lg shadow-lg p-6"
        onClick={handleContentClick}
        tabIndex={0}
        ref={modalContentRef}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl mb-5 text-gray-900 text-center">{message}</h2>
        <div className="items-center px-4 py-3">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 duration-300"
          >
            확인
          </button>
          <button
            onClick={handleClose}
            className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 duration-300"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
