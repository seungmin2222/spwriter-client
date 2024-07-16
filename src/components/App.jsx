import React from 'react';
import { ImageList } from './ImageList';
import { SpriteMain } from './SpriteMain';

export const App = () => {
  return (
    <div
      className="flex justify-between w-screen h-screen bg-slate-200 p-[4%]"
      data-testid="app"
    >
      <ImageList />
      <SpriteMain />
    </div>
  );
};

export default App;
