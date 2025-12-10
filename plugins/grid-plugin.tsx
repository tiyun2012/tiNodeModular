import React, { useState, useEffect } from 'react';
import { BasePlugin } from './base-plugin';
import { Grid } from '@components/built-in/Grid';
import { CanvasEngine } from '@core/canvas-engine';

// ✅ NEW: Wrapper component to handle viewport updates efficiently
const GridWrapper: React.FC<{ 
  engine: CanvasEngine; 
  config: any; 
  theme: any; 
}> = ({ engine, config, theme }) => {
  const [viewport, setViewport] = useState(engine.getViewport());

  useEffect(() => {
    // Subscribe to viewport changes to update the grid position
    const unsubscribe = engine.getEventBus().on('viewport:changed', (newViewport) => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setViewport({ ...newViewport });
      });
    });
    return unsubscribe;
  }, [engine]);

  return <Grid viewport={viewport} config={config} theme={theme} />;
};

export class GridPlugin extends BasePlugin {
  id = 'grid';
  name = 'Grid Plugin';
  version = '1.0.0';

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;
    
    // Subscribe to config changes (Theme/UI updates)
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
       // React will handle the re-render via the component tree
    });
    
    this.updateConfig({ unsubscribe });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{ unsubscribe?: () => void }>();
    config.unsubscribe?.();
  }

  render(): React.ReactNode {
    if (!this.engine || !this.isEnabled()) return null;

    const gridConfig = this.configs.get('ui').grid;
    const theme = this.configs.get('theme');

    // ✅ Render the Wrapper instead of the static Grid
    return (
      <GridWrapper
        engine={this.engine}
        config={gridConfig}
        theme={theme}
      />
    );
  }
}
