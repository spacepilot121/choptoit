const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const manifestContext={self:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'offline-assets.js'),'utf8'),manifestContext);
const release=manifestContext.self.CHOP_RELEASE;
for(const file of release.files) assert.ok(fs.existsSync(path.join(root,file)),`Missing offline asset: ${file}`);
const collectAssets=require('./collect-assets.cjs');
for(const file of collectAssets(root)) assert.ok(release.files.includes('./'+file),`Preloaded file is not available offline: ${file}`);
assert.ok(!release.files.includes('./background_travel2.png'),'Unused legacy travel scenery must not be downloaded by mobile');
assert.ok(collectAssets(root,false).includes('background_travel2.png'),'Legacy fallback should retain its travel assets');
assert.ok(release.files.includes('./assets/cast-heads-v2.png'),'Illustrated character sheet must be available offline');
assert.ok(release.files.includes('./assets/cast-heads-v2.json'),'Character frame metadata must be available offline');
for(const name of fs.readdirSync(path.join(root,'assets')).filter(name=>name.endsWith('-v2.jpg'))) {
  const original=name.slice(0,-4)+'.png';
  assert.ok(release.files.includes('./assets/'+name),`Compressed painting must be offline: ${name}`);
  assert.ok(!release.files.includes('./assets/'+original),`Do not download the large source PNG: ${original}`);
  assert.ok(fs.statSync(path.join(root,'assets',name)).size<fs.statSync(path.join(root,'assets',original)).size/2,`Painting did not compress enough: ${name}`);
}
assert.ok(!release.files.some(file=>/\/prisonerhead.*\.png$/.test(file)),'Replaced individual faces must not be downloaded');
assert.ok(release.files.includes('./weapons30.png'),'Keep late-game upgrades');
function fixture(fail=false) {
  const handlers={}, messages=[], stores=new Map([['choptoit-release-old',new Map()],['unrelated-cache',new Map()]]);
  const self={CHOP_RELEASE:release,location:new URL('https://example.test/choptoit/sw.js'),clients:{claim:async()=>{},matchAll:async()=>[{postMessage:message=>messages.push(message)}]},addEventListener:(name,fn)=>{handlers[name]=fn;}};
  const caches={keys:async()=>[...stores.keys()],delete:async key=>stores.delete(key),open:async key=>{
    if(!stores.has(key)) stores.set(key,new Map());
    const data=stores.get(key);
    return {addAll:async files=>{if(fail)throw new Error('Network failed');files.forEach(file=>data.set(file,{file}));},match:async request=>{const name=typeof request==='string'?request:'./'+new URL(request.url).pathname.split('/').pop();return data.get(name);}};
  }};
  vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),{self,caches,URL,importScripts:()=>{},fetch:async()=>{throw new Error('Offline');}});
  return {handlers,messages,stores};
}
async function dispatch(fixture,name) {let work;fixture.handlers[name]({waitUntil:p=>{work=p;}});await work;}
(async()=>{
  const good=fixture();await dispatch(good,'install');await dispatch(good,'activate');
  assert.equal(good.messages.length,Math.ceil(release.files.length/8),'Each completed batch reports progress');
  assert.equal(good.messages.at(-1).completed,release.files.length);
  assert.equal(good.messages.at(-1).total,release.files.length);
  assert.ok(!good.stores.has('choptoit-release-old'));assert.ok(good.stores.has('unrelated-cache'));
  let response;
  good.handlers.fetch({request:{method:'GET',url:'https://example.test/choptoit/',mode:'navigate'},respondWith:p=>{response=p;}});
  assert.equal((await response).file,'./index.html');
  const failed=fixture(true);await assert.rejects(dispatch(failed,'install'));
  assert.equal(failed.messages.length,0,'Failed batches must not report completed downloads');
  assert.ok(failed.stores.has('choptoit-release-old'));assert.ok(!failed.stores.has('choptoit-release-'+release.version));
  console.log(`${release.files.length} offline assets exist; offline entry fallback, scoped cache cleanup and atomic failed-install recovery pass.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
