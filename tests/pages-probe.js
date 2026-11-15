// Browser-only acceptance helper, injected by scripts/verify-pages.mjs.
// Observes rendered pixels and sends normal keyboard events. Never imported by the game.
export function installPixelProbe(templates) {
  const canvas = document.querySelector('#game canvas');
  if (!canvas || !document.querySelector('#status').hidden) throw new Error('Game is not ready');
  const copy = document.createElement('canvas');
  copy.width = canvas.width; copy.height = canvas.height;
  const context = copy.getContext('2d', { willReadFrequently: true });
  const bright = [211, 223, 235]; // Original knight's pale steel; used only to find candidates.
  const frames = templates.map(t => ({ ...t, anchor: t.pixels.find(p => p[2] === bright[0] && p[3] === bright[1] && p[4] === bright[2]) }));
  function read() {
    context.clearRect(0, 0, copy.width, copy.height);
    context.drawImage(canvas, 0, 0);
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    for (let p = 0; p < pixels.length; p += 4) {
      if (pixels[p] !== bright[0] || pixels[p + 1] !== bright[1] || pixels[p + 2] !== bright[2] || pixels[p + 3] !== 255) continue;
      const x = p / 4 % copy.width, y = Math.floor(p / 4 / copy.width);
      for (const frame of frames) {
        const left = x - frame.anchor[0], top = y - frame.anchor[1];
        if (left < 0 || top < 0 || left + 16 > copy.width || top + 16 > copy.height) continue;
        if (frame.pixels.every(([dx, dy, r, g, b]) => {
          const index = ((top + dy) * copy.width + left + dx) * 4;
          return pixels[index] === r && pixels[index + 1] === g && pixels[index + 2] === b && pixels[index + 3] === 255;
        })) return { x: left + 8 - 160, y: top + 12 - 96, direction: frame.direction, pose: frame.pose };
      }
    }
    throw new Error('Rendered knight does not match any expected frame');
  }
  const keys = { W: 87, A: 65, S: 83, D: 68, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 };
  let held = [];
  function event(type, key) {
    const e = new KeyboardEvent(type, { key, code: key.length === 1 ? `Key${key}` : key, keyCode: keys[key], which: keys[key], bubbles: true, cancelable: true });
    window.dispatchEvent(e); return e.defaultPrevented;
  }
  function release() { for (const key of held) event('keyup', key); held = []; }
  const sample = () => new Promise((resolve, reject) => requestAnimationFrame(() => {
    try { resolve(read()); } catch (e) { reject(e); }
  }));
  async function move(names, duration) {
    const before = await sample();
    held = names;
    const prevented = names.map(key => event('keydown', key));
    const start = performance.now(), samples = [];
    try {
      while (performance.now() - start < duration) {
        const state = await sample(); samples.push({ elapsed: performance.now() - start, ...state });
      }
      return { before, after: samples.at(-1), elapsed: performance.now() - start, prevented,
        frames: [...new Set(samples.map(s => `${s.direction}:${s.pose}`))], samples };
    } finally { release(); }
  }
  window.__dungeonAcceptance = { sample, move, release };
  return { url: location.href, native: [canvas.width, canvas.height], templates: frames.length };
}
