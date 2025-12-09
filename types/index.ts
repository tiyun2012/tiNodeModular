// types/index.ts
import React from 'react';
import type { CanvasEngine } from '@core/canvas-engine';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface ViewportConstraints {
  minZoom: number;
  maxZoom: number;
  worldSize: number;
  // ✅ FIX: Added this property so CoordinateSystem can access it
  constrainToWorld?: boolean;
}

export interface CanvasNode {
  id: string;
  type: 'text' | 'ai-generated' | 'image' | 'shape';
  content: string;
  position: Position;
  size: Size;
  metadata?: Record<string, any>;
}

export interface AppState {
  nodes: CanvasNode[];
}

// Plugin System Types
export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  priority: number;
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface CanvasPlugin {
  id: string;
  name: string;
  version: string;
  activate: (engine: CanvasEngine) => void;
  deactivate: () => void;
  getConfig?: () => Record<string, any>;
}

// Toolbar Types
export type ToolbarAction = 'ZOOM_IN' | 'ZOOM_OUT' | 'RESET' | 'FIT_VIEW' | 'CENTER';
export type ToolbarItemType = 'button' | 'info' | 'separator' | 'dropdown';

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  label: string;
  icon?: string;
  action?: ToolbarAction;
  style?: React.CSSProperties;
  visible?: boolean;
  disabled?: boolean;
}

export interface ToolbarConfig {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'floating';
  width: number;
  backgroundColor: string;
  borderRadius: number;
  items: ToolbarItem[];
}

// Event System Types
export type CanvasEvent =
  | 'viewport:changed'
  | 'viewport:zoom'
  | 'viewport:pan'
  | 'node:added'
  | 'node:removed'
  | 'node:selected'
  | 'node:updated'
  | 'node:dragged'
  | 'toolbar:action'
  | 'minimap:navigate'
  | 'config:changed'
  | 'plugin:activated'
  | 'plugin:deactivated'
  |  'node:created'
  | 'plugin:render-requested'
  |'canvas:contextmenu' ;

export interface EventPayload {
  event: CanvasEvent;
  data: any;
  timestamp: number;
}

// Component Registry Types
export interface ComponentRegistration {
  id: string;
  component: React.ComponentType<any>;
  priority: number;
  enabled: boolean;
  config?: Record<string, any>;
}