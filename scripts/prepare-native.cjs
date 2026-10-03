const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const nativeWeb = path.join(root, 'native-web');
const source = fs.readFileSync(path.join(root, 'offline-assets.js'), 'utf8');
const manifest = JSON.parse(source.slice(source.indexOf('{'), source.lastIndexOf('}') + 1));
const release = path.join(root, 'releases', manifest.version);
const report = JSON.parse(fs.readFileSync(path.join(release, 'integrity.json'), 'utf8'));
const site = path.join(release, 'site');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');

if (report.version !== manifest.version) throw new Error('Release report does not match the game build');
if (path.dirname(nativeWeb) !== root || path.basename(nativeWeb) !== 'native-web') throw new Error('Unsafe native output directory');
fs.rmSync(nativeWeb, {recursive:true, force:true});
fs.mkdirSync(nativeWeb, {recursive:true});
for (const file of report.files) {
  if (file.path.includes('..') || /[:\\]/.test(file.path) || path.isAbsolute(file.path)) throw new Error('Unsafe release path');
  const from = path.join(site, file.path);
  const data = fs.readFileSync(from);
  if (hash(data) !== file.sha256) throw new Error(`Release file changed: ${file.path}`);
  const to = path.join(nativeWeb, file.path);
  fs.mkdirSync(path.dirname(to), {recursive:true});
  fs.writeFileSync(to, data);
}
esbuild.buildSync({absWorkingDir:root,entryPoints:['./scripts/native-bridge.js'],bundle:true,platform:'browser',format:'iife',minify:true,outfile:'native-web/native-bridge.js'});
const html=path.join(nativeWeb,'index.html');
fs.writeFileSync(html,fs.readFileSync(html,'utf8').replace('<script src="offline.js"></script>','<script src="native-bridge.js"></script><script src="offline.js"></script>'));
if(!fs.readFileSync(html,'utf8').includes('<script src="native-bridge.js"></script>')) throw new Error('Native bridge was not added to app page');
fs.writeFileSync(path.join(nativeWeb, 'native-build.json'), JSON.stringify({version:manifest.version, files:report.files.length, appId:JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8')).appId, nativeBridgeSha256:hash(fs.readFileSync(path.join(nativeWeb,'native-bridge.js')))}) + '\n');
console.log(`Native app assets prepared from verified web release ${manifest.version} (${report.files.length} files).`);
