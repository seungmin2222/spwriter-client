import React, { useState, useEffect } from 'react';
import ImageList from './ImageList';
import SpriteMain from './SpriteMain';

import xMarkIcon from '../assets/images/circle-xmark-regular.svg';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex items-center justify-center w-screen h-screen text-center p-4">
        <div className="p-6 bg-[#f8f8fd] text-[#6b7280] rounded-2xl flex flex-col items-center">
          <img
            src={xMarkIcon}
            alt="xMarkIcon Icon"
            className="h-10 w-10 mb-2"
          />
          <h1 className="text-2xl">
            죄송합니다. <br />
            모바일은 지원하지 않습니다.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-between w-screen h-screen bg-gradient-to-r from-[#dbd9e9] to-[#e5e2ed] p-[2%]"
      data-testid="app"
    >
      <ImageList />
      <SpriteMain />
    </div>
  );
}

export default App;
