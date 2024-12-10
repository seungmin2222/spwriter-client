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
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-[23rem] rounded-[1rem] border bg-white p-6 shadow-lg"
        role="document"
      >
        <div className="text-center">
          <h3 className="mb-4 text-xl leading-6 text-gray-900">
            이미지 크기를 조정하시겠습니까?
          </h3>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="새 너비"
              onChange={e => setWidth(e.target.value)}
              className="mb-3 w-full rounded-md border p-2"
            />
            <input
              type="text"
              placeholder="새 높이"
              onChange={e => setHeight(e.target.value)}
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={onConfirm}
              className="mb-3 w-full rounded-md bg-[#241f3a] px-4 py-2 text-base font-medium text-white shadow-sm duration-300 hover:bg-[#565465]"
            >
              확인
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-[#f0f0f2] px-4 py-2 text-base font-medium text-gray-700 shadow-sm duration-300 hover:bg-[#c9c7d2]"
            >
              취소
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 h-full w-full cursor-default focus:outline-none"
        aria-label="Close modal"
      />
    </div>
  );
}

export default ResizeModal;
