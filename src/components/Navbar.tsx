import React from 'react';
import Toast from './Toast';
import useFileStore from '../../store';
import { handleFiles } from '../utils/utils';
import downloadIcon from '../assets/images/download-solid.svg';

const Navbar = () => {
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

  const handlePaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
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

    let totalWidth: number = 0;
    let maxHeight: number = 0;

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
    } else if (alignElement === 'bin-packing') {
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

  const removeToast = (id: number) => {
    if (toast && toast.id === id) {
      setToast(null);
    }
  };

  return (
    <nav
      className="flex justify-between w-auto h-[5%] min-h-[50px] m-5 text-[17px] font-medium rounded-t-[2.375rem] select-none"
      data-testid="navbar"
    >
      <div className="flex h-[100%] gap-4">
        <div className="relative inline-block bg-[#241f3a] hover:bg-[#565465] duration-300 rounded-[1rem]">
          <input
            type="file"
            id="fileInput"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            multiple
            onChange={e => {
              const files = e.target.files;
              if (files) {
                const filesArray = Array.from(files);
                setFiles(filesArray);
                handleFiles(
                  filesArray,
                  setFiles,
                  setCoordinates,
                  coordinates,
                  paddingValue,
                  alignElement
                );
              }
            }}
          />

          <label
            htmlFor="fileInput"
            className="flex items-center justify-center text-[18px] w-[8rem] h-full px-3 text-white font-semibold cursor-pointer"
          >
            Open files
          </label>
        </div>
        <div className="flex justify-center items-center w-[13rem] h-full space-x-1 border rounded-[1rem] shadow-sm bg-[#ffffff]">
          <label htmlFor="paddingInput">Padding :</label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              id="paddingInput"
              value={paddingValue}
              onChange={handlePaddingChange}
              className="w-16 p-1 border rounded-[0.5rem] text-center"
            />
            <span>px</span>
          </div>
        </div>
        <div className="flex h-full justify-center p-2 border rounded-[1rem] shadow-sm bg-[#ffffff]">
          <label
            htmlFor="align-elements"
            className="flex h-full p-1 items-center"
          >
            정렬 옵션 :
          </label>
          <select
            id="align-elements"
            value={alignElement}
            onChange={e =>
              setAlignElement(
                e.target.value as 'bin-packing' | 'top-bottom' | 'left-right'
              )
            }
            className="w-32"
          >
            <option value="bin-packing">Bin-Packing</option>
            <option value="left-right">Left-Right</option>
            <option value="top-bottom">Top-Bottom</option>
          </select>
        </div>
      </div>
      <div className="flex w-[26%]">
        <div className="flex items-center space-x-2 h-auto w-full">
          <input
            type="text"
            className="flex-grow h-auto p-2 bg-[#f8f8f8] border-b-2 border-gray-400 focus-within:border-[#241f3a] focus:outline-none"
            placeholder="파일 이름을 입력해주세요."
            value={fileName}
            onChange={e => setFileName(e.target.value)}
          />
          <button
            onClick={handleDownload}
            className="p-[0.7rem] rounded-full bg-[#241f3a] hover:bg-[#565465] text-white transition-colors duration-300"
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
};

export default Navbar;
