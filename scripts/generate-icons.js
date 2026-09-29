import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function drawMosqueIcon(width, height, isMaskable = false) {
  const png = new PNG({ width, height });
  const emeraldDark = [6, 95, 70, 255]; // #065f46
  const emeraldMid = [16, 185, 129, 255]; // #10b981
  const gold = [245, 158, 11, 255]; // #f59e0b
  const white = [255, 255, 255, 255];

  const safeMargin = isMaskable ? 0.15 : 0.05;
  const cx = width / 2;
  const cy = height / 2;
  const radius = (Math.min(width, height) / 2) * (1 - safeMargin);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable || dist <= radius) {
        // Gradient background
        const t = (y / height);
        const r = Math.round(emeraldDark[0] * (1 - t * 0.4) + 4 * t);
        const g = Math.round(emeraldDark[1] * (1 - t * 0.3) + 70 * t);
        const b = Math.round(emeraldDark[2] * (1 - t * 0.3) + 50 * t);
        
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0; // Transparent
      }
    }
  }

  // Draw Dome and Minaret geometric symbols in center
  const scale = (radius * 1.6) / 100;
  function setPixel(px, py, col) {
    const x = Math.round(cx + px * scale);
    const y = Math.round(cy + py * scale);
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (width * y + x) << 2;
      png.data[idx] = col[0];
      png.data[idx + 1] = col[1];
      png.data[idx + 2] = col[2];
      png.data[idx + 3] = col[3];
    }
  }

  function fillCircle(centerPx, centerPy, r, col) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) {
          setPixel(centerPx + x, centerPy + y, col);
        }
      }
    }
  }

  function fillRect(x1, y1, x2, y2, col) {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        setPixel(x, y, col);
      }
    }
  }

  // Base building
  fillRect(-32, 10, 32, 34, white);
  // Main entrance arch
  fillCircle(0, 18, 12, emeraldDark);
  fillRect(-12, 18, 12, 34, emeraldDark);

  // Main Central Dome
  for (let py = -24; py <= 10; py++) {
    for (let px = -22; px <= 22; px++) {
      const dy = py - 4;
      const dx = px;
      if (dx * dx * 1.2 + dy * dy <= 22 * 22 && py <= 10) {
        setPixel(px, py, gold);
      }
    }
  }

  // Left minaret
  fillRect(-38, -14, -30, 34, white);
  fillRect(-38, -24, -30, -14, gold);

  // Right minaret
  fillRect(30, -14, 38, 34, white);
  fillRect(30, -24, 38, -14, gold);

  // Crescent on top of dome
  fillCircle(0, -28, 5, gold);
  fillCircle(1.5, -29, 4, emeraldDark);

  return png;
}

const icons = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: true },
  { name: 'favicon.ico', size: 48, maskable: false },
];

for (const icon of icons) {
  const png = drawMosqueIcon(icon.size, icon.size, icon.maskable);
  const outPath = path.join(publicDir, icon.name);
  png.pack().pipe(fs.createWriteStream(outPath));
  console.log(`Generated ${icon.name}`);
}
