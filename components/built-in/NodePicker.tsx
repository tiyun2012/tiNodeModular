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
  onMove?: (newPosition: Position) => void;
}

const DEFAULT_NODE_TYPES: NodeType[] = [
  { id: 'text', name: 'Text Node', icon: '📝', description: 'Add text content', defaultSize: { width: 150, height: 80 } },
  { id: 'shape', name: 'Shape', icon: '🔷', description: 'Geometric shape', defaultSize: { width: 100, height: 100 } },
  { id: 'image', name: 'Image', icon: '🖼️', description: 'Insert an image', defaultSize: { width: 200, height: 150 } },
  { id: 'ai-generated', name: 'AI Node', icon: '🤖', description: 'AI-generated content', defaultSize: { width: 200, height: 120 } },
  { id: 'note', name: 'Sticky Note', icon: '📌', description: 'Colored sticky note', defaultSize: { width: 180, height: 140 } },
  { id: 'group', name: 'Group Container', icon: '📦', description: 'Container for grouping nodes', defaultSize: { width: 300, height: 200 } },
  { id: 'connection', name: 'Connection', icon: '🔗', description: 'Line or arrow connector', defaultSize: { width: 50, height: 50 } },
  { id: 'video', name: 'Video', icon: '🎥', description: 'Embed video content', defaultSize: { width: 320, height: 180 } },
];

export const NodePicker: React.FC<NodePickerProps> = ({
  position,
  isVisible,
  onClose,
  onSelectNodeType,
  theme,
  onMove, 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // --- 1. DRAG LOGIC ---
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.PointerEvent) => {
    // Prevent dragging if interacting with the input field
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation(); // Stop Canvas from receiving 'pointerdown' (prevents panning)

    setIsDragging(true);
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    
    // Capture pointer to track dragging even if mouse leaves the element
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !onMove) return;
      e.preventDefault();

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      onMove({ x: newX, y: newY });
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, onMove]);

  // --- 2. EVENT BLOCKING HELPER ---
  const blockPropagation = (e: React.PointerEvent | React.WheelEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
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

  return (
    <div 
      ref={menuRef} 
      style={{
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
      }}
      // ✅ FIX: Only block 'down' and 'wheel'. 
      // Do NOT block 'move' or 'up', otherwise the window listeners above will never receive the events.
      onPointerDown={blockPropagation}
      onWheel={blockPropagation}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header / Drag Handle */}
      <div 
        onPointerDown={handleDragStart} // Attach drag start logic here
        style={{
          padding: '12px',
          borderBottom: `1px solid ${theme.colors.toolbar.border}`,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
         <input
          type="text"
          placeholder="Search node types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.colors.toolbar.border}`,
            borderRadius: theme.borderRadius.sm,
            color: theme.colors.text.primary,
            fontSize: '14px',
            outline: 'none',
            cursor: 'text', 
          }}
          autoFocus
          // Stop propagation here so we can select text without dragging the window
          onPointerDown={(e) => e.stopPropagation()} 
        />
      </div>

      {/* Node Type List */}
      <div 
        style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 0',
      }}>
        {filteredTypes.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: theme.colors.text.muted, fontSize: '14px' }}>No matching node types found</div>
        ) : (
          filteredTypes.map((nodeType) => (
            <div
              key={nodeType.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                color: theme.colors.text.primary,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
              onClick={() => onSelectNodeType(nodeType, position)}
            >
              <span style={{ fontSize: '20px', marginRight: '12px', width: '24px', textAlign: 'center' }}>
                {nodeType.icon || '📄'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                  {nodeType.name}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginTop: '2px' }}>
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
        Press ESC to close • Drag header to move
      </div>
    </div>
  );
};
