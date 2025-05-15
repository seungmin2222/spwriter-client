import React from 'react';
import useFileStore from '../../store';
import { handleFiles } from '../utils/fileUtils';
import { downloadUtility, handlePaddingChangeUtility } from '../utils/navUtils';
import Toast from './Toast';

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
      className="m-5 flex h-[5%] min-h-[50px] w-auto select-none justify-between rounded-t-[2.375rem] text-[17px] font-medium"
      data-testid="navbar"
    >
      <div className="flex h-[100%] gap-4">
        <label
          htmlFor="fileInput"
          className="relative inline-block rounded-[1rem] bg-[#241f3a] duration-300 hover:bg-[#565465]"
        >
          <input
            type="file"
            id="fileInput"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
          <span className="flex h-full w-[8rem] cursor-pointer items-center justify-center px-3 text-[18px] font-semibold text-white">
            Open files
          </span>
        </label>
        <div className="flex h-full w-[13rem] items-center justify-center space-x-1 rounded-[1rem] border bg-[#ffffff] shadow-sm">
          <label
            className="flex items-center gap-[10px] space-x-1"
            htmlFor="paddingInput"
          >
            Padding :
            <input
              type="number"
              id="paddingInput"
              value={padding}
              onChange={handlePaddingChange}
              className="w-16 rounded-[0.5rem] border p-1 text-center"
            />
            <span>px</span>
          </label>
        </div>
        <div className="flex h-full justify-center rounded-[1rem] border bg-[#ffffff] p-2 shadow-sm">
          <span id="alignLabel" className="flex h-full items-center p-1">
            정렬 옵션 :
          </span>
          <select
            id="align-elements"
            aria-labelledby="alignLabel"
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
        <div className="flex h-auto w-full items-center space-x-2">
          <input
            type="text"
            className="h-auto flex-grow border-b-2 border-gray-400 bg-[#f8f8f8] p-2 focus-within:border-[#241f3a] focus:outline-none"
            placeholder="파일 이름을 입력해주세요."
            value={fileName}
            onChange={e => setFileName(e.target.value)}
          />
          <button
            type="button"
            onClick={handleDownload}
            className="group relative rounded-full bg-[#241f3a] p-[0.7rem] text-white transition-colors duration-300 hover:bg-[#565465]"
            aria-label="Download"
          >
            <div className="downloadImg" />
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 flex -translate-x-1/2 transform flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="h-0 w-0 border-b-8 border-l-8 border-r-8 border-b-gray-700 border-l-transparent border-r-transparent" />
              <span className="whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-sm text-white">
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
