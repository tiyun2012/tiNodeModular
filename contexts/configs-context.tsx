// contexts/configs-context.tsx
import React, { createContext, useState, useEffect } from 'react';
import { ConfigsManager } from '@configs';

interface ConfigsContextValue {
  configs: ConfigsManager;
  ui: any;
  theme: any;
  viewport: any;
  plugins: any;
  updateConfig: (section: string, value: any) => void;
  getPluginConfig: (pluginId: string) => any;
  updatePluginConfig: (pluginId: string, value: any) => void;
}

// ✅ FIX: Export this so use-configs.ts can import it
export const ConfigsContext = createContext<ConfigsContextValue | null>(null);

// REMOVED: Duplicate useConfigs hook (it exists in hooks/use-configs.ts)

interface ConfigsProviderProps {
  children: React.ReactNode;
  initialConfigs?: Partial<any>;
}

export const ConfigsProvider: React.FC<ConfigsProviderProps> = ({ 
  children, 
  initialConfigs = {} 
}) => {
  const [configsManager] = useState(() => new ConfigsManager(initialConfigs));
  const [ui, setUi] = useState(() => configsManager.get('ui'));
  const [theme, setTheme] = useState(() => configsManager.get('theme'));
  const [viewport, setViewport] = useState(() => configsManager.get('viewport'));
  const [plugins, setPlugins] = useState(() => configsManager.get('plugins'));

  // Subscribe to config changes
  useEffect(() => {
    const unsubscribeUi = configsManager.subscribe('ui', (newUi) => {
      setUi(newUi);
    });

    const unsubscribeTheme = configsManager.subscribe('theme', (newTheme) => {
      setTheme(newTheme);
    });

    const unsubscribeViewport = configsManager.subscribe('viewport', (newViewport) => {
      setViewport(newViewport);
    });

    const unsubscribePlugins = configsManager.subscribe('plugins', (newPlugins) => {
      setPlugins(newPlugins);
    });

    return () => {
      unsubscribeUi();
      unsubscribeTheme();
      unsubscribeViewport();
      unsubscribePlugins();
    };
  }, [configsManager]);

  const updateConfig = (section: string, value: any) => {
    configsManager.set(section as any, value);
  };

  const getPluginConfig = (pluginId: string) => {
    return configsManager.getPluginConfig(pluginId);
  };

  const updatePluginConfig = (pluginId: string, value: any) => {
    configsManager.registerPluginConfig(pluginId, value);
  };

  const value: ConfigsContextValue = {
    configs: configsManager,
    ui,
    theme,
    viewport,
    plugins,
    updateConfig,
    getPluginConfig,
    updatePluginConfig,
  };

  return (
    <ConfigsContext.Provider value={value}>
      {children}
    </ConfigsContext.Provider>
  );
};