const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'native-web','native-build.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(root,'releases',manifest.version,'integrity.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
assert.equal(report.version,manifest.version);
assert.equal(report.files.length,manifest.files);
assert.equal(config.webDir,'native-web');
for(const file of report.files) {
  for(const dir of ['native-web','android/app/src/main/assets/public','ios/App/App/public']) {
    const content=fs.readFileSync(path.join(root,dir,file.path));
    if(file.path==='index.html' && dir!=='native-web') continue;
    if(file.path==='index.html') continue;
    assert.equal(sha(content),file.sha256,`${dir}/${file.path} differs from verified release`);
  }
}
for(const dir of ['native-web','android/app/src/main/assets/public','ios/App/App/public']) {
  const html=fs.readFileSync(path.join(root,dir,'index.html'),'utf8');
  assert.ok(html.includes('native-bridge.js'),`${dir} is missing native backup support`);
  assert.ok(fs.statSync(path.join(root,dir,'native-bridge.js')).size>1000);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,dir,'native-build.json'),'utf8')).version,manifest.version);
  if(dir!=='native-web') assert.equal(html,fs.readFileSync(path.join(root,'native-web','index.html'),'utf8'),`${dir} has a stale entry page`);
}
const gradle=fs.readFileSync(path.join(root,'android','variables.gradle'),'utf8');
const androidManifest=fs.readFileSync(path.join(root,'android','app','src','main','AndroidManifest.xml'),'utf8');
const ios=fs.readFileSync(path.join(root,'ios','App','App','Info.plist'),'utf8');
assert.match(gradle,/targetSdkVersion\s*=\s*36/);
assert.match(androidManifest,/screenOrientation="portrait"/);
assert.doesNotMatch(ios,/UIInterfaceOrientationLandscape/);
assert.ok(fs.existsSync(path.join(root,'ios','App','App','PrivacyInfo.xcprivacy')));
const iosIcon=fs.readFileSync(path.join(root,'ios','App','App','Assets.xcassets','AppIcon.appiconset','AppIcon-512@2x.png'));
assert.equal(iosIcon.readUInt32BE(16),1024);
assert.equal(iosIcon.readUInt32BE(20),1024);
const androidIcon=fs.readFileSync(path.join(root,'android','app','src','main','res','mipmap-xxxhdpi','ic_launcher.png'));
assert.equal(androidIcon.readUInt32BE(16),192);
assert.equal(androidIcon.readUInt32BE(20),192);
console.log(`Both portrait app projects contain verified game release ${manifest.version}, native backup support and icons.`);
