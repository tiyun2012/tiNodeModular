import { PluginRegistry } from './registry';
import { GridPlugin } from './grid-plugin';
import { ToolbarPlugin } from './toolbar-plugin';
import { MinimapPlugin } from './minimap-plugin';
import { DebugPlugin } from './debug-plugin';
import { NodeLayerPlugin } from './node-layer-plugin';
import { NodePickerPlugin } from './node-picker-plugin';

// Register all built-in plugins
export const registerBuiltInPlugins = () => {
  PluginRegistry.register('grid', GridPlugin);
  PluginRegistry.register('toolbar', ToolbarPlugin);
  PluginRegistry.register('minimap', MinimapPlugin);
  PluginRegistry.register('debug', DebugPlugin);
  PluginRegistry.register('node-layer', NodeLayerPlugin);
  PluginRegistry.register('node-picker', NodePickerPlugin);
};

export { PluginRegistry };