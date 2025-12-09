// contexts/canvas-context.tsx
import React, { createContext, useState, useEffect, useRef } from 'react'; // ✅ Import useRef
import { CanvasEngine } from '@core/canvas-engine';
import { ConfigsManager } from '@configs';
import { BasePlugin } from '@plugins/base-plugin';
import { PluginEntry } from '@configs/plugins.config';
import { EventsProvider } from './events-context';
import { CanvasNode } from '@types';
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
  
  // ✅ FIX: Ref to track if initialization has already started
  // This prevents the double-invocation in React Strict Mode
  const isInitializing = useRef(false);

  // Initialize canvas
  const initialize = async (userConfigs: Partial<any> = {}) => {
    try {
      // Create configs manager
      const configsManager = new ConfigsManager(userConfigs);
      setConfigs(configsManager);

      // Create canvas engine
      const viewportConfig = configsManager.get('viewport');
      
      const constraints = {
        ...viewportConfig.constraints,
        constrainToWorld: viewportConfig.behaviors?.constrainToWorld ?? false
      };
      
      const canvasEngine = new CanvasEngine(
        viewportConfig.initial,
        constraints
      );

      // Initialize with Demo Data
      const DEMO_NODES: CanvasNode[] = [
        {
          id: '1',
          type: 'text',
          content: 'Center Node',
          position: { x: 0, y: 0 },
          size: { width: 150, height: 80 },
        },
        {
          id: '2',
          type: 'shape',
          content: '',
          position: { x: -300, y: -200 },
          size: { width: 100, height: 100 },
          metadata: { color: '#ef4444', shape: 'circle' }
        },
        {
          id: '3',
          type: 'ai-generated',
          content: 'AI Insights',
          position: { x: 300, y: 200 },
          size: { width: 200, height: 120 },
        },
      ];
      
      canvasEngine.loadGraph(DEMO_NODES);
      setEngine(canvasEngine);

      // Initialize plugins
      const pluginsConfig = configsManager.get('plugins');
      const pluginInstances: BasePlugin[] = [];

      const pluginModules = await Promise.all([
        import('@plugins/grid-plugin'),
        import('@plugins/toolbar-plugin'),
        import('@plugins/minimap-plugin'),
        import('@plugins/debug-plugin'),
        import('@plugins/node-layer-plugin'),
        import('@plugins/node-picker-plugin'),
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
            case 'node-picker':
              plugin = new pluginModules[5].NodePickerPlugin(configsManager); // ✅ ADDED
              break  
          }

          if (plugin) {
            await plugin.initialize(canvasEngine);
            pluginInstances.push(plugin);
          }
        }
      }

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
      
      // Reset the lock in case we need to re-init later (unlikely but safe)
      isInitializing.current = false;

      console.log('Canvas initialized with', pluginInstances.length, 'plugins');
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      isInitializing.current = false;
    }
  };

  // ... (getPlugin, activatePlugin, deactivatePlugin methods remain the same) ...

  const getPlugin = (id: string) => {
    return plugins.find(plugin => plugin.id === id);
  };

  const activatePlugin = async (id: string) => {
    const plugin = getPlugin(id);
    if (plugin && !plugin.isActivated()) {
      await plugin.activate();
      setPlugins([...plugins]); 
    }
  };

  const deactivatePlugin = async (id: string) => {
    const plugin = getPlugin(id);
    if (plugin && plugin.isActivated()) {
      await plugin.deactivate();
      setPlugins([...plugins]); 
    }
  };

  useEffect(() => {
    // ✅ FIX: Check the ref before calling initialize
    if (!initialized && !isInitializing.current) {
      isInitializing.current = true;
      initialize(initialConfigs);
    }

    return () => {
      // Cleanup
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