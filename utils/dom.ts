// utils/dom.ts

// Element positioning
export const getElementPosition = (element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  };
};

export const getElementCenter = (element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

export const getViewportSize = (): { width: number; height: number } => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const getScrollPosition = (): { x: number; y: number } => {
  return {
    x: window.scrollX,
    y: window.scrollY,
  };
};

// Mouse/pointer utilities
export const getMousePosition = (event: MouseEvent): { x: number; y: number } => {
  return {
    x: event.clientX,
    y: event.clientY,
  };
};

export const getTouchPosition = (event: TouchEvent): { x: number; y: number } => {
  if (event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  return { x: 0, y: 0 };
};

export const getPointerPosition = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
  if ('touches' in event) {
    return getTouchPosition(event);
  }
  return getMousePosition(event);
};

// Element utilities
export const isElementVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportSize();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  );
};

export const isElementInViewport = (element: HTMLElement, threshold: number = 0): boolean => {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportSize();
  
  return (
    rect.top >= 0 - threshold &&
    rect.left >= 0 - threshold &&
    rect.bottom <= viewport.height + threshold &&
    rect.right <= viewport.width + threshold
  );
};

export const getElementVisibility = (element: HTMLElement): number => {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportSize();
  
  // Calculate visible area
  const visibleWidth = Math.min(rect.right, viewport.width) - Math.max(rect.left, 0);
  const visibleHeight = Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0);
  
  if (visibleWidth <= 0 || visibleHeight <= 0) return 0;
  
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = rect.width * rect.height;
  
  return visibleArea / totalArea;
};

// CSS utilities
export const setStyles = (element: HTMLElement, styles: Record<string, string>): void => {
  Object.assign(element.style, styles);
};

export const addClass = (element: HTMLElement, className: string): void => {
  element.classList.add(className);
};

export const removeClass = (element: HTMLElement, className: string): void => {
  element.classList.remove(className);
};

export const toggleClass = (element: HTMLElement, className: string, force?: boolean): void => {
  element.classList.toggle(className, force);
};

export const hasClass = (element: HTMLElement, className: string): boolean => {
  return element.classList.contains(className);
};

// Event utilities
export const addEventListener = (
  element: HTMLElement | Window | Document,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void => {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
};

export const preventDefault = (event: Event): void => {
  event.preventDefault();
};

export const stopPropagation = (event: Event): void => {
  event.stopPropagation();
};

export const stopImmediatePropagation = (event: Event): void => {
  event.stopImmediatePropagation();
};

// Animation utilities
export const requestAnimationFramePromise = (): Promise<void> => {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
};

export const nextFrame = (): Promise<void> => {
  return requestAnimationFramePromise();
};

export const waitForAnimationFrame = async (frames: number = 1): Promise<void> => {
  for (let i = 0; i < frames; i++) {
    await nextFrame();
  }
};

// Scroll utilities
export const scrollToElement = (
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center', inline: 'center' }
): void => {
  element.scrollIntoView(options);
};

export const scrollToPosition = (x: number, y: number, behavior: ScrollBehavior = 'smooth'): void => {
  window.scrollTo({ left: x, top: y, behavior });
};

// Focus utilities
export const focusElement = (element: HTMLElement): void => {
  element.focus({ preventScroll: true });
};

export const blurElement = (element: HTMLElement): void => {
  element.blur();
};

// Measurement utilities
export const measureText = (
  text: string,
  font: string = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
): { width: number; height: number } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return { width: 0, height: 0 };
  
  context.font = font;
  const metrics = context.measureText(text);
  
  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  };
};

// Clipboard utilities
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      return false;
    }
  }
};

export const pasteFromClipboard = async (): Promise<string> => {
  try {
    return await navigator.clipboard.readText();
  } catch (err) {
    console.error('Failed to read from clipboard:', err);
    return '';
  }
};

// Drag and drop utilities
export const createDragImage = (element: HTMLElement, x: number = 0, y: number = 0): void => {
  // This sets the drag image for HTML5 drag and drop
  if ('setDragImage' in DataTransfer.prototype) {
    // The actual implementation would be in the dragstart event handler
  }
};

// Keyboard utilities
export const isKeyPressed = (key: string): boolean => {
  const pressedKeys = new Set<string>();
  
  document.addEventListener('keydown', (e) => {
    pressedKeys.add(e.key.toLowerCase());
  });
  
  document.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key.toLowerCase());
  });
  
  return pressedKeys.has(key.toLowerCase());
};

export const createKeyCombo = (keys: string[]): string => {
  return keys
    .map(key => key.toLowerCase())
    .sort()
    .join('+');
};

// Selection utilities
export const getSelectedText = (): string => {
  return window.getSelection()?.toString() || '';
};

export const clearSelection = (): void => {
  window.getSelection()?.removeAllRanges();
};

// URL utilities
export const getQueryParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export const setQueryParam = (param: string, value: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(param, value);
  window.history.replaceState({}, '', url.toString());
};

// Device detection
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isDesktop = (): boolean => {
  return !isMobile() && !isTouchDevice();
};

// Performance monitoring
export const measureDOMOperation = <T>(operation: () => T): { result: T; duration: number } => {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  return { result, duration };
};