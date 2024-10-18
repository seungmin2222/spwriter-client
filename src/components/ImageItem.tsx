import React from 'react';
import { PackedImage } from '../utils/types';

interface ImageItemProps {
  image: PackedImage;
  index: number;
  isSelected: boolean;
  isDeleting: boolean;
  isButtonHovered: boolean;
  handleImageListClick: (image: PackedImage) => void;
  generateCSS: (image: PackedImage, index: number) => string;
  setIsButtonHovered: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentImage: React.Dispatch<
    React.SetStateAction<HTMLImageElement | null>
  >;
  setDeleteConfirmationType: React.Dispatch<
    React.SetStateAction<'single' | 'batch' | null>
  >;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function ImageItem({
  image,
  index,
  isSelected,
  isDeleting,
  isButtonHovered,
  handleImageListClick,
  generateCSS,
  setIsButtonHovered,
  setCurrentImage,
  setDeleteConfirmationType,
  setShowModal,
}: ImageItemProps) {
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
        <div className="flex justify-center items-center h-6 w-6 bg-[#241f3a] transition-colors duration-300 group-hover:bg-[#c53030] rounded-full">
          <div className="crossIcon filter brightness-0 invert " />
        </div>
      </button>
    </div>
  );
}

export default ImageItem;
