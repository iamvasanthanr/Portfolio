/**
 * main.ts
 * Entry point. Boots the 3D game, or (if the device cannot do WebGL,
 * or the user prefers reduced motion) sends them to the classic page.
 */

import { Game } from './core/Game';

const loader = document.getElementById('loader')!;
const loaderSub = document.getElementById('loaderSub')!;

function fallbackToClassic(reason: string) {
  loaderSub.textContent = reason + ' Opening the classic page...';
  setTimeout(() => { location.href = 'classic.html'; }, 900);
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  fallbackToClassic('Reduced motion is on.');
} else if (!webglAvailable()) {
  fallbackToClassic('This device has no 3D support.');
} else {
  try {
    const app = document.getElementById('app')!;
    const game = new Game(app);
    game.start();
    // let the first frame paint, then reveal
    requestAnimationFrame(() => requestAnimationFrame(() => {
      loader.classList.add('hide');
      setTimeout(() => (loader.style.display = 'none'), 500);
    }));
  } catch (err) {
    console.error(err);
    fallbackToClassic('Something went wrong starting the 3D world.');
  }
}
