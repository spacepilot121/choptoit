const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});await context.addInitScript(()=>localStorage.setItem('choptoit-intro-read','yes'));const page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log(e.stack);});await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#start-overlay').tap();await page.waitForFunction(()=>gameStarted&&swingActive&&inputEnabled);
const out=path.resolve(__dirname,'../qa/countryside');fs.mkdirSync(out,{recursive:true});
await page.evaluate(()=>{window.qaScene=game.scene.scenes[0];xpThreshold=1000000000;xp=0;window.qaShot={active:true,power:2,targetCombo:0,targetGold:0,body:{enable:true,velocity:{x:0,y:180},setVelocity(x,y){this.velocity={x,y};}}};retirePreviousRoundTargets(qaScene);qaScene.nextFlockAt=Infinity;qaScene.nextCraftAt=Infinity;});await page.waitForTimeout(1000);


const heights=[];
for(const streak of [0,10,24]){
 await page.evaluate(s=>{killStreak=s;qaScene.dayNight.timeOfDay=.5;},streak);await page.waitForTimeout(1300);
 await page.evaluate(()=>{retirePreviousRoundTargets(qaScene);for(let i=0;i<7;i++){spawnTarget(qaScene,[],TargetShop.catalog.find(o=>o.id==='red'));}spawnTarget(qaScene,[],SpecialTargets.catalog.find(o=>o.art==='line'));});await page.waitForTimeout(2200);
 const h=await page.evaluate(()=>{const targets=targetGroup.getChildren().filter(t=>t.jester&&!t.collected),line=targets.find(t=>t.washingLine);window.heightLine=line;return{zoom:qaScene.cameras.main.zoom,normal:targets.filter(t=>!t.washingLine).map(t=>t.poleHeight),line:line.poleHeight,attached:Math.abs(line.linePartner.jesterPole.displayHeight-line.poleHeight)<.01,parts:line.specialParts.every(p=>p.body.enable&&Math.abs(p.x-(line.x+p.partOffset))<.1),reach:Math.pow(500*getWeaponPowerMultiplier()-100,2)/800};});
 assert.ok(h.attached&&h.parts);assert.ok(h.normal.some(n=>n<200),'Low targets remain available at every zoom');heights.push(h);
 await page.screenshot({path:path.join(out,'height-'+streak+'.png')});
}
assert.ok(heights[2].line>heights[0].line*3,'Zoomed-out washing line uses the upper sky');assert.ok(Math.max(...heights[2].normal)-Math.min(...heights[2].normal)>500,'Wide view has a genuinely mixed vertical target field');
// Existing target bases stay exactly fixed through camera changes in both directions.
const before=await page.evaluate(()=>targetGroup.getChildren().filter(t=>t.jester&&!t.collected).map(t=>t.basePoleHeight));
for(const streak of [0,24]){
 await page.evaluate(s=>killStreak=s,streak);await page.waitForTimeout(2200);
 assert.deepEqual(await page.evaluate(()=>targetGroup.getChildren().filter(t=>t.jester&&!t.collected).map(t=>t.basePoleHeight)),before,'Zoom must never resize a resident pole');
 assert.ok(await page.evaluate(()=>Math.abs(heightLine.poleHeight-heightLine.linePartner.jesterPole.displayHeight)<.01));
}
await page.evaluate(()=>resetForNewCity(qaScene));await page.waitForTimeout(400);assert.deepEqual(errors,[]);console.log(JSON.stringify(heights));console.log('Phone browser: varied low and aspirational heights, taller two-carrier lines, fixed resident heights during zoom and safe city cleanup pass.');await context.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
