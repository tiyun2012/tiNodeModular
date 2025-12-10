// App.tsx
import React from 'react';
import { CanvasProvider } from '@contexts/canvas-context';
import { ConfigsProvider } from '@contexts/configs-context';
import { CanvasContainer } from '@components/canvas/CanvasContainer';

const App: React.FC = () => {
  // Custom configuration
  const customConfigs = {
    viewport: {
      initial: {
        zoom: 1.13, // Matches the 113% in your image
      },
      constraints: {
        maxZoom: 10,
      },
    },
    ui: {
      toolbar: {
        position: 'floating' as const,
        // ✅ FULL DEFINITION: Zoom buttons + Save/Load buttons
        items: [
          {
            id: 'zoom-in',
            type: 'button',
            label: 'Zoom In',
            icon: '＋',
            action: 'ZOOM_IN',
            style: {
              fontSize: '16px',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              margin: '6px auto 2px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            },
          },
          {
            id: 'zoom-level',
            type: 'info',
            label: 'Reset Zoom',
            action: 'RESET',
            style: {
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '4px 0',
              color: '#94a3b8',
              textAlign: 'center',
              margin: '2px 0',
              cursor: 'pointer',
              userSelect: 'none',
            },
          },
          {
            id: 'zoom-out',
            type: 'button',
            label: 'Zoom Out',
            icon: '－',
            action: 'ZOOM_OUT',
            style: {
              fontSize: '16px',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              margin: '2px auto 6px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            },
          },
          // ✅ ADDED SAVE BUTTON
          {
            id: 'save',
            type: 'button',
            label: 'Save Workflow',
            icon: '💾',
            action: 'SAVE_WORKFLOW',
            style: {
              fontSize: '14px',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              margin: '6px auto 2px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            },
          },
          // ✅ ADDED LOAD BUTTON
          {
            id: 'load',
            type: 'button',
            label: 'Load Workflow',
            icon: '📂',
            action: 'LOAD_WORKFLOW',
            style: {
              fontSize: '14px',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              margin: '2px auto 6px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            },
          },
        ],
      },
      debug: {
        coordinateFormat: 'screen', 
      },
    },
    theme: {
      mode: 'dark',
      colors: {
        background: '#0f172a',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
        },
      },
    },
  };

  return (
    <ConfigsProvider initialConfigs={customConfigs}>
      <CanvasProvider initialConfigs={customConfigs}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: customConfigs.theme.colors.background,
          }}
        >
          <CanvasContainer />
        </div>
      </CanvasProvider>
    </ConfigsProvider>
  );
};

export default App;
