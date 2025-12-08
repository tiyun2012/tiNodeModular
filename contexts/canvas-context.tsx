// contexts/canvas-context.tsx
import React, { createContext, useState, useEffect } from 'react';
import { CanvasEngine } from '@core/canvas-engine';
import { ConfigsManager } from '@configs';
import { BasePlugin } from '@plugins/base-plugin';
import { PluginEntry } from '@configs/plugins.config';
import { EventsProvider } from './events-context';
import './CanvasContext.css';

interface CanvasContextValue {
  engine: CanvasEngine | null;
  plugins: BasePlugin[];
  configs: ConfigsManager;
  initialized: boolean;
  initialize: (configs: Partial<any>) => Promise<void>;
  getPlugin: (id: string) => BasePlugin | undefined;
  activatePlugin: (id: string) => Promise<void>;
  deactivatePlugin: (id: string) => Promise<void>;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

interface CanvasProviderProps {
  children: React.ReactNode;
  initialConfigs?: Partial<any>;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ 
  children, 
  initialConfigs = {} 
}) => {
  const [engine, setEngine] = useState<CanvasEngine | null>(null);
  const [configs, setConfigs] = useState<ConfigsManager | null>(null);
  const [plugins, setPlugins] = useState<BasePlugin[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize canvas
  const initialize = async (userConfigs: Partial<any> = {}) => {
    try {
      // Create configs manager
      const configsManager = new ConfigsManager(userConfigs);
      setConfigs(configsManager);

      // Create canvas engine
      const viewportConfig = configsManager.get('viewport');
      
      // ✅ FIX: Merge constraints with behavior flags
      // The engine expects 'constrainToWorld' inside constraints, but config has it in behaviors
      const constraints = {
        ...viewportConfig.constraints,
        constrainToWorld: viewportConfig.behaviors?.constrainToWorld ?? false
      };
      
      const canvasEngine = new CanvasEngine(
        viewportConfig.initial,
        constraints
      );
      setEngine(canvasEngine);

      // Initialize plugins
      const pluginsConfig = configsManager.get('plugins');
      const pluginInstances: BasePlugin[] = [];

      // Import and create built-in plugins
      const pluginModules = await Promise.all([
        import('@plugins/grid-plugin'),
        import('@plugins/toolbar-plugin'),
        import('@plugins/minimap-plugin'),
        import('@plugins/debug-plugin'),
        import('@plugins/node-layer-plugin'),
      ]);

      for (const pluginConfig of pluginsConfig.builtIn) {
        if (pluginConfig.enabled) {
          let plugin: BasePlugin | null = null;
          
          switch (pluginConfig.id) {
            case 'grid':
              plugin = new pluginModules[0].GridPlugin(configsManager);
              break;
            case 'toolbar':
              plugin = new pluginModules[1].ToolbarPlugin(configsManager);
              break;
            case 'minimap':
              plugin = new pluginModules[2].MinimapPlugin(configsManager);
              break;
            case 'debug':
              plugin = new pluginModules[3].DebugPlugin(configsManager);
              break;
            case 'node-layer':
              plugin = new pluginModules[4].NodeLayerPlugin(configsManager);
              break;
          }

          if (plugin) {
            await plugin.initialize(canvasEngine);
            pluginInstances.push(plugin);
          }
        }
      }

      // Activate plugins based on priority
      pluginInstances.sort((a, b) => {
        const aPriority = pluginsConfig.builtIn.find((p: PluginEntry) => p.id === a.id)?.priority || 0;
        const bPriority = pluginsConfig.builtIn.find((p: PluginEntry) => p.id === b.id)?.priority || 0;
        return aPriority - bPriority;
      });

      for (const plugin of pluginInstances) {
        if (pluginsConfig.autoEnable) {
          await plugin.activate();
        }
      }

      setPlugins(pluginInstances);
      setInitialized(true);

      console.log('Canvas initialized with', pluginInstances.length, 'plugins');
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
    }
  };

  // Plugin management
  const getPlugin = (id: string) => {
    return plugins.find(plugin => plugin.id === id);
  };

  const activatePlugin = async (id: string) => {
    const plugin = getPlugin(id);
    if (plugin && !plugin.isActivated()) {
      await plugin.activate();
      setPlugins([...plugins]); // Trigger re-render
    }
  };

  const deactivatePlugin = async (id: string) => {
    const plugin = getPlugin(id);
    if (plugin && plugin.isActivated()) {
      await plugin.deactivate();
      setPlugins([...plugins]); // Trigger re-render
    }
  };

  useEffect(() => {
    if (!initialized) {
      initialize(initialConfigs);
    }

    return () => {
      plugins.forEach(plugin => plugin.dispose());
      engine?.dispose();
    };
  }, []);

  if (!configs || !engine || !initialized) {
    return (
      <div className="canvas-loading">
        Loading InfiniSpace...
      </div>
    );
  }

  const value: CanvasContextValue = {
    engine,
    plugins,
    configs,
    initialized,
    initialize,
    getPlugin,
    activatePlugin,
    deactivatePlugin,
  };

  return (
    <EventsProvider eventBus={engine.getEventBus()}>
      <CanvasContext.Provider value={value}>
        {children}
      </CanvasContext.Provider>
    </EventsProvider>
  );
};