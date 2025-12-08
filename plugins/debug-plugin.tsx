// plugins/debug-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
import { DebugOverlay } from '@components/built-in/DebugOverlay';

export class DebugPlugin extends BasePlugin {
  id = 'debug';
  name = 'Debug Plugin';
  version = '1.0.0';

  private fps = 0;
  private lastFrameTime = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;

  protected async onActivate(): Promise<void> {
    if (!this.engine) return;

    // Subscribe to debug config changes
    const unsubscribe = this.configs.subscribe('ui', (uiConfig) => {
      if (uiConfig?.debug) {
        this.handleDebugConfigChange(uiConfig.debug);
      }
    });

    // Start FPS counter
    this.startFpsCounter();

    this.updateConfig({ unsubscribe });
  }

  protected async onDeactivate(): Promise<void> {
    const config = this.getConfig<{ unsubscribe?: () => void }>();
    config.unsubscribe?.();
    
    // Stop FPS counter
    this.stopFpsCounter();
  }

  private handleDebugConfigChange(config: any): void {
    // Handle debug configuration changes
  }

  private startFpsCounter(): void {
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = this.lastFrameTime;
    
    const updateFps = () => {
      if (!this.isEnabled()) return;
      
      const now = performance.now();
      this.frameCount++;
      
      if (now >= this.lastFpsUpdate + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = now;
      }
      
      requestAnimationFrame(updateFps);
    };
    
    requestAnimationFrame(updateFps);
  }

  private stopFpsCounter(): void {
    // FPS counter stops when plugin is deactivated
  }

  // ✅ FIX: Use React.ReactNode return type
  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled()) return null;

    const viewport = this.engine.getViewport();
    const debugConfig = this.configs.get('ui').debug;
    const theme = this.configs.get('theme');

    return (
      <DebugOverlay
        viewport={viewport}
        config={debugConfig}
        theme={theme}
        fps={this.fps}
      />
    );
  }
}