// plugins/node-picker-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
import { NodePicker } from '@components/built-in/NodePicker';
import { Position } from '@types';

interface NodePickerState {
  isVisible: boolean;
  screenPosition: Position;
  worldPosition: Position;
}

export class NodePickerPlugin extends BasePlugin {
  id = 'node-picker';
  name = 'Node Picker Plugin';
  version = '1.0.0';

  private state: NodePickerState = {
    isVisible: false,
    screenPosition: { x: 0, y: 0 },
    worldPosition: { x: 0, y: 0 },
  };

  private cleanupListeners: (() => void)[] = [];

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;

    // 1. Listen for Context Menu Event from Engine (Replacing manual DOM listener)
    const unsubscribeContextMenu = this.engine.getEventBus().on('canvas:contextmenu', (data: { x: number, y: number }) => {
      if (!this.engine) return;

      const screenPos = { x: data.x, y: data.y };
      const worldPos = this.engine.screenToWorld(screenPos);

      this.setState({
        isVisible: true,
        screenPosition: screenPos,
        worldPosition: worldPos,
      });
    });
    this.cleanupListeners.push(unsubscribeContextMenu);

    // 2. Click to close (Left click anywhere)
    const handleCanvasClick = (event: MouseEvent) => {
      if (this.state.isVisible && event.button === 0) {
        this.setState({ isVisible: false });
      }
    };

    document.addEventListener('mousedown', handleCanvasClick);
    this.cleanupListeners.push(() => {
      document.removeEventListener('mousedown', handleCanvasClick);
    });
    
    // 3. Keyboard Shortcut (Ctrl+Shift+N)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'N' || event.key === 'n')) {
        event.preventDefault();
        
        if (!this.engine) return;

        const center = this.engine.getCenter();
        const screenPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const worldPos = this.engine.screenToWorld(screenPos);

        this.setState({
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

  // ... (Keep the rest of the file: setState, requestRender, handleSelectNodeType, handleClose, render)
  
  private setState(updates: Partial<NodePickerState>): void {
    this.state = { ...this.state, ...updates };
    this.requestRender();
  }

  private requestRender(): void {
    if (this.engine) {
       this.engine.getEventBus().emit('plugin:render-requested', { pluginId: this.id });
    }
  }

  private handleSelectNodeType = (nodeType: any, screenPosition: Position): void => {
    if (!this.engine) return;

    const worldPos = this.state.worldPosition;

    const newNode: any = {
      type: nodeType.id,
      content: nodeType.name,
      position: worldPos,
      size: nodeType.defaultSize || { width: 150, height: 100 },
      metadata: {
        createdVia: 'node-picker',
        timestamp: Date.now(),
      },
    };

    this.engine.addNode(newNode);
    this.setState({ isVisible: false });

    this.engine.getEventBus().emit('node:created', {
      node: newNode,
      source: 'node-picker',
    });
  };

  private handleClose = (): void => {
    this.setState({ isVisible: false });
  };

  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled() || !this.state.isVisible) {
      return null;
    }

    const theme = this.configs.get('theme');

    return (
      <NodePicker
        position={this.state.screenPosition}
        isVisible={this.state.isVisible}
        onClose={this.handleClose}
        onSelectNodeType={this.handleSelectNodeType}
        theme={theme}
      />
    );
  }
}