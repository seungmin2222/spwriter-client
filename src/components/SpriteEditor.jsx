import React from 'react';
import { Footer } from './Footer';

export const SpriteEditor = () => {
  return (
    <div className="relative w-full h-[90%]" data-testid="sprite-editor">
      <div className="flex w-full h-[90%] bg-slate-100"></div>
      <Footer />
    </div>
  );
};
