import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  pluginId: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PluginErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[PluginErrorBoundary] Error in plugin "${this.props.pluginId}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render a fallback UI or return null to simply hide the broken plugin
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, padding: 10, color: 'red', zIndex: 9999, pointerEvents: 'none' }}>
          ⚠️ Plugin "{this.props.pluginId}" crashed.
        </div>
      );
    }

    return this.props.children;
  }
}