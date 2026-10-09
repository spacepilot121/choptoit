const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const required=new Set(['index.html','mobile.css','mobile.js','opening.js','special-targets.js','special-runtime.js','platform-art.js','caravan-art.js','cast-art.js','audio.js','campaign.js','dayNightCycle.js','game-core.js','offline.js','manifest.webmanifest','favicon256.png','vendor/phaser-3.55.2.min.js',...require('./collect-assets.cjs')(root)]);
// Story portraits and title scenery are DOM images, outside the Phaser loader.
// Keep editable PNG masters in Git, but ship their smaller opaque JPEG exports.
for(const name of ['oswin-angular.png','merrin-angular.png','agnes-angular.png','cart-angular.png']) required.add('assets/'+name);
const files=[...required];
files.push('arcade.js');
files.push('target-shop.js');
files.sort();
const hash=crypto.createHash('sha256');let bytes=0;
for(const file of [...files,'sw.js']) {const data=fs.readFileSync(path.join(root,file));hash.update(file);hash.update(data);bytes+=data.length;}
const manifest={version:hash.digest('hex').slice(0,16),bytes,files:files.map(file=>'./'+file)};
const output='self.CHOP_RELEASE = '+JSON.stringify(manifest,null,2)+';\n';
if(process.argv.includes('--check')) {
  if(fs.readFileSync(path.join(root,'offline-assets.js'),'utf8')!==output) throw new Error('Offline package is stale. Run npm run build.');
} else fs.writeFileSync(path.join(root,'offline-assets.js'),output);
console.log(`Release ${manifest.version}: ${files.length} files, ${(bytes/1024/1024).toFixed(1)} MB offline package.`);
