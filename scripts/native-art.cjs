const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'assets', 'app-icon.svg'), 'utf8');
const foreground = svg.replace(/<rect width="512" height="512" fill="#152b31"\/>/, '');
const android = path.join(root, 'android', 'app', 'src', 'main', 'res');
const ios = path.join(root, 'ios', 'App', 'App', 'Assets.xcassets');
const background = {r:21,g:43,b:49,alpha:1};

async function icon(file, size, adaptive=false) {
  const input = Buffer.from(adaptive ? foreground : svg);
  if (!adaptive) return sharp(input).resize(size,size).png().toFile(file);
  const inner=Math.round(size*0.9);
  const mark=await sharp(input).resize(inner,inner).png().toBuffer();
  await sharp({create:{width:size,height:size,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
    .composite([{input:mark,left:Math.floor((size-inner)/2),top:Math.floor((size-inner)/2)}])
    .png().toFile(file);
}
async function splash(file, width, height) {
  const size=Math.round(Math.min(width,height)*0.42);
  const mark=await sharp(Buffer.from(svg)).resize(size,size).png().toBuffer();
  await sharp({create:{width,height,channels:4,background}})
    .composite([{input:mark,left:Math.floor((width-size)/2),top:Math.floor((height-size)/2)}])
    .png().toFile(file);
}

(async()=>{
  await icon(path.join(ios,'AppIcon.appiconset','AppIcon-512@2x.png'),1024);
  for (const file of fs.readdirSync(path.join(ios,'Splash.imageset')).filter(name=>name.endsWith('.png')))
    await splash(path.join(ios,'Splash.imageset',file),2732,2732);
  for (const density of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi']) {
    const size={mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192}[density];
    const dir=path.join(android,`mipmap-${density}`);
    await icon(path.join(dir,'ic_launcher.png'),size);
    await icon(path.join(dir,'ic_launcher_round.png'),size);
    await icon(path.join(dir,'ic_launcher_foreground.png'),Math.round(size*2.25),true);
  }
  for (const dir of fs.readdirSync(android).filter(name=>name==='drawable'||name.startsWith('drawable-port-')||name.startsWith('drawable-land-'))) {
    const file=path.join(android,dir,'splash.png');
    if (!fs.existsSync(file)) continue;
    const {width,height}=await sharp(file).metadata();
    await splash(file,width,height);
  }
  fs.writeFileSync(path.join(android,'values','ic_launcher_background.xml'),'<resources><color name="ic_launcher_background">#152b31</color></resources>\n');
  console.log('Native icons and splash screens rendered from the game icon.');
})().catch(error=>{console.error(error);process.exitCode=1;});
