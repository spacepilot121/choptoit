// Optional art export tool. Install sharp or expose it through NODE_PATH.
const sharp=require('sharp');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
  for(const size of [180,192,512]) await sharp(path.join(root,'assets/app-icon.svg')).resize(size,size).png().toFile(path.join(root,`assets/app-icon-${size}.png`));
  console.log('Exported home-screen icons at 180, 192 and 512 pixels.');
})().catch(error=>{console.error(error);process.exitCode=1;});
