import React from 'react';
import { Navbar } from './Navbar';
import { SpriteEditor } from './SpriteEditor';
import { Footer } from './Footer';

export const SpriteMain = () => {
  return (
    <main className="flex flex-col w-[72%] w-min-[955px] h-full bg-[#ffffff] rounded-md shadow-md">
      <Navbar />
      <SpriteEditor />
      <Footer />
    </main>
  );
};
