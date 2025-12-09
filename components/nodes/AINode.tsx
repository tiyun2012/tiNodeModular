import React from 'react';
import { CanvasNode } from '@types';

export const AINode: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ 
    padding: '12px', 
    background: `linear-gradient(135deg, ${theme.colors.palette.secondary}22, ${theme.colors.palette.primary}22)`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ fontSize: '0.8em', color: theme.colors.palette.secondary, textTransform: 'uppercase' }}>AI Generated</div>
    <div>{node.content}</div>
  </div>
);