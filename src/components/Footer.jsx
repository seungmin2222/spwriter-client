import React from 'react';
import rotateIcon from '../assets/images/Button-Go-Forward-90--Streamline-Sharp.png';
import cloneIcon from '../assets/images/cloneIcon.png';
import leftIcon from '../assets/images/angles-left-solid.svg';
import rightIcon from '../assets/images/angles-right-solid.svg';

export const Footer = () => {
  return (
    <footer
      className="flex justify-between items-center w-full h-[10%] p-[3%]"
      data-testid="footer"
    >
      <div className="flex space-x-4">
        <button className="p-2 rounded-full bg-gray-200">
          <img src={rotateIcon} alt="Rotate Icon" className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-full bg-gray-200">
          <img src={cloneIcon} alt="Clone Icon" className="h-6 w-6" />
        </button>
      </div>
      <div className="flex space-x-4">
        <button className="p-2 rounded-full bg-gray-200">
          <img src={leftIcon} alt="Left Icon" className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-full bg-gray-200">
          <img src={rightIcon} alt="Right Icon" className="h-6 w-6" />
        </button>
      </div>
    </footer>
  );
};
