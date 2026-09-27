const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
execFileSync(process.execPath,[path.join(__dirname,'build.cjs'),'--check'],{stdio:'inherit'});
const source=fs.readFileSync(path.join(root,'offline-assets.js'),'utf8');
const manifest=JSON.parse(source.slice(source.indexOf('{'),source.lastIndexOf('}')+1));
if(!/^[a-f0-9]{16}$/.test(manifest.version)) throw new Error('Invalid release identifier');
const release=path.join(root,'releases',manifest.version),site=path.join(release,'site');
const files=[...new Set([...manifest.files.map(p=>p.replace(/^\.\//,'')),'sw.js','offline-assets.js','vendor/PHASER-LICENSE.md'])].sort();
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const report={version:manifest.version,files:[],bytes:0};
for(const file of files) {
  if(file.includes('..') || /[:\\]/.test(file) || path.isAbsolute(file)) throw new Error('Unsafe release path: '+file);
  const data=fs.readFileSync(path.join(root,file)),dest=path.join(site,file);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(fs.existsSync(dest)) {
    if(sha(fs.readFileSync(dest))!==sha(data)) throw new Error('Existing release differs: '+file);
  } else fs.writeFileSync(dest,data,{flag:'wx'});
  if(sha(fs.readFileSync(dest))!==sha(data)) throw new Error('Release copy verification failed: '+file);
  report.files.push({path:file,bytes:data.length,sha256:sha(data)});
  report.bytes+=data.length;
}
function list(dir,prefix='') {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?list(path.join(dir,entry.name),prefix+entry.name+'/'):[prefix+entry.name]);
}
if(JSON.stringify(list(site).sort())!==JSON.stringify(files)) throw new Error('Unexpected files in release folder');
fs.writeFileSync(path.join(release,'integrity.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Verified upload folder: ${site}\n${files.length} files, ${(report.bytes/1024/1024).toFixed(1)} MB. Nothing published.`);
