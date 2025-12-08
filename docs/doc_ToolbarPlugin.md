Toolbar Plugin
The Toolbar provides zoom controls and viewport reset functionality. It can be positioned in corners or be a floating, draggable element.

Configuration Location: ui.toolbar object in your config.

Theme Location: theme.colors.toolbar.

Configuration Options
TypeScript

interface ToolbarConfig {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'floating';
  width: number;              // Width of the toolbar in pixels
  backgroundColor: string;    // Override theme background (optional)
  borderRadius: number;       // Border radius in pixels
  items: ToolbarItem[];       // Array of buttons or info displays
}

interface ToolbarItem {
  id: string;
  type: 'button' | 'info';    // 'button' is clickable, 'info' is text
  label: string;              // Hover text or display text
  icon?: string;              // Character or SVG path for the button
  action?: 'ZOOM_IN' | 'ZOOM_OUT' | 'RESET'; // Action to trigger
  style?: React.CSSProperties;// Custom CSS for this specific item
}
How to Customize
Add New Buttons: You can add custom buttons to the items array. Currently, the ToolbarPlugin handles specific actions hardcoded in handleToolbarAction. To add custom logic (e.g., "Fit to Screen"), you would need to extend ToolbarPlugin.ts to listen for new action strings.

Styling: Use theme.colors.toolbar.button to change default, hover, and active states globally.