import sharp from 'sharp';
const [, , src, out] = process.argv;
await sharp(src).trim({ threshold: 2 }).resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82, alphaQuality: 90 }).toFile(out);
