Debug Plugin Documentation

```markdown
# Debug Plugin Documentation

**Plugin ID:** `debug`  
**Class:** `DebugPlugin`

The Debug Plugin provides an overlay useful for development and performance monitoring. It can display current coordinates, frames per second (FPS), and system status instructions.

## Configuration

The debug overlay is configured via the `ui.debug` object.

### Interface

```typescript
interface DebugConfig {
  enabled: boolean;           // Default: true
  showCoordinates: boolean;   // Show X/Y position
  showFPS: boolean;           // Show performance counter
  coordinateFormat: 'screen' | 'world' | 'both';
}
Coordinate Formats
screen: Displays the raw X/Y pixel values of the viewport's top-left corner relative to the origin. Useful for debugging panning logic.

world: Displays the coordinate of the viewport's center mapped to the infinite canvas space. Useful for gameplay or content placement.

both: Displays both values side-by-side.

Usage Example
TypeScript

const customConfig = {
  ui: {
    debug: {
      enabled: true,
      showCoordinates: true,
      coordinateFormat: 'world',
      showFPS: true // Enable performance monitoring
    }
  }
};
Theming
The debug overlay inherits basic text and border colors from the theme:

Text: theme.colors.text.secondary

Border: theme.colors.toolbar.border

Background: Hardcoded to semi-transparent black (rgba(0, 0, 0, 0.3)) to ensuring readability on all themes.