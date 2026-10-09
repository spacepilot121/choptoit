// Browser fault injection: interrupted image, persistent atlas failure, recovery.
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{
 const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const persistent of [false,true]){
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   await context.addInitScript(()=>localStorage.setItem('choptoit-save',JSON.stringify({gold:321,fame:0,xp:1,level:1,itemsOwned:{},citiesUnlocked:['York'],upgradesOwned:{storageLevel:1,weaponLevel:1}})));
   const page=await context.newPage(),errors=[],requests=[];let unavailable=true;
   page.on('pageerror',error=>errors.push(error.message));
   const asset=persistent?'cast-heads-angular.json':'platform-angular.png';
   await page.route('**/assets/'+asset+'*',async route=>{
    requests.push(route.request().url());
    if(unavailable){if(!persistent)unavailable=false;await route.abort();}else await route.continue();
   });
   await page.goto('http://127.0.0.1:'+server.address().port);
   const save=await page.evaluate(()=>localStorage.getItem('choptoit-save'));
   await page.locator('#start-overlay').tap();
   if(persistent){
    await page.getByRole('heading',{name:'The gates are stuck'}).waitFor();
    assert.match(await page.locator('#loading-copy').innerText(),/cast-heads-angular\.json/);
    assert.equal(await page.evaluate(()=>localStorage.getItem('choptoit-save')),save,'Failed startup must preserve the save');
    assert.equal(requests.length,2,'Exactly one automatic retry');
    unavailable=false;await page.locator('#loading-retry').tap();
   }
   await page.waitForFunction(()=>!document.querySelector('#game-loading')&&!document.querySelector('#mobile-ui').hidden);
   assert.ok(requests[1].includes('?artwork-retry='),'Retry bypasses a cached failed response');
   assert.equal(await page.evaluate(()=>player.gold),321,'Recovery retains the purse');
   await page.locator('[data-action="begin"]').tap();
   await page.waitForFunction(()=>swingActive&&inputEnabled);
   assert.deepEqual(errors,[]);
   console.log(persistent?'Persistent atlas error names the file; manual retry recovers with saved gold intact.':'Interrupted artwork recovers automatically.');
   await context.close();
  }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
