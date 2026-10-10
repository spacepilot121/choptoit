const assert=require('node:assert/strict'),http=require('node:http'),path=require('node:path');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{let latest=false;const old=createPreview(path.resolve(__dirname,'../releases/875a4415bf8010c8/site')).listeners('request')[0],fresh=createPreview().listeners('request')[0];
 const server=http.createServer((req,res)=>(latest?fresh:old)(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const origin='http://127.0.0.1:'+server.address().port;
 await page.addInitScript(()=>localStorage.setItem('choptoit-intro-read','yes'));await page.goto(origin+'/?offline-test=1');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.locator('#start-overlay').tap();await page.waitForFunction(()=>gameStarted&&inputEnabled);await page.evaluate(()=>{SaveManager.save();localStorage.setItem('update-save-marker','keep-me');});
 const other=await context.newPage();await other.goto(origin+'/?offline-test=1');latest=true;
 await page.goto(origin+'/update.html');const saved=await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage))));await page.getByRole('button',{name:'Update game',exact:true}).tap();await page.waitForURL('**/index.html',{timeout:60000});
 assert.equal(await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage)))),saved,'All save data survives update unchanged');
 const cache=await page.evaluate(async()=>{const keys=(await caches.keys()).filter(k=>k.startsWith('choptoit-release-'));return {keys,script:await(await(await caches.open(keys[0])).match('./mobile.js')).text()};});
 assert.equal(cache.keys.length,1);assert.ok(cache.script.includes('game-update'));assert.ok(!cache.keys[0].endsWith('875a4415bf8010c8'));assert.deepEqual(errors,[]);
 // Repeating the update when already current must also finish.
 await page.goto(origin+'/update.html');await page.getByRole('button',{name:'Update game',exact:true}).tap();await page.waitForURL('**/index.html');assert.equal(await page.evaluate(()=>localStorage.getItem('update-save-marker')),'keep-me');
 console.log('Real phone browser: old offline release upgrades with another game tab open; old cache removed, latest scripts served, save unchanged, repeated update completes.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
