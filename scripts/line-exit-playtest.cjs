const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});await context.addInitScript(()=>localStorage.setItem('choptoit-intro-read','yes'));const page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log(e.stack);});await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#start-overlay').tap();await page.waitForFunction(()=>gameStarted&&swingActive&&inputEnabled);
const out=path.resolve(__dirname,'../qa/countryside');fs.mkdirSync(out,{recursive:true});
await page.evaluate(()=>{window.qaScene=game.scene.scenes[0];xpThreshold=1000000000;xp=0;window.qaShot={active:true,power:2,targetCombo:0,targetGold:0,body:{enable:true,velocity:{x:0,y:180},setVelocity(x,y){this.velocity={x,y};}}};retirePreviousRoundTargets(qaScene);qaScene.nextFlockAt=Infinity;qaScene.nextCraftAt=Infinity;});await page.waitForTimeout(1000);

for(const mode of ['complete','miss','early-miss','reset-arrival','reset-exit','destroy-left','destroy-right','repeat-depart','mid-arrival-miss']){
 await page.evaluate(()=>{retirePreviousRoundTargets(qaScene);qaScene.tweens.timeScale=4;killStreak=24;spawnTarget(qaScene,[],SpecialTargets.catalog.find(o=>o.art==='line'));window.testLine=targetGroup.getChildren().find(t=>t.washingLine&&!t.leaving);});
 if(mode==='mid-arrival-miss')await page.evaluate(()=>qaScene.tweens.timeScale=1);
 await page.waitForTimeout(mode==='mid-arrival-miss'?1000:mode==='early-miss'||mode==='reset-arrival'?80:650);
 await page.evaluate(mode=>{const t=testLine;if(mode==='reset-arrival'){resetForNewCity(qaScene);return;}if(mode==='miss'||mode==='early-miss'||mode==='mid-arrival-miss'){retirePreviousRoundTargets(qaScene);return;}t.specialParts.slice().forEach(p=>handleTargetHit(qaScene,p,qaShot));if(mode==='destroy-left')t.jester.destroy(true);if(mode==='destroy-right')t.linePartner.destroy(true);if(mode==='repeat-depart')departWashingLine(qaScene,t);},mode);
 if(mode==='reset-exit'){await page.waitForTimeout(80);await page.evaluate(()=>resetForNewCity(qaScene));}
 if(mode==='mid-arrival-miss'){
  await page.waitForTimeout(950);
  assert.equal(await page.evaluate(()=>testLine.jester.walkTween.isPlaying()&&testLine.linePartner.walkTween.isPlaying()),true,'Old arrival timers cannot stop an exit');
 }
 await page.waitForTimeout(850);
 const state=await page.evaluate(()=>({active:testLine.active,first:testLine.jester.active,second:testLine.linePartner.active,departing:qaScene.departingCarriers?.size,error:localStorage.getItem('choptoit-runtime-error')}));
 console.log(mode,JSON.stringify(state));assert.deepEqual(errors,[],mode+' should not crash');assert.equal(state.active,false);assert.equal(state.first,false);assert.equal(state.second,false);assert.equal(state.departing,0);assert.equal(state.error,null);
 assert.equal(await page.evaluate(()=>testLine.specialParts.every(p=>!p.scene)&&!testLine.scene&&!testLine.jester.scene&&!testLine.linePartner.scene),true,'Line, clothes and both carriers release their scene references');
}
await context.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
