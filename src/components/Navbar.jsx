import React, { useState } from 'react';
import downloadIcon from '../assets/images/download-solid.svg';
import { useFileStore } from '../../store';

export const Navbar = () => {
  const [option, setOption] = useState('Binary Tree');
  const setFiles = useFileStore(state => state.setFiles);
  const addCoordinates = useFileStore(state => state.addCoordinates);
  const coordinates = useFileStore(state => state.coordinates);
  const padding = useFileStore(state => state.padding);
  const setPadding = useFileStore(state => state.setPadding);
  const canvasRef = useFileStore(state => state.canvasRef);
  const [fileName, setFileName] = useState('');

  const handleFileChange = event => {
    const files = Array.from(event.target.files);
    setFiles(files);

    const newImages = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          newImages.push(img);
          if (newImages.length === files.length) {
            const newCoordinates = newImages.map((img, index) => ({
              index: Date.now() + index,
              x: 0,
              y: 0,
              width: img.width,
              height: img.height,
              img,
            }));
            addCoordinates(newCoordinates);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaddingChange = event => {
    setPadding(Number(event.target.value));
  };

  const handleDownload = () => {
    if (coordinates.length === 0) {
      alert('다운로드할 이미지가 없습니다.');
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
    link.download = `${fileName}.png`;
    link.click();

    ctx.putImageData(imageData, 0, 0);
  };

  const drawImagesWithoutBackground = ctx => {
    const coordinates = useFileStore.getState().coordinates;
    const padding = useFileStore.getState().padding;

    const totalWidth = coordinates.reduce(
      (acc, coord) => acc + coord.width + padding,
      -padding
    );
    const maxHeight = Math.max(...coordinates.map(coord => coord.height));
    canvasRef.current.width = totalWidth;
    canvasRef.current.height = maxHeight;

    let xOffset = 0;
    coordinates.forEach(coord => {
      ctx.drawImage(coord.img, xOffset, 0, coord.width, coord.height);
      coord.x = xOffset;
      coord.y = 0;
      xOffset += coord.width + padding;
    });
  };

  return (
    <nav
      className="flex w-full h-[10%] h-min-[50px] py-[10px] bg-white rounded-t-md items-center justify-around shadow-md select-none"
      data-testid="navbar"
    >
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
        <label className="text-gray-700">Padding between elements :</label>
        <div className="flex items-center space-x-1">
          <input
            type="number"
            value={padding}
            onChange={handlePaddingChange}
            className="w-16 p-1 border rounded-md text-center"
          />
          <span className="text-gray-700">px</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 h-[40px] p-2 border rounded-md shadow-sm bg-[#ffffff]">
        <label className="text-gray-700">Align-elements :</label>
        <select
          value={option}
          onChange={e => setOption(e.target.value)}
          className="w-40 p-1 border rounded-md"
        >
          <option value="Binary Tree">Binary Tree</option>
          <option value="left-right">left-right</option>
          <option value="top-bottom">top-bottom</option>
        </select>
      </div>
      <div className="flex items-center space-x-2 h-[40px]">
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
    </nav>
  );
};
