import React from 'react';

function Modal({ showModal, handleClose, handleConfirm }) {
  if (!showModal) return null;

  const handleBackgroundClick = () => {
    handleClose();
  };

  const handleContentClick = e => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      data-testid="modal"
      onClick={handleBackgroundClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Escape') handleClose();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-[300px]"
        onClick={handleContentClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Escape') handleClose();
        }}
      >
        <h2 className="text-xl mb-4">
          Are you sure you want to delete the image file?
        </h2>
        <div className="flex justify-end space-x-4">
          <button
            className="w-[70px] px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleClose}
          >
            No
          </button>
          <button
            className="w-[70px] rounded-md bg-[#1f77b4] text-white font-semibold hover:bg-[#1a5a91] transition-colors duration-300"
            onClick={handleConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
