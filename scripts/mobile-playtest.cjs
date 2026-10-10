// Isolated browser playtest: fresh storage, real touch controls, no player save changes.
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
const saveArgument=process.argv.find(arg=>arg.startsWith('--save='));
const output=path.resolve(__dirname,'../qa/2026-10-10',process.argv.includes('--diagnostic')?'diagnostic':saveArgument?'final-campaign':process.argv.includes('--resume')?'resumed':process.argv.includes('--colliders')?'colliders':process.argv.includes('--tour')?'tour':process.argv.includes('--transition')?'transition':process.argv.includes('--campaign')?'campaign':'smoke');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
 if(process.argv.includes('--resume')){
  const checkpoint=JSON.parse(fs.readFileSync(saveArgument?path.resolve(__dirname,'..',saveArgument.slice(7)):path.resolve(__dirname,'../qa/2026-10-09/campaign-checkpoint.json')));
  await context.addInitScript(data=>{if(!sessionStorage.getItem('qa-seeded')){sessionStorage.setItem('qa-seeded','yes');localStorage.setItem('choptoit-save',JSON.stringify(data));localStorage.setItem('choptoit-intro-read','yes');}},checkpoint);
 }
 const page=await context.newPage(),errors=[];
 let clockTimer,advancing=false;
 if(process.argv.includes('--accelerated')){
  await page.clock.install();
  clockTimer=setInterval(async()=>{if(advancing)return;advancing=true;try{await page.clock.runFor(200);}catch(_){}finally{advancing=false;}},20);
 }
 page.on('pageerror',e=>{errors.push(e.stack);console.log('RUNTIME ERROR',e.stack);});
 try{
  const enterGame=async()=>{
   if(await page.locator('#wake-button').count()){
    const button=page.locator('#wake-button');await button.waitFor({state:'visible'});
    for(let i=0;i<7;i++){await page.waitForFunction(()=>!document.querySelector('#wake-button').disabled);await button.tap();}
    await page.waitForFunction(()=>ChopOpening.phase==='timing'&&!document.querySelector('#wake-button').disabled);
    await page.waitForFunction(()=>{if(Math.abs(ChopOpening.meterPosition-50)<3){document.querySelector('#wake-button').click();return true;}return false;});
    for(const phase of ['aim','power']){await page.waitForFunction(p=>ChopOpening.phase===p&&!document.querySelector('#wake-button').disabled,phase);await button.tap();}
    await page.waitForFunction(()=>ChopOpening.completed&&!document.querySelector('#start-overlay'));
   }else if(await page.locator('#start-overlay').count())await page.locator('#start-overlay').tap();
  };
  await page.goto('http://127.0.0.1:'+server.address().port);await enterGame();
  await page.waitForFunction(()=>swingActive&&inputEnabled);
  await page.evaluate(()=>{window.qaEvents=[];for(const name of ['startSwingMeter','spawnPrisoner','endSwing','chooseAngle','choosePower','beheadPrisoner']){const original=window[name];window[name]=function(...args){window.qaEvents.push({name,time:performance.now(),sceneTime:game.scene.scenes[0].time.now,stack:new Error().stack.split('\n').slice(1,4)});return original(...args);};}});
  await page.screenshot({path:path.join(output,'fresh-york.png')});
  await page.waitForFunction(()=>{if(swingActive&&inputEnabled&&Math.abs(cursor.x-redZone.x)<4){document.querySelector('#shot-button').click();return true;}return false;});
  await page.waitForFunction(()=>awaitingAngle);await page.locator('#shot-button').tap();
  await page.waitForFunction(()=>awaitingPower);await page.locator('#shot-button').tap();
  await page.waitForTimeout(1150);
  const state=await page.evaluate(()=>({kills:killCount,swingActive,betweenSwings,awaitingAngle,awaitingPower,headAttached:prisonerHead.parentContainer===prisoner,headPhysics:prisonerHead.body?.enable,phase:document.querySelector('#shot-button').dataset.phase,round:roundCount}));
  console.log('FAST FIRST SHOT',JSON.stringify(state));
  assert.equal(state.round,1,'Only one entrance may run at startup');
  assert.equal(state.swingActive,false,'A launch must not restart the timing meter during flight');
  assert.equal(state.phase,'wait');
  console.log('SHOT EVENTS',JSON.stringify(await page.evaluate(()=>qaEvents)));
  await page.screenshot({path:path.join(output,'fast-shot.png')});
  await page.locator('.mobile-nav [data-screen="journal"]').tap();
  const journal=await page.evaluate(()=>({scrollHeight:document.querySelector('#dialog-body').scrollHeight,claimY:document.querySelector('[data-action="claim"]').getBoundingClientRect().y,visibleHeight:innerHeight,body:document.querySelector('#dialog-body').innerText.slice(0,450)}));
  console.log('JOURNAL',JSON.stringify(journal));
  assert.ok(journal.claimY<journal.visibleHeight,'The first contract reward should be visible without scrolling');
  fs.writeFileSync(path.join(output,'initial-findings.json'),JSON.stringify({state,journal,errors},null,2));
  if(process.argv.includes('--colliders')){
   const collision=await page.evaluate(()=>{
    const scene=game.scene.scenes[0],before=scene.physics.world.colliders.getActive().length;
    for(let i=0;i<50;i++){spawnBird(scene);const bird=targetGroup.getChildren().find(t=>t.targetType==='bird');if(bird){targetGroup.remove(bird);dropHitBird(scene,bird,bodyGroup.getChildren().find(t=>t.isHead));}}
    return {before,after:scene.physics.world.colliders.getActive().length,birds:bodyGroup.getChildren().filter(t=>t.isFallingBird).length};
   });
   console.log('PROJECTILE COLLIDERS',JSON.stringify(collision));assert.equal(collision.before,1);assert.equal(collision.after,1);assert.equal(collision.birds,50);
  }
  if(process.argv.includes('--transition')){
   await page.locator('[data-action="debug-grant"]').tap();await page.locator('#dialog-close').tap();
   await page.locator('.mobile-nav [data-screen="travel"]').tap();await page.locator('[data-travel="1"]').tap();
   await page.waitForFunction(()=>currentCity==='Durham'&&!MobileGame.isPaused());
   await page.waitForTimeout(6500);
   const transition=await page.evaluate(()=>({round:roundCount,city:currentCity,swingActive,events:qaEvents.filter(e=>['spawnPrisoner','startSwingMeter'].includes(e.name))}));
   console.log('MID SHOT TRAVEL',JSON.stringify(transition));
   fs.writeFileSync(path.join(output,'transition.json'),JSON.stringify({transition,errors},null,2));
   assert.equal(transition.round,2,'Only the new-city entrance may spawn after abandoning a shot');
  }
  if(process.argv.includes('--tour')){
   // Separate debug-assisted coverage; never counted as the fresh campaign.
   for(let i=0;i<20;i++)await page.locator('[data-action="debug-grant"]').tap();await page.locator('#dialog-close').tap();
   await page.evaluate(()=>{while(level<15)addXP(game.scene.scenes[0],xpThreshold-xp);});
   await page.waitForTimeout(5000);
   await page.locator('.mobile-nav [data-screen="workshop"]').tap();
   for(let i=0;i<29;i++)await page.locator('[data-buy="weapon"]').tap();
   for(let i=0;i<15;i++)await page.locator('[data-buy="storage"]').tap();
   for(let i=0;i<24;i++)await page.locator('[data-buy="platform"]').tap();
   assert.deepEqual(await page.evaluate(()=>({weapon:player.weaponLevel,cart:player.storageLevel,platform:player.platformLevel})),{weapon:30,cart:16,platform:25},'Every workshop upgrade is purchased through its button');
   await page.screenshot({path:path.join(output,'max-workshop.png')});await page.locator('#dialog-close').tap();
   const citiesToVisit=await page.evaluate(()=>cities.map((c,index)=>({name:c.name,index})));
   const tour=[];
   for(const city of citiesToVisit){
    if(city.index){await page.locator('.mobile-nav [data-screen="travel"]').tap();await page.locator('[data-travel="'+city.index+'"]').tap();await page.waitForFunction(name=>currentCity===name&&!MobileGame.isPaused(),city.name);}
    await page.waitForFunction(()=>swingActive&&inputEnabled);
    await page.screenshot({path:path.join(output,'tour-'+city.name.toLowerCase()+'.png')});
    await page.locator('.mobile-nav [data-screen="market"]').tap();
    for(let i=0;i<80;i++){const buy=page.locator('[data-target-buy]:enabled').first();if(!await buy.count())break;await buy.tap();}
    const state=await page.evaluate(()=>({city:currentCity,weather:currentWeather,owned:TargetShop.state,visited:Campaign.state.visited,remaining:document.querySelectorAll('[data-target-buy]:enabled').length}));
    assert.equal(state.remaining,0);tour.push(state);console.log('CITY TOUR',JSON.stringify({city:state.city,weather:state.weather}));
    await page.locator('#dialog-close').tap();
    if(errors.length)throw Error('City tour runtime error');
   }
   fs.writeFileSync(path.join(output,'city-tour.json'),JSON.stringify({tour,errors,assisted:true},null,2));
  }
  if(process.argv.includes('--mobile-checks')){
   await page.locator('#dialog-close').tap();await page.waitForFunction(()=>swingActive&&inputEnabled);
   for(const phase of ['timing','aim','power']){
    if(phase!=='timing'){
     if(phase==='aim')await page.waitForFunction(()=>{const b=document.querySelector('#shot-button');if(!b.disabled&&Math.abs(cursor.x-redZone.x)<5){b.click();return true;}return false;});
     else await page.locator('#shot-button').tap();
    }
    await page.locator('.mobile-nav [data-screen="journal"]').tap();
    const pose=()=>page.evaluate(()=>({cursor:cursor.x,angle:aimArrow.angle,power:aimArrow.scaleY,swingActive,awaitingAngle,awaitingPower}));
    const before=await pose();await page.waitForTimeout(500);assert.deepEqual(await pose(),before,'Menu pauses '+phase+' selection');
    await page.locator('#dialog-close').tap();
   }
   for(const [width,height]of [[320,568],[360,640],[390,844],[430,932]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(100);
    const bounds=await page.locator('#shot-button').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height,'Shot control fits '+width+'x'+height);
    assert.ok(bounds.height>=44,'Shot control has a touch-sized hit area');
    await page.screenshot({path:path.join(output,'layout-'+width+'.png')});
   }
   const beforeReload=await page.evaluate(()=>{SaveManager.performSave();return {gold:player.gold,kills:killCount,city:currentCity,rank:level};});
   await page.reload();await enterGame();await page.waitForFunction(()=>swingActive&&inputEnabled);
   assert.deepEqual(await page.evaluate(()=>({gold:player.gold,kills:killCount,city:currentCity,rank:level})),beforeReload,'Reload during power selection preserves earned progress');
   for(const weather of ['clear','wind','rain','snow','fog']){
    await page.evaluate(weather=>{const random=Math.random,pick=Phaser.Utils.Array.GetRandom,chops=killCount;try{killCount=Math.max(3,killCount);Math.random=()=>weather==='clear'?0:.99;Phaser.Utils.Array.GetRandom=()=>weather;applyRandomWeather(game.scene.scenes[0]);}finally{killCount=chops;Math.random=random;Phaser.Utils.Array.GetRandom=pick;}},weather);
    await page.waitForTimeout(weather==='fog'?7000:500);assert.equal(await page.evaluate(()=>currentWeather),weather);
    await page.screenshot({path:path.join(output,'weather-'+weather+'.png')});
   }
   await page.evaluate(()=>localStorage.setItem('choptoit-runtime-error',JSON.stringify({message:'Test diagnostic',time:new Date().toISOString()})));
   await page.locator('.mobile-nav [data-screen="journal"]').tap();await page.locator('[data-action="new-game"]').tap();await Promise.all([page.waitForEvent('load'),page.locator('[data-action="confirm-new"]').tap()]);
   await enterGame();
   await page.waitForFunction(()=>swingActive&&inputEnabled);
   const reset=await page.evaluate(()=>({gold:player.gold,kills:killCount,rank:level,error:localStorage.getItem('choptoit-runtime-error')}));
   assert.deepEqual(reset,{gold:0,kills:0,rank:1,error:null});
   console.log('MOBILE CHECKS',JSON.stringify({sizes:4,pausedPhases:3,reload:true,weather:5,newGame:reset,errors}));
   fs.writeFileSync(path.join(output,'mobile-checks.json'),JSON.stringify({beforeReload,reset,errors},null,2));
  }
  if(process.argv.includes('--campaign')){
   const diagnostics=[];
   await page.evaluate(()=>{const original=beheadPrisoner;window.beheadPrisoner=function(...args){const result=original(...args);const head=bodyGroup.getChildren().filter(t=>t.isHead).at(-1);window.qaLastLaunch={x:head?.x,y:head?.y,vx:head?.body?.velocity.x,vy:head?.body?.velocity.y,gravity:head?.body?.gravity.y,worldGravity:game.scene.scenes[0].physics.world.gravity.y,angle:args[2],power:args[3]};return result;};});
   await page.locator('#dialog-close').tap();
   async function menu(name){await page.locator('.mobile-nav [data-screen="'+name+'"]').tap();}
   async function claimAndPrepare(){
    await menu('journal');
    for(let n=0;n<6;n++){const b=page.locator('[data-action="claim"]');if(!await b.count()||!await b.isEnabled())break;await b.tap();}
    for(let n=0;n<100;n++){const b=page.locator('[data-challenge]:enabled').first();if(!await b.count())break;await b.tap();}
    const state=await page.evaluate(()=>({chapter:Campaign.state.claimed,gold:player.gold,rank:level,city:currentCity,targets:Campaign.state.targets,chops:killCount,fame,weapon:player.weaponLevel,days:Campaign.state.days}));
    console.log('PROGRESS',JSON.stringify(state));
    fs.writeFileSync(path.join(output,'campaign-progress.json'),JSON.stringify(state,null,2));
    fs.writeFileSync(path.join(output,'campaign-checkpoint.json'),JSON.stringify(await page.evaluate(()=>SaveManager.getData()),null,2));
    const ending=page.locator('[data-ending="freedom"]:enabled');if(await ending.count()){await ending.tap();console.log('CAMPAIGN ENDING',await page.evaluate(()=>Campaign.state.ending));return true;}
    await page.locator('#dialog-close').tap();
    if(state.weapon<8){await menu('workshop');for(let n=0;n<8;n++){if(await page.evaluate(()=>player.weaponLevel>=8)||!await page.locator('[data-buy="weapon"]').isEnabled())break;await page.locator('[data-buy="weapon"]').tap();}await page.locator('#dialog-close').tap();}
    const destination=state.chapter===1||state.chapter===2?'Durham':state.chapter===3?'Chester':state.chapter===4?'London':null;
    if(destination&&state.city!==destination){
     await menu('travel');const index=await page.evaluate(name=>cities.findIndex(c=>c.name===name),destination),key=page.locator('[data-key="'+index+'"]');
     if(await key.count()&&await key.isEnabled())await key.tap();
     const travel=page.locator('[data-travel="'+index+'"]');
     if(await travel.count()&&await travel.isEnabled()){await travel.tap();await page.waitForFunction(name=>currentCity===name&&!MobileGame.isPaused(),destination,{timeout:30000});await page.screenshot({path:path.join(output,destination.toLowerCase()+'.png')});}
     else await page.locator('#dialog-close').tap();
    }
    return false;
   }
   for(let shot=0;shot<(process.argv.includes('--diagnostic')?5:120);shot++){
    if(await claimAndPrepare())break;
    await page.waitForFunction(()=>swingActive&&inputEnabled,{},{timeout:20000});
    await page.waitForFunction(()=>{const button=document.querySelector('#shot-button');if(swingActive&&inputEnabled&&!button.disabled&&button.dataset.phase==='timing'&&Math.abs(cursor.x-redZone.x)<5){button.click();return true;}return false;});
    const plan=await page.evaluate(()=>{
     const origin={x:prisoner.x,y:prisoner.y-64},all=targetGroup.getChildren().filter(t=>t.active&&!t.collected&&t.body?.enable),basic=all.filter(t=>t.targetType==='standard'),targets=basic.length?basic:all;
     let best={distance:Infinity,angle:0,power:1.8};
     for(let angle=-75;angle<=75;angle+=3)for(let power=.6;power<=2.01;power+=.1){let{x:vx,y:vy}=ChopCore.launchVelocity(angle,power,getWeaponPowerMultiplier(),currentWeather==='wind'?windForce:{x:0,y:0}),x=origin.x,y=origin.y;for(let frame=0;frame<180;frame++){vx=Math.sign(vx)*Math.max(0,Math.abs(vx)-50/60);vy+=(vy>0&&['rain','snow'].includes(currentWeather)?currentWeather==='snow'?520:700:400)/60;x+=vx/60;y+=vy/60;for(const t of targets){const d=Math.hypot(x-t.x,y-t.y);if(d<best.distance)best={distance:d,angle,power};}if(y>origin.y+350)break;}}
     return {...best,origin,weather:currentWeather,targets:targets.map(t=>({x:t.x,y:t.y,id:t.targetOption?.id,type:t.targetType,motion:t.targetOption?.motion}))};
    });
    await page.evaluate(()=>window.qaPreviousAngle=aimArrow.angle);
    await page.waitForFunction(angle=>{const previous=window.qaPreviousAngle;window.qaPreviousAngle=aimArrow.angle;const button=document.querySelector('#shot-button');if(awaitingAngle&&!button.disabled&&button.dataset.phase==='aim'&&(Math.abs(aimArrow.angle-angle)<2||(previous-angle)*(aimArrow.angle-angle)<0)){button.click();return true;}return false;},plan.angle);
    await page.evaluate(()=>window.qaPreviousPower=aimArrow.scaleY);
    await page.waitForFunction(power=>{const previous=window.qaPreviousPower;window.qaPreviousPower=aimArrow.scaleY;const button=document.querySelector('#shot-button');if(awaitingPower&&!button.disabled&&button.dataset.phase==='power'&&(Math.abs(aimArrow.scaleY-power)<.025||(previous-power)*(aimArrow.scaleY-power)<0)){button.click();return true;}return false;},plan.power);
    await page.waitForFunction(()=>swingActive&&inputEnabled,{},{timeout:20000});
    diagnostics.push({plan,actual:await page.evaluate(()=>qaLastLaunch),hits:await page.evaluate(()=>Campaign.state.targets)});
    fs.writeFileSync(path.join(output,'shots.json'),JSON.stringify(diagnostics,null,2));
    if(shot%10===0)await page.screenshot({path:path.join(output,'campaign-shot-'+shot+'.png')});
    if(errors.length)throw Error('Runtime errors during campaign');
   }
   const final=await page.evaluate(()=>({campaign:Campaign.state,arcade:Arcade.state,save:SaveManager.getData(),kills:killCount,level,gold:player.gold,fame}));
   fs.writeFileSync(path.join(output,'campaign-result.json'),JSON.stringify({final,errors},null,2));
   console.log('FINAL',JSON.stringify({ending:final.campaign.ending,kills:final.kills,level:final.level,gold:final.gold,targets:final.campaign.targets,errors}));
  }
 }catch(error){
  console.log('PLAYTEST FAILURE',error.message);
  await page.screenshot({path:path.join(output,'failure.png')});
  fs.writeFileSync(path.join(output,'failure-events.json'),JSON.stringify(await page.evaluate(()=>window.qaEvents||[]),null,2));
  console.log('FAILURE STATE',JSON.stringify(await page.evaluate(()=>({swingActive,awaitingAngle,awaitingPower,inputEnabled,paused:MobileGame.isPaused(),phase:document.querySelector('#shot-button')?.dataset.phase,angle:aimArrow?.angle,power:aimArrow?.scaleY,kills:killCount,round:roundCount}))));
  await page.evaluate(()=>SaveManager.performSave());
  fs.writeFileSync(path.join(output,'checkpoint.json'),JSON.stringify(await page.evaluate(()=>localStorage.getItem('choptoit-save'))));
  throw error;
 }finally{clearInterval(clockTimer);await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
