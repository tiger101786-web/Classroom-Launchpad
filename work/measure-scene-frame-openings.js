// Read-only measurement of existing frame alpha; prints CSS clipping geometry.
// PNG artwork is never modified. Run with the workspace Playwright runtime.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const ids = ['blossom', 'guardian', 'woodland', 'orbit', 'treasure', 'royal', 'phoenix', 'butterfly', 'frost-dragon', 'clockwork', 'library', 'champion'];
    const rules = [];
    for (const id of ids) {
      const source = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '..', 'assets', `scene-frame-${id}.png`)).toString('base64');
      const points = await page.evaluate(async source => {
        const image = new Image(); image.src = source; await image.decode();
        const size = 1024;
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, size, size);
        const pixels = ctx.getImageData(0, 0, size, size).data;
        return Array.from({ length: 360 }, (_, degree) => {
          const angle = degree * Math.PI / 180;
          let radius = size * .25;
          for (; radius < size * .49; radius += .5) {
            const x = Math.round(size / 2 + radius * Math.cos(angle));
            const y = Math.round(size / 2 + radius * Math.sin(angle));
            if (pixels[(y * size + x) * 4 + 3] >= 220) break;
          }
          if (radius >= size * .49) throw new Error(`Frame opening is not enclosed at ${degree} degrees`);
          // Overlap the opaque inner lip slightly, avoiding antialiasing seams.
          radius += 1;
          return [50 + radius / size * 108 * Math.cos(angle), 50 + radius / size * 108 * Math.sin(angle)].map(n => n.toFixed(2) + '%').join(' ');
        });
      }, source);
      rules.push(`:is(.launch-scene-stage, .frame-swatch):has(> [data-scene-frame="${id}"]) { --scene-aperture: polygon(${points.join(', ')}); }`);
    }
    console.log('/* Measured inner openings of the unmodified PNG frames, at the shared 108% overlay size. */\n' + rules.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
