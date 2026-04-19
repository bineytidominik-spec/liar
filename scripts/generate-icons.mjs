import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function makeSvg(size) {
  const fontSize = Math.round(size * 0.72);
  const yOffset = Math.round(size * 0.53);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0e0e1c"/>
  <text
    x="${size / 2}"
    y="${yOffset}"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${fontSize}"
    font-weight="bold"
    font-style="italic"
    fill="#dc2626"
    text-anchor="middle"
    dominant-baseline="middle"
  >L</text>
</svg>`;
}

const targets = [
  // iOS App Store icon — 1024x1024, no alpha channel
  {
    out: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
    size: 1024,
    flatten: true,
  },
  // PWA icons
  { out: 'public/icons/icon-512.png', size: 512 },
  { out: 'public/icons/icon-192.png', size: 192 },
];

for (const target of targets) {
  const outPath = join(root, target.out);
  mkdirSync(dirname(outPath), { recursive: true });

  let pipeline = sharp(Buffer.from(makeSvg(target.size)));

  if (target.flatten) {
    // App Store icons must not have transparency
    pipeline = pipeline.flatten({ background: '#0e0e1c' });
  }

  await pipeline.png().toFile(outPath);
  console.log(`✓ ${target.out}`);
}

console.log('\nDone.');
