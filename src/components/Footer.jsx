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
import leftIcon from '../assets/images/historyBack.png';
import rightIcon from '../assets/images/historyReturn.png';

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
    'p-[0.7rem] rounded-full bg-[#241f3a] hover:bg-[#565465] text-white hover:text-black font-bold font-bold transition-background duration-300';

  const handleActionIfNoSelection = action => {
    if (selectedFiles.size === 0) {
      addToast('선택된 이미지가 없습니다.');
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
      addToast('이전 작업 내역이 없습니다.');
    }
  };

  const handleRedo = () => {
    if (redoHistory.length) {
      pushHistory();
    } else {
      addToast('다시 실행할 작업 내역이 없습니다.');
    }
  };

  return (
    <footer
      className="flex justify-between items-center w-full h-[9%] p-[3%] rounded-[2rem] select-none"
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
          <img
            src={leftIcon}
            alt="Left Icon"
            className="h-6 w-6 invert hue-rotate-180"
          />
        </button>
        <button className={buttonStyle} onClick={handleRedo}>
          <img
            src={rightIcon}
            alt="Right Icon"
            className="h-6 w-6 invert hue-rotate-180"
          />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
