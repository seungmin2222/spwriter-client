import React from 'react';
import { Navbar } from './Navbar';
import { SpriteEditor } from './SpriteEditor';

export const SpriteMain = () => {
  return (
    <main className="flex flex-col w-[70%] w-min-[955px] bg-[#ffffff] rounded-md shadow-md">
      <Navbar />
      <SpriteEditor />
    </main>
  );
};
