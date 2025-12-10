// plugins/toolbar-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
import { Toolbar } from '@components/built-in/Toolbar';
import { downloadWorkflow, uploadWorkflow } from '@utils/file-io';

export class ToolbarPlugin extends BasePlugin {
  id = 'toolbar';
  name = 'Toolbar Plugin';
  version = '1.0.0';

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;
    
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
      if (uiConfig?.toolbar) {
        this.handleToolbarConfigChange(uiConfig.toolbar);
      }
    });

    const actionUnsubscribe = this.engine.getEventBus().on(
      'toolbar:action',
      (action) => this.handleToolbarAction(action)
    );
    
    this.updateConfig({ unsubscribe, actionUnsubscribe });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{
      unsubscribe?: () => void;
      actionUnsubscribe?: () => void;
    }>();
    config.unsubscribe?.();
    config.actionUnsubscribe?.();
  }

  private handleToolbarConfigChange(config: any): void {
  }

  private async handleToolbarAction(action: any): Promise<void> {
    if (!this.engine) return;
    
    switch (action) {
      case 'ZOOM_IN':
        this.engine.zoom(-300, this.engine.getCenter());
        break;
      case 'ZOOM_OUT':
        this.engine.zoom(300, this.engine.getCenter());
        break;
      case 'RESET':
        this.engine.resetViewport();
        break;
      
      case 'SAVE_WORKFLOW': {
        console.log("Saving workflow..."); // Debug log
        const data = this.engine.exportState();
        const filename = `infini-workflow-${new Date().toISOString().slice(0, 10)}.json`;
        downloadWorkflow(data, filename);
        break;
      }

      case 'LOAD_WORKFLOW': {
        console.log("Loading workflow..."); // Debug log
        try {
          const data = await uploadWorkflow();
          this.engine.loadState(data);
        } catch (error) {
          console.error('[ToolbarPlugin] Failed to load:', error);
          alert('Failed to load workflow file.');
        }
        break;
      }
    }
  }

  render(): React.ReactNode {
    if (!this.engine || !this.isEnabled()) return null;

    const viewport = this.engine.getViewport();
    const toolbarConfig = this.configs.get('ui').toolbar;
    const theme = this.configs.get('theme');

    return (
      <Toolbar
        viewport={viewport}
        config={toolbarConfig}
        theme={theme}
        onZoomIn={() => this.engine?.getEventBus().emit('toolbar:action', 'ZOOM_IN')}
        onZoomOut={() => this.engine?.getEventBus().emit('toolbar:action', 'ZOOM_OUT')}
        onReset={() => this.engine?.getEventBus().emit('toolbar:action', 'RESET')}
        // ✅ NEW: Connect the generic handler!
        onAction={(action) => this.engine?.getEventBus().emit('toolbar:action', action)}
      />
    );
  }
}
