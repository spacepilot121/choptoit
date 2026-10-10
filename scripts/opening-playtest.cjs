const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{
 const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const out=path.resolve(__dirname,'../qa/extended-opening');fs.mkdirSync(out,{recursive:true});
 try{
  for(const reduced of [false,true]){
   const context=await browser.newContext({viewport:reduced?{width:320,height:568}:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',reducedMotion:reduced?'reduce':'no-preference'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port);const button=page.locator('#wake-button');await button.waitFor({state:'visible'});
   assert.equal(await page.locator('.wake-hint').count(),0);assert.equal(await page.locator('.wake-york text').count(),0);
   assert.equal(await page.locator('.wake-york').evaluate(n=>getComputedStyle(n).opacity),'1','City is present before the tree is cut');
   assert.equal(await page.locator('.wake-sleep i').count(),3);assert.equal(await page.locator('.wake-dream').count(),1);
   if(!reduced)await page.screenshot({path:path.join(out,'01-sleep.png')});
   for(let i=0;i<5;i++){await page.waitForFunction(()=>!document.querySelector('#wake-button').disabled);await button.tap();}
   await page.waitForFunction(()=>ChopOpening.phase==='reach'&&!document.querySelector('#wake-button').disabled);
   assert.equal(await page.evaluate(()=>game==null),true,'Waking does not skip the tree tutorial');await button.tap();
   await page.waitForFunction(()=>ChopOpening.phase==='lift'&&!document.querySelector('#wake-button').disabled);
   if(!reduced)await page.screenshot({path:path.join(out,'02-pickup.png')});await button.tap();
   await page.waitForFunction(()=>ChopOpening.phase==='timing'&&!document.querySelector('#wake-button').disabled);
   for(const [width,height]of reduced?[[320,568]]:[[320,568],[390,844],[430,932]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(100);for(const selector of ['#wake-button','.wake-controls']){const box=await page.locator(selector).boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1);}
   }
   if(!reduced)await page.setViewportSize({width:390,height:844});
   await page.waitForFunction(()=>{if(ChopOpening.meterPosition<15){document.querySelector('#wake-button').click();return true;}return false;});
   assert.equal(await page.evaluate(()=>ChopOpening.phase),'timing','An early tap gives another chance, without a failure screen');
   await page.waitForFunction(()=>!document.querySelector('#wake-button').disabled);
   if(!reduced)await page.screenshot({path:path.join(out,'03-meter.png')});
   await page.waitForFunction(()=>{if(Math.abs(ChopOpening.meterPosition-50)<3){document.querySelector('#wake-button').click();return true;}return false;});
   await page.waitForFunction(()=>ChopOpening.phase==='aim'&&!document.querySelector('#wake-button').disabled);
   await page.waitForFunction(target=>Math.abs(ChopOpening.meterPosition-target)<2,reduced?75:25);await button.press('Enter');
   await page.waitForFunction(()=>ChopOpening.phase==='power'&&!document.querySelector('#wake-button').disabled);
   await page.waitForFunction(target=>{if(Math.abs(ChopOpening.meterPosition-target)<2){document.querySelector('#wake-button').click();return true;}return false;},reduced?15:85);
   const shot=await page.evaluate(()=>({shot:ChopOpening.shot,expected:ChopCore.launchVelocity(ChopOpening.shot.angle,ChopOpening.shot.power)}));
   assert.deepEqual(shot.shot.velocity,shot.expected);assert.ok(reduced?shot.shot.velocity.x>0:shot.shot.velocity.x<0);assert.ok(reduced?shot.shot.power<.8:shot.shot.power>1.7);
   assert.equal(await page.evaluate(()=>!!game&&!ChopOpening.completed&&!!document.querySelector('#start-overlay')),true,'Game preloads beneath the tree scene');
   if(!reduced){await page.waitForTimeout(1900);await page.screenshot({path:path.join(out,'04-reveal.png')});await page.waitForFunction(()=>ChopOpening.phase==='walk');await page.waitForTimeout(750);await page.screenshot({path:path.join(out,'05-road.png')});}
   await page.waitForFunction(()=>ChopOpening.completed&&!document.querySelector('#start-overlay'));
   await page.waitForFunction(()=>swingActive&&inputEnabled&&!document.querySelector('.mobile-controls').inert);
   assert.equal(await page.evaluate(()=>localStorage.getItem('choptoit-intro-read')),'yes');
   assert.equal(await page.evaluate(()=>currentCity),'York');assert.equal(await page.evaluate(()=>Campaign.state.targets),0);
   assert.equal(await page.evaluate(()=>executioner.x),300);assert.equal(await page.locator('#game-loading').count(),0);
   if(!reduced)await page.screenshot({path:path.join(out,'06-york.png')});
   await page.reload();assert.equal(await page.locator('#wake-button').count(),0,'Returning players retain their progress and skip the opening');
   assert.deepEqual(errors,[]);await context.close();
  }
  // A failed asset must expose the normal retry screen instead of trapping the player behind the intro.
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
  await page.route('**/assets/cast-heads-angular.png*',route=>route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#wake-button').waitFor({state:'visible'});
  for(let i=0;i<7;i++){await page.waitForFunction(()=>!document.querySelector('#wake-button').disabled);await page.locator('#wake-button').tap();}
  await page.waitForFunction(()=>ChopOpening.phase==='timing'&&!document.querySelector('#wake-button').disabled);
  await page.waitForFunction(()=>{if(Math.abs(ChopOpening.meterPosition-50)<3){document.querySelector('#wake-button').click();return true;}return false;});
  for(const phase of ['aim','power']){await page.waitForFunction(p=>ChopOpening.phase===p&&!document.querySelector('#wake-button').disabled,phase);await page.locator('#wake-button').tap();}
  await page.getByRole('button',{name:'Try again',exact:true}).waitFor({state:'visible'});assert.equal(await page.locator('#start-overlay').isVisible(),false);assert.equal(await page.evaluate(()=>localStorage.getItem('choptoit-intro-read')),null);
  await context.close();console.log('Extended opening: wake, axe pickup, forgiving timing/aim/power, treetop flight, York reveal, seamless live entrance, 320/390/430px controls, reduced motion, returning-player skip and failed-download retry pass.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
