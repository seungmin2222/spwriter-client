import React, { useEffect, useRef } from 'react';

const useModalEventListener = (
  ref: React.RefObject<HTMLDivElement>,
  handleConfirm: () => void,
  handleClose: () => void,
  showModal: boolean
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (showModal && ref.current) {
      ref.current.focus();
      ref.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [showModal, handleConfirm, handleClose, ref]);
};

function Modal({
  showModal,
  handleClose,
  handleConfirm,
  message,
}: {
  showModal: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  message: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useModalEventListener(modalRef, handleConfirm, handleClose, showModal);

  if (!showModal) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget === e.target) {
      handleClose();
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex h-full w-full select-none items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <button
        type="button"
        className="fixed inset-0 h-full w-full cursor-default bg-black bg-opacity-50"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        aria-label="Close modal"
        tabIndex={0}
      />
      <div className="relative z-10 w-80 rounded-[1rem] border bg-white p-6 shadow-lg">
        <div className="text-center">
          <h3 id="modal-title" className="mb-6 text-xl leading-6 text-gray-900">
            {message}
          </h3>
          <div>
            <button
              type="button"
              onClick={handleConfirm}
              className="mb-3 w-full rounded-md bg-[#241f3a] px-4 py-2 text-base font-medium text-white shadow-sm duration-300 hover:bg-[#565465]"
            >
              확인
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-md bg-[#f0f0f2] px-4 py-2 text-base font-medium text-gray-700 shadow-sm duration-300 hover:bg-[#c9c7d2]"
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
