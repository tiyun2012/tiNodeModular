// plugins/grid-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
import { CanvasEngine } from '@core/canvas-engine';
import { Grid } from '@components/built-in/Grid';

export class GridPlugin extends BasePlugin {
  id = 'grid';
  name = 'Grid Plugin';
  version = '1.0.0';

  private gridComponent: React.ReactNode | null = null;

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;

    // Get grid config
    const gridConfig = this.configs.get('ui').grid;
    
    // Subscribe to config changes
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
      if (uiConfig?.grid) {
        this.updateGrid(uiConfig.grid);
      }
    });

    // Store unsubscribe function
    this.updateConfig({ unsubscribe });

    // Subscribe to viewport changes
    const viewportUnsubscribe = this.engine.getEventBus().on(
      'viewport:changed',
      (viewport) => {
        // Grid would auto-update via React props
      }
    );

    this.updateConfig({ viewportUnsubscribe });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{ unsubscribe?: () => void; viewportUnsubscribe?: () => void }>();
    config.unsubscribe?.();
    config.viewportUnsubscribe?.();
  }

  private updateGrid(config: any): void {
    // Grid updates are handled by React re-renders with new props
  }

  // Render method for React integration
  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled()) return null;

    const viewport = this.engine.getViewport();
    const gridConfig = this.configs.get('ui').grid;
    const theme = this.configs.get('theme');

    return (
      <Grid
        viewport={viewport}
        config={gridConfig}
        theme={theme}
      />
    );
  }
}