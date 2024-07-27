import React, { useEffect, useRef } from 'react';

function ResizeModal({ isOpen, onClose, onConfirm, setWidth, setHeight }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (modalRef.current) {
      modalRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [onConfirm, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative top-72 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        onClick={e => e.stopPropagation()}
        tabIndex="-1"
      >
        <div className="mt-3 text-center">
          <h3 className="text-xl leading-6 text-gray-900">
            이미지 크기를 조정하시겠습니까?
          </h3>
          <div className="mt-2 px-4 py-3">
            <input
              type="text"
              placeholder="새 너비"
              onChange={e => setWidth(e.target.value)}
              className="border rounded p-1 w-full mb-2"
            />
            <input
              type="text"
              placeholder="새 높이"
              onChange={e => setHeight(e.target.value)}
              className="border rounded p-1 w-full"
            />
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 duration-300"
            >
              확인
            </button>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 duration-300"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResizeModal;
