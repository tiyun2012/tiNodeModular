// plugins/minimap-plugin.tsx
import React, { useState, useEffect, useRef } from 'react';
import { BasePlugin } from './base-plugin';
import { Minimap } from '@components/built-in/Minimap';
import { Viewport } from '@types';

// Wrapper component to handle subscription
const MinimapWrapper: React.FC<{ 
    engine: any; 
    config: any; 
    theme: any; 
    plugin: MinimapPlugin 
}> = ({ engine, config, theme, plugin }) => {
    // Subscribe to viewport to force Minimap re-render
    const [viewport, setViewport] = useState<Viewport>(engine.getViewport());
    // Subscribe to nodes (optional, but good for accuracy)
    const [nodes, setNodes] = useState(engine.getNodes());
    
    // Ref to handle throttling
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const bus = engine.getEventBus();
        
        // Update function with RAF throttling to prevent lag during drag
        const update = () => {
             if (rafRef.current) return;
             
             rafRef.current = requestAnimationFrame(() => {
                 setViewport({ ...engine.getViewport() });
                 setNodes([...engine.getNodes()]);
                 rafRef.current = null;
             });
        };
        
        const unsubVP = bus.on('viewport:changed', update);
        const unsubNodes = bus.on('node:updated', update);
        
        // ✅ NEW: Listen to these events so the minimap updates while dragging
        const unsubDrag = bus.on('node:dragged', update);
        const unsubAdd = bus.on('node:added', update);
        const unsubRemove = bus.on('node:removed', update);

        return () => { 
            unsubVP(); 
            unsubNodes(); 
            unsubDrag();
            unsubAdd();
            unsubRemove();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [engine]);

    return (
        <Minimap
            viewport={viewport}
            nodes={nodes}
            config={config}
            theme={theme}
            onNavigate={(x, y) => plugin.handleMinimapNavigation({ x, y })}
        />
    );
};

export class MinimapPlugin extends BasePlugin {
  id = 'minimap';
  name = 'Minimap Plugin';
  version = '1.0.0';

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;
    // Subscribe to config changes
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
        // handled via re-render in container or wrapper
    });
    this.updateConfig({ unsubscribe });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{ unsubscribe?: () => void }>();
    config.unsubscribe?.();
  }

  public handleMinimapNavigation(delta: { x: number; y: number }): void {
    if (!this.engine) return;
    const viewport = this.engine.getViewport();
    this.engine.setViewport({
      x: viewport.x - delta.x * viewport.zoom,
      y: viewport.y - delta.y * viewport.zoom,
    });
  }

  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled()) return null;

    const minimapConfig = this.configs.get('ui').minimap;
    const theme = this.configs.get('theme');

    // Return the wrapper which handles the subscription
    return (
      <MinimapWrapper
        engine={this.engine}
        config={minimapConfig}
        theme={theme}
        plugin={this}
      />
    );
  }
}
