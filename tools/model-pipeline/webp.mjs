import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const [,, src, dst] = process.argv;
for (const f of fs.readdirSync(src).filter(f=>f.endsWith('.jpg'))) {
  const k = f.replace('.jpg','');
  const img = sharp(path.join(src,f));
  const m = await img.metadata();
  await sharp(path.join(src,f)).resize({width:2000, withoutEnlargement:true}).webp({quality:74}).toFile(path.join(dst,`${k}.webp`));
  await sharp(path.join(src,f)).resize({width:900}).webp({quality:70}).toFile(path.join(dst,`${k}-sm.webp`));
  console.log(k, m.width, m.height);
}
