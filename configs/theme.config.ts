// configs/theme.config.ts
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  muted: string;
  disabled: string;
  inverse: string;
}

export interface NodeColors {
  background: string;
  border: string;
  selected: string;
  hover: string;
  text: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colors: {
    palette: ColorPalette;
    text: TextColors;
    node: NodeColors;
    grid: string;
    minimap: {
      background: string;
      border: string;
      indicator: string;
    };
    toolbar: {
      background: string;
      border: string;
      button: {
        default: string;
        hover: string;
        active: string;
      };
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'dark',
  colors: {
    palette: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981',
      background: '#0f172a',
      surface: '#1e293b',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#06b6d4',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      muted: '#64748b',
      disabled: '#475569',
      inverse: '#0f172a',
    },
    node: {
      background: 'rgba(30, 41, 59, 0.9)',
      border: '#475569',
      selected: '#3b82f6',
      hover: '#60a5fa',
      text: '#f1f5f9',
    },
    grid: '#334155',
    minimap: {
      background: 'rgba(30, 41, 59, 0.95)',
      border: '#475569',
      indicator: 'rgba(255, 255, 255, 0.8)',
    },
    toolbar: {
      background: 'rgba(30, 41, 59, 0.95)',
      border: '#475569',
      button: {
        default: 'rgba(255, 255, 255, 0.1)',
        hover: 'rgba(255, 255, 255, 0.15)',
        active: 'rgba(255, 255, 255, 0.2)',
      },
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};