// Assisted real-engine collision coverage; separate from the earned fresh-save campaign.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/siu03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createPreview}=require('./serve.cjs');
(async()=>{
 const out=path.resolve(__dirname,'../qa/full-target-audit');fs.mkdirSync(out,{recursive:true});
 const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await context.addInitScript(()=>localStorage.setItem('choptoit-intro-read','yes'));
 const page=await context.newPage(),errors=[],results=[];page.on('pageerror',e=>{errors.push(e.stack);console.log('ERROR',e.message);});
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#start-overlay').tap();await page.waitForFunction(()=>swingActive&&inputEnabled);
  await page.evaluate(()=>{game.loop.stop();window.qs=game.scene.scenes[0];window.qaTime=game.loop.now;window.qaAdvance=ms=>{for(let i=0;i<Math.ceil(ms/(1000/60));i++){qaTime+=1000/60;game.loop.now=qaTime;game.headlessStep(qaTime,1000/60);game.scene.isProcessing=false;qs?.cameras.main.preRender();}};});
  await page.evaluate(()=>{
   window.qs=game.scene.scenes[0];qs.nextFlockAt=Infinity;qs.nextCraftAt=Infinity;currentWeather='clear';windForce.x=0;
   window.makeShot=(x,y,vy=350)=>{const h=qs.add.image(x,y,'castHeads','0').setDisplaySize(36,36).setDepth(25);h.isHead=true;h.power=2;h.targetCombo=0;h.targetGold=0;h.chopGold=10;h.prevX=x;h.prevY=y;bodyGroup.add(h);h.body.setCircle(16).setOffset(0,0).setAllowGravity(false).setCollideWorldBounds(false).setVelocity(0,vy);return h;};
  });
  await page.evaluate(()=>retirePreviousRoundTargets(qs));await page.evaluate(ms=>qaAdvance(ms),2000);
  const catalog=await page.evaluate(()=>TargetShop.catalog.filter(o=>!['basket','event'].includes(o.type)));
  for(const option of catalog){
   await page.evaluate(o=>{retirePreviousRoundTargets(qs);bodyGroup.getChildren().slice().forEach(h=>h.destroy());currentCity=o.city;spawnTarget(qs,[],o);},option);
   await page.evaluate(ms=>qaAdvance(ms),1800);
   const geometry=await page.evaluate(id=>{window.qt=targetGroup.getChildren().find(t=>t.targetOption?.id===id);if(!qt)throw Error('Missing target '+id);if(!qt.jester)return {height:0,attachmentError:0,parts:0};const pole=qt.jesterPole,a=pole.rotation;const tip=qt.jester.getWorldTransformMatrix().transformPoint(pole.x+Math.sin(a)*qt.poleHeight,pole.y-Math.cos(a)*qt.poleHeight);if(qt.washingLine){const b=qt.linePartner.getWorldTransformMatrix().transformPoint(23,-20-qt.poleHeight);tip.x=(tip.x+b.x)/2;tip.y=(tip.y+b.y)/2;}return {height:qt.poleHeight,attachmentError:Math.hypot(tip.x-qt.x,tip.y-qt.y),parts:qt.specialParts?.length||0};},option.id);
   assert.ok(geometry.attachmentError<8,'Pole remains attached: '+option.id+' '+JSON.stringify(geometry));
   if(option.effect==='parts'){
    for(let i=0;i<option.pieces;i++){await page.evaluate(i=>{const t=qt.specialParts[i];makeShot(t.x,t.y-60);},i);await page.evaluate(ms=>qaAdvance(ms),450);}
   }else{
    for(let i=0;i<(option.hits||1);i++){
     await page.evaluate(()=>{qt.motionStartedAt=qs.time.now;makeShot(qt.x,qt.y-60);});await page.evaluate(ms=>qaAdvance(ms),450);
    }
   }
   const hit=await page.evaluate(()=>({collected:qt.collected,hits:qt.trickHits,active:qt.active,targets:Arcade.state.targets}));
   results.push({id:option.id,city:option.city,...geometry,...hit});fs.writeFileSync(path.join(out,'targets.json'),JSON.stringify({assisted:true,results,errors},null,2));
   assert.equal(hit.collected,true,'Physical projectile completes '+option.id);
   await page.evaluate(ms=>qaAdvance(ms),2000);assert.equal(errors.length,0);
   console.log('TARGET',option.id,'PASS');
  }

  // Six basket variants: actual moving carrier and swept falling-head crossing.
  const baskets=await page.evaluate(()=>TargetShop.catalog.filter(o=>o.type==='basket'));
  for(const option of baskets){
   const caught=await page.evaluate(o=>{
    retirePreviousRoundTargets(qs);qaAdvance(2000);bodyGroup.getChildren().slice().forEach(h=>h.destroy());qs.basketCarrier?.destroy();qs.basketCarrier=null;
    const oldBasket=TargetShop.basket,descriptor=Object.getOwnPropertyDescriptor(TargetShop,'lastBasket'),between=Phaser.Math.Between;
    try{TargetShop.basket=()=>o.multiplier;Object.defineProperty(TargetShop,'lastBasket',{configurable:true,get:()=>o});Phaser.Math.Between=(a,b)=>a;spawnBasketCarrier(qs);}
    finally{TargetShop.basket=oldBasket;Object.defineProperty(TargetShop,'lastBasket',descriptor);Phaser.Math.Between=between;}
    qaAdvance(1800);const basket=qs.basketCarrier;const h=makeShot(basket.x,basket.y-23,350);qaAdvance(100);return {caught:h.basketCaught,multiplier:basket.multiplier,active:basket.active};
   },option);assert.equal(caught.caught,true,'Basket '+option.id);results.push({id:option.id,...caught});console.log('BASKET',option.id,'PASS');
  }
  await page.evaluate(()=>{qs.basketCarrier?.destroy();qs.basketCarrier=null;bodyGroup.getChildren().slice().forEach(h=>h.destroy());killStreak=24;qaAdvance(2000);});
  for(const [index,kind]of ['crow','dove','swallow','magpie','owl','phoenix'].entries()){
   const hit=await page.evaluate(({index,kind})=>{
    const old=Phaser.Math.Between;try{Phaser.Math.Between=(a,b)=>a===0&&b===5?index:a;spawnBird(qs);}finally{Phaser.Math.Between=old;}
    const b=targetGroup.getChildren().find(t=>t.targetType==='bird'&&!t.collected);b.moveTween.stop();b.setX(400);b.body.updateFromGameObject();makeShot(b.x,b.y-60);qaAdvance(500);return {kind:b.birdKind,collected:b.collected,falling:b.isFallingBird};
   },{index,kind});assert.equal(hit.kind,kind);assert.ok(hit.collected&&hit.falling);results.push({id:'bird-'+kind,...hit});console.log('BIRD',kind,'PASS');
  }
  for(const type of ['ufo','balloon']){
   const hit=await page.evaluate(type=>{window.qcraft=spawnSkyCraft(qs,type);qcraft.moveTween.stop();qcraft.setX(400);qcraft.body.updateFromGameObject();makeShot(qcraft.x,qcraft.y-60);qaAdvance(500);return {collected:qcraft.collected,falling:qcraft.isFallingCraft};},type);assert.ok(hit.collected);if(type==='balloon')assert.ok(hit.falling);results.push({id:'sky-'+type,...hit});console.log('SKY',type,'PASS');
  }
  const ring=await page.evaluate(()=>{currentCity='Winchester';player.weaponLevel=8;spawnYorkRingPlatformEvent(qs);qaAdvance(2200);const r=yorkRingPlatformEvent.activeRing;if(!r)throw Error('No thrown ring');qs.tweens.killTweensOf(r);makeShot(r.sprite.x,r.sprite.y-45,500);qaAdvance(250);return {spent:r.spent,banner:document.querySelector('#combo-banner').textContent};});assert.ok(ring.spent);results.push({id:'rings',...ring});
  const golf=await page.evaluate(()=>{cleanupYorkRingPlatformEvent(qs);currentCity='Gloucester';spawnYorkFlyingIslandEvent(qs);qaAdvance(1800);window.qisland=yorkFlyingIslandEvent;const m=getFlyingIslandMetrics(qisland);makeShot(m.holeX,m.holeY-40,200);qaAdvance(300);return {success:qisland.success,banner:document.querySelector('#combo-banner').textContent};});assert.ok(golf.success);results.push({id:'island',...golf});
  fs.writeFileSync(path.join(out,'targets.json'),JSON.stringify({assisted:true,results,errors},null,2));


  if(process.argv.includes('--challenges')){
   await page.evaluate(()=>{cleanupYorkFlyingIslandEvent(qs);cleanupYorkRingPlatformEvent(qs);currentCity='York';retirePreviousRoundTargets(qs);qaAdvance(2000);spawnPrisoner(qs,false);qaAdvance(1800);});
   // Use the same three-input path as the phone button. Exact timing/aim are assisted.
   for(let batch=0;batch<20;batch++){
    const progress=await page.evaluate(()=>{
     for(let i=0;i<50;i++){
      if(!swingActive||!inputEnabled)throw Error('Shot did not become ready '+killCount);
      cursor.x=redZone.x;MobileGame.strike();if(!awaitingAngle)throw Error('No aim phase');
      arrowTween?.stop();aimArrow.angle=0;MobileGame.strike();arrowPowerTween?.stop();aimArrow.scaleY=2;MobileGame.strike();
      qaAdvance(4900);
      // Release settled test remains periodically; visual pile coverage is separate.
      if(i%10===0)bodyGroup.getChildren().slice().filter(h=>h.hasSettled).forEach(h=>h.destroy());
     }
     SaveManager.performSave();return {chops:Arcade.state.chops,perfects:Arcade.state.perfects,faces:Arcade.state.heads.filter(n=>n>0).length,rank:level,save:SaveManager.getData()};
    });
    fs.writeFileSync(path.join(out,'challenge-checkpoint.json'),JSON.stringify(progress,null,2));console.log('CHALLENGE CHOPS',progress.chops,'FACES',progress.faces,'RANK',progress.rank);
   }
   await page.evaluate(()=>{
    window.simpleTarget=(x,y)=>{const t=qs.add.container(x,y).setDepth(20);t.targetType='standard';t.targetOption={id:'red'};t.collected=false;createTargetAppearance(qs,t,'standard');qs.physics.world.enable(t);t.body.setCircle(20).setOffset(-20,-20).setAllowGravity(false).setImmovable(true);targetGroup.add(t);return t;};
    retirePreviousRoundTargets(qs);qaAdvance(2000);bodyGroup.getChildren().slice().forEach(h=>h.destroy());
   });
   // Physical nine-target chains in wind cover chain, score, target and weather goals.
   for(let batch=0;batch<12;batch++){
    await page.evaluate(()=>{currentWeather='wind';windForce.x=0;for(let i=0;i<10;i++){for(let n=0;n<9;n++)simpleTarget(400,250+n*60);const h=makeShot(400,150,1800);qaAdvance(600);if(h.targetCombo<9)throw Error('Nine-target chain missed: '+h.targetCombo);qaAdvance(400);bodyGroup.getChildren().slice().forEach(h=>h.destroy());}});
   }
   // Every barrel is struck and allowed to complete its real fuse/explosion.
   await page.evaluate(()=>{for(let i=0;i<150;i++){spawnTarget(qs,[],TargetShop.catalog.find(o=>o.id==='barrel'));qaAdvance(1700);const t=targetGroup.getChildren().find(t=>t.targetType==='explodingBarrel'&&!t.collected);makeShot(t.x,t.y-60);qaAdvance(1000);if(!t.barrelExploded)throw Error('Barrel did not explode');bodyGroup.getChildren().slice().forEach(h=>h.destroy());}});
   // Bank shots physically hit a target before crossing a waiting basket's mouth.
   await page.evaluate(()=>{
    currentWeather='clear';const o=TargetShop.catalog.find(o=>o.id==='basket');
    const old=TargetShop.basket,descriptor=Object.getOwnPropertyDescriptor(TargetShop,'lastBasket'),between=Phaser.Math.Between;
    try{TargetShop.basket=()=>2;Object.defineProperty(TargetShop,'lastBasket',{configurable:true,get:()=>o});Phaser.Math.Between=(a,b)=>a;spawnBasketCarrier(qs);}finally{TargetShop.basket=old;Object.defineProperty(TargetShop,'lastBasket',descriptor);Phaser.Math.Between=between;}
    qaAdvance(1800);const basket=qs.basketCarrier;basket.moveTween.stop();basket.waitEvent?.remove(false);
    for(let i=0;i<100;i++){basket.caughtHead?.destroy();basket.caughtHead=null;basket.used=false;simpleTarget(basket.x,basket.y-85);const h=makeShot(basket.x,basket.y-140,350);qaAdvance(500);if(!h.basketCaught||h.targetCombo<1)throw Error('Bank shot failed '+i);}
   });
   const progress=await page.evaluate(()=>({rank:level,state:Arcade.state,challenges:Arcade.progress(level)}));
   fs.writeFileSync(path.join(out,'challenge-progress.json'),JSON.stringify(progress,null,2));
   assert.equal(progress.challenges.filter(c=>c.current>=c.goal&&!c.locked).length,100,'All 100 challenges earned through gameplay events');
   // Claim each earned reward using the journal buttons, then verify persistence.
   await page.locator('.mobile-nav [data-screen="journal"]').tap();
   for(let i=0;i<100;i++){const b=page.locator('[data-challenge]:enabled').first();if(!await b.count())break;await b.tap();}
   const claimed=await page.evaluate(()=>{SaveManager.performSave();return {count:Arcade.state.claimed.length,save:SaveManager.getData()};});assert.equal(claimed.count,100);
   await page.reload();await page.locator('#start-overlay').tap();await page.waitForFunction(()=>swingActive&&inputEnabled);assert.equal(await page.evaluate(()=>Arcade.state.claimed.length),100,'All claimed rewards survive a reload');assert.equal(await page.evaluate(()=>Arcade.claim(Arcade.progress(level)[0].id,level)),0,'Reload cannot claim a reward twice');
   fs.writeFileSync(path.join(out,'challenge-result.json'),JSON.stringify({assisted:true,claimed,reloadVerified:true,errors},null,2));console.log('ALL 100 CHALLENGES CLAIMED AND RELOADED');
  }

  console.log(JSON.stringify({completed:results.length,errors}));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.txt'),e.stack);throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
