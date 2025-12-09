import React from 'react';
import { CanvasNode } from '@types';

export const TextNode: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ padding: '8px', color: theme.colors.text.primary }}>
    {node.content}
  </div>
);