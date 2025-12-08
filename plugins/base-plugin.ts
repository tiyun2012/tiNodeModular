// plugins/base-plugin.ts
import React from 'react';
import { CanvasEngine } from '@core/canvas-engine';
import { ConfigsManager } from '@configs';
import { EventBus } from '@events/event-bus';

export abstract class BasePlugin {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  
  protected engine: CanvasEngine | null = null;
  protected configs: ConfigsManager;
  protected eventBus: EventBus;
  
  private _enabled = false;
  private _activated = false;

  constructor(configs: ConfigsManager) {
    this.configs = configs;
    this.eventBus = new EventBus();
  }

  // Lifecycle methods
  async initialize(engine: CanvasEngine): Promise<void> {
    this.engine = engine;
    await this.onInitialize();
  }

  async activate(): Promise<void> {
    if (this._activated || !this.engine) return;
    
    this._enabled = true;
    this._activated = true;
    
    await this.onActivate();
    this.eventBus.emit('plugin:activated', { pluginId: this.id });
  }

  async deactivate(): Promise<void> {
    if (!this._activated) return;
    
    this._enabled = false;
    this._activated = false;
    
    await this.onDeactivate();
    this.eventBus.emit('plugin:deactivated', { pluginId: this.id });
  }

  async dispose(): Promise<void> {
    await this.deactivate();
    await this.onDispose();
    this.engine = null;
    this.eventBus.dispose();
  }

  // Configuration
  getConfig<T = any>(): T {
    return this.configs.getPluginConfig(this.id) as T;
  }

  updateConfig(updates: Partial<any>): void {
    const current = this.getConfig() || {};
    this.configs.registerPluginConfig(this.id, { ...current, ...updates });
  }

  // Status
  isEnabled(): boolean {
    return this._enabled;
  }

  isActivated(): boolean {
    return this._activated;
  }

  // ✅ FIX: Added default render method to satisfy TypeScript
  render(): React.ReactNode | null {
    return null;
  }

  // Protected hooks for subclasses
  protected async onInitialize(): Promise<void> {}
  protected async onActivate(): Promise<void> {}
  protected async onDeactivate(): Promise<void> {}
  protected async onDispose(): Promise<void> {}
}