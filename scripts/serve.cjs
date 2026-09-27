const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const releaseVersion = process.env.CHOP_RELEASE;
if (releaseVersion && !/^[a-f0-9]{16}$/.test(releaseVersion)) throw new Error('Invalid release identifier');
const root = releaseVersion ? path.join(projectRoot,'releases',releaseVersion,'site') : projectRoot;
const port=Number(process.env.CHOP_PORT || 4173);
// Local fault injection for recovery tests; never included in the web app.
const missing=process.env.CHOP_MISSING_ASSET;
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'};
function createPreview(rootDirectory=root) {
const root=path.resolve(rootDirectory);
return http.createServer((req,res) => {
  let filename;
  try { filename = path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)); }
  catch (_) { res.writeHead(400).end(); return; }
  if (!filename.startsWith(root+path.sep) && filename !== root) { res.writeHead(403).end(); return; }
  if (filename === root) filename = path.join(root,'index.html');
  if (missing && filename===path.resolve(root,missing)) { res.writeHead(404).end('Test asset unavailable'); return; }
  fs.readFile(filename,(error,data) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200,{'Content-Type':types[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  });
});
}
module.exports={createPreview};
if(require.main===module) createPreview().listen(port,'127.0.0.1',() => console.log(`Chop To It preview: http://127.0.0.1:${port}${releaseVersion ? ' (release '+releaseVersion+')' : ''}`));
