import React from 'react';
import Navbar from './Navbar';
import SpriteEditor from './SpriteEditor';
import Footer from './Footer';

function SpriteMain() {
  return (
    <main
      className="flex flex-col w-[70%] w-min-[955px] h-full bg-[#ffffff] rounded-md shadow-md"
      data-testid="sprite-main"
    >
      <Navbar />
      <SpriteEditor />
      <Footer />
    </main>
  );
}

export default SpriteMain;
