import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import ResizeModal from './ResizeModal';
import Toast from './Toast';
import useFileStore from '../../store';
import { handleFiles, calculateCoordinates } from '../utils/utils';
import fileImageIcon from '../assets/images/file-image-regular.svg';

interface PackedImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

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
    const width = parseInt(modalWidth, 10);
    const height = parseInt(modalHeight, 10);

    if (
      Number.isNaN(width) ||
      Number.isNaN(height) ||
      width <= 0 ||
      height <= 0
    ) {
      generateToast('유효한 너비와 높이를 입력해주세요.');
      return;
    }

    addHistory(coordinates);

    const newSelectedFiles = new Set<HTMLImageElement>();

    const processImage = async (
      coord: PackedImage,
      transformCallback: (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
      ) => void
    ): Promise<HTMLImageElement> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      canvas.width = coord.img.width;
      canvas.height = coord.img.height;

      await transformCallback(ctx, canvas);

      const processedImg = new Image();
      processedImg.src = canvas.toDataURL();

      return new Promise<HTMLImageElement>(resolve => {
        processedImg.onload = () => resolve(processedImg);
      });
    };

    const resizePromises = coordinates.map(async (coord: PackedImage) => {
      if (selectedFiles.has(coord.img)) {
        const resizedImg: HTMLImageElement = await processImage(
          coord,
          (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
            const newCanvas = canvas;
            newCanvas.width = width;
            newCanvas.height = height;
            ctx.drawImage(coord.img, 0, 0, width, height);
          }
        );

        newSelectedFiles.add(resizedImg);

        const createPackedImage = (
          img: HTMLImageElement,
          x: number,
          y: number,
          imageWidth: number,
          imageHeight: number,
          rotated: boolean
        ): PackedImage => ({
          img,
          x,
          y,
          width,
          height,
          rotated,
        });

        return createPackedImage(
          resizedImg,
          coord.x,
          coord.y,
          width,
          height,
          coord.rotated
        );
      }

      return coord;
    });

    Promise.all(resizePromises).then((updatedCoordinates: PackedImage[]) => {
      const reorderedCoordinates = calculateCoordinates(
        updatedCoordinates.map(coord => coord.img),
        padding,
        alignElement
      );

      setCoordinates(reorderedCoordinates);
      setSelectedFiles(newSelectedFiles);
      setResizeModalOpen(false);
      setModalWidth('');
      setModalHeight('');
      generateToast('선택된 이미지의 크기가 조정되었습니다.');
    });
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
    addHistory(coordinates);
    setDeletingImages(new Set(imagesToDelete));

    setTimeout(() => {
      const updatedCoordinates = coordinates.filter(
        coord => !imagesToDelete.has(coord.img)
      );

      setCoordinates(updatedCoordinates);
      setSelectedFiles(new Set());
      setDeletingImages(new Set());
      generateToast(
        `${imagesToDelete.size > 1 ? '선택된 이미지가' : '이미지가'} 삭제되었습니다.`
      );
    }, 400);
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
      <div
        key={index}
        onClick={() => handleImageListClick(image)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleImageListClick(image);
          }
        }}
        role="button"
        tabIndex={0}
        className={`flex w-full h-[70px] bg-[#f8f8f8] rounded-[1rem] transition-colors duration-300 shadow-sm border transition-border duration-250 ${
          !isButtonHovered ? 'hover:bg-[#e9eaf1]' : ''
        } ${isSelected ? 'border border-[#23212f]' : ''} ${
          isDeleting ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
      >
        <div className="flex w-[19%] items-center justify-center">
          <img
            src={image.img.src}
            alt={`Thumbnail ${index}`}
            className="max-h-[50px] p-[5px] border shadow-sm rounded-lg"
          />
        </div>
        <div className="flex items-center w-[72%] h-full pl-[5px] text-[12px] leading-[24px] text-[#374151] overflow-hidden">
          <pre className="text-[10px] leading-tight">
            {generateCSS(image, index)}
          </pre>
        </div>

        <button
          type="button"
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
            className="h-6 w-6 bg-[#241f3a] transition-colors duration-300 group-hover:bg-[#c53030] rounded-full"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path d="M12 10.586l4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05l1.414-1.414z" />
          </svg>
        </button>
      </div>
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
              <img src={fileImageIcon} alt="파일 아이콘" className="h-7 ml-2" />
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
