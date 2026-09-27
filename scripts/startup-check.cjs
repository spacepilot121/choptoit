const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const cities=html.match(/const cityBackgrounds = \{[\s\S]*?\n\};/)?.[0];
const travel=html.match(/const travelBackgrounds = [^\r\n]+;/)?.[0];
const preload=html.slice(html.indexOf('function preload() {'),html.indexOf('const pendingCityBackgrounds'));
for(const [mobile,city,expected] of [[true,'York',1],[true,'Chester',1],[false,'York',15]]) {
  const files=[];
  const loader={load:{on(){},image(key,file){if(key.startsWith('background-')&&!key.startsWith('background-travel'))files.push(file);},atlas(){}}};
  vm.runInNewContext(`${cities}\n${travel}\n${preload}\npreload.call(loader);`,{window:mobile?{MobileGame:{}}:{},currentCity:city,loader},{timeout:1000});
  assert.equal(files.length,expected);
  if(mobile)assert.equal(files[0],`assets/${city.toLowerCase()}-v2.jpg`);
}
const offline=require('./collect-assets.cjs')(path.join(__dirname,'..'));
assert.equal(offline.filter(file=>/^assets\/(york|durham|chester|london|hull|newcastle|lincoln|canterbury|dover|norwich|winchester|colchester|oxford|southampton|gloucester)-v2\.jpg$/.test(file)).length,15);
console.log('Mobile startup requests only the saved town; all fifteen town images remain in the offline package.');
