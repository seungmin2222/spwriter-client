import React from 'react';
import useFileStore from '../../store';
import {
  cloneSelectedImages,
  inversionSelectedImages,
  rotateSelectedImages,
} from '../utils/utils';

import rotateIcon from '../assets/images/arrows-spin-solid.svg';
import inversionIcon from '../assets/images/right-left-solid.svg';
import cloneIcon from '../assets/images/copy-regular.svg';
import leftIcon from '../assets/images/angles-left-solid.svg';
import rightIcon from '../assets/images/angles-right-solid.svg';

function Footer() {
  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const selectedFiles = useFileStore(state => state.selectedFiles);
  const addToast = useFileStore(state => state.addToast);

  const buttonStyle =
    'p-2 rounded-full bg-[#1f77b4] text-white hover:bg-[#1a5a91] transition-colors duration-300';

  const handleActionIfNoSelection = action => {
    if (selectedFiles.size === 0) {
      addToast('선택된 이미지가 없습니다');
      return false;
    }
    action();
    return true;
  };

  const handleCloneSelectedImages = () => {
    handleActionIfNoSelection(() =>
      cloneSelectedImages(coordinates, selectedFiles, setCoordinates)
    );
  };

  const handleInversionSelectedImages = () => {
    handleActionIfNoSelection(() =>
      inversionSelectedImages(coordinates, selectedFiles, setCoordinates)
    );
  };

  const handleRotateSelectedImages = () => {
    handleActionIfNoSelection(() =>
      rotateSelectedImages(coordinates, selectedFiles, setCoordinates)
    );
  };

  return (
    <footer
      className="flex justify-between items-center w-full h-[10%] p-[3%] select-none"
      data-testid="footer"
    >
      <div className="flex space-x-4">
        <button className={buttonStyle} onClick={handleRotateSelectedImages}>
          <img src={rotateIcon} alt="Rotate Icon" className="h-6 w-6" />
        </button>
        <button className={buttonStyle} onClick={handleInversionSelectedImages}>
          <img src={inversionIcon} alt="Inversion Icon" className="h-6 w-6" />
        </button>
        <button className={buttonStyle} onClick={handleCloneSelectedImages}>
          <img src={cloneIcon} alt="Clone Icon" className="h-6 w-6" />
        </button>
      </div>
      <div className="flex space-x-4">
        <button className={buttonStyle}>
          <img src={leftIcon} alt="Left Icon" className="h-6 w-6" />
        </button>
        <button className={buttonStyle}>
          <img src={rightIcon} alt="Right Icon" className="h-6 w-6" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
