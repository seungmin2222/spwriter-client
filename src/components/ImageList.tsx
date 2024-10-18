import React, { useState, useEffect, useRef } from 'react';
import ResizeModal from './ResizeModal';
import Toast from './Toast';
import Modal from './Modal';
import ImageItem from './ImageItem';
import useFileStore from '../../store';
import handleResizeConfirmUtil from '../utils/imageResizeUtils';
import deleteImagesUtil from '../utils/imageDeleteUtils';
import { calculateCoordinates } from '../utils/coordinateUtils';
import { handleFiles } from '../utils/fileUtils';
import { PackedImage } from '../utils/types';

function ImageList() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingImages, setDeletingImages] = useState(new Set());
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(
    null
  );
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null
  );
  const [deleteConfirmationType, setDeleteConfirmationType] = useState<
    'single' | 'batch' | null
  >(null);

  const coordinates = useFileStore(state => state.coordinates) || [];
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const selectedFiles = useFileStore(state => state.selectedFiles) || new Set();
  const setSelectedFiles = useFileStore(state => state.setSelectedFiles);
  const setFiles = useFileStore(state => state.setFiles);
  const padding = useFileStore(state => state.padding);
  const fileName = useFileStore(state => state.fileName);
  const addHistory = useFileStore(state => state.addHistory);
  const alignElement = useFileStore(state => state.alignElement);
  const [resizeModalOpen, setResizeModalOpen] = useState(false);
  const [modalWidth, setModalWidth] = useState('');
  const [modalHeight, setModalHeight] = useState('');

  const generateToast = (message: string): void => {
    setToast({
      id: Date.now(),
      message,
    });
  };

  const handleResizeImages = () => {
    if (selectedFiles.size === 0) {
      generateToast('선택된 이미지가 없습니다.');
      return;
    }
    setModalWidth('');
    setModalHeight('');
    setResizeModalOpen(true);
  };

  const handleResizeConfirm = () => {
    handleResizeConfirmUtil(
      modalWidth,
      modalHeight,
      coordinates,
      selectedFiles,
      addHistory,
      setCoordinates,
      setSelectedFiles,
      setResizeModalOpen,
      setModalWidth,
      setModalHeight,
      generateToast,
      padding,
      alignElement
    );
  };

  const prevCoordinatesRef = useRef(coordinates);

  useEffect(() => {
    if (Array.isArray(coordinates) && coordinates.length > 0) {
      const newCoordinates = calculateCoordinates(
        coordinates.map(coord => coord.img),
        padding,
        alignElement
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

      prevCoordinatesRef.current = newCoordinates;
    }
  }, [padding, coordinates, setCoordinates, alignElement]);

  const handleOpenModal = () => {
    if (selectedFiles.size === 0) {
      generateToast('선택된 이미지가 없습니다.');
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

  const deleteImages = (imagesToDelete: Set<HTMLImageElement>): void => {
    deleteImagesUtil(
      imagesToDelete,
      addHistory,
      coordinates,
      setCoordinates,
      setSelectedFiles,
      setDeletingImages,
      generateToast
    );
  };

  const deleteSelectedImages = () => {
    deleteImages(selectedFiles);
  };

  const deleteImage = (imgSrc: HTMLImageElement): void => {
    deleteImages(new Set([imgSrc]));
  };

  const handleConfirm = () => {
    if (deleteConfirmationType === 'batch') {
      deleteSelectedImages();
    } else if (deleteConfirmationType === 'single' && currentImage) {
      deleteImage(currentImage);
    }
    setShowModal(false);
  };

  const generateCSS = (image: PackedImage, index: number): string =>
    `.sprite-${index} {
  width: ${image.width}px;
  height: ${image.height}px;
  background: url('${
    fileName ? `${fileName}.png` : 'sprites.png'
  }') -${image.x}px -${image.y}px;
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => generateToast('좌표값이 클립보드에 복사되었습니다.'))
      .catch(() => {
        generateToast('클립보드 복사 실패.');
      });
  };

  const handleImageListClick = (image: PackedImage): void => {
    const newSelectedFiles = new Set(selectedFiles);
    if (newSelectedFiles.has(image.img)) {
      newSelectedFiles.delete(image.img);
    } else {
      newSelectedFiles.add(image.img);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleToastClose = (id: number): void => {
    if (toast?.id === id) {
      setToast(null);
    }
  };

  const handleSelectAll = () => {
    if (Array.isArray(coordinates)) {
      setSelectedFiles(new Set(coordinates.map(coord => coord.img)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    handleFiles(
      droppedFiles,
      setFiles,
      setCoordinates,
      coordinates,
      padding,
      alignElement
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const copySelectedCoordinates = (): void => {
    const selectedCoordinates = coordinates.filter(coord =>
      selectedFiles.has(coord.img)
    );

    if (selectedCoordinates.length === 0) {
      generateToast('선택된 이미지가 없습니다.');
    } else {
      const cssText = selectedCoordinates
        .map(coord => generateCSS(coord, coordinates.indexOf(coord)))
        .join('\n');
      copyToClipboard(cssText);
    }
  };

  const renderImageList = (image: PackedImage, index: number): JSX.Element => {
    const isSelected = selectedFiles.has(image.img);
    const isDeleting = deletingImages.has(image.img);

    return (
      <ImageItem
        key={index}
        image={image}
        index={index}
        isSelected={isSelected}
        isDeleting={isDeleting}
        isButtonHovered={isButtonHovered}
        handleImageListClick={handleImageListClick}
        generateCSS={generateCSS}
        setIsButtonHovered={setIsButtonHovered}
        setCurrentImage={setCurrentImage}
        setDeleteConfirmationType={setDeleteConfirmationType}
        setShowModal={setShowModal}
      />
    );
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newSelectFiles = Array.from(e.target.files || []);
    handleFiles(
      newSelectFiles,
      setFiles,
      setCoordinates,
      coordinates,
      padding,
      alignElement
    );
  };

  return (
    <aside
      className="flex flex-col w-[26%] h-full min-w-[370px] mr-[2%] text-gray-700 bg-[#f7f7f7] rounded-[2.375rem] shadow-md"
      data-testid="image-list"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header className="flex justify-center items-center w-auto h-[5%] m-5  text-3xl font-semibold text-[#1f2937] select-none">
        Image List
      </header>
      {coordinates.length > 0 && (
        <div className="flex w-full h-[5%] items-center mb-3 px-[20px] border-[#e2e8f0] transition-opacity duration-500 animate-fadeIn select-none">
          <div className="flex w-full justify-between">
            <div>
              <button
                type="button"
                className="p-1 border mr-2 rounded-md shadow-sm hover:text-[white] hover:bg-[#25203b] transition-colors"
                onClick={handleSelectAll}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="p-1 border mr-2 rounded-md shadow-sm hover:bg-[#c9c7d2] transition-colors duration-300"
                onClick={handleDeselectAll}
              >
                전체 해제
              </button>
              <button
                type="button"
                className="p-1 border mr-2 rounded-md shadow-sm hover:text-[white] hover:bg-[#25203b] transition-colors duration-300"
                onClick={copySelectedCoordinates}
              >
                선택좌표 복사
              </button>
              <button
                type="button"
                className="p-1 border mr-2 rounded-md shadow-sm hover:text-[white] hover:bg-[#25203b] transition-colors duration-300"
                onClick={handleResizeImages}
              >
                크기 조정
              </button>
            </div>
            <button
              type="button"
              className="p-1 border rounded-md shadow-sm hover:text-[white] hover:bg-[#c53030] transition-colors duration-300"
              onClick={handleOpenModal}
            >
              선택삭제
            </button>
          </div>
        </div>
      )}
      <section
        className={`flex flex-col w-full h-[80%] px-[20px] pb-[20px] text-lg font-light space-y-3 overflow-y-auto ${
          Array.isArray(coordinates) && coordinates.length > 0
            ? ''
            : 'justify-center'
        }`}
      >
        {Array.isArray(coordinates) && coordinates.length > 0 ? (
          coordinates.map((image, index) => renderImageList(image, index))
        ) : (
          <div className="flex w-full justify-center border-[#e2e8f0] transition-opacity duration-500">
            <span
              className="flex bg-[#f8f8fd] text-[#6b7280] text-[15px] border rounded-[1rem] p-2 animate-fadeIn select-none cursor-pointer"
              onClick={handleClick}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClick();
                }
              }}
            >
              이미지 파일을 드래그하여 놓거나 클릭하여 선택하세요.
              <div className="fileImageIcon ml-2" />
            </span>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              multiple
              accept="image/*"
            />
          </div>
        )}
      </section>
      {resizeModalOpen && (
        <ResizeModal
          isOpen={resizeModalOpen}
          onClose={() => setResizeModalOpen(false)}
          onConfirm={handleResizeConfirm}
          setWidth={setModalWidth}
          setHeight={setModalHeight}
        />
      )}
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
          id={toast.id}
          message={toast.message}
          onClose={() => handleToastClose(toast.id)}
        />
      )}
    </aside>
  );
}

export default ImageList;
