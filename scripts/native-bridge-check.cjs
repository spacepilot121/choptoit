const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'native-bridge.js'),'utf8').replace(/^import .*;\r?\n/gm,'');
(async () => {
  for (const platform of ['android','ios']) {
    const events={};let minimized=0,suspended=0,paused=0;
    const context={Capacitor:{getPlatform:()=>platform},App:{addListener(name,fn){events[name]=fn;},async minimizeApp(){minimized++;}},window:{ChopSuspend(){paused++;},ChopAudio:{suspend(){suspended++;}}}};
    vm.runInNewContext(source,context);
    events.appStateChange({isActive:false});assert.equal(paused,1);assert.equal(suspended,1);
    events.appStateChange({isActive:true});assert.equal(paused,1,'Foregrounding must not resume a shot');
    if(platform==='ios') { assert.equal(events.backButton,undefined);continue; }
    await events.backButton();assert.equal(minimized,0,'Missing game controls during startup must not minimize');
    context.window.ChopBack=()=>true;
    await events.backButton();assert.equal(minimized,0,'Handled menu navigation must keep the app open');
    context.window.ChopBack=()=>false;
    await events.backButton();assert.equal(minimized,1);assert.equal(suspended,2,'Minimizing must silence audio');
  }
  console.log('Native lifecycle and Android Back route through game controls; minimizing suspends sound and iOS keeps its normal navigation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
