import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function makeIconSvg(size) {
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

// Splash screen: dark background, small centered logo (icon at ~15% of width)
function makeSplashSvg(size) {
  const logoSize = Math.round(size * 0.15);
  const fontSize = Math.round(logoSize * 0.72);
  const center = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0e0e1c"/>
  <text
    x="${center}"
    y="${center}"
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

const iconTargets = [
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

const splashTargets = [
  { out: 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png', size: 2732 },
  { out: 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png', size: 2732 },
  { out: 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png', size: 2732 },
];

console.log('Generating icons...');
for (const target of iconTargets) {
  const outPath = join(root, target.out);
  mkdirSync(dirname(outPath), { recursive: true });
  let pipeline = sharp(Buffer.from(makeIconSvg(target.size)));
  if (target.flatten) pipeline = pipeline.flatten({ background: '#0e0e1c' });
  await pipeline.png().toFile(outPath);
  console.log(`✓ ${target.out}`);
}

console.log('\nGenerating splash screens...');
for (const target of splashTargets) {
  const outPath = join(root, target.out);
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(makeSplashSvg(target.size)))
    .flatten({ background: '#0e0e1c' })
    .png()
    .toFile(outPath);
  console.log(`✓ ${target.out}`);
}

console.log('\nDone.');
