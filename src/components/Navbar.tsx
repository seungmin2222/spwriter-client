import React from 'react';
import Toast from './Toast';
import useFileStore from '../../store';
import { handleFiles } from '../utils/fileUtils';
import { downloadUtility, handlePaddingChangeUtility } from '../utils/navUtils';

function Navbar() {
  const fileName = useFileStore(state => state.fileName);
  const setFileName = useFileStore(state => state.setFileName);
  const setFiles = useFileStore(state => state.setFiles);
  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const padding = useFileStore(state => state.padding);
  const setPadding = useFileStore(state => state.setPadding);
  const addToast = useFileStore(state => state.addToast);
  const toast = useFileStore(state => state.toast);
  const setToast = useFileStore(state => state.setToast);
  const alignElement = useFileStore(state => state.alignElement);
  const setAlignElement = useFileStore(state => state.setAlignElement);

  const handlePaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePaddingChangeUtility(e, setPadding, addToast);
  };

  const handleDownload = () => {
    downloadUtility({
      coordinates,
      padding,
      alignElement,
      addToast,
      fileName,
    });
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
            onChange={({ target: { files } }) => {
              if (files) {
                const filesArray = Array.from(files);
                setFiles(filesArray);
                handleFiles(
                  filesArray,
                  setFiles,
                  setCoordinates,
                  coordinates,
                  padding,
                  alignElement
                );
              }
            }}
          />

          <span className="flex items-center justify-center text-[18px] w-[8rem] h-full px-3 text-white font-semibold cursor-pointer">
            Open files
          </span>
        </div>
        <div className="flex justify-center items-center w-[13rem] h-full space-x-1 border rounded-[1rem] shadow-sm bg-[#ffffff]">
          <span>Padding :</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              id="paddingInput"
              value={padding}
              onChange={handlePaddingChange}
              className="w-16 p-1 border rounded-[0.5rem] text-center"
            />
            <span>px</span>
          </div>
        </div>
        <div className="flex h-full justify-center p-2 border rounded-[1rem] shadow-sm bg-[#ffffff]">
          <span className="flex h-full p-1 items-center">정렬 옵션 :</span>
          <select
            id="align-elements"
            value={alignElement}
            onChange={({ target: { value } }) => {
              if (
                value === 'bin-packing' ||
                value === 'left-right' ||
                value === 'top-bottom'
              ) {
                setAlignElement(value);
              }
            }}
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
            type="button"
            onClick={handleDownload}
            className="relative p-[0.7rem] rounded-full bg-[#241f3a] hover:bg-[#565465] text-white transition-colors duration-300 group"
            aria-label="Download"
          >
            <div className="downloadImg" />
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-b-gray-700 border-l-transparent border-r-transparent" />
              <span className="text-sm bg-gray-700 text-white rounded py-1 px-2 whitespace-nowrap">
                스프라이트 시트 생성
              </span>
            </div>
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
