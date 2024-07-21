import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Toast from './Toast';
import useFileStore from '../../store';
import { handleDropFiles, calculateCoordinates } from '../utils/utils';
import fileImageIcon from '../assets/images/file-image-regular.svg';

function ImageList() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirmationType, setDeleteConfirmationType] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [deletingImages, setDeletingImages] = useState(new Set());

  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const selectedFiles = useFileStore(state => state.selectedFiles);
  const setSelectedFiles = useFileStore(state => state.setSelectedFiles);
  const setFiles = useFileStore(state => state.setFiles);
  const padding = useFileStore(state => state.padding);
  const fileName = useFileStore(state => state.fileName);

  const prevCoordinatesRef = useRef(coordinates);

  useEffect(() => {
    if (coordinates.length > 0) {
      const newCoordinates = calculateCoordinates(
        coordinates.map(coord => coord.img),
        padding
      );

      const prevCoordinates = prevCoordinatesRef.current;
      const coordinatesChanged =
        newCoordinates.length !== prevCoordinates.length ||
        newCoordinates.some(
          (coord, index) =>
            coord.img !== prevCoordinates[index]?.img ||
            coord.x !== prevCoordinates[index]?.x ||
            coord.y !== prevCoordinates[index]?.y
        );

      if (coordinatesChanged) {
        setCoordinates(newCoordinates);
      }

      prevCoordinatesRef.current = coordinates;
    }
  }, [padding, coordinates, setCoordinates]);

  const handleOpenModal = () => {
    if (selectedFiles.size === 0) {
      generateToast('선택된 리스트가 없습니다.');
      return;
    }
    setShowModal(true);
    setDeleteConfirmationType('batch');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDeleteConfirmationType(null);
    setCurrentImage(null);
  };

  const handleConfirm = () => {
    if (deleteConfirmationType === 'batch') {
      deleteSelectedImages();
    } else if (deleteConfirmationType === 'single' && currentImage) {
      deleteImage(currentImage);
    }
    setShowModal(false);
  };

  const generateCSS = (image, index) => `
    .sprite-${index} {
      width: ${image.width}px;
      height: ${image.height}px;
      background: url('${
        fileName ? `${fileName}.png` : 'css_sprites.png'
      }') -${image.x}px -${image.y}px;
    }
  `;

  const generateToast = message => {
    setToast({
      id: Date.now(),
      message,
    });
  };

  const copyToClipboard = text => {
    navigator.clipboard
      .writeText(text)
      .then(() => generateToast('좌표값이 클립보드에 복사되었습니다.'))
      .catch(err => {
        generateToast('클립보드 복사 실패.');
        console.error('클립보드 복사 실패:', err);
      });
  };

  const handleImageClick = (image, index) => {
    const newSelectedFiles = new Set(selectedFiles);
    newSelectedFiles.has(image.img)
      ? newSelectedFiles.delete(image.img)
      : newSelectedFiles.add(image.img);
    setSelectedFiles(newSelectedFiles);

    const cssText = generateCSS(image, index);
    copyToClipboard(cssText);
  };

  const handleToastClose = id => {
    if (toast?.id === id) {
      setToast(null);
    }
  };

  const handleSelectAll = () => {
    setSelectedFiles(new Set(coordinates.map(coord => coord.img)));
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  const deleteSelectedImages = () => {
    setDeletingImages(new Set(selectedFiles));

    setTimeout(() => {
      const updatedCoordinates = coordinates.filter(
        coord => !selectedFiles.has(coord.img)
      );

      setCoordinates(updatedCoordinates);
      setSelectedFiles(new Set());
      setDeletingImages(new Set());
      generateToast('선택된 이미지가 삭제되었습니다.');
    }, 400);
  };

  const deleteImage = imgSrc => {
    setDeletingImages(new Set([imgSrc]));

    setTimeout(() => {
      const updatedCoordinates = coordinates.filter(
        coord => coord.img !== imgSrc
      );

      setCoordinates(updatedCoordinates);
      setDeletingImages(new Set());
      generateToast('이미지가 삭제되었습니다.');
    }, 400);
  };

  const handleDrop = event => {
    event.preventDefault();
    handleDropFiles(event, setFiles, setCoordinates, coordinates, padding);
  };

  const handleDragOver = event => {
    event.preventDefault();
  };

  const copySelectedCoordinates = () => {
    const selectedCoordinates = coordinates.filter(coord =>
      selectedFiles.has(coord.img)
    );

    if (selectedCoordinates.length === 0) {
      generateToast('선택된 리스트가 없습니다.');
    } else {
      const cssText = selectedCoordinates
        .map((coord, index) => generateCSS(coord, coordinates.indexOf(coord)))
        .join('\n');
      copyToClipboard(cssText);
    }
  };

  const renderImageList = (image, index) => {
    const isSelected = selectedFiles.has(image.img);
    const isDeleting = deletingImages.has(image.img);

    return (
      <article
        key={index}
        className={`flex w-full h-[70px] bg-[#f0f4f8] rounded-md transition-colors duration-300 shadow-sm border transition-border duration-250 ${
          !isButtonHovered ? 'hover:bg-[#e2e8f0]' : ''
        } ${isSelected ? 'border border-[#1f77b4]' : ''} ${
          isDeleting ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
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
            setCurrentImage(image.img);
            setDeleteConfirmationType('single');
            setShowModal(true);
          }}
          aria-label="cross"
        >
          <svg
            className="h-6 w-6 bg-[#1f77b4] transition-colors duration-300 group-hover:fill-current group-hover:text-white group-hover:bg-[#c53030] rounded-full"
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
      className="flex flex-col w-[26%] h-full min-w-[380px] mr-[2%] text-gray-700 bg-[#f9fafb] rounded-md shadow-md"
      data-testid="image-list"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header className="flex w-full h-[10%] justify-center items-center text-3xl font-semibold text-[#1f2937] select-none">
        Image List
      </header>
      {coordinates.length > 0 && (
        <div className="flex w-full h-[5%] items-center mb-3 px-[20px] border-[#e2e8f0] bg-[#f9fafb] transition-opacity duration-500 animate-fadeIn select-none">
          <div className="flex w-full justify-between">
            <div>
              <button
                className="p-1 border mr-2 rounded-md shadow-sm hover:text-[white] hover:bg-[#1f77b4] transition-colors"
                onClick={handleSelectAll}
              >
                전체 선택
              </button>
              <button
                className="p-1 border mr-2 rounded-md shadow-sm hover:bg-[#cbd5e1] transition-colors"
                onClick={handleDeselectAll}
              >
                전체 해제
              </button>
              <button
                className="p-1 border mr-2 rounded-md shadow-sm hover:text-[white] hover:bg-[#1f77b4] transition-colors"
                onClick={copySelectedCoordinates}
              >
                선택좌표 복사
              </button>
            </div>
            <button
              className="p-1 border rounded-md shadow-sm hover:text-[white] hover:bg-[#e53e3e] transition-colors"
              onClick={handleOpenModal}
            >
              선택삭제
            </button>
          </div>
        </div>
      )}
      <section
        className={`flex flex-col w-full h-[80%] px-[20px] pb-[20px] text-lg font-light space-y-3 overflow-y-auto ${
          coordinates.length > 0 ? '' : 'justify-center'
        }`}
      >
        {coordinates.length > 0 ? (
          coordinates.map((image, index) => renderImageList(image, index))
        ) : (
          <div className="flex w-full justify-center border-[#e2e8f0] bg-[#f9fafb] transition-opacity duration-500">
            <span className="flex items-center text-[#6b7280] text-[15px] border rounded-md p-2 animate-fadeIn select-none">
              이미지 파일을 드래그하여 놓으세요.
              <img src={fileImageIcon} alt="파일 아이콘" className="h-7 ml-2" />
            </span>
          </div>
        )}
      </section>
      {showModal && (
        <Modal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleConfirm={handleConfirm}
          message={
            deleteConfirmationType === 'single'
              ? '이 이미지를 삭제하시겠습니까?'
              : '선택된 이미지를 삭제하시겠습니까?'
          }
        />
      )}
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
