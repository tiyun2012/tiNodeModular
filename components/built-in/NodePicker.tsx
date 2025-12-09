// File: D:\dev\tiNodeModular\components\built-in\NodePicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Position } from '@types';

interface NodeType {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  defaultSize?: { width: number; height: number };
}

interface NodePickerProps {
  position: Position; // Screen coordinates
  isVisible: boolean;
  onClose: () => void;
  onSelectNodeType: (nodeType: NodeType, worldPosition: Position) => void;
  theme: any;
}

// Define available node types
const DEFAULT_NODE_TYPES: NodeType[] = [
  {
    id: 'text',
    name: 'Text Node',
    icon: '📝',
    description: 'Add text content',
    defaultSize: { width: 150, height: 80 },
  },
  {
    id: 'shape',
    name: 'Shape',
    icon: '🔷',
    description: 'Geometric shape (circle, square)',
    defaultSize: { width: 100, height: 100 },
  },
  {
    id: 'image',
    name: 'Image',
    icon: '🖼️',
    description: 'Insert an image',
    defaultSize: { width: 200, height: 150 },
  },
  {
    id: 'ai-generated',
    name: 'AI Node',
    icon: '🤖',
    description: 'AI-generated content',
    defaultSize: { width: 200, height: 120 },
  },
  {
    id: 'note',
    name: 'Sticky Note',
    icon: '📌',
    description: 'Colored sticky note',
    defaultSize: { width: 180, height: 140 },
  },
  {
    id: 'group',
    name: 'Group Container',
    icon: '📦',
    description: 'Container for grouping nodes',
    defaultSize: { width: 300, height: 200 },
  },
  {
    id: 'connection',
    name: 'Connection',
    icon: '🔗',
    description: 'Line or arrow connector',
    defaultSize: { width: 50, height: 50 },
  },
  {
    id: 'video',
    name: 'Video',
    icon: '🎥',
    description: 'Embed video content',
    defaultSize: { width: 320, height: 180 },
  },
];

export const NodePicker: React.FC<NodePickerProps> = ({
  position,
  isVisible,
  onClose,
  onSelectNodeType,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search is handled by the autoFocus prop on input
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const filteredTypes = DEFAULT_NODE_TYPES.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 9999,
    width: '280px',
    maxHeight: '400px',
    overflow: 'hidden',
    backgroundColor: theme.colors.surface || '#1e293b',
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.toolbar.border}`,
    boxShadow: theme.shadows.xl,
    display: 'flex',
    flexDirection: 'column',
  };

  const searchStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: `1px solid ${theme.colors.toolbar.border}`,
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.colors.toolbar.border}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    fontSize: '14px',
    outline: 'none',
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    color: theme.colors.text.primary,
    transition: 'background-color 0.2s',
  };

  const emptyStyle: React.CSSProperties = {
    padding: '24px 16px',
    textAlign: 'center',
    color: theme.colors.text.muted,
    fontSize: '14px',
  };

  return (
    <div 
      ref={menuRef} 
      style={menuStyle} 
      // ✅ FIX: Stop propagation to prevent Canvas capture conflicts
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Search Bar */}
      <div style={searchStyle}>
        <input
          type="text"
          placeholder="Search node types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
          autoFocus
        />
      </div>

      {/* Node Type List */}
      <div style={listStyle}>
        {filteredTypes.length === 0 ? (
          <div style={emptyStyle}>No matching node types found</div>
        ) : (
          filteredTypes.map((nodeType) => (
            <div
              key={nodeType.id}
              style={itemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
              onClick={() => onSelectNodeType(nodeType, position)}
            >
              <span style={{ fontSize: '20px', marginRight: '12px', width: '24px', textAlign: 'center' }}>
                {nodeType.icon || '📄'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                  {nodeType.name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: theme.colors.text.secondary,
                  marginTop: '2px'
                }}>
                  {nodeType.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${theme.colors.toolbar.border}`,
        fontSize: '11px',
        color: theme.colors.text.muted,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      }}>
        Press ESC to close • Click outside to dismiss
      </div>
    </div>
  );
};