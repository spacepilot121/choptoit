const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const listeners={};let prompts=0;
const sandbox={window:{addEventListener:(name,fn)=>listeners[name]=fn,matchMedia:()=>({matches:false})},navigator:{},location:{hostname:'localhost',search:''},URLSearchParams};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../offline.js'),'utf8'),sandbox);
(async()=>{
  const install=sandbox.window.ChopInstall;
  assert.equal(install.available,false);assert.equal(await install.prompt(),'unavailable');
  listeners.beforeinstallprompt({preventDefault(){},prompt(){prompts++;},userChoice:Promise.resolve({outcome:'dismissed'})});
  assert.equal(install.available,true);assert.equal(prompts,0,'Never open a prompt without user action');
  assert.equal(await install.prompt(),'dismissed');assert.equal(install.available,false);assert.equal(install.installed,false);
  listeners.beforeinstallprompt({preventDefault(){},prompt(){prompts++;},userChoice:Promise.resolve({outcome:'accepted'})});
  assert.equal(await install.prompt(),'accepted');assert.equal(install.installed,false,'Acceptance is not installation confirmation');
  listeners.appinstalled();assert.equal(install.installed,true);assert.equal(await install.prompt(),'unavailable');assert.equal(prompts,2);
  console.log('Install affordance waits for browser support and user action, handles dismissal and confirms installation only on its event.');
})().catch(error=>{console.error(error);process.exitCode=1;});
