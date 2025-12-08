Toolbar Plugin Documentation

```markdown
# Toolbar Plugin Documentation

**Plugin ID:** `toolbar`  
**Class:** `ToolbarPlugin`

The Toolbar Plugin provides the primary interface for viewport manipulation, such as zooming in, zooming out, and resetting the view. It supports fixed positioning (corners) or a floating mode that allows the user to drag the toolbar around the screen.

## Configuration

The toolbar is configured via the `ui.toolbar` object.

### Interface

```typescript
interface ToolbarConfig {
  enabled: boolean;           // Default: true
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'floating';
  width: number;              // Width in pixels (Default: 38)
  backgroundColor: string;    // CSS color (optional override)
  borderRadius: number;       // Radius in pixels (Default: 19)
  items: ToolbarItem[];       // Array of controls to render
}

interface ToolbarItem {
  id: string;
  type: 'button' | 'info';    // 'button' is clickable, 'info' is static text
  label: string;              // Tooltip or display text
  icon?: string;              // Text/Emoji/SVG character to display
  action?: 'ZOOM_IN' | 'ZOOM_OUT' | 'RESET'; // Action ID
  style?: React.CSSProperties;// Inline styles for specific items
}
Usage Example
To create a floating toolbar with custom icons:

TypeScript

const customConfig = {
  ui: {
    toolbar: {
      position: 'floating',
      width: 50,
      items: [
        { 
          id: 'in', 
          type: 'button', 
          label: 'Zoom In', 
          icon: '🔍+', 
          action: 'ZOOM_IN' 
        },
        { 
          id: 'out', 
          type: 'button', 
          label: 'Zoom Out', 
          icon: '🔍-', 
          action: 'ZOOM_OUT' 
        }
      ]
    }
  }
};
Theming
Global styles for the toolbar can be set in the theme configuration.

Background: theme.colors.toolbar.background

Border: theme.colors.toolbar.border

Buttons: theme.colors.toolbar.button (states: default, hover, active)

Extension
To add new actions (e.g., "Fit View"):

Add the Item: Add a new item to the items array with a custom action string (e.g., FIT_VIEW).

Handle the Event: In plugins/toolbar-plugin.tsx, update the handleToolbarAction switch statement to handle your new case.