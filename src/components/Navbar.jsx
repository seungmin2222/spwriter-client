import React, { useState, useEffect, useRef } from 'react';
import downloadIcon from '../assets/images/download-solid.svg';
import useFileStore from '../../store';
import Toast from './Toast';

function Navbar() {
  const [option, setOption] = useState('Binary Tree');
  const [fileName, setFileName] = useState('');
  const setFiles = useFileStore(state => state.setFiles);
  const coordinates = useFileStore(state => state.coordinates);
  const setCoordinates = useFileStore(state => state.setCoordinates);
  const paddingValue = useFileStore(state => state.padding);
  const setPadding = useFileStore(state => state.setPadding);
  const canvasRef = useFileStore(state => state.canvasRef);
  const addToast = useFileStore(state => state.addToast);
  const toast = useFileStore(state => state.toast);
  const setToast = useFileStore(state => state.setToast);

  const initialRender = useRef(true);

  const calculateCoordinates = (images, padding) => {
    let xOffset = 0;
    return images.map((img, index) => {
      const coord = {
        index: Date.now() + index,
        x: xOffset,
        y: padding,
        width: img.width,
        height: img.height,
        img,
      };
      xOffset += img.width + padding;
      return coord;
    });
  };

  const drawImagesWithoutBackground = ctx => {
    const { coordinates: coords } = useFileStore.getState();
    const { padding: pad } = useFileStore.getState();

    const totalWidth = coords.reduce(
      (acc, coord) => acc + coord.width + pad,
      -pad
    );
    const maxHeight = Math.max(...coords.map(coord => coord.height)) + pad * 2;
    canvasRef.current.width = totalWidth;
    canvasRef.current.height = maxHeight;

    let xOffset = 0;
    coords.forEach(coord => {
      ctx.drawImage(coord.img, xOffset, pad, coord.width, coord.height);
      coord.x = xOffset;
      coord.y = pad;
      xOffset += coord.width + pad;
    });
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else if (coordinates.length > 0) {
      const newCoordinates = calculateCoordinates(
        coordinates.map(coord => coord.img),
        paddingValue
      );
      setCoordinates(newCoordinates);
    }
  }, [paddingValue]);

  const sortAndSetCoordinates = newCoords => {
    const sortedCoordinates = [...newCoords].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );
    setCoordinates(sortedCoordinates);
  };

  const trimImage = img => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let left = canvas.width;
    let right = 0;
    let top = canvas.height;
    let bottom = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        if (pixels[index + 3] > 0) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    const trimmedWidth = right - left + 1;
    const trimmedHeight = bottom - top + 1;
    const trimmedCanvas = document.createElement('canvas');
    const trimmedCtx = trimmedCanvas.getContext('2d');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    trimmedCtx.drawImage(
      canvas,
      left,
      top,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      trimmedWidth,
      trimmedHeight
    );

    const trimmedImg = new Image();
    trimmedImg.src = trimmedCanvas.toDataURL();
    return new Promise(resolve => {
      trimmedImg.onload = () => resolve(trimmedImg);
    });
  };

  const handleFileChange = event => {
    const files = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...files]);

    const newImages = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          trimImage(img).then(trimmedImg => {
            newImages.push(trimmedImg);
            if (newImages.length === files.length) {
              const newCoordinates = calculateCoordinates(
                newImages,
                paddingValue
              );
              sortAndSetCoordinates([...coordinates, ...newCoordinates]);
            }
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaddingChange = event => {
    const value = Number(event.target.value);
    if (value <= 0) {
      addToast('1 보다 작게 설정 할 수 없습니다.');
    } else {
      setPadding(value);
    }
  };

  const handleDownload = () => {
    if (coordinates.length === 0) {
      addToast('다운로드할 이미지가 없습니다.');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawImagesWithoutBackground(ctx);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName ? `${fileName}.png` : 'sprite.png';
    link.click();

    ctx.putImageData(imageData, 0, 0);
  };

  const removeToast = id => {
    if (toast && toast.id === id) {
      setToast(null);
    }
  };

  return (
    <nav
      className="flex w-full h-[10%] h-min-[50px] px-[1rem] py-[10px] bg-white rounded-t-md items-center justify-between shadow-md select-none"
      data-testid="navbar"
    >
      <div className="flex gap-4">
        <div className="relative inline-block bg-[#1f77b4] hover:bg-[#1a5a91] transition-colors duration-300 rounded-md">
          <input
            type="file"
            id="fileInput"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            multiple
            onChange={handleFileChange}
          />
          <label
            htmlFor="fileInput"
            className="p-2 w-full h-full text-white font-semibold cursor-pointer flex items-center justify-center"
          >
            Open files
          </label>
        </div>
        <div className="flex items-center space-x-2 h-[40px] p-2 border rounded-md shadow-sm bg-[#ffffff]">
          <label htmlFor="paddingInput" className="text-gray-700">
            Padding :
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              id="paddingInput"
              value={paddingValue}
              onChange={handlePaddingChange}
              className="w-16 p-1 border rounded-md text-center"
            />
            <span className="text-gray-700">px</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 h-[40px] p-2 border rounded-md shadow-sm bg-[#ffffff]">
          <label htmlFor="align-elements" className="text-gray-700">
            Align-elements :
          </label>
          <select
            id="align-elements"
            value={option}
            onChange={e => setOption(e.target.value)}
            className="w-40 p-1 border rounded-md"
          >
            <option value="Binary Tree">Binary Tree</option>
            <option value="left-right">left-right</option>
            <option value="top-bottom">top-bottom</option>
          </select>
        </div>
      </div>
      <div className="flex gap-4 w-[28%]">
        <div className="flex items-center space-x-2 h-[40px] w-full">
          <input
            type="text"
            className="flex-grow focus:outline-none h-full p-2 border-b-2 border-gray-400 focus-within:border-gray-600"
            placeholder="원하시는 파일 이름을 입력해주세요."
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
