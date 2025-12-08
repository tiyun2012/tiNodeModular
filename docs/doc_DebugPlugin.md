Debug Plugin
Displays technical information like coordinates and FPS for development purposes.

Configuration Location: ui.debug object in your config.

Configuration Options
TypeScript

interface DebugConfig {
  enabled: boolean;
  showCoordinates: boolean;   // Show X/Y values
  showFPS: boolean;           // Show Frames Per Second counter
  coordinateFormat: 'screen' | 'world' | 'both'; // Which coordinate space to display
}
How to Customize
Coordinate Format:

'screen': Shows pixel coordinates relative to the browser window (good for UI debugging).

'world': Shows coordinates in the infinite canvas space (good for game logic/placement).

'both': Shows both for comparison.