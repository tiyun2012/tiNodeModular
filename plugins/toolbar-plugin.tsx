// plugins/toolbar-plugin.ts
import { BasePlugin } from './base-plugin';
import { CanvasEngine } from '@core/canvas-engine';
import { Toolbar } from '@components/built-in/Toolbar';

export class ToolbarPlugin extends BasePlugin {
  id = 'toolbar';
  name = 'Toolbar Plugin';
  version = '1.0.0';

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;

    // Subscribe to toolbar config changes
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
      if (uiConfig?.toolbar) {
        this.handleToolbarConfigChange(uiConfig.toolbar);
      }
    });

    // Listen for toolbar actions
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
    // Handle toolbar configuration changes
  }

  private handleToolbarAction(action: any): void {
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
        onZoomIn={() => this.handleToolbarAction('ZOOM_IN')}
        onZoomOut={() => this.handleToolbarAction('ZOOM_OUT')}
        onReset={() => this.handleToolbarAction('RESET')}
      />
    );
  }
}