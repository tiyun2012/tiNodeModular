import { ConfigsManager } from '@configs';
import { BasePlugin } from './base-plugin';

// Type for the plugin class constructor
type PluginConstructor = new (configs: ConfigsManager) => BasePlugin;

// Map to store registered plugin classes
const registry = new Map<string, PluginConstructor>();

export const PluginRegistry = {
  // Register a plugin class
  register(id: string, PluginClass: PluginConstructor) {
    registry.set(id, PluginClass);
  },

  // Create an instance of a plugin by ID
  create(id: string, configs: ConfigsManager): BasePlugin | null {
    const PluginClass = registry.get(id);
    if (!PluginClass) {
      console.warn(`[PluginRegistry] No plugin registered with ID: ${id}`);
      return null;
    }
    return new PluginClass(configs);
  },

  // Helper to check if a plugin exists
  has(id: string): boolean {
    return registry.has(id);
  }
};