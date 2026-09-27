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
  const statusNode={textContent:''},offlineListeners={},workerListeners={};
  let resolveReady;
  const registration={active:null,addEventListener:(name,fn)=>{workerListeners[name]=fn;}};
  const offlineSandbox={
    window:{addEventListener:(name,fn)=>{offlineListeners[name]=fn;},matchMedia:()=>({matches:false})},
    document:{getElementById:id=>id==='offline-status'?statusNode:null},
    navigator:{serviceWorker:{addEventListener:(name,fn)=>{workerListeners[name]=fn;},register:async()=>registration,ready:new Promise(resolve=>{resolveReady=resolve;})}},
    location:{hostname:'localhost',search:'?offline-test=1'},URLSearchParams,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../offline.js'),'utf8'),offlineSandbox);
  const offline=offlineSandbox.window.ChopOffline;
  workerListeners.message({data:{type:'choptoit-offline-progress',completed:8,total:123}});
  assert.equal(offline.status,'Downloading offline game · 8 of 123 files');
  assert.equal(statusNode.textContent,offline.status,'Open Journal status updates immediately');
  workerListeners.message({data:{type:'choptoit-offline-progress',completed:124,total:123}});
  assert.equal(offline.status,'Downloading offline game · 8 of 123 files','Reject impossible progress');
  await offlineListeners.load();
  resolveReady(registration);
  await Promise.resolve();
  assert.equal(offline.status,'Ready to play offline');
  workerListeners.message({data:{type:'choptoit-offline-progress',completed:123,total:123}});
  assert.equal(offline.status,'Ready to play offline','Late progress cannot overwrite readiness');
  console.log('Install prompts require user action; offline progress updates the open Journal, rejects invalid counts and settles on ready.');
})().catch(error=>{console.error(error);process.exitCode=1;});
