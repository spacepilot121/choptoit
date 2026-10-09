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
    part.setPosition(target.x+part.partOffset,target.y+5);
    if(part.body){part.body.x=part.x+part.body.offset.x;part.body.y=part.y+part.body.offset.y;}
  }
}
function specialTargetAPI(scene) {
  return {
    windX:windForce.x,
    targets:()=>targetGroup.getChildren().filter(t=>!t.partParent),
    refresh:refreshSpecialTarget,
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
    }
    target.once('destroy',()=>{for(const part of target.specialParts)if(part.active){targetGroup.remove(part);part.destroy();}});
  }
}
