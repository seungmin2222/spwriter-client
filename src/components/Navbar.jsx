import React, { useState } from 'react';
import downloadIcon from '../assets/images/download-solid.svg';

export const Navbar = () => {
  const [count, setCount] = useState(10);
  const [option, setOption] = useState('Binary Tree');

  return (
    <nav
      className="flex w-full h-[10%] min-h-[60px] py-[20px] bg-white rounded-t-md items-center justify-around shadow-md"
      data-testid="navbar"
    >
      <button className="p-2 rounded-md bg-[#1f77b4] text-white font-semibold hover:bg-[#1a5a91] transition-colors duration-300">
        Open files
      </button>
      <div className="flex items-center space-x-2 p-2 border rounded-md shadow-sm bg-[#ffffff] h-full">
        <label className="text-gray-700">Padding between elements :</label>
        <div className="flex items-center space-x-1">
          <input
            type="number"
            value={count}
            onChange={e => setCount(e.target.value)}
            className="w-16 p-1 border rounded-md text-center"
          />
          <span className="text-gray-700">px</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 p-2 border rounded-md shadow-sm bg-[#ffffff] h-full">
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
      <div className="flex items-center space-x-2 p-2 border-b-2 border-gray-400 focus-within:border-gray-600 bg-[#ffffff] h-full">
        <input
          type="text"
          className="flex-grow focus:outline-none h-full"
          placeholder="파일 이름을 입력해주세요."
        />
      </div>
      <button className="p-2 rounded-full bg-[#1f77b4] text-white hover:bg-[#1a5a91] transition-colors duration-300">
        <img src={downloadIcon} alt="Download Icon" className="h-6 w-6" />
      </button>
    </nav>
  );
};
