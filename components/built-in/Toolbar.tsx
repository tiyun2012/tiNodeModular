// components/built-in/Toolbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Viewport, ToolbarItem, ToolbarConfig } from '@types';

interface ToolbarProps {
  viewport: Viewport;
  config: ToolbarConfig;
  theme: any;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  // ✅ NEW: Generic action handler for everything else (Save, Load, etc.)
  onAction: (actionId: string) => void;
}

const SNAP_THRESHOLD = 100;
const SNAP_MARGIN = 24;

export const Toolbar: React.FC<ToolbarProps> = React.memo(({
  viewport,
  config,
  theme,
  onZoomIn,
  onZoomOut,
  onReset,
  onAction, // ✅ Destructure new prop
}) => {
  if (!config.enabled) return null;

  const TOOLBAR_WIDTH = config.width;

  // Initial position
  const [position, setPosition] = useState(() => {
    switch (config.position) {
      case 'top-left':
        return { x: 32, y: 32 };
      case 'top-right':
        return { x: window.innerWidth - TOOLBAR_WIDTH - 32, y: 32 };
      case 'bottom-left':
        return { x: 32, y: window.innerHeight - 200 };
      case 'bottom-right':
        return { x: window.innerWidth - TOOLBAR_WIDTH - 32, y: window.innerHeight - 200 };
      case 'floating':
      default:
        return { x: window.innerWidth - TOOLBAR_WIDTH - 32, y: window.innerHeight - 200 };
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (config.position === 'floating') {
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - TOOLBAR_WIDTH - SNAP_MARGIN),
          y: Math.min(prev.y, window.innerHeight - 200),
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [TOOLBAR_WIDTH, config.position]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (config.position !== 'floating') return;
    e.stopPropagation();
    setIsDragging(true);
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || config.position !== 'floating') return;
      e.preventDefault();

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      const clampedX = Math.max(0, Math.min(window.innerWidth - TOOLBAR_WIDTH, newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - 200, newY));

      setPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging || config.position !== 'floating') return;
      setIsDragging(false);

      setPosition(prev => {
        let nextX = prev.x;
        if (prev.x < SNAP_THRESHOLD) {
          nextX = SNAP_MARGIN;
        } else if (window.innerWidth - (prev.x + TOOLBAR_WIDTH) < SNAP_THRESHOLD) {
          nextX = window.innerWidth - TOOLBAR_WIDTH - SNAP_MARGIN;
        }
        return { x: nextX, y: prev.y };
      });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, TOOLBAR_WIDTH, config.position]);

  // ✅ UPDATED: Handle generic actions
  const handleClick = (item: ToolbarItem) => {
    if (!item.action) return;

    // Legacy specific handlers
    if (item.action === 'ZOOM_IN') { onZoomIn(); return; }
    if (item.action === 'ZOOM_OUT') { onZoomOut(); return; }
    if (item.action === 'RESET') { onReset(); return; }

    // Pass everything else to generic handler (e.g., SAVE_WORKFLOW)
    onAction(item.action);
  };

  const renderItemContent = (item: ToolbarItem) => {
    if (item.type === 'info' && item.action === 'RESET') {
      return `${Math.round(viewport.zoom * 100)}%`;
    }
    return item.icon || item.label;
  };

  return (
    <>
      <div
        className="zoom-controls"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: config.width,
          backgroundColor: config.backgroundColor || theme.colors.toolbar.background,
          border: `1px solid ${theme.colors.toolbar.border}`,
          borderRadius: config.borderRadius,
          transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.1s linear',
          boxShadow: theme.shadows.md,
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          userSelect: 'none',
          touchAction: 'none',
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {config.position === 'floating' && (
          <div className="drag-handle" onMouseDown={handleMouseDown}>
            <div className="drag-handle-icon" />
          </div>
        )}

        {config.items
          .filter(item => item.visible !== false)
          .map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={item.type === 'button' ? 'btn-zoom' : 'zoom-level'}
              title={item.label}
              style={{
                border: 'none',
                background: 'none',
                color: theme.colors.text.primary,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1,
                ...item.style,
              }}
              disabled={item.disabled}
            >
              {renderItemContent(item)}
            </button>
          ))}
      </div>
    </>
  );
});

Toolbar.displayName = 'Toolbar';
