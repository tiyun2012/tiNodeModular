// [file: plugins/node-picker-plugin.tsx]
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
    console.log('[NodePicker] Activated'); // DEBUG

    // 1. Listen for the event emitted by CanvasContainer
    const unsubscribeContextMenu = this.engine.getEventBus().on('canvas:contextmenu', (data: { x: number, y: number }) => {
      console.log('[NodePicker] Context Menu Event Received', data); // DEBUG
      
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

    // 2. Close on left click (Document level)
    const handleCanvasClick = (event: MouseEvent) => {
      // Only close if visible and it's a left click (button 0)
      if (this.state.isVisible && event.button === 0) {
        console.log('[NodePicker] Closing due to outside click'); // DEBUG
        this.setState({ isVisible: false });
      }
    };

    // Use 'mousedown' with capture to ensure we catch it before other logic if necessary,
    // though bubbling (default) is usually fine.
    document.addEventListener('mousedown', handleCanvasClick);
    
    this.cleanupListeners.push(() => {
      document.removeEventListener('mousedown', handleCanvasClick);
    });

    // 3. Keyboard Shortcut (Ctrl+Shift+N)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'N' || event.key === 'n')) {
        event.preventDefault();
        if (!this.engine) return;

        console.log('[NodePicker] Shortcut Triggered'); // DEBUG
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

  private setState(updates: Partial<NodePickerState>): void {
    this.state = { ...this.state, ...updates };
    console.log('[NodePicker] State Updated:', this.state); // DEBUG
    this.requestRender();
  }

  private requestRender(): void {
    if (this.engine) {
       console.log('[NodePicker] Requesting Render'); // DEBUG
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
    if (!this.engine || !this.isEnabled()) return null;

    // DEBUG: Verify render is called and visibility state
    // console.log('[NodePicker] Render called. Visible:', this.state.isVisible);

    if (!this.state.isVisible) {
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