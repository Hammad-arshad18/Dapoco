import sharp from 'sharp';
const [,, input, out] = process.argv;
const trimmed = await sharp(input).trim({ background: '#ffffff', threshold: 18 }).toBuffer();
const { data, info } = await sharp(trimmed).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const o = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const r = data[i], g = data[i+1], b = data[i+2];
  // alpha from deviation from white (max channel distance)
  let a = Math.max(255 - r, 255 - g, 255 - b) / 255;
  a = Math.min(1, a * 1.25);
  const un = (c) => a < 0.01 ? 0 : Math.max(0, Math.min(255, (c - (1 - a) * 255) / a));
  o[j] = un(r); o[j+1] = un(g); o[j+2] = un(b); o[j+3] = Math.round(a * 255);
}
await sharp(o, { raw: { width: info.width, height: info.height, channels: 4 } }).extend({top:12,bottom:12,left:12,right:12,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(out);
console.log(info.width, info.height);
