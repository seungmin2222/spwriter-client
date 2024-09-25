import React from 'react';
import Navbar from './Navbar';
import SpriteEditor from './SpriteEditor';
import Footer from './Footer';

function SpriteMain() {
  return (
    <main
      className="flex flex-col w-[72%] w-min-[955px] h-full bg-[#f7f7f7] rounded-[2rem] shadow-md"
      data-testid="sprite-main"
    >
      <Navbar />
      <SpriteEditor />
      <Footer />
    </main>
  );
}

export default SpriteMain;
