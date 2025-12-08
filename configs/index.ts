// configs/index.ts
import { ViewportConfig } from './viewport.config';
import { UIConfig } from './ui.config';
import { PluginsConfig } from './plugins.config';
import { ThemeConfig } from './theme.config';

export interface ConfigRegistry {
  viewport: ViewportConfig;
  ui: UIConfig;
  plugins: PluginsConfig;
  theme: ThemeConfig;
  custom: Record<string, any>;
}

// ✅ FIX: Deep Merge Utility
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
    // Initialize with defaults
    this.configs = this.loadDefaultConfigs();
    
    // Apply user overrides
    if (initialConfigs) {
      this.mergeConfigs(initialConfigs);
    }
  }

  private loadDefaultConfigs(): ConfigRegistry {
    // Import from individual config files (circular dependency safe)
    const viewport: ViewportConfig = {
      initial: { x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1 },
      constraints: { minZoom: 0.1, maxZoom: 5.0, worldSize: 10000 },
      behaviors: { 
        inertia: false, 
        momentum: 0, 
        snapToGrid: false,
        constrainToWorld: false 
      },
    };

    const ui: UIConfig = {
      toolbar: {
        enabled: true,
        position: 'floating' as const,
        width: 38,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderRadius: 19,
        items: [],
      },
      grid: {
        enabled: true,
        size: 20,
        color: '#334155',
        fadeBelowZoom: 0.5,
        opacity: 1,
        showLargeGrid: true,
        largeGridMultiplier: 10,
      },
      minimap: {
        enabled: true,
        size: 180,
        position: 'bottom-left' as const,
        opacity: 0.8,
        showNodes: true,
        interactive: true,
        showViewportIndicator: true,
      },
      debug: {
        enabled: true,
        showCoordinates: true,
        showFPS: false,
        showEvents: false,
        showPerformance: false,
        coordinateFormat: 'screen',
      },
    };

    const plugins: PluginsConfig = {
      builtIn: [
        { id: 'grid', enabled: true, priority: 100 },
        { id: 'toolbar', enabled: true, priority: 200 },
        { id: 'minimap', enabled: true, priority: 300 },
        { id: 'debug', enabled: true, priority: 400 },
      ],
      external: [],
      autoEnable: true,
    };

    const theme: ThemeConfig = {
      mode: 'dark' as const,
      colors: {
        palette: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          background: '#0f172a',
          surface: '#1e293b',
          error: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          info: '#06b6d4',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
          disabled: '#475569',
          inverse: '#0f172a',
        },
        node: {
          background: 'rgba(30, 41, 59, 0.9)',
          border: '#475569',
          selected: '#3b82f6',
          hover: '#60a5fa',
          text: '#f1f5f9',
        },
        grid: '#334155',
        minimap: {
          background: 'rgba(30, 41, 59, 0.95)',
          border: '#475569',
          indicator: 'rgba(255, 255, 255, 0.8)',
        },
        toolbar: {
          background: 'rgba(30, 41, 59, 0.95)',
          border: '#475569',
          button: {
            default: 'rgba(255, 255, 255, 0.1)',
            hover: 'rgba(255, 255, 255, 0.15)',
            active: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      borderRadius: { sm: 4, md: 8, lg: 12, xl: 16 },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    };

    return {
      viewport,
      ui,
      plugins,
      theme,
      custom: {},
    };
  }

  // Get a config section
  get<K extends keyof ConfigRegistry>(key: K): ConfigRegistry[K] {
    return this.configs[key] as ConfigRegistry[K];
  }

  // Set a config section
  set<K extends keyof ConfigRegistry>(
    key: K,
    value: Partial<ConfigRegistry[K]>
  ): void {
    const current = this.configs[key] || {};
    
    // ✅ FIX: Use Deep Merge instead of Shallow Spread
    const updated = deepMerge(current, value);
    
    this.configs[key] = updated as any;
    
    // Notify subscribers
    this.notifySubscribers(key, updated);
    this.notifySubscribers('*', { [key]: updated });
  }

  // Merge multiple configs at once
  mergeConfigs(configs: Partial<ConfigRegistry>): void {
    Object.entries(configs).forEach(([key, value]) => {
      this.set(key as keyof ConfigRegistry, value);
    });
  }

  // Plugin config management
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

  // Subscription system
  subscribe<K extends keyof ConfigRegistry>(
    key: K | '*',
    callback: (config: any) => void
  ): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
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

  // Serialization
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

  // Reset to defaults
  reset(): void {
    this.configs = this.loadDefaultConfigs();
    this.notifySubscribers('*', this.configs);
  }
}