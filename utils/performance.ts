// utils/performance.ts

// FPS tracking
export class FPSTracker {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private updateInterval = 1000; // Update FPS every second
  private lastUpdateTime = 0;
  
  constructor(private onUpdate?: (fps: number) => void) {
    this.lastTime = performance.now();
    this.lastUpdateTime = this.lastTime;
    this.startTracking();
  }
  
  private startTracking(): void {
    const update = () => {
      const currentTime = performance.now();
      this.frameCount++;
      
      // Update FPS every second
      if (currentTime >= this.lastUpdateTime + this.updateInterval) {
        this.fps = Math.round(
          (this.frameCount * 1000) / (currentTime - this.lastUpdateTime)
        );
        this.frameCount = 0;
        this.lastUpdateTime = currentTime;
        
        if (this.onUpdate) {
          this.onUpdate(this.fps);
        }
      }
      
      this.lastTime = currentTime;
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
  
  getFPS(): number {
    return this.fps;
  }
  
  dispose(): void {
    // Cleanup if needed
  }
}

// Memory monitoring
export class MemoryMonitor {
  private updateInterval = 5000; // Update every 5 seconds
  private intervalId: number | null = null;
  
  constructor(private onUpdate?: (memory: MemoryInfo) => void) {
    if ('memory' in performance) {
      this.startMonitoring();
    }
  }
  
  private startMonitoring(): void {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      if (this.onUpdate) {
        this.onUpdate(memoryInfo);
      }
    }, this.updateInterval);
  }
  
  getMemoryInfo(): MemoryInfo {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    };
  }
  
  dispose(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Performance measurement
export const measurePerformance = <T>(
  fn: () => T,
  name?: string
): { result: T; duration: number; memory?: MemoryInfo } => {
  const startTime = performance.now();
  
  // Get initial memory if available
  let initialMemory: MemoryInfo | undefined;
  if ('memory' in performance) {
    initialMemory = (performance as any).memory;
  }
  
  const result = fn();
  const endTime = performance.now();
  
  // Get final memory if available
  let finalMemory: MemoryInfo | undefined;
  if ('memory' in performance) {
    finalMemory = (performance as any).memory;
  }
  
  const duration = endTime - startTime;
  
  if (name) {
    console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
  }
  
  return {
    result,
    duration,
    memory: finalMemory,
  };
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Batch updates
export class BatchUpdate {
  private updates: Array<() => void> = [];
  private scheduled = false;
  
  schedule(update: () => void): void {
    this.updates.push(update);
    
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }
  
  private flush(): void {
    const updates = [...this.updates];
    this.updates = [];
    this.scheduled = false;
    
    updates.forEach(update => update());
  }
  
  cancel(): void {
    this.updates = [];
    this.scheduled = false;
  }
}

// Frame scheduler
export class FrameScheduler {
  private callbacks: Array<{
    id: string;
    callback: () => void;
    priority: number;
  }> = [];
  private animationFrameId: number | null = null;
  
  schedule(id: string, callback: () => void, priority: number = 0): void {
    // Remove existing callback with same id
    this.callbacks = this.callbacks.filter(cb => cb.id !== id);
    
    // Add new callback
    this.callbacks.push({ id, callback, priority });
    
    // Sort by priority (higher priority first)
    this.callbacks.sort((a, b) => b.priority - a.priority);
    
    // Schedule animation frame if not already scheduled
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => this.execute());
    }
  }
  
  cancel(id: string): void {
    this.callbacks = this.callbacks.filter(cb => cb.id !== id);
    
    // Cancel animation frame if no callbacks left
    if (this.callbacks.length === 0 && this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  private execute(): void {
    const callbacks = [...this.callbacks];
    this.callbacks = [];
    this.animationFrameId = null;
    
    callbacks.forEach(({ callback }) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in frame scheduler callback:', error);
      }
    });
  }
  
  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.callbacks = [];
  }
}

// Memory management
export class MemoryManager {
  private cache = new Map<string, any>();
  private maxCacheSize = 100;
  
  set(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry (first key in Map)
      const firstKey = this.cache.keys().next().value;
      // ✅ FIX: Check for undefined before deleting
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }
  
  get<T = any>(key: string): T | undefined {
    return this.cache.get(key);
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getSize(): number {
    return this.cache.size;
  }
  
  setMaxSize(size: number): void {
    this.maxCacheSize = size;
    
    // Trim cache if needed
    while (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      // ✅ FIX: Check for undefined before deleting
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      } else {
        break; // Should not happen if size > 0, but good for safety
      }
    }
  }
}

// Performance profiling
export class PerformanceProfiler {
  private marks = new Map<string, number>();
  private measures = new Map<string, number[]>();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark: string): void {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (start !== undefined && end !== undefined) {
      const duration = end - start;
      const existing = this.measures.get(name) || [];
      existing.push(duration);
      this.measures.set(name, existing);
      
      // Keep only last 100 measurements
      if (existing.length > 100) {
        this.measures.set(name, existing.slice(-100));
      }
    }
  }
  
  getAverage(name: string): number {
    const measurements = this.measures.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }
  
  getStats(name: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } {
    const measurements = this.measures.get(name) || [];
    
    if (measurements.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return {
      average: sum / measurements.length,
      min,
      max,
      count: measurements.length,
    };
  }
  
  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Resource loading performance
export const measureResourceLoad = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const img = new Image();
    img.onload = () => {
      const duration = performance.now() - startTime;
      resolve(duration);
    };
    img.onerror = () => {
      const duration = performance.now() - startTime;
      resolve(duration);
    };
    img.src = url;
  });
};

// Render performance monitoring
export class RenderMonitor {
  private frameTimes: number[] = [];
  private maxSamples = 60; // Keep last 60 frames (about 1 second at 60fps)
  private lastFrameTime = 0;
  
  start(): () => void {
    const update = () => {
      const now = performance.now();
      
      if (this.lastFrameTime > 0) {
        const frameTime = now - this.lastFrameTime;
        this.frameTimes.push(frameTime);
        
        // Keep only maxSamples
        if (this.frameTimes.length > this.maxSamples) {
          this.frameTimes.shift();
        }
      }
      
      this.lastFrameTime = now;
      requestAnimationFrame(update);
    };
    
    this.lastFrameTime = performance.now();
    requestAnimationFrame(update);
    
    // Return stop function
    return () => {
      this.frameTimes = [];
      this.lastFrameTime = 0;
    };
  }
  
  getStats(): {
    fps: number;
    frameTime: number;
    jankyFrames: number;
  } {
    if (this.frameTimes.length === 0) {
      return { fps: 0, frameTime: 0, jankyFrames: 0 };
    }
    
    const totalFrameTime = this.frameTimes.reduce((a, b) => a + b, 0);
    const averageFrameTime = totalFrameTime / this.frameTimes.length;
    const fps = 1000 / averageFrameTime;
    
    // Count janky frames (frames taking more than 50ms)
    const jankyFrames = this.frameTimes.filter(time => time > 50).length;
    
    return {
      fps: Math.round(fps),
      frameTime: Math.round(averageFrameTime * 100) / 100,
      jankyFrames,
    };
  }
}