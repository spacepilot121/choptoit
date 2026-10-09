const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../game-core.js');
const city={name:'Durham',fameReq:1,unlocked:false},player={gold:99};
assert.equal(core.buyCityKey(city,player,1),false);assert.equal(player.gold,99);
player.gold=150;assert.equal(core.buyCityKey(city,player,1),true);assert.equal(player.gold,50);
assert.equal(core.buyCityKey(city,player,1),false);assert.equal(player.gold,50,'Owned keys never charge again');
const last={name:'Gloucester',fameReq:14,unlocked:false};player.gold=1000;
assert.equal(core.buyCityKey(last,player,13),false);assert.equal(core.buyCityKey(last,player,14),true);assert.equal(player.gold,250);
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const context={window:{TargetShop:{enabled:()=>true}},bodyGroup:null,currentCity:'Gloucester',yorkFlyingIslandEvent:null,yorkRingPlatformEvent:{active:true},cleanupYorkRingPlatformEvent(){throw Error('Winchester ring removed');},cleanupYorkFlyingIslandEvent(){throw Error('Gloucester island removed');}};
context.CENTER_X=400;context.GAME_WIDTH=800;vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function offscreenActorX('),html.indexOf('function anchorCoinChest(')),context);
vm.runInContext(html.slice(html.indexOf('function updateYorkRingPlatformEvent('),html.indexOf('function pointSegmentDistanceSq(')),context);
context.currentCity='Winchester';context.updateYorkRingPlatformEvent({});
vm.runInContext(html.slice(html.indexOf('function updateFlyingIslandEvent('),html.indexOf('function isPointInsideFlyingIslandGreen(')),context);
context.currentCity='Gloucester';context.updateFlyingIslandEvent({time:{now:100}}, {active:true,phase:'success'});
// Exercise target catch and parenting before a carrier runs off.
let tweens=[],caught=false,walked=false;
const jester={x:240,y:900,active:true,startFromRight:false,poleHands:{},jesterPole:{setVisible(){}},add(t){caught=true;assert.equal(t.x,23);assert.equal(t.y,-38);},destroy(){}};
const target={targetType:'standard',x:263,y:780,jester,active:true,collected:false,body:{setVelocity(){},setAllowGravity(){},setImmovable(){},setCollideWorldBounds(){}},setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){}};
Object.assign(context,{GAME_WIDTH:800,Campaign:{state:{targets:0}},window:{MobileGame:null},gainFame(){},targetGroup:{remove(){}},splatEmitter:{explode(){}},CastArt:{holdPole(){},walk(){walked=true;}}});
vm.runInContext(html.slice(html.indexOf('function handleTargetHit('),html.indexOf('function armExplodingBarrel(')),context);
const hitScene={cameras:{main:{zoom:.35,scrollX:0}},tweens:{add(t){tweens.push(t);}}};context.handleTargetHit(hitScene,target,null);
assert.equal(tweens[0].y,862);tweens[0].onComplete();assert.equal(caught,true);assert.equal(walked,true);assert.equal(tweens.length,2);assert.equal(tweens[1].targets,jester);assert.equal(tweens[1].x,context.offscreenActorX(hitScene,false));
console.log('City keys debit gold once, respect rank and affordability; relocated events survive; hit targets are caught and carried off, leaving room for replacements.');

// Complete both carrier routes through their pauses, without a new round deleting them.
vm.runInContext(html.slice(html.indexOf('function spawnBasketCarrier('),html.indexOf('function checkBasketCatch(')),context);
context.window.TargetShop={basket:()=>2};
for(const direction of [0,1]){
  const moves=[],waits=[];let actor;
  const shape=(x=0,y=0)=>({x,y,active:true,list:[],setDepth(){return this;},setOrigin(){return this;},setStrokeStyle(){return this;},setScale(){return this;},lineStyle(){return this;},lineBetween(){return this;},add(){return this;},setAngle(){return this;},setY(y){this.y=y;return this;},once(type,cb){if(type==='destroy')this.cleanup=cb;return this;},destroy(){this.active=false;this.cleanup?.();}});
  const add=new Proxy({}, {get:(_,key)=>(...args)=>{const obj=shape(args[0],args[1]);if(key==='container'&&!actor)actor=obj;return obj;}});
  Object.assign(context,{ChopCore:core,currentCity:'Hull',level:1,player:{weaponLevel:1},GROUND_Y:1270,Phaser:{Math:{Between:(min,max)=>min===0&&max===1?direction:min}},CastArt:{body:x=>x,head:x=>x,expression(){},walk(){}}});
  const scene={cameras:{main:{zoom:.35,scrollX:0}},remainsFloor:1270,add,tweens:{add(t){moves.push(t);return {stop(){}};}},time:{delayedCall(delay,cb){waits.push({delay,cb});return {remove(){}};}}};
  context.spawnBasketCarrier(scene);context.spawnBasketCarrier(scene);assert.equal(moves.length,1,'New prisoners do not replace an active basket');
  let previous=actor.x;
  for(let i=0;i<3;i++){
    const move=moves[i];if(i<2)assert.ok(direction?move.x<previous:move.x>previous);else assert.ok(direction?move.x>previous:move.x<previous);previous=move.x;actor.x=move.x;move.onComplete();
    if(i<2)assert.ok(waits[i].delay>=600,'Carrier rests between moves');waits[i].cb();
  }
  assert.ok(previous>=150&&previous<=650);assert.equal(actor.active,true,'Successful rounds retain the basket carrier');
  vm.runInContext(html.slice(html.indexOf('function dismissBasketCarrier('),html.indexOf('function retirePreviousRoundTargets(')),context);
  context.dismissBasketCarrier(scene);const exit=moves.at(-1);assert.equal(exit.x,actor.exitX);assert.ok(direction?exit.x<0:exit.x>800);exit.onComplete();assert.equal(actor.active,false);assert.equal(scene.basketCarrier,null);
}
console.log('Basket carriers enter from either edge, patrol and survive successful rounds, then exit fully on a missed strike.');
