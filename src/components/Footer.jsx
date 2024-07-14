import React from 'react';
import rotateIcon from '../assets/images/arrows-spin-solid.svg';
import cloneIcon from '../assets/images/copy-regular.svg';
import leftIcon from '../assets/images/angles-left-solid.svg';
import rightIcon from '../assets/images/angles-right-solid.svg';

export const Footer = () => {
  const buttonStyle =
    'p-2 rounded-full bg-[#1f77b4] text-white hover:bg-[#1a5a91] transition-colors duration-300';

  return (
    <footer
      className="flex justify-between items-center w-full h-[10%] p-[3%]"
      data-testid="footer"
    >
      <div className="flex space-x-4">
        <button className={buttonStyle}>
          <img src={rotateIcon} alt="Rotate Icon" className="h-6 w-6" />
        </button>
        <button className={buttonStyle}>
          <img src={cloneIcon} alt="Clone Icon" className="h-6 w-6" />
        </button>
      </div>
      <div className="flex space-x-4">
        <button className={buttonStyle}>
          <img src={leftIcon} alt="Left Icon" className="h-6 w-6" />
        </button>
        <button className={buttonStyle}>
          <img src={rightIcon} alt="Right Icon" className="h-6 w-6" />
        </button>
      </div>
    </footer>
  );
};
