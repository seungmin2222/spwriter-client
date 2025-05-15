import React, { useEffect, useRef, useState } from 'react';
import useFileStore from '../../store';
import { calculateCoordinates } from '../utils/coordinateUtils';
import { handleFiles } from '../utils/fileUtils';
import deleteImagesUtil from '../utils/imageDeleteUtils';
import handleResizeConfirmUtil from '../utils/imageResizeUtils';
import { PackedImage } from '../utils/types';
import ImageItem from './ImageItem';
import Modal from './Modal';
import ResizeModal from './ResizeModal';
import Toast from './Toast';

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
      const images: HTMLImageElement[] = [];
      const fileNames: string[] = [];

      coordinates.forEach(coord => {
        images.push(coord.img);
        fileNames.push(coord.fileName);
      });

      const newCoordinates = calculateCoordinates(
        images,
        fileNames,
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

  const generateCSS = (image: PackedImage): string =>
    `.${image.fileName} {
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
        .map(coord => generateCSS(coord))
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
      className="mr-[2%] flex h-full w-[26%] min-w-[460px] flex-col rounded-[2.375rem] bg-[#f7f7f7] text-gray-700 shadow-md"
      data-testid="image-list"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header className="m-5 flex h-[5%] w-auto select-none items-center justify-center text-3xl font-semibold text-[#1f2937]">
        Image List
      </header>
      {coordinates.length > 0 && (
        <div className="mb-3 flex h-[5%] w-full animate-fadeIn select-none items-center border-[#e2e8f0] px-[20px] transition-opacity duration-500">
          <div className="flex w-full min-w-[430px] justify-between">
            <div>
              <button
                type="button"
                className="mr-2 rounded-md border p-1 shadow-sm transition-colors hover:bg-[#25203b] hover:text-[white]"
                onClick={handleSelectAll}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="mr-2 rounded-md border p-1 shadow-sm transition-colors duration-300 hover:bg-[#c9c7d2]"
                onClick={handleDeselectAll}
              >
                전체 해제
              </button>
              <button
                type="button"
                className="mr-2 rounded-md border p-1 shadow-sm transition-colors duration-300 hover:bg-[#25203b] hover:text-[white]"
                onClick={copySelectedCoordinates}
              >
                선택좌표 복사
              </button>
              <button
                type="button"
                className="mr-2 rounded-md border p-1 shadow-sm transition-colors duration-300 hover:bg-[#25203b] hover:text-[white]"
                onClick={handleResizeImages}
              >
                크기 조정
              </button>
            </div>
            <button
              type="button"
              className="rounded-md border p-1 shadow-sm transition-colors duration-300 hover:bg-[#c53030] hover:text-[white]"
              onClick={handleOpenModal}
            >
              선택삭제
            </button>
          </div>
        </div>
      )}
      <section
        className={`flex h-[80%] w-full flex-col space-y-3 overflow-y-auto px-[20px] pb-[20px] text-lg font-light ${
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
              className="flex animate-fadeIn cursor-pointer select-none rounded-[1rem] border bg-[#f8f8fd] p-2 text-[15px] text-[#6b7280]"
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
