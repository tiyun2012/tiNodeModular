import React, { createContext, useState, useEffect, useRef } from 'react';
import { CanvasEngine } from '@core/canvas-engine';
import { ConfigsManager } from '@configs';
import { BasePlugin } from '@plugins/base-plugin';
import { PluginEntry } from '@configs/plugins.config';
import { EventsProvider } from './events-context';
import { CanvasNode } from '@types';
import './CanvasContext.css';
import { PluginRegistry, registerBuiltInPlugins } from '@plugins';
import { useCanvasStore } from '@store/canvas-store';

// Register plugins OUTSIDE the component
registerBuiltInPlugins();

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

export const CanvasProvider: React.FC<{ children: React.ReactNode; initialConfigs?: Partial<any> }> = ({ 
  children, 
  initialConfigs = {} 
}) => {
  const [engine, setEngine] = useState<CanvasEngine | null>(null);
  const [configs, setConfigs] = useState<ConfigsManager | null>(null);
  const [plugins, setPlugins] = useState<BasePlugin[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  const isInitializing = useRef(false);

  // Initialize canvas
  const initialize = async (userConfigs: Partial<any> = {}) => {
    try {
      const configsManager = new ConfigsManager(userConfigs);
      setConfigs(configsManager);

      const viewportConfig = configsManager.get('viewport');
      const constraints = {
        ...viewportConfig.constraints,
        constrainToWorld: viewportConfig.behaviors?.constrainToWorld ?? false
      };
      
      const canvasEngine = new CanvasEngine(viewportConfig.initial, constraints);

      // --- Insert Demo Data Loading Here if needed ---
      const DEMO_NODES: CanvasNode[] = [
        { id: '1', type: 'text', content: 'Center Node', position: { x: 0, y: 0 }, size: { width: 150, height: 80 } },
        { id: '2', type: 'shape', content: '', position: { x: -300, y: -200 }, size: { width: 100, height: 100 }, metadata: { color: '#ef4444', shape: 'circle' } },
        { id: '3', type: 'ai-generated', content: 'AI Insights', position: { x: 300, y: 200 }, size: { width: 200, height: 120 } },
      ];
      canvasEngine.loadGraph(DEMO_NODES);
      // ----------------------------------------------
      
      setEngine(canvasEngine);

      // Connect to Zustand
      useCanvasStore.getState().syncWithEngine(canvasEngine);

      // Initialize plugins
      const pluginsConfig = configsManager.get('plugins');
      const pluginInstances: BasePlugin[] = [];

      for (const pluginConfig of pluginsConfig.builtIn) {
        if (pluginConfig.enabled) {
          const plugin = PluginRegistry.create(pluginConfig.id, configsManager);
          if (plugin) {
            await plugin.initialize(canvasEngine);
            pluginInstances.push(plugin);
          }
        }
      }

      // Sort
      pluginInstances.sort((a, b) => {
        const aPriority = pluginsConfig.builtIn.find((p: PluginEntry) => p.id === a.id)?.priority || 0;
        const bPriority = pluginsConfig.builtIn.find((p: PluginEntry) => p.id === b.id)?.priority || 0;
        return aPriority - bPriority;
      });

      // Activate
      for (const plugin of pluginInstances) {
        if (pluginsConfig.autoEnable) {
          await plugin.activate();
        }
      }

      setPlugins(pluginInstances);
      setInitialized(true);
      isInitializing.current = false;

    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      isInitializing.current = false;
    }
  };

  // ✅ CORRECT PLACEMENT: Define these functions at the component level
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
    if (!initialized && !isInitializing.current) {
      isInitializing.current = true;
      initialize(initialConfigs);
    }
    return () => {
      plugins.forEach(plugin => plugin.dispose());
      engine?.dispose();
    };
  }, []);

  if (!configs || !engine || !initialized) return <div className="canvas-loading">Loading...</div>;

  return (
    <EventsProvider eventBus={engine.getEventBus()}>
      <CanvasContext.Provider value={{ engine, plugins, configs, initialized, initialize, getPlugin, activatePlugin, deactivatePlugin }}>
        {children}
      </CanvasContext.Provider>
    </EventsProvider>
  );
};