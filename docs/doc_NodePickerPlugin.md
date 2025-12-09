Node Picker Plugin Documentation

Plugin ID: node-picker
Class: NodePickerPlugin

The Node Picker Plugin provides a context-sensitive menu for quickly adding new nodes to the canvas. It is triggered via a right-click or a keyboard shortcut, appearing at the cursor's location or the screen center.

Configuration

The Node Picker is part of the builtIn plugins list. It does not currently require a dedicated entry in the ui config object, but it relies on theme settings for styling.

Interaction Triggers

Context Menu (Right-Click):

Trigger: Right-clicking anywhere on the CanvasContainer.

Event: Listens for canvas:contextmenu.

Behavior: Opens the picker at the exact mouse coordinates. The new node will be placed at the corresponding world coordinates.

Keyboard Shortcut:

Trigger: Ctrl + Shift + N (or Cmd + Shift + N on macOS).

Behavior: Opens the picker at the center of the screen.

Theming

The Node Picker inherits its look and feel strictly from the global theme configuration to ensure consistency.

Background: theme.colors.surface (Default: #1e293b)

Border: theme.colors.toolbar.border

Text: theme.colors.text.primary

Shadow: theme.shadows.xl

Events

Emits: node:created when a user selects a node type.

Listens: canvas:contextmenu to know when to appear.
