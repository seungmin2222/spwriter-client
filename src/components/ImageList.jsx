import React, { useState } from 'react';
import Modal from './Modal';
import Toast from './Toast';
import useFileStore from '../../store';

function ImageList() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [indexToDelete, setIndexToDelete] = useState(null);
  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const selectedFiles = useFileStore(state => state.selectedFiles);
  const setSelectedFiles = useFileStore(state => state.setSelectedFiles);

  const handleOpenModal = index => {
    setShowModal(true);
    setIndexToDelete(index);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIndexToDelete(null);
  };

  const handleConfirm = () => {
    if (indexToDelete !== null) {
      const updatedCoordinates = coordinates.filter(
        (_, index) => index !== indexToDelete
      );
      setCoordinates(updatedCoordinates);
      setShowModal(false);
      setIndexToDelete(null);
    }
  };

  const generateCSS = (image, index) => {
    return `
      .sprite-${index} {
        width: ${image.width}px;
        height: ${image.height}px;
        background: url('css_sprites.png') -${image.x}px -${image.y}px;
      }
    `;
  };

  const handleImageClick = (image, index) => {
    const newSelectedFiles = new Set(selectedFiles);

    if (newSelectedFiles.has(image.img)) {
      newSelectedFiles.delete(image.img);
    } else {
      newSelectedFiles.add(image.img);
    }

    setSelectedFiles(newSelectedFiles);

    const cssText = generateCSS(image, index);

    navigator.clipboard
      .writeText(cssText)
      .then(() => {
        const newToast = {
          id: Date.now(),
          message: 'CSS 정보가 클립보드에 복사되었습니다.',
        };
        setToast(newToast);
      })
      .catch(err => {
        const newToast = { id: Date.now(), message: '클립보드 복사 실패.' };
        setToast(newToast);
        console.error('클립보드 복사 실패:', err);
      });
  };

  const handleToastClose = id => {
    if (toast && toast.id === id) {
      setToast(null);
    }
  };

  const handleSelectAll = () => {
    const newSelectedFiles = new Set(coordinates.map(coord => coord.img));
    setSelectedFiles(newSelectedFiles);
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  const renderImageList = (image, index) => {
    const isSelected = selectedFiles.has(image.img);
    return (
      <article
        key={index}
        className={`flex w-full h-[70px] bg-[#f0f4f8] rounded-md transition-colors duration-300 shadow-sm ${
          !isButtonHovered ? 'hover:bg-[#e2e8f0]' : ''
        } ${isSelected ? 'border border-[#1f77b4] duration-250' : ''}`}
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
          className="flex w-[71%] h-full pl-[5px] text-[12px] leading-[24px] text-[#374151] overflow-hidden"
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
            handleOpenModal(index);
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
      <header className="flex w-full h-[10%] justify-center items-center text-3xl font-semibold text-[#1f2937]">
        Image List
      </header>
      <div className="flex w-full h-[5%] items-center mb-3 px-[20px] border-[#e2e8f0] bg-[#f9fafb]">
        <div className="flex w-full justify-between">
          <div>
            <button
              className="p-1 bg-[#ffffff] mr-2 border rounded-md shadow-sm hover:text-[white] hover:bg-[#1f77b4] transition-colors"
              onClick={handleSelectAll}
            >
              전체 선택
            </button>
            <button
              className="p-1 border rounded-md shadow-sm hover:bg-[#cbd5e1] transition-colors"
              onClick={handleDeselectAll}
            >
              선택 해제
            </button>
          </div>
          <button
            className="p-1 border rounded-md shadow-sm hover:bg-[#cbd5e1] transition-colors"
            onClick={handleDeselectAll}
          >
            좌표 복사
          </button>
        </div>
      </div>
      <section className="flex flex-col w-full h-[80%] px-[20px] pb-[20px] text-lg font-light space-y-3 overflow-y-auto">
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
          message={toast.message}
          onClose={() => handleToastClose(toast.id)}
        />
      )}
    </aside>
  );
}

export default ImageList;
