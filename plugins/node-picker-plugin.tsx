import React, { useState, useEffect, useCallback } from 'react';
import { BasePlugin } from './base-plugin';
import { NodePicker } from '@components/built-in/NodePicker';
import { Position, CanvasNode } from '@types';
import { CanvasEngine } from '@core/canvas-engine';

// 1. Define the internal state shape
interface PickerState {
  isVisible: boolean;
  screenPosition: Position;
  worldPosition: Position;
}

// 2. Create a React Component to manage state and logic
const NodePickerWrapper: React.FC<{ 
  engine: CanvasEngine; 
  theme: any; 
}> = ({ engine, theme }) => {
  const [state, setState] = useState<PickerState>({
    isVisible: false,
    screenPosition: { x: 0, y: 0 },
    worldPosition: { x: 0, y: 0 },
  });

  // --- Event Listeners ---
  useEffect(() => {
    // Handle Right-Click (Context Menu)
    const handleContextMenu = (data: { x: number, y: number }) => {
      const screenPos = { x: data.x, y: data.y };
      // Convert to world pos so the node spawns where we initially clicked, 
      // even if we drag the menu away later.
      const worldPos = engine.screenToWorld(screenPos);

      setState({
        isVisible: true,
        screenPosition: screenPos,
        worldPosition: worldPos,
      });
    };

    const unsub = engine.getEventBus().on('canvas:contextmenu', handleContextMenu);
    return () => unsub();
  }, [engine]);

  // Handle Keyboard Shortcut (Ctrl+Shift+N)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'N' || event.key === 'n')) {
        event.preventDefault();
        
        // Spawn at center of screen
        const screenPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const worldPos = engine.screenToWorld(screenPos);

        setState({
          isVisible: true,
          screenPosition: screenPos,
          worldPosition: worldPos,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  // --- Interaction Handlers ---

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // This fixes the "Cannot move" issue
  const handleMove = useCallback((newPosition: Position) => {
    setState(prev => ({ ...prev, screenPosition: newPosition }));
  }, []);

  const handleSelectNodeType = useCallback((nodeType: any) => {
    const newNode: any = {
      type: nodeType.id,
      content: nodeType.name,
      position: state.worldPosition, // Use the stored world position
      size: nodeType.defaultSize || { width: 150, height: 100 },
      metadata: {
        createdVia: 'node-picker',
        timestamp: Date.now(),
      },
    };

    engine.addNode(newNode);
    
    engine.getEventBus().emit('node:created', {
      node: newNode,
      source: 'node-picker',
    });

    handleClose();
  }, [engine, state.worldPosition, handleClose]);

  if (!state.isVisible) return null;

  return (
    <NodePicker
      position={state.screenPosition}
      isVisible={state.isVisible}
      onClose={handleClose}
      onSelectNodeType={handleSelectNodeType}
      theme={theme}
      onMove={handleMove} // ✅ Passed the missing prop
    />
  );
};

// 3. The Plugin Class becomes a thin shell that renders the Wrapper
export class NodePickerPlugin extends BasePlugin {
  id = 'node-picker';
  name = 'Node Picker Plugin';
  version = '1.0.0';

  // No internal state needed here anymore, the React component handles it.
  
  protected async onActivate(): Promise<void> {
    // The component mounts when the plugin is active, so logic starts there automatically.
    // We can keep this empty or log activation.
  }

  protected async onDeactivate(): Promise<void> {
    // React unmounts the component, cleaning up listeners automatically.
  }

  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled()) return null;

    const theme = this.configs.get('theme');

    return (
      <NodePickerWrapper 
        engine={this.engine} 
        theme={theme} 
      />
    );
  }
}
