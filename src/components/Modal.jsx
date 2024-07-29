import React, { useEffect, useRef } from 'react';

function Modal({ showModal, handleClose, handleConfirm, message }) {
  const modalContainerRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (showModal && modalContainerRef.current) {
      modalContainerRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (modalContainerRef.current) {
        modalContainerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [showModal, handleConfirm, handleClose]);

  useEffect(() => {
    if (showModal && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      data-testid="modal"
      onClick={handleClose}
      tabIndex="-1"
    >
      <div
        className="p-6 border w-80 shadow-lg rounded-[1rem] bg-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="text-xl leading-6 text-gray-900 mb-6">{message}</h3>
          <div>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#241f3a] text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-[#565465] duration-300 mb-3"
            >
              확인
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#f0f0f2] text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-[#c9c7d2] duration-300"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
