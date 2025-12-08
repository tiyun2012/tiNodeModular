// plugins/node-layer-plugin.tsx
import React from 'react';
import { BasePlugin } from './base-plugin';
import { NodeLayer } from '@components/built-in/NodeLayer';

export class NodeLayerPlugin extends BasePlugin {
  id = 'node-layer';
  name = 'Node Layer Plugin';
  version = '1.0.0';

  // ✅ FIX: Changed return type to React.ReactNode | null
  render(): React.ReactNode | null {
    if (!this.engine || !this.isEnabled()) return null;

    const viewport = this.engine.getViewport();
    const theme = this.configs.get('theme');

    return (
      <NodeLayer
        key="node-layer"
        engine={this.engine}
        viewport={viewport}
        theme={theme}
      />
    );
  }
}