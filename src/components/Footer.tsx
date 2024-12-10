import React from 'react';
import useFileStore from '../../store';
import {
  cloneSelectedImages,
  inversionSelectedImages,
  rotateSelectedImages,
} from '../utils/imageSelectUtils';

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

  const handleActionIfNoSelection = (action: () => void) => {
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
      className="flex h-[9%] w-full select-none items-center justify-between rounded-[2rem] p-[3%]"
      data-testid="footer"
    >
      <div className="flex space-x-4">
        <button
          type="button"
          className={buttonStyle}
          onClick={handleRotateSelectedImages}
          title="회전"
        >
          <div className="relative flex items-center justify-center">
            <div className="rotateIcon" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 transform flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-sm text-white">
                90° 회전
              </span>
              <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-gray-700" />
            </div>
          </div>
        </button>
        <button
          type="button"
          className={buttonStyle}
          onClick={handleInversionSelectedImages}
          title="반전"
        >
          <div className="relative flex items-center justify-center">
            <div className="inversionIcon" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 transform flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-sm text-white">
                좌우 반전
              </span>
              <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-gray-700" />
            </div>
          </div>
        </button>
        <button
          type="button"
          className={buttonStyle}
          onClick={handleCloneSelectedImages}
          title="복제"
        >
          <div className="relative flex items-center justify-center">
            <div className="cloneIcon" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 transform flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-sm text-white">
                이미지 복제
              </span>
              <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-gray-700" />
            </div>
          </div>
        </button>
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          className={buttonStyle}
          onClick={handleUndo}
          title="실행 취소"
        >
          <div className="relative flex items-center justify-center">
            <div className="leftIcon brightness-100 invert filter" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 transform flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-sm text-white">
                실행 취소
              </span>
              <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-gray-700" />
            </div>
          </div>
        </button>
        <button
          type="button"
          className={buttonStyle}
          onClick={handleRedo}
          title="다시 실행"
        >
          <div className="relative flex items-center justify-center">
            <div className="rightIcon brightness-100 invert filter" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 transform flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-sm text-white">
                다시 실행
              </span>
              <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-gray-700" />
            </div>
          </div>
        </button>
      </div>
    </footer>
  );
}

export default Footer;
