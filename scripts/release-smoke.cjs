const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {createPreview}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'offline-assets.js'),'utf8');
const version=JSON.parse(source.slice(source.indexOf('{'),source.lastIndexOf('}')+1)).version;
const folder=path.join(root,'releases',version);
const report=JSON.parse(fs.readFileSync(path.join(folder,'integrity.json'),'utf8'));
const server=createPreview(path.join(folder,'site'));
(async()=>{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin='http://127.0.0.1:'+server.address().port;
  try {
    for(let i=0;i<report.files.length;i+=8) {
      await Promise.all(report.files.slice(i,i+8).map(async file=>{
        const response=await fetch(origin+'/'+file.path);
        assert.equal(response.status,200,file.path);
        const bytes=Buffer.from(await response.arrayBuffer());
        assert.equal(bytes.length,file.bytes,file.path);
        assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);
        const expected={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webmanifest':'application/manifest+json'}[path.extname(file.path)];
        if(expected) assert.equal(response.headers.get('content-type'),expected,file.path);
      }));
    }
    const homepage=await fetch(origin+'/');
    assert.equal(await homepage.text(),fs.readFileSync(path.join(folder,'site/index.html'),'utf8'));
    for(const file of ['scripts/check.cjs','LAUNCH_PLAN.md','README.md','background_canterbury.png']) {
      assert.equal((await fetch(origin+'/'+file)).status,404,'Development file leaked: '+file);
    }
    console.log(`Packaged HTTP check passed: ${report.files.length} files match their hashes and content types; homepage works and development files are absent.`);
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
