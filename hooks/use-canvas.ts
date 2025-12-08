// hooks/use-canvas.ts
import { useContext } from 'react';
import { CanvasContext } from '@contexts/canvas-context';

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};