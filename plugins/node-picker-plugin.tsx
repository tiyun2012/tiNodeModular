// plugins/node-picker-plugin.tsx
import React from 'react';
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
  };

  private cleanupListeners: (() => void)[] = [];

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;
    console.log('[NodePicker] Activated');

    // 1. Listen for the event emitted by CanvasContainer
    const unsubscribeContextMenu = this.engine.getEventBus().on('canvas:contextmenu', (data: { x: number, y: number }) => {
      console.log('[NodePicker] Context Menu Event Received', data);
      
      if (!this.engine) return;

      const screenPos = { x: data.x, y: data.y };
      // Convert to world pos so the node spawns where we initially clicked, 
      // even if we drag the menu away later.
      const worldPos = engine.screenToWorld(screenPos);

      setState({
        isVisible: true,
        screenPosition: screenPos,
        worldPosition: worldPos,
      });
    });
    this.cleanupListeners.push(unsubscribeContextMenu);

    // ---------------------------------------------------------------------------
    // ❌ DELETED: The aggressive global 'mousedown' listener was here.
    // It was closing the picker on ANY click.
    // We now rely on NodePicker.tsx's internal 'handleClickOutside' logic.
    // ---------------------------------------------------------------------------

    // 2. Keyboard Shortcut (Ctrl+Shift+N)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'N' || event.key === 'n')) {
        event.preventDefault();

        if (!this.engine) return;

        console.log('[NodePicker] Shortcut Triggered');
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
    this.cleanupListeners.push(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    this.updateConfig({ cleanupListeners: this.cleanupListeners });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{ cleanupListeners?: (() => void)[] }>();
    config.cleanupListeners?.forEach(cleanup => cleanup());
    this.cleanupListeners = [];
    this.setState({ isVisible: false });
  }

  private setState(updates: Partial<NodePickerState>): void {
    this.state = { ...this.state, ...updates };
    // console.log('[NodePicker] State Updated:', this.state); 
    this.requestRender();
  }

  private requestRender(): void {
    if (this.engine) {
       // console.log('[NodePicker] Requesting Render');
       this.engine.getEventBus().emit('plugin:render-requested', { pluginId: this.id });
    }
  }

  private handleSelectNodeType = (nodeType: any, screenPosition: Position): void => {
    if (!this.engine) return;

    // Use the stored world position from when the menu was opened
    const worldPos = this.state.worldPosition;

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

    if (!this.state.isVisible) {
      return null;
    }

    const theme = this.configs.get('theme');

    return (
      <NodePickerWrapper 
        engine={this.engine} 
        theme={theme} 
      />
    );
  }
}