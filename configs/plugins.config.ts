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
      id: 'node-layer', // NEW: Added Node Layer
      enabled: true,
      priority: 200,    // Above Grid, Below Toolbar
    },
    {
      id: 'toolbar',
      enabled: true,
      priority: 300,
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