// TiNodes/plugins/minimap-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
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
    // Note: This listener might be redundant if we handle onNavigate directly in render,
    // but we keep it for architecture consistency.
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

  private handleMinimapNavigation(delta: { x: number; y: number }): void {
    if (!this.engine) return;

    const viewport = this.engine.getViewport();
    
    // ✅ FIX: Apply the delta to the CURRENT viewport position.
    // Previously used 'center.x' which caused the view to snap/reset on every move.
    this.engine.setViewport({
      x: viewport.x - delta.x * viewport.zoom,
      y: viewport.y - delta.y * viewport.zoom,
    });
  }

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
        // Directly call the handler to ensure context is preserved
        onNavigate={(x, y) => this.handleMinimapNavigation({ x, y })}
      />
    );
  }
}