// Choose a fixed height on arrival; camera zoom never stretches existing poles.
function desiredTargetPoleHeight(scene,target){
  const camera=scene.cameras.main,zoom=Math.max(.35,camera.zoom);
  const top=camera.worldView.y+GAME_HEIGHT*.22/zoom;
  const ceiling=Math.max(140,CHARACTER_BASE_Y-20-top-85);
  const seed=target.heightSeed ?? .5;
  const high=target.washingLine || target.targetOption?.art==='line' || target.isYorkTallWaver;
  const counts=[0,0,0];
  for(const other of targetGroup.getChildren()){
    if(other===target || !other.jester || !other.active || other.collected || other.leaving)continue;
    const fraction=(other.basePoleHeight ?? other.poleHeight)/ceiling;
    counts[fraction<.28?0:fraction<.6?1:2]++;
  }
  const least=Math.min(...counts),available=counts.map((n,i)=>n===least?i:-1).filter(i=>i>=0);
  const band=high?2:available[Math.min(available.length-1,Math.floor(seed*available.length))];
  target.heightBand=band;
  if(band===0)return Math.min(ceiling*.22,70+seed*100);
  return ceiling*(band===1?.34+seed*.18:.66+seed*.23);
}

// Runtime adapters keep target rules separate from the Phaser scene lifecycle.
function refreshSpecialTarget(target) {
  const option=target.targetOption,g=target.specialStatus;if(!g)return;
  g.clear();
  if(target.mustardPaint)target.specialSprite?.setTint(0xf9d86e);
  const count=option?.hits || option?.needed || 0;
  for(let i=0;i<count;i++)g.fillStyle(i<(target.trickCharge || target.trickHits || 0)?0x9ce2bf:0xe4bd70,1).fillCircle((i-(count-1)/2)*13,-45,4);
}
function updateSpecialTarget(scene,target) {
  if(!target.active || target.collected)return;
  if(target.washingLine){
    const a=target.jester,b=target.linePartner;
    if(!a?.active || !b?.active)return;
    const tipA=a.getWorldTransformMatrix().transformPoint(23,-20-target.poleHeight);
    const tipB=b.getWorldTransformMatrix().transformPoint(23,-20-target.poleHeight);
    target.setPosition((tipA.x+tipB.x)/2,(tipA.y+tipB.y)/2);
    const half=(tipB.x-tipA.x)/2,dy=(tipB.y-tipA.y)/2,g=target.lineArt;g.clear();g.lineStyle(3,0x594832,1);
    g.beginPath();g.moveTo(-half,-dy);g.lineTo(0,12);g.lineTo(half,dy);g.strokePath();
    for(const part of target.specialParts || []){part.partOffset=part.lineFraction*half;part.lineYOffset=dy*part.lineFraction+12*(1-Math.abs(part.lineFraction));}
    CastArt.holdPole(b.poleHands,0);
  }
  const o=target.targetOption,sprite=target.specialSprite,pose=SpecialTargets.state(o,scene.time.now-(target.motionStartedAt || 0));
  if(sprite){
    if(['redirect','coin','extreme','speed','wind'].includes(o.effect))sprite.setRotation(pose.angle);
    if(['gate','alignment','lift'].includes(o.effect))sprite.setTint(pose.open?0xffffff:0x7f8c89);
    if(o.art==='book'||o.art==='press')sprite.scaleX=(pose.open?1:.4)*72/128;
    if(o.effect==='cycle')sprite.setTint([0xffd36b,0x9ce2bf,0xef9678][pose.mode]);
    if(o.effect==='jackpot')sprite.setTint(pose.matched?0xffe7a3:0xffffff);
    if(o.effect==='aim'){
      const next=targetGroup.getChildren().filter(t=>t!==target&&t.active&&!t.collected&&t.body?.enable).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
      if(next&&['compass','bumper'].includes(o.art))sprite.setRotation(Math.atan2(next.y-target.y,next.x-target.x)+Math.PI/2);
    }
  }
  for(const part of target.specialParts || [])if(part.active&&!part.collected){
    part.setPosition(target.x+part.partOffset,target.y+(target.washingLine?part.lineYOffset:5));
    if(part.body){
      part.body.x=part.x+part.body.offset.x;part.body.y=part.y+part.body.offset.y;
      // Attached clothes are positioned by the rope, not by physics displacement.
      part.body.updateFromGameObject?.();
      if(part.body.position){part.body.prev?.copy(part.body.position);part.body.prevFrame?.copy(part.body.position);}
    }
  }
}
function specialTargetAPI(scene) {
  return {
    windX:windForce.x,
    targets:()=>targetGroup.getChildren().filter(t=>!t.partParent),
    refresh:refreshSpecialTarget,
    sonic(target,projectile){sonicWave(scene,target,projectile);},
    flash(target,text,color){
      if(!target.active)return;
      const label=scene.add.text(target.x,target.y-65,text,{font:'bold 18px Trebuchet MS',color:'#'+color.toString(16).padStart(6,'0'),stroke:'#25343b',strokeThickness:3}).setOrigin(.5).setDepth(26);
      const tween=scene.tweens.add({targets:label,y:label.y-22,alpha:0,duration:900,onComplete:()=>label.destroy()});label.once('destroy',()=>tween.stop());
    },
    gold(target,projectile,amount){addGold(scene,amount);const source=projectile?.comboSource || projectile;if(source)source.targetGold=(source.targetGold || 0)+amount;gainFame(scene,target,0,amount);},
    clearFog(duration){
      const expiry=scene.time.now+duration;scene.trickClearFogUntil=expiry;
      fogEmitter?.stop();fogEmitter?.killAll?.();
      scene.time.delayedCall(duration,()=>{if(currentWeather==='fog'&&scene.trickClearFogUntil===expiry)fogEmitter?.start();});
    },
    chain(origin,target,projectile,delay){
      if(!target.active || target.collected || target.leaving)return;
      const icon=scene.add.image(origin.x,origin.y,'specialTargets',String(origin.targetOption?.frame || 0)).setDisplaySize(26,26).setDepth(24);
      const tween=scene.tweens.add({targets:icon,x:target.x,y:target.y,angle:180,duration:Math.max(200,delay),ease:'Sine.easeIn',onComplete:()=>{
        icon.destroy();if(target.active&&!target.collected&&!target.leaving)handleTargetHit(scene,target,projectile,true);
      }});icon.once('destroy',()=>tween.stop());
    },
    pieces(target,option,projectile){
      const count=Math.min(option.pieces || 3,Math.max(0,36-targetGroup.getChildren().length));
      for(let i=0;i<count;i++){
        if(option.art==='crate'){spawnFlyingFruit(scene,target.x,target.y,i,count,projectile);continue;}
        const frame=SpecialTargets.frameFor(option.partArt || (option.art==='crate'?'apple':'gold'));
        const part=spawnSpecialPiece(scene,target.x+(i-(count-1)/2)*22,target.y-(option.high?90:0),frame,option.treasure?150:12,option.stationary);
        part.body.setVelocity(option.stationary?0:(i-(count-1)/2)*80,option.stationary?0:option.treasure?35:-180-Math.random()*120);
        part.body.setGravityY(option.slow?-300:0);
      }
    }
  };
}
function spawnSpecialPiece(scene,x,y,frame,gold,stationary=false) {
  const part=scene.add.container(x,y).setSize(32,32).setDepth(21);
  part.targetType='special';part.fragmentFrame=frame;part.fragmentGold=gold;part.fameMultiplier=2;part.collected=false;part.targetOption={};
  createTargetAppearance(scene,part,'special');scene.physics.world.enable(part);
  part.body.setCircle(13).setOffset(-13,-13).setAllowGravity(!stationary).setImmovable(stationary);part.body.setCollideWorldBounds(false);
  targetGroup.add(part);
  if(!stationary){part.expiry=scene.time.delayedCall(5000,()=>{if(part.active){targetGroup.remove(part);part.destroy();}});part.once('destroy',()=>part.expiry?.remove(false));}
  return part;
}
function initializeSpecialTarget(scene,target) {
  const o=target.targetOption;
  if(o.effect==='parts'){
    target.body.enable=false;target.specialSprite?.setAlpha(.4);target.specialPartsRemaining=o.pieces;target.specialParts=[];
    for(let i=0;i<o.pieces;i++){
      const offset=(i-(o.pieces-1)/2)*28,part=spawnSpecialPiece(scene,target.x+offset,target.y+5,SpecialTargets.frameFor(o.partArt),10,true);
      part.partParent=target;part.partOffset=offset;target.specialParts.push(part);
      part.lineFraction=-.8+i*1.6/Math.max(1,o.pieces-1);
      if(o.art==='line' && i%2){
        part.removeAll(true);
        const cloth=scene.add.polygon(0,8,i===1?[0,0,9,-8,17,-4,25,-8,34,0,27,9,25,28,9,28,7,9]:[0,0,28,0,26,30,17,30,14,10,11,30,2,30],i===1?0xc57564:0x638d9b).setStrokeStyle(2,0x25343b);
        part.add(cloth);
      }
    }
    target.once('destroy',()=>{for(const part of target.specialParts)if(part.active){targetGroup.remove(part);part.destroy();}});
    if(o.art==='line')prepareWashingLine(scene,target);
  }
}

function prepareWashingLine(scene,target){
  if(!target.jester)return;
  target.washingLine=true;target.motionStartedAt=scene.time.now;target.specialSprite?.setVisible(false);
  const first=target.jester,centre=target.lineDestination ?? first.x,half=155;
  const entrance=first.startFromRight?offscreenActorX(scene,true)+half:offscreenActorX(scene,false)-half;
  first.x=entrance-half;
  const partner=scene.add.container(entrance+half,CHARACTER_BASE_Y).setDepth(20);
  partner.startFromRight=first.startFromRight;
  const pole=scene.add.rectangle(23,-20,6,target.poleHeight,0x8b4513).setOrigin(.5,1);
  const body=CastArt.jester(scene.add.image(0,63,'jesterBody1').setOrigin(.5,1),'jesterBody2');
  partner.poleHands=scene.add.graphics();partner.jesterPole=pole;partner.add([pole,body,partner.poleHands]);
  CastArt.strain(scene,partner,body,target.poleHeight,1);CastArt.walk(scene,partner,1800);CastArt.walk(scene,first,1800);
  target.linePartner=partner;target.lineArt=scene.add.graphics();target.add(target.lineArt);
  // Keep the clothes unavailable until both ends of the line reach their places.
  for(const part of target.specialParts)part.body.enable=false;
  const firstArrival=scene.tweens.add({targets:first,x:centre-half,duration:1800,ease:'Linear'});
  const arrival=scene.tweens.add({targets:partner,x:centre+half,duration:1800,ease:'Linear',onComplete:()=>{
    if(!target.active || target.collected)return;
    for(const part of target.specialParts)if(part.active)part.body.enable=true;
  }});
  target.once('destroy',()=>{target.disposing=true;arrival.stop();firstArrival.stop();if(partner.scene && !partner.lineDisposing){scene.tweens.killTweensOf(partner);partner.destroy();}if(first.scene && !first.lineDisposing){scene.tweens.killTweensOf(first);first.destroy();}});
}

function departWashingLine(scene,target){
  if(!target?.scene || target.disposing || target.lineDeparting)return;
  target.lineDeparting=true;
  target.collected=true;target.leaving=true;targetGroup.remove(target);
  if(target.body)target.body.enable=false;
  for(const part of target.specialParts || []){targetGroup.remove(part);if(part.active)part.destroy();}
  target.lineArt?.setVisible(false);
  const carriers=[target.jester,target.linePartner].filter(c=>c?.active);
  let remaining=carriers.length;
  if(!remaining){target.destroy();return;}
  carriers.forEach((carrier,i)=>{
    scene.tweens.killTweensOf(carrier);carrier.running=true;CastArt.walk(scene,carrier,1600,true);
    (scene.departingCarriers ||= new Set()).add(carrier);
    carrier.once('destroy',()=>{carrier.lineDisposing=true;carrier.exitTween?.stop();scene.departingCarriers.delete(carrier);if(--remaining===0 && target.scene && !target.disposing){target.disposing=true;target.destroy();}});
    carrier.exitTween=scene.tweens.add({targets:carrier,x:offscreenActorX(scene,i===1),duration:1600,ease:'Linear',onComplete:()=>{
      if(carrier.scene)carrier.destroy();
    }});
  });
}

function spawnFlyingFruit(scene,x,y,index,count,projectile){
  if(bodyGroup.getChildren().filter(p=>p.active&&p.isFlyingFruit).length>=18)return;
  const apple=scene.add.image(x,y,'specialTargets',String(SpecialTargets.frameFor('apple'))).setDisplaySize(30,30).setDepth(23);
  apple.isFlyingFruit=true;apple.comboSource=projectile?.comboSource || projectile;apple.power=projectile?.power || 1;apple.prevX=x;apple.prevY=y;
  bodyGroup.add(apple);apple.body.setCircle(48).setOffset(16,16).setAllowGravity(true).setImmovable(false);
  apple.body.setCollideWorldBounds(true);apple.body.checkCollision.up=false;apple.body.onWorldBounds=true;
  apple.body.setVelocity((index-(count-1)/2)*105+(currentWeather==='wind'?windForce.x:0)*.35,-250-Math.random()*150).setAngularVelocity((index%2?1:-1)*130);
  apple.body.setAccelerationX(currentWeather==='wind'?windForce.x*.45:0);
  const expiry=scene.time.delayedCall(8000,()=>{if(apple.active)apple.destroy();});
  apple.once('destroy',()=>{expiry.remove(false);bodyGroup.remove(apple);});
  return apple;
}

function sonicWave(scene,origin,projectile){
  for(let i=0;i<3;i++){
    const ring=scene.add.circle(origin.x,origin.y,12,0xf1db9d,.04).setStrokeStyle(3-i*.6,0xf1db9d,.85).setDepth(24);
    const tween=scene.tweens.add({targets:ring,scale:18,alpha:0,duration:650,delay:i*90,onComplete:()=>{if(ring.active)ring.destroy();}});
    ring.once('destroy',()=>tween.stop());
  }
  // A small, bounded cascade gives the ringing bell a mechanical consequence.
  targetGroup.getChildren().filter(t=>t!==origin&&t.active&&!t.collected&&t.body?.enable&&Math.hypot(t.x-origin.x,t.y-origin.y)<215)
    .sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y)).slice(0,2).forEach(t=>{
      scene.time.delayedCall(250,()=>{if(t.active&&!t.collected&&!t.leaving)handleTargetHit(scene,t,projectile,true);});
    });
}

function applyBirdEffect(scene,bird,projectile){
  if(bird.birdKind==='swallow' && projectile?.body?.enable)projectile.body.setVelocity(projectile.body.velocity.x*1.15,-Math.max(520,Math.abs(projectile.body.velocity.y)));
  if(bird.birdKind==='owl')specialTargetAPI(scene).clearFog(6000);
  if(bird.birdKind==='magpie')specialTargetAPI(scene).pieces(bird,{pieces:3,partArt:'gold'},projectile);
  if(bird.birdKind==='phoenix')sonicWave(scene,bird,projectile);
}

function updateSkyEncounters(scene){
  const now=scene.time.now,zoom=scene.cameras.main.zoom;
  if(FEATURES.birds && now>(scene.nextFlockAt || 0)){scene.nextFlockAt=now+(zoom<.7?2300:12000);if(prisonerHead?.active)spawnBird(scene);}
  if(zoom>.5 || now<(scene.nextCraftAt || 0))return;
  scene.nextCraftAt=now+14000;
  const type=zoom<=.37 && Math.random()<.55?'ufo':'balloon';
  spawnSkyCraft(scene,type);
}

function spawnSkyCraft(scene,type){
  const zoom=scene.cameras.main.zoom;if(zoom>(type==='ufo'?.37:.5))return;
  if(targetGroup.getChildren().some(t=>t.skyCraft===type&&t.active&&!t.collected))return;
  // Distant prizes belong to the sky, independent of the player's current blade.
  const y=scene.cameras.main.worldView.y+GAME_HEIGHT*(type==='ufo'?.2:.3)/zoom+100;
  const fromRight=Math.random()<.5,craft=scene.add.container(offscreenActorX(scene,fromRight),y).setDepth(20);
  craft.targetType=type;craft.skyCraft=type;craft.fromRight=fromRight;craft.specialGold=type==='ufo'?1500:500;craft.fameMultiplier=type==='ufo'?10:5;craft.collected=false;
  const g=scene.add.graphics();craft.add(g);craft.skyArt=g;
  if(type==='ufo'){
    g.fillStyle(0x7ab5ad).fillPoints([{x:-33,y:0},{x:-22,y:-26},{x:0,y:-38},{x:25,y:-22},{x:34,y:0}],true);
    g.fillStyle(0xdcc084).fillPoints([{x:-75,y:3},{x:-43,y:-9},{x:39,y:-9},{x:77,y:4},{x:43,y:26},{x:-40,y:26}],true);
    g.fillStyle(0x5e6e81).fillPoints([{x:-75,y:3},{x:77,y:4},{x:43,y:26},{x:-40,y:26}],true);
    for(let x=-44;x<=44;x+=22)g.fillStyle(0xa2eccd).fillCircle(x,9,5);
    g.lineStyle(3,0x25343b).strokeEllipse(0,3,150,42);
  }else{
    g.fillStyle(0xbf6659).fillPoints([{x:0,y:-80},{x:-42,y:-64},{x:-60,y:-20},{x:-48,y:20},{x:0,y:59},{x:48,y:20},{x:60,y:-20},{x:42,y:-64}],true);
    g.fillStyle(0xe8bd70).fillPoints([{x:0,y:-80},{x:-20,y:-62},{x:-25,y:-15},{x:0,y:59},{x:25,y:-15},{x:20,y:-62}],true);
    g.lineStyle(3,0x25343b).lineBetween(-18,42,-18,81).lineBetween(18,42,18,81);
    g.fillStyle(0x936947).fillRect(-23,76,46,28);g.lineStyle(3,0xe1b97c).strokeRect(-23,76,46,28);
  }
  scene.physics.world.enable(craft);craft.body.setSize(type==='ufo'?150:120,type==='ufo'?66:190).setOffset(type==='ufo'?-75:-60,type==='ufo'?-38:-82).setAllowGravity(false).setImmovable(true);
  targetGroup.add(craft);
  const flight=scene.tweens.add({targets:craft,x:offscreenActorX(scene,!fromRight),duration:type==='ufo'?11000:19000,ease:'Linear',onComplete:()=>{if(craft.active)craft.destroy();}});craft.moveTween=flight;
  const bob=scene.tweens.add({targets:g,y:{from:-8,to:8},duration:1200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  craft.bobTween=bob;
  craft.once('destroy',()=>{flight.stop();bob.stop();targetGroup.remove(craft);});
  return craft;
}

function burstSkyCraft(scene,target,projectile){
  if(target.skyCraft==='ufo'){
    sonicWave(scene,target,projectile);fireworkEmitter.explode(24,target.x,target.y);target.destroy();return;
  }
  if(target.isFallingCraft)return;
  specialTargetAPI(scene).pieces(target,{pieces:4,partArt:'gold',treasure:true},projectile);
  target.moveTween?.stop();target.bobTween?.stop();
  target.isFallingCraft=true;target.comboSource=projectile?.comboSource || projectile;
  target.prevX=target.x;target.prevY=target.y;target.power=projectile?.power || 1;
  bodyGroup.add(target);
  target.body.setAllowGravity(true).setImmovable(false).setCollideWorldBounds(true);
  target.body.checkCollision.up=false;target.body.onWorldBounds=true;
  target.body.setVelocity(target.fromRight?-240:240,-130).setAngularVelocity(65).setDrag(30,0);
  target.body.setAccelerationX(currentWeather==='wind'?windForce.x*.45:0);
  const deflate=scene.tweens.add({targets:target.skyArt,scaleX:.42,scaleY:.58,duration:1600,ease:'Sine.easeIn'});
  let bursts=0;
  const sputter=scene.time.addEvent({delay:280,repeat:5,callback:()=>{
    if(!target.scene || !target.body?.enable)return;
    const side=bursts++%2?1:-1;
    target.body.setVelocityX(side*(230+Math.random()*170));
    target.body.setVelocityY(target.body.velocity.y-90);
    target.body.setAngularVelocity(side*95);
    fireworkEmitter.explode(3,target.x,target.y-20);
  }});
  const expiry=scene.time.delayedCall(16000,()=>landSkyCraft(scene,target));
  target.once('destroy',()=>{deflate.stop();sputter.remove(false);expiry.remove(false);bodyGroup.remove(target);});
}

function landSkyCraft(scene,target){
  if(!target?.scene || target.crashLanded)return;
  target.crashLanded=true;
  fireworkEmitter.explode(16,target.x,target.y);
  target.destroy();
}

function updateWideWeather(scene){
  const c=scene.cameras.main,v=c.worldView;
  if(scene.weatherViewZoom===Math.round(c.zoom*20))return;
  scene.weatherViewZoom=Math.round(c.zoom*20);
  const left=v.x-100,right=v.right+100,top=v.y;
  rainEmitter?.setPosition(0,0);snowEmitter?.setPosition(0,0);windEmitter?.setPosition(0,0);
  rainEmitter?.setEmitZone({type:'random',source:new Phaser.Geom.Rectangle(left,top,right-left,Math.max(100,WEATHER_MAX_Y-top))});
  snowEmitter?.setEmitZone({type:'random',source:new Phaser.Geom.Rectangle(left,top,right-left,Math.max(100,(scene.remainsFloor || GROUND_Y)-top))});
  fogEmitter?.setScale({start:2.4/c.zoom,end:3.6/c.zoom});fogEmitter?.setSpeedX({min:110/c.zoom,max:145/c.zoom});
  fogEmitter?.setPosition(left-480/c.zoom,0);fogEmitter?.setEmitZone({type:'random',source:new Phaser.Geom.Rectangle(0,top,1,Math.max(100,FOG_MAX_Y-top))});
  windEmitter?.setEmitZone({type:'random',source:new Phaser.Geom.Rectangle(left,top,right-left,Math.max(100,WIND_MAX_Y-top))});
}

