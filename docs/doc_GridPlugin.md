
# Grid Plugin Documentation

**Plugin ID:** `grid`  
**Class:** `GridPlugin`

The Grid Plugin renders a background grid that scales and translates with the viewport. It supports a primary grid for fine details and an optional secondary "large" grid for broader context. It is optimized to fade out at low zoom levels to prevent visual aliasing.

## Configuration

The grid is configured via the `ui.grid` object in your main configuration passed to `ConfigsProvider`.

### Interface

```typescript
interface GridConfig {
  enabled: boolean;           // Default: true
  size: number;               // Size of a small grid square in pixels (Default: 20)
  color: string;              // CSS color string for grid lines (Default: '#334155')
  fadeBelowZoom: number;      // Zoom level where opacity starts fading (Default: 0.5)
  opacity: number;            // Maximum opacity of the grid lines (0 to 1)
  showLargeGrid: boolean;     // Enable the secondary, larger grid (Default: true)
  largeGridMultiplier: number;// How many small squares fit in a large square (Default: 10)
}
Usage Example
TypeScript

const customConfig = {
  ui: {
    grid: {
      enabled: true,
      size: 40,                // Larger grid squares
      color: 'rgba(255, 0, 0, 0.2)', // Red tint
      showLargeGrid: false     // Disable the secondary grid
    }
  }
};
Theming
If no specific color is provided in the ui config, the plugin falls back to the theme.

Theme Key: theme.colors.grid

Default: #334155

Customization Guide
Adjusting Visibility
If the grid looks too "busy" when zoomed out:

Increase fadeBelowZoom (e.g., to 0.8). This causes the grid to disappear sooner as you zoom out.

Decrease opacity (e.g., to 0.5) for a subtler look.

creating a "Graph Paper" Look
Set largeGridMultiplier to 5 or 10 and ensure showLargeGrid is true. Use a light background color in your theme and a dark, semi-transparent color for the grid lines.