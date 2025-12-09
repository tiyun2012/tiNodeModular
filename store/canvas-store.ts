// File: D:\dev\tiNodeModular\store\canvas-store.ts
import { create } from 'zustand';
import { CanvasNode, Viewport } from '@types';
import { CanvasEngine } from '@core/canvas-engine';

interface CanvasState {
  nodes: CanvasNode[];
  viewport: Viewport;
  draggedNodeId: string | null;
  setNodes: (nodes: CanvasNode[]) => void;
  setViewport: (viewport: Viewport) => void;
  setDraggedNodeId: (id: string | null) => void;
  syncWithEngine: (engine: CanvasEngine) => () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  draggedNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  setViewport: (viewport) => set({ viewport }),
  setDraggedNodeId: (draggedNodeId) => set({ draggedNodeId }),

  syncWithEngine: (engine: CanvasEngine) => {
    // Initial sync
    set({ 
      nodes: engine.getNodes(),
      viewport: engine.getViewport(),
      draggedNodeId: engine.getDraggedNodeId()
    });

    const eventBus = engine.getEventBus();

    // Full syncs only for structural changes
    const unsubNodes = eventBus.on('node:updated', () => set({ nodes: engine.getNodes() }));
    const unsubAdd = eventBus.on('node:added', () => set({ nodes: engine.getNodes() }));
    const unsubRemove = eventBus.on('node:removed', () => set({ nodes: engine.getNodes() }));
    const unsubViewport = eventBus.on('viewport:changed', (vp) => set({ viewport: vp }));
    
    // ✅ FIX: Do NOT sync the entire node array while dragging.
    // Only update the drag ID. The visual movement is handled efficiently by NodeLayer.
    const unsubDrag = eventBus.on('node:dragged', (data) => {
        set({ draggedNodeId: data.nodeId });
    });

    return () => {
      unsubNodes(); unsubAdd(); unsubRemove(); unsubViewport(); unsubDrag();
    };
  }
}));