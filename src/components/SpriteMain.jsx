import React from 'react';
import { Navbar } from './Navbar';
import { SpriteEditor } from './SpriteEditor';

export const SpriteMain = () => {
  return (
    <div className="flex flex-wrap w-[70%] w-min-[955px] bg-[#ffffff] rounded-md">
      <Navbar />
      <SpriteEditor />
    </div>
  );
};
