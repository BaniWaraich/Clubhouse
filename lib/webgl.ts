/**
 * WebGL feature detection.
 *
 * Single source of truth for "can this device run our canvases?" — used before
 * mounting any WebGL so devices without it get the designed poster / graded
 * backdrop rather than a crash. Must run client-side only (touches `document`
 * and `window`).
 */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}
