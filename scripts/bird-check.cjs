const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
class Object2D extends EventEmitter {
  constructor(x,y){super();this.x=x;this.y=y;this.children=[];this.active=true;}
  setScale(x,y){this.scaleX=x;this.scaleY=y;return this;}
  setStrokeStyle(){return this;}
  setDepth(){return this;}
  add(children){this.children.push(...(Array.isArray(children)?children:[children]));return this;}
  destroy(){this.active=false;this.emit('destroy');this.children.forEach(child=>child.destroy());}
}
for(const direction of [0,1]) {
  const active=new Set(),objects=[];
  const scene={add:{},tweens:{add(config){const tween={config,stop(){active.delete(tween);}};active.add(tween);return tween;}},physics:{world:{enable(bird){bird.body={setAllowGravity(){},setImmovable(){},setSize(w,h){this.size=[w,h];},setOffset(x,y){this.offset=[x,y];}};}}}};
  for(const shape of ['container','polygon','ellipse','circle','triangle'])scene.add[shape]=(x,y)=>new Object2D(x,y);
  const context={GAME_WIDTH:800,window:{},Phaser:{Math:{Between:()=>direction}},targetGroup:{add:bird=>objects.push(bird),getChildren:()=>objects.filter(bird=>bird.active&&!bird.collected)},applyTargetWeather(){},prisoner:{y:1020},prisonerHead:{y:-64},player:{weaponLevel:8},getWeaponPowerMultiplier:()=>1.42,FEATURES:{weather:true},currentWeather:'clear',windForce:{y:0}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'cast-art.js'),'utf8'),context);
  context.CastArt=context.window.CastArt;
  context.createTargetAppearance=(s,bird)=>{bird.birdSprite=context.CastArt.bird(s,bird.birdKind,bird.fromRight);bird.add(bird.birdSprite);};
  vm.runInContext(html.slice(html.indexOf('function birdFlightLane('),html.indexOf('function pickSpacedTargetX(')),context);
  vm.runInContext(html.slice(html.indexOf('function segmentIntersectsExpandedRect('),html.indexOf('function checkFastHeadTargetCrossings(')),context);
  context.spawnBird(scene);
  const bird=objects[0],motion=bird.moveTween.config;
  assert.equal(bird.y,420,'Bird lane remains below the portrait HUD');
  assert.equal(bird.birdSprite.scaleX,direction?-1:1,'Bird faces its outbound path');
  assert.equal(motion.x,direction?-450:1250);
  assert.deepEqual(bird.body.size,[100,50]);
  assert.deepEqual(bird.body.offset,[-50,-20]);
  context.spawnBird(scene);
  assert.equal(objects.length,1,'Only one bird may cross the stage at a time');
  motion.onYoyo();
  assert.equal(bird.birdSprite.scaleX,direction?1:-1,'Bird faces its return path');
  assert.equal(active.size,2);
  bird.destroy();
  assert.equal(active.size,0,'Hit or departing birds release wing and flight animations');
  assert.equal(context.birdFlightLane(1,956),420,'Distant birds do not descend to accommodate a starter blade');
  let previousLane=Infinity;
  for(let level=1;level<=30;level++) {
    const multiplier=1+(level-1)*.06, lane=context.birdFlightLane(multiplier,956);
    assert.equal(lane,420,'Weapon upgrades do not move the prize further away');
    assert.ok(lane<=previousLane,'Upgrades only raise the bird lane');
    // spawnBird skips flights that this blade cannot reach.
    previousLane=lane;
  }
  context.player.weaponLevel=1;context.getWeaponPowerMultiplier=()=>1;
  const starterCount=objects.length;context.spawnBird(scene);assert.equal(objects.length,starterCount+1,'A starter blade can see a bird it cannot yet reach');
  const lowBird=objects.at(-1);
  assert.equal(lowBird.y,420);
  assert.equal(lowBird.birdKind,'crow','Early birds teach a positive target before doves appear');
  Object.assign(lowBird.body,{enable:true,left:350,top:lowBird.y-20,right:450,bottom:lowBird.y+30});
  assert.equal(context.didHeadSegmentHitTarget({displayWidth:36},lowBird,400,lowBird.y+90,400,lowBird.y-90),true,'A full-power head crossing the starter bird lane registers');
  assert.equal(context.didHeadSegmentHitTarget({displayWidth:36},lowBird,444,lowBird.y+90,444,lowBird.y-90),true,'The illustrated beak is hittable when the bird faces right');
  assert.equal(context.didHeadSegmentHitTarget({displayWidth:36},lowBird,356,lowBird.y+90,356,lowBird.y-90),true,'The illustrated beak is hittable when the bird faces left');
  assert.equal(context.didHeadSegmentHitTarget({displayWidth:36},lowBird,500,lowBird.y+90,500,lowBird.y-90),false,'A shot outside the bird lane does not register');
  lowBird.destroy();
  context.currentWeather='wind';context.windForce.y=100;
  const count=objects.length;
  context.spawnBird(scene);
  assert.equal(objects.length,count+1,'Adverse wind does not hide distant prizes');
}
console.log('Birds remain visible beyond the current blade’s reach, face their flight path and release flight/wing animations on destruction.');

// Six birds use six distinct parts of the reachable sky, even with adversarial random choices.
for(const pick of ['first','last']){
 const context={Phaser:{Math:{Between:(min,max)=>pick==='first'?min:max}}};vm.createContext(context);
 vm.runInContext(html.slice(html.indexOf('function spreadBirdFlightLane('),html.indexOf('function spawnBird(')),context);
 const birds=[];for(let i=0;i<6;i++)birds.push({y:context.spreadBirdFlightLane(-1800,900,birds,6)});
 const bands=birds.map(b=>Math.floor((b.y+1800)/450));
 assert.equal(new Set(bands).size,6,'Every flight band receives a bird before any is reused');
 assert.ok(birds.every(b=>b.y>-1800&&b.y<900));
 assert.ok(Math.max(...birds.map(b=>b.y))-Math.min(...birds.map(b=>b.y))>2200,'Birds span the sky instead of sharing a narrow lane');
 const survivor=birds[0];assert.ok(Number.isFinite(context.spreadBirdFlightLane(-400,900,[survivor],3)),'Older flights outside a changed camera view cannot break band selection');
}
console.log('Wide flocks fill separate randomized heights across the reachable sky.');

// Upgrades still increase reach at a full combo instead of all blades converging.
{const context={player:{weaponLevel:1},killStreak:25};vm.createContext(context);vm.runInContext(html.slice(html.indexOf('function getWeaponPowerMultiplier('),html.indexOf('// Refresh weapon image',html.indexOf('function getWeaponPowerMultiplier('))),context);const starter=context.getWeaponPowerMultiplier();context.player.weaponLevel=30;assert.ok(context.getWeaponPowerMultiplier()>starter+1.7);}
