1. Grid Plugin
The Grid plugin renders a background grid that scales with the viewport. It supports a primary grid and an optional larger secondary grid.

Configuration Location: ui.grid object in your config.

Theme Location: theme.colors.grid (default fallback).

Configuration Options
TypeScript

interface GridConfig {
  enabled: boolean;           // Turn the grid on/off
  size: number;               // Size of a grid square in world pixels (default: 20)
  color: string;              // CSS color for grid lines (e.g., "#334155")
  fadeBelowZoom: number;      // Zoom level where grid starts fading out (default: 0.5)
  opacity: number;            // Max opacity of the grid lines (0 to 1)
  showLargeGrid: boolean;     // Enable every Nth line being darker/thicker
  largeGridMultiplier: number;// How many small squares make one large square (default: 10)
}
How to Customize
You can modify the ui.grid section in initialConfigs passed to ConfigsProvider.

Change Grid Density: Lower size for a denser graph paper look, or increase it for a spacious layout.

Performance Tuning: If rendering is slow on low zoom, increase fadeBelowZoom to hide the grid earlier.