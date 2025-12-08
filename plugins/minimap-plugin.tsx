// plugins/minimap-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
import { CanvasEngine } from '@core/canvas-engine';
import { Minimap } from '@components/built-in/Minimap';

export class MinimapPlugin extends BasePlugin {
  id = 'minimap';
  name = 'Minimap Plugin';
  version = '1.0.0';

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;

    // Subscribe to minimap config changes
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
      if (uiConfig?.minimap) {
        this.handleMinimapConfigChange(uiConfig.minimap);
      }
    });

    // Listen for navigation events
    const navigateUnsubscribe = this.engine.getEventBus().on(
      'minimap:navigate',
      (position) => this.handleMinimapNavigation(position)
    );

    this.updateConfig({ unsubscribe, navigateUnsubscribe });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{
      unsubscribe?: () => void;
      navigateUnsubscribe?: () => void;
    }>();
    config.unsubscribe?.();
    config.navigateUnsubscribe?.();
  }

  private handleMinimapConfigChange(config: any): void {
    // Handle minimap configuration changes
  }

  private handleMinimapNavigation(position: { x: number; y: number }): void {
    if (!this.engine) return;

    const viewport = this.engine.getViewport();
    const center = this.engine.getCenter();
    
    this.engine.setViewport({
      x: center.x - position.x * viewport.zoom,
      y: center.y - position.y * viewport.zoom,
    });
  }

  // ✅ FIX: Correct return type and use JSX safely
  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled()) return null;

    const viewport = this.engine.getViewport();
    const nodes = this.engine.getNodes();
    const minimapConfig = this.configs.get('ui').minimap;
    const theme = this.configs.get('theme');

    return (
      <Minimap
        viewport={viewport}
        nodes={nodes}
        config={minimapConfig}
        theme={theme}
        onNavigate={(x, y) => this.handleMinimapNavigation({ x, y })}
      />
    );
  }
}