import React, { useEffect, useRef } from 'react';

function ResizeModal({ isOpen, onClose, onConfirm, setWidth, setHeight }) {
  const inputRef = useRef(null);
  const modalContainerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && modalContainerRef.current) {
      modalContainerRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (modalContainerRef.current) {
        modalContainerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isOpen, onConfirm, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      onClick={onClose}
      tabIndex="-1"
    >
      <div
        className="p-6 border w-96 shadow-lg rounded-[1rem] bg-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="text-xl leading-6 text-gray-900 mb-4">
            이미지 크기를 조정하시겠습니까?
          </h3>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="새 너비"
              onChange={e => setWidth(e.target.value)}
              className="border rounded-md p-2 w-full mb-3"
            />
            <input
              type="text"
              placeholder="새 높이"
              onChange={e => setHeight(e.target.value)}
              className="border rounded-md p-2 w-full"
            />
          </div>
          <div>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[#241f3a] text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-[#565465] duration-300 mb-3"
            >
              확인
            </button>
            <button
              onClick={onClose}
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

export default ResizeModal;
