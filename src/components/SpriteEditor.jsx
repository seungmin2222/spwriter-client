import React from 'react';
import { Footer } from './Footer';

export const SpriteEditor = () => {
  return (
    <div className="relative w-full h-full" data-testid="sprite-editor">
      <canvas className="flex w-full h-full bg-[#f0f4f8]"></canvas>
    </div>
  );
};
