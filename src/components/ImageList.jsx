import React, { useState } from 'react';
import Modal from './Modal';
import useFileStore from '../../store';
import Toast from './Toast';

function ImageList() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const coordinates = useFileStore(state => state.coordinates);
  const lastClickedIndex = useFileStore(state => state.lastClickedIndex);
  const setLastClickedIndex = useFileStore(state => state.setLastClickedIndex);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirm = () => {
    setShowModal(false);
  };

  const generateCSS = (image, index) => {
    return `
      .bg-${index} {
        width: ${image.width}px;
        height: ${image.height}px;
        background: url('css_sprites.png') -${image.x}px -${image.y}px;
      }
    `;
  };

  const handleImageClick = (image, index) => {
    const cssText = generateCSS(image, index);
    setLastClickedIndex(index);

    navigator.clipboard
      .writeText(cssText)
      .then(() => {
        const newToast = {
          id: Date.now(),
          message: 'CSS 정보가 클립보드에 복사되었습니다.',
        };
        setToast(null);
        setToast(newToast);
      })
      .catch(err => {
        const newToast = { id: Date.now(), message: '클립보드 복사 실패.' };
        setToast(null);
        setToast(newToast);
        console.error('클립보드 복사 실패:', err);
      });
  };

  const handleToastClose = id => {
    if (toast && toast.id === id) {
      setToast(null);
    }
  };

  const renderImageList = (image, index) => {
    const isSelected = index === lastClickedIndex;
    return (
      <article
        key={index}
        className={`flex w-full h-[70px] bg-[#f0f4f8] rounded-md transition-colors duration-300 shadow-sm ${
          !isButtonHovered ? 'hover:bg-[#e2e8f0]' : ''
        } ${isSelected ? 'border border-blue-500' : ''}`}
      >
        <button
          className="flex w-[20%] items-center justify-center"
          onClick={() => handleImageClick(image, index)}
        >
          <img
            src={image.img.src}
            alt={`Thumbnail ${index}`}
            className="max-h-[60px] p-[5px] border shadow-sm rounded-md"
          />
        </button>
        <button
          className="flex w-[71%] h-full pl-[5px] text-[12px] leading-[24px] text-gray-700 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            textOverflow: 'ellipsis',
          }}
          onClick={() => handleImageClick(image, index)}
        >
          {generateCSS(image, index)}
        </button>

        <button
          className="flex justify-center items-center w-[9%] h-full group"
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          onClick={e => {
            e.stopPropagation();
            handleOpenModal();
          }}
          aria-label="cross"
        >
          <svg
            className="h-6 w-6 bg-[#1f77b4] transition-colors duration-300 group-hover:fill-current group-hover:text-white group-hover:bg-[#07427e] rounded-full"
            aria-label="cross"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path d="M12 10.586l4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05l1.414-1.414z" />
          </svg>
        </button>
      </article>
    );
  };

  return (
    <aside
      className="flex flex-col w-[26%] h-full mr-[2%] bg-[#f9fafb] rounded-md shadow-md"
      data-testid="image-list"
    >
      <header className="flex w-full h-[10%] justify-center items-center text-3xl font-semibold text-gray-800">
        Image List
      </header>
      <section className="flex flex-col w-full h-[90%] px-[20px] pb-[20px] text-lg font-light space-y-3 overflow-y-auto">
        {Array.isArray(coordinates)
          ? coordinates.map((image, index) => renderImageList(image, index))
          : null}
      </section>
      <Modal
        showModal={showModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirm}
      />
      {toast && (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onClose={() => handleToastClose(toast.id)}
        />
      )}
    </aside>
  );
}

export default ImageList;
