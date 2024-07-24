import React from 'react';
import Toast from './Toast';
import useFileStore from '../../store';
import { handleFiles } from '../utils/utils';
import downloadIcon from '../assets/images/download-solid.svg';

function Navbar() {
  const fileName = useFileStore(state => state.fileName);
  const setFileName = useFileStore(state => state.setFileName);
  const setFiles = useFileStore(state => state.setFiles);
  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const paddingValue = useFileStore(state => state.padding);
  const setPadding = useFileStore(state => state.setPadding);
  const addToast = useFileStore(state => state.addToast);
  const toast = useFileStore(state => state.toast);
  const setToast = useFileStore(state => state.setToast);
  const alignElement = useFileStore(state => state.alignElement);
  const setAlignElement = useFileStore(state => state.setAlignElement);

  const handlePaddingChange = event => {
    const value = Number(event.target.value);
    if (value <= 0) {
      addToast('Padding 값은 1보다 작을 수 없습니다.');
    } else {
      setPadding(value);
    }
  };

  const handleDownload = async () => {
    if (coordinates.length === 0) {
      addToast('다운로드할 이미지가 없습니다.');
      return;
    }

    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');

    if (!downloadCtx) {
      addToast('Canvas context를 생성할 수 없습니다.');
      return;
    }

    let totalWidth, maxHeight;

    if (alignElement === 'left-right') {
      totalWidth = coordinates.reduce(
        (acc, coord) => acc + coord.width + paddingValue,
        paddingValue
      );
      maxHeight =
        Math.max(...coordinates.map(coord => coord.height)) + paddingValue * 2;
    } else if (alignElement === 'top-bottom') {
      totalWidth =
        Math.max(...coordinates.map(coord => coord.width)) + paddingValue * 2;
      maxHeight = coordinates.reduce(
        (acc, coord) => acc + coord.height + paddingValue,
        paddingValue
      );
    } else if (alignElement === 'best-fit-decreasing') {
      totalWidth =
        Math.max(...coordinates.map(coord => coord.x + coord.width)) +
        paddingValue;
      maxHeight =
        Math.max(...coordinates.map(coord => coord.y + coord.height)) +
        paddingValue;
    }

    downloadCanvas.width = totalWidth;
    downloadCanvas.height = maxHeight;

    downloadCtx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    coordinates.forEach(coord => {
      downloadCtx.drawImage(
        coord.img,
        coord.x,
        coord.y,
        coord.width,
        coord.height
      );
    });

    const link = document.createElement('a');
    link.href = downloadCanvas.toDataURL('image/png');
    link.download = fileName ? `${fileName}.png` : 'sprites.png';
    link.click();
  };

  const removeToast = id => {
    if (toast && toast.id === id) {
      setToast(null);
    }
  };

  return (
    <nav
      className="flex w-full h-[10%] min-h-[50px] px-[1rem] py-[10px] bg-white rounded-t-md items-center justify-between shadow-md select-none"
      data-testid="navbar"
    >
      <div className="flex gap-4">
        <div className="relative inline-block bg-[#1f77b4] hover:bg-[#1a5a91] transition-colors duration-300 rounded-md">
          <input
            type="file"
            id="fileInput"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            multiple
            onChange={event =>
              handleFiles(
                Array.from(event.target.files),
                setFiles,
                setCoordinates,
                coordinates,
                paddingValue,
                alignElement
              )
            }
          />
          <label
            htmlFor="fileInput"
            className="p-2 w-full h-full text-white font-semibold cursor-pointer flex items-center justify-center"
          >
            Open files
          </label>
        </div>
        <div className="flex items-center space-x-2 h-[40px] p-2 border rounded-md shadow-sm bg-[#ffffff]">
          <label htmlFor="paddingInput" className="text-[#374151]">
            Padding :
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              id="paddingInput"
              value={paddingValue}
              onChange={handlePaddingChange}
              className="w-16 p-1 border rounded-md text-center"
              min="1"
            />
            <span>px</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 h-[40px] p-2 border rounded-md shadow-sm bg-[#ffffff]">
          <label htmlFor="align-elements">정렬 옵션 :</label>
          <select
            id="align-elements"
            value={alignElement}
            onChange={e => setAlignElement(e.target.value)}
            className="w-44 p-1 border rounded-md"
          >
            <option value="best-fit-decreasing">Best fit decreasing</option>
            <option value="left-right">Left-Right</option>
            <option value="top-bottom">Top-Bottom</option>
          </select>
        </div>
      </div>
      <div className="flex gap-4 w-[28%]">
        <div className="flex items-center space-x-2 h-[40px] w-full">
          <input
            type="text"
            className="flex-grow focus:outline-none h-full p-2 border-b-2 border-gray-400 focus-within:border-gray-600"
            placeholder="파일 이름을 입력해주세요."
            value={fileName}
            onChange={e => setFileName(e.target.value)}
          />
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-[#1f77b4] text-white hover:bg-[#1a5a91] transition-colors duration-300"
          >
            <img src={downloadIcon} alt="Download Icon" className="h-6 w-6" />
          </button>
        </div>
      </div>
      {toast && (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      )}
    </nav>
  );
}

export default Navbar;
