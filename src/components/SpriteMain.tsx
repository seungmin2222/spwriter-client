import React from 'react';
import Navbar from './Navbar';
import SpriteEditor from './SpriteEditor';
import Footer from './Footer';

function SpriteMain() {
  return (
    <main
      className="w-min-[955px] flex h-full w-[72%] flex-col rounded-[2rem] bg-[#f7f7f7] shadow-md"
      data-testid="sprite-main"
    >
      <Navbar />
      <SpriteEditor />
      <Footer />
    </main>
  );
}

export default SpriteMain;
