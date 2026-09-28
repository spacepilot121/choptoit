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
  const context={window:{},Phaser:{Math:{Between:()=>direction}},targetGroup:{add:bird=>objects.push(bird),getChildren:()=>objects.filter(bird=>bird.active&&!bird.collected)},applyTargetWeather(){},prisoner:{y:1020},prisonerHead:{y:-64},player:{weaponLevel:8},getWeaponPowerMultiplier:()=>1.42,FEATURES:{weather:true},currentWeather:'clear',windForce:{y:0}};
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
  assert.equal(motion.x,direction?-50:850);
  assert.deepEqual(bird.body.size,[100,50]);
  assert.deepEqual(bird.body.offset,[-50,-20]);
  context.spawnBird(scene);
  assert.equal(objects.length,1,'Only one bird may cross the stage at a time');
  motion.onYoyo();
  assert.equal(bird.birdSprite.scaleX,direction?1:-1,'Bird faces its return path');
  assert.equal(active.size,2);
  bird.destroy();
  assert.equal(active.size,0,'Hit or departing birds release wing and flight animations');
  assert.equal(context.birdFlightLane(1,956),724,'A starting blade gets a reachable lower flight lane');
  let previousLane=Infinity;
  for(let level=1;level<=30;level++) {
    const multiplier=1+(level-1)*.06, lane=context.birdFlightLane(multiplier,956);
    assert.ok(lane>=420 && lane<=760,'Birds remain below the HUD and above the stage');
    assert.ok(lane<=previousLane,'Upgrades only raise the bird lane');
    assert.ok(956-(500*multiplier)**2/800<=lane,'Every blade can reach its bird lane at full power');
    previousLane=lane;
  }
  context.player.weaponLevel=1;context.getWeaponPowerMultiplier=()=>1;
  context.spawnBird(scene);
  const lowBird=objects.at(-1);
  assert.equal(lowBird.y,724);
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
  assert.equal(objects.length,count,'Do not spawn a bird above the best shot in adverse wind');
}
console.log('Birds stay within the current blade’s reach, face their flight path and release flight/wing animations on destruction.');
