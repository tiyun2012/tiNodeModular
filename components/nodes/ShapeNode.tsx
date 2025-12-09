import React from 'react';
import { CanvasNode } from '@types';

export const ShapeNode: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ 
    width: '100%', 
    height: '100%', 
    backgroundColor: node.metadata?.color || theme.colors.palette.accent,
    borderRadius: node.metadata?.shape === 'circle' ? '50%' : '4px',
    opacity: 0.5
  }} />
);