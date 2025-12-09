// configs/plugins.config.ts
export interface PluginEntry {
  id: string;
  enabled: boolean;
  priority: number;
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface PluginsConfig {
  builtIn: PluginEntry[];
  external: PluginEntry[];
  autoEnable: boolean;
}

export const DEFAULT_PLUGINS_CONFIG: PluginsConfig = {
  builtIn: [
    {
      id: 'grid',
      enabled: true,
      priority: 100,
    },
    {
      id: 'node-layer',
      enabled: true,
      priority: 200,
    },
    {
      id: 'toolbar',
      enabled: true,
      priority: 300,
    },
    // ✅ ADDED: Node Picker
    {
      id: 'node-picker',
      enabled: true,
      priority: 350,
    },
    {
      id: 'minimap',
      enabled: true,
      priority: 400,
    },
    {
      id: 'debug',
      enabled: true,
      priority: 500,
    },
  ],
  external: [],
  autoEnable: true,
};