import React from 'react';
import { CanvasNode } from '@types';

export const ImageNode: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'inherit' }}>
    <img 
      src={node.metadata?.src || 'https://via.placeholder.com/150'} 
      alt={node.content} 
      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
    />
  </div>
);