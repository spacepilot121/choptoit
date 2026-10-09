// Real browser checks for fresh onboarding, icon controls and reward beacons.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{
 const output=path.resolve(__dirname,'../qa/clean-interface');fs.mkdirSync(output,{recursive:true});
 const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  assert.equal(await page.evaluate(()=>game==null),true);
  await page.locator('#start-overlay').tap({position:{x:15,y:15}});
  assert.equal(await page.evaluate(()=>game==null),true,'Tapping outside the axe cannot skip the opening');
  await page.locator('#wake-button').waitFor({state:'visible'});
  await page.screenshot({path:path.join(output,'01-night.png')});
  for(let i=1;i<=5;i++){
   await page.locator('#wake-button').tap();await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>ChopOpening.presses),i);
   if(i===2||i===4)await page.screenshot({path:path.join(output,'02-wake-'+i+'.png')});
   if(i<5)assert.equal(await page.evaluate(()=>game==null),true);
  }
  await page.waitForFunction(()=>swingActive&&inputEnabled);
  assert.equal(await page.locator('#shot-button').getAttribute('aria-label'),'Chop');
  assert.equal(await page.locator('.mobile-nav').innerText(),'');
  for(const menu of ['Workshop','Market','Travel','Journal'])assert.equal(await page.getByRole('button',{name:menu,exact:true}).count(),1);
  assert.equal(await page.locator('#contract-track').isVisible(),false);
  assert.equal(await page.locator('#arcade-track').isVisible(),false);
  await page.screenshot({path:path.join(output,'03-first-shot.png')});
  await page.waitForFunction(()=>{if(swingActive&&inputEnabled&&!document.querySelector('#shot-button').disabled&&Math.abs(cursor.x-redZone.x)<4){document.querySelector('#shot-button').click();return true;}return false;});
  await page.waitForFunction(()=>awaitingAngle&&document.querySelector('#shot-button').dataset.phase==='aim');
  assert.equal(await page.locator('#shot-hint').isVisible(),true);
  await page.locator('#shot-button').tap();
  await page.waitForFunction(()=>awaitingPower&&document.querySelector('#shot-button').dataset.phase==='power');await page.locator('#shot-button').tap();
  assert.equal(await page.evaluate(()=>localStorage.getItem('choptoit-intro-read')),'yes');
  assert.equal(await page.locator('#shot-hint').isVisible(),false,'Instruction text disappears after the tutorial shot');
  await page.evaluate(()=>{killCount=3;level=8;player.gold=1250;game.scene.scenes[0].dayNight.timeOfDay=.5;});
  await page.waitForFunction(()=>document.querySelector('.mobile-nav [data-screen="journal"]').classList.contains('reward-ready'));
  assert.equal(await page.locator('#hud-rank').innerText(),'VIII');
  await page.evaluate(()=>{killCount=0;Campaign.state.claimed=1;Arcade.state.perfects=1000;});
  assert.equal(await page.evaluate(()=>Campaign.nextObjective({chops:killCount,weapon:player.weaponLevel,rank:level,fame},player.gold).ready),false);
  await page.waitForFunction(()=>document.querySelector('.mobile-nav [data-screen="journal"]').classList.contains('reward-ready'));
  assert.ok(!(await page.locator('.mobile-hud').innerText()).includes('FAME'));
  for(const weather of ['clear','rain','snow','wind','fog']){
   await page.evaluate(w=>currentWeather=w,weather);
   await page.waitForFunction(w=>document.querySelector('#hud-weather').dataset.icon===w,weather);
   assert.equal(await page.locator('#hud-weather').innerText(),'');
  }
  await page.evaluate(()=>currentWeather='clear');await page.waitForTimeout(250);
  await page.screenshot({path:path.join(output,'04-clean-day.png')});
  for(const [width,height]of [[320,568],[390,844],[430,932]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(80);
   for(const selector of ['#shot-button','.mobile-nav button'])for(const control of await page.locator(selector).all()){
    const bounds=await control.boundingBox();assert.ok(bounds.height>=44&&bounds.width>=44);assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1);
   }
  }
  await page.reload();assert.equal(await page.locator('#wake-button').count(),0,'Returning players skip awakening');await page.locator('#start-overlay').tap();await page.waitForFunction(()=>swingActive&&inputEnabled);
  assert.equal(await page.locator('#shot-hint').isVisible(),false);
  assert.deepEqual(errors,[]);
  const reduced=await browser.newContext({viewport:{width:320,height:568},reducedMotion:'reduce'}),r=await reduced.newPage();await r.goto('http://127.0.0.1:'+server.address().port);await r.locator('#wake-button').waitFor({state:'visible'});assert.equal(await r.locator('#wake-button').evaluate(e=>getComputedStyle(e).animationName),'none');await reduced.close();
  console.log('Five-tap dawn, first-shot tutorial, returning-player skip, icon HUD, Roman ranks, reward beacon, all weather icons and phone-sized controls pass.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
