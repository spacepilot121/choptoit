const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

// Execute only the declarative preload against a recording loader. This keeps
// loop-generated sprite names and destination mappings in one source of truth.
module.exports=function collectAssets(root, mobile=true) {
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const cities=html.match(/const cityBackgrounds = \{[\s\S]*?\n\};/)?.[0];
  const travel=html.match(/const travelBackgrounds = [^\r\n]+;/)?.[0];
  const start=html.indexOf('function preload() {'),end=html.indexOf('function create() {',start);
  if(!cities||!travel||start<0||end<0) throw new Error('Could not locate the game asset declarations.');
  const files=new Set();
  const loader={load:{on(){},image(_key,file){
    if(typeof file!=='string'||file.includes('..')||file.includes(':')) throw new Error('Unexpected preload asset path');
    files.add(file);
  }}};
  loader.load.atlas=(_key,image,json)=>{loader.load.image(_key,image);loader.load.image(_key,json);};
  vm.runInNewContext(`${cities}\n${travel}\n${html.slice(start,end)}\npreload.call(loader);`,{window:mobile?{MobileGame:{}}:{},loader,currentCity:'York'},{timeout:1000});
  // Travel backgrounds load on demand in mobile play, but the service worker
  // still caches every town for an offline road trip.
  if(mobile) Object.values(vm.runInNewContext(`${cities}\ncityBackgrounds`)).forEach(file=>files.add(file));
  return [...files];
};
