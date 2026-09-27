// Optional art export. The original PNGs remain editable source material;
// the opaque scenes and portraits are shipped as smaller JPEGs.
const sharp=require('sharp');
const path=require('node:path');
const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const names=[
  'york','canterbury','london','dover','durham','norwich','winchester',
  'chester','hull','newcastle','colchester','lincoln','oxford',
  'southampton','gloucester','oswin','merrin','agnes',
];
(async()=>{
  let original=0,optimized=0;
  for(const name of names) {
    const source=path.join(root,'assets',`${name}-v2.png`);
    const output=path.join(root,'assets',`${name}-v2.jpg`);
    const metadata=await sharp(source).metadata();
    if(metadata.hasAlpha) throw new Error(`${name} has transparency and must stay PNG`);
    const result=await sharp(source).jpeg({quality:90,mozjpeg:true}).toFile(output);
    if(result.width!==metadata.width || result.height!==metadata.height) throw new Error(`${name} dimensions changed`);
    original+=fs.statSync(source).size;optimized+=result.size;
  }
  console.log(`${names.length} opaque paintings: ${(original/1048576).toFixed(1)} MB PNG → ${(optimized/1048576).toFixed(1)} MB JPEG`);
})().catch(error=>{console.error(error);process.exitCode=1;});
