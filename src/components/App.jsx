import React from 'react';
import ImageList from './ImageList';
import SpriteMain from './SpriteMain';

function App() {
  return (
    <div
      className="flex justify-between w-screen h-screen bg-slate-200 p-[3%]"
      data-testid="app"
    >
      <ImageList />
      <SpriteMain />
    </div>
  );
}

export default App;
