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
  const addHistory = useFileStore(state => state.addHistory);
  const popHistory = useFileStore(state => state.popHistory);
  const pushHistory = useFileStore(state => state.pushHistory);
  const selectedFiles = useFileStore(state => state.selectedFiles);
  const addToast = useFileStore(state => state.addToast);
  const history = useFileStore(state => state.history);
  const redoHistory = useFileStore(state => state.redoHistory);
  const padding = useFileStore(state => state.padding);
  const alignElement = useFileStore(state => state.alignElement);

  const buttonStyle =
    'p-2 rounded-full bg-[#1f77b4] text-white hover:bg-[#1a5a91] transition-colors duration-300';

  const handleActionIfNoSelection = action => {
    if (selectedFiles.size === 0) {
      addToast('선택된 이미지가 없습니다');
    } else {
      action();
    }
  };

  const handleCloneSelectedImages = () => {
    handleActionIfNoSelection(() => {
      addHistory(coordinates);
      cloneSelectedImages(
        coordinates,
        selectedFiles,
        setCoordinates,
        padding,
        alignElement
      );
    });
  };

  const handleInversionSelectedImages = () => {
    handleActionIfNoSelection(() => {
      addHistory(coordinates);
      inversionSelectedImages(coordinates, selectedFiles, setCoordinates);
    });
  };

  const handleRotateSelectedImages = () => {
    handleActionIfNoSelection(() => {
      addHistory(coordinates);
      rotateSelectedImages(coordinates, selectedFiles, setCoordinates);
    });
  };

  const handleUndo = () => {
    if (history.length) {
      popHistory();
    } else {
      addToast('뒤로 갈 기록이 없습니다');
    }
  };

  const handleRedo = () => {
    if (redoHistory.length) {
      pushHistory();
    } else {
      addToast('앞으로 갈 기록이 없습니다');
    }
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
        <button className={buttonStyle} onClick={handleUndo}>
          <img src={leftIcon} alt="Left Icon" className="h-6 w-6" />
        </button>
        <button className={buttonStyle} onClick={handleRedo}>
          <img src={rightIcon} alt="Redo Icon" className="h-6 w-6" />{' '}
        </button>
      </div>
    </footer>
  );
}

export default Footer;
