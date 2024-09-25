import React, { useEffect, useRef } from 'react';

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  setWidth: (width: string) => void;
  setHeight: (height: string) => void;
}

function ResizeModal({
  isOpen,
  onClose,
  onConfirm,
  setWidth,
  setHeight,
}: ResizeModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (isOpen) {
        document.removeEventListener('keydown', handleKeyDown);
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
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="p-6 border w-[23rem] shadow-lg rounded-[1rem] bg-white"
        role="document"
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
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-[#241f3a] text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-[#565465] duration-300 mb-3"
            >
              확인
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f0f0f2] text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-[#c9c7d2] duration-300"
            >
              취소
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 w-full h-full cursor-default focus:outline-none"
        aria-label="Close modal"
      />
    </div>
  );
}

export default ResizeModal;
