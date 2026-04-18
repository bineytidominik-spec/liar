import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');

const sizes = [192, 512];

for (const size of sizes) {
  const padding = Math.round(size * 0.15);
  const fontSize = Math.round(size * 0.6);

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0a0a0f"/>
  <text
    x="${size / 2}"
    y="${size / 2 + fontSize * 0.35}"
    font-family="Georgia, serif"
    font-size="${fontSize}"
    font-weight="900"
    font-style="italic"
    fill="#dc2626"
    text-anchor="middle"
  >H</text>
</svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outDir, `icon-${size}.png`));

  console.log(`Generated icon-${size}.png`);
}
