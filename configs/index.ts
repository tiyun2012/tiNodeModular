import { ViewportConfig, DEFAULT_VIEWPORT_CONFIG } from './viewport.config';
// ✅ FIX: Import Type from @types, Value from file
import { DEFAULT_UI_CONFIG } from './ui.config'; 
import { UIConfig } from '@types'; 

import { PluginsConfig, DEFAULT_PLUGINS_CONFIG } from './plugins.config';
import { ThemeConfig, DEFAULT_THEME_CONFIG } from './theme.config';

export interface ConfigRegistry {
  viewport: ViewportConfig;
  ui: UIConfig;
  plugins: PluginsConfig;
  theme: ThemeConfig;
  custom: Record<string, any>;
}

// Deep Merge Utility
function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export class ConfigsManager {
  private configs: Partial<ConfigRegistry> = {};
  private subscribers: Map<string, Set<(config: any) => void>> = new Map();

  constructor(initialConfigs?: Partial<ConfigRegistry>) {
    this.configs = this.loadDefaultConfigs();
    if (initialConfigs) {
      this.mergeConfigs(initialConfigs);
    }
  }

  private loadDefaultConfigs(): ConfigRegistry {
    return {
      viewport: { ...DEFAULT_VIEWPORT_CONFIG },
      ui: { ...DEFAULT_UI_CONFIG }, // ✅ Uses the imported default value
      plugins: { ...DEFAULT_PLUGINS_CONFIG },
      theme: { ...DEFAULT_THEME_CONFIG },
      custom: {},
    };
  }

  get<K extends keyof ConfigRegistry>(key: K): ConfigRegistry[K] {
    return this.configs[key] as ConfigRegistry[K];
  }

  set<K extends keyof ConfigRegistry>(
    key: K,
    value: Partial<ConfigRegistry[K]>
  ): void {
    const current = this.configs[key] || {};
    const updated = deepMerge(current, value);
    this.configs[key] = updated as any;
    
    this.notifySubscribers(key, updated);
    this.notifySubscribers('*', { [key]: updated });
  }

  mergeConfigs(configs: Partial<ConfigRegistry>): void {
    Object.entries(configs).forEach(([key, value]) => {
      this.set(key as keyof ConfigRegistry, value);
    });
  }

  registerPluginConfig(pluginId: string, config: any): void {
    this.configs.custom = {
      ...this.configs.custom,
      [pluginId]: config,
    };
    this.notifySubscribers(`plugin:${pluginId}`, config);
  }

  getPluginConfig(pluginId: string): any {
    return this.configs.custom?.[pluginId];
  }

  subscribe<K extends keyof ConfigRegistry>(
    key: K | '*',
    callback: (config: any) => void
  ): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  private notifySubscribers(key: string, config: any): void {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(config);
        } catch (error) {
          console.error(`Error in config subscriber for ${key}:`, error);
        }
      });
    }
  }

  toJSON(): string {
    return JSON.stringify(this.configs, null, 2);
  }

  fromJSON(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.mergeConfigs(parsed);
    } catch (error) {
      console.error('Failed to parse config JSON:', error);
    }
  }

  reset(): void {
    this.configs = this.loadDefaultConfigs();
    this.notifySubscribers('*', this.configs);
  }
}
