import React from 'react';
import useFileStore from '../../store';
import {
  cloneSelectedImages,
  inversionSelectedImages,
  rotateSelectedImages,
} from '../utils/utils.tsx';

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
    'p-[0.7rem] rounded-full bg-[#241f3a] hover:bg-[#565465] text-white hover:text-black font-bold transition-background duration-300 relative group';

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
        <button
          className={buttonStyle}
          onClick={handleRotateSelectedImages}
          title="회전"
        >
          <div className="relative flex items-center justify-center">
            <img src={rotateIcon} alt="Rotate Icon" className="h-6 w-6" />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <span className="text-sm bg-gray-700 text-white rounded py-1 px-2 whitespace-nowrap">
                90° 회전
              </span>
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-700"></div>
            </div>
          </div>
        </button>
        <button
          className={buttonStyle}
          onClick={handleInversionSelectedImages}
          title="반전"
        >
          <div className="relative flex items-center justify-center">
            <img src={inversionIcon} alt="Rotate Icon" className="h-6 w-6" />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <span className="text-sm bg-gray-700 text-white rounded py-1 px-2 whitespace-nowrap">
                좌우 반전
              </span>
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-700"></div>
            </div>
          </div>
        </button>
        <button
          className={buttonStyle}
          onClick={handleCloneSelectedImages}
          title="복제"
        >
          <div className="relative flex items-center justify-center">
            <img src={cloneIcon} alt="Rotate Icon" className="h-6 w-6" />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <span className="text-sm bg-gray-700 text-white rounded py-1 px-2 whitespace-nowrap">
                이미지 복제
              </span>
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-700"></div>
            </div>
          </div>
        </button>
      </div>
      <div className="flex space-x-4">
        <button className={buttonStyle} onClick={handleUndo} title="실행 취소">
          <div className="relative flex items-center justify-center">
            <img
              src={leftIcon}
              alt="Undo"
              className="h-6 w-6 invert hue-rotate-180"
            />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <span className="text-sm bg-gray-700 text-white rounded py-1 px-2 whitespace-nowrap">
                실행 취소
              </span>
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-700"></div>
            </div>
          </div>
        </button>
        <button className={buttonStyle} onClick={handleRedo} title="다시 실행">
          <div className="relative flex items-center justify-center">
            <img
              src={rightIcon}
              alt="Redo"
              className="h-6 w-6 invert hue-rotate-180"
            />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <span className="text-sm bg-gray-700 text-white rounded py-1 px-2 whitespace-nowrap">
                다시 실행
              </span>
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-700"></div>
            </div>
          </div>
        </button>
      </div>
    </footer>
  );
}

export default Footer;
