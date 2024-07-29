import React from 'react';
import ImageList from './ImageList';
import SpriteMain from './SpriteMain';

function App() {
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
