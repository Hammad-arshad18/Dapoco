import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const dir=process.argv[2], out=process.argv[3];
const fs_=fs.readdirSync(dir).filter(f=>f.endsWith('.png')).sort();
const W=200,H=220,cols=6,rows=Math.ceil(fs_.length/cols);
const comps=[];
for (let i=0;i<fs_.length;i++){
  const buf=await sharp(path.join(dir,fs_[i])).resize(W,200,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).png().toBuffer();
  comps.push({input:buf,left:(i%cols)*W,top:Math.floor(i/cols)*H});
  const svg=`<svg width="${W}" height="20"><text x="4" y="14" font-size="11" font-family="Arial">${fs_[i].replace('.png','')}</text></svg>`;
  comps.push({input:Buffer.from(svg),left:(i%cols)*W,top:Math.floor(i/cols)*H+200});
}
await sharp({create:{width:W*cols,height:H*rows,channels:3,background:'#ffffff'}}).composite(comps).png().toFile(out);
