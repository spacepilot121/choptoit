const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const section=(from,to)=>html.slice(html.indexOf(from),html.indexOf(to,html.indexOf(from)));
const feedback=[],saved=[],rewards=[];
let targets=[],fallers=[];
const player={gold:0};
const context={
  player,fame:0,fameMultiplier:1,Campaign:{state:{targets:0}},
  goldText:{setText(){}},fameText:{setText(){}},formatGold:String,
  SaveManager:{save(){saved.push([player.gold,context.fame,context.Campaign.state.targets]);}},
  window:{MobileGame:{feedback(message){feedback.push(message);},reward(gold,silver){rewards.push([gold,silver]);},combo(){}}},
  bloodFireworkEmitter:{explode(){}},
  targetGroup:{getChildren:()=>targets,remove(target){targets=targets.filter(item=>item!==target);}},
  bodyGroup:{getChildren:()=>[head,...fallers],add(bird){fallers.push(bird);}},
  yorkFlyingIslandEvent:null,yorkRingPlatformEvent:null,
  Phaser:{Math:{Distance:{Between:(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1)}}},
  addXP(){},spawnCoin(){},spawnFameCoin(){},isMenuOpen:()=>false,
  pendingCoins:0,MAX_COIN_ANIMS:8
};
const head={active:true,isHead:true,displayWidth:36,x:400,y:650,prevX:400,prevY:800,body:{enable:true}};
const scene={
  physics:{add:{overlap(){}}},
  time:{delayedCall(){}},
  add:{text(){return {x:0,y:0,setOrigin(){return this;},destroy(){}};}},
  tweens:{add(){},killTweensOf(){}}
};
vm.createContext(context);
for(const [from,to] of [
  ['function addGold(','function spawnCoin('],
  ['function gainFame(','function showGoldGain('],
  ['function dropHitBird(','function handleTargetHit('],
  ['function handleTargetHit(','function armExplodingBarrel('],
  ['function pointSegmentDistanceSq(','function checkFastHeadTargetCrossings('],
  ['function checkFastHeadTargetCrossings(','function spawnHolyMonk(']
]) vm.runInContext(section(from,to),context);
const bird=kind=>({
  active:true,collected:false,targetType:'bird',birdKind:kind,x:400,y:724,
  setSize(w,h){this.displayWidth=w;this.displayHeight=h;return this;},
  body:{checkCollision:{},enable:true,left:350,top:704,right:450,bottom:754,
    setVelocity(x,y){this.velocity={x,y};return this;},setAllowGravity(v){this.gravity=v;return this;},setImmovable(v){this.immovable=v;return this;},setCollideWorldBounds(){return this;},setCircle(){return this;},setOffset(){return this;},setBounce(){return this;},setDrag(){return this;},setGravityY(){return this;},setAngularVelocity(v){this.spin=v;return this;}},
  moveTween:{stop(){}}
});
targets=[bird('crow')];
context.checkFastHeadTargetCrossings(scene);
assert.equal(player.gold,100,'A live crossing earns the crow gold');
assert.equal(context.fame,1,'A live crossing earns crow fame');
assert.equal(context.Campaign.state.targets,1,'A crow counts toward target contracts');
assert.equal(targets.length,0,'The hit crow leaves the collision group');
assert.equal(saved.at(-1)[0],100,'The reward is saved after the gold is added');
assert.deepEqual(rewards,[[100,1]],'Crow feedback shows only the gold and silver reward values');
context.checkFastHeadTargetCrossings(scene);
assert.equal(player.gold,100,'The same head cannot earn the crow reward twice');
context.fame=1;head.targetCombo=0;
head.y=650;head.prevY=800;
targets=[bird('dove')];
context.checkFastHeadTargetCrossings(scene);
assert.equal(context.fame,2,'White birds award positive fame');
assert.equal(player.gold,1100,'White birds award 1000 gold');
assert.equal(context.Campaign.state.targets,2,'White birds advance target contracts');
assert.deepEqual(rewards.at(-1),[1000,1],'White birds show positive gold and silver rewards');
console.log('Real head crossings pay crow rewards once, while white birds award 1000 gold and advance target contracts.');
const comboCalls=[];context.window.MobileGame.combo=(count,bonus)=>comboCalls.push([count,bonus]);
const comboHead={...head,targetCombo:0};const beforeCombo=player.gold;
const firstCrow=bird('crow'),secondCrow=bird('crow');
context.handleTargetHit(scene,firstCrow,comboHead);context.handleTargetHit(scene,secondCrow,comboHead);
assert.equal(player.gold,beforeCombo+220,'Two targets in one flight earn both rewards plus a 20-gold chain bonus');
assert.deepEqual(comboCalls,[[2,20]]);
assert.deepEqual(rewards.at(-1),[120,1],'The gold number includes both crow gold and the chain bonus');
context.handleTargetHit(scene,secondCrow,comboHead);assert.equal(player.gold,beforeCombo+220,'A collected target cannot pay the combo twice');

const chainSource={...head,power:2,targetCombo:0,targetGold:0};
const falling=bird('crow');context.handleTargetHit(scene,falling,chainSource);
assert.equal(falling.body.gravity,true);assert.equal(falling.body.immovable,false);assert.ok(falling.body.velocity.y>0);assert.equal(falling.isFallingBird,true);assert.equal(falling.body.checkCollision.up,false);assert.equal(falling.comboSource,chainSource);
const nextBird=bird('crow');nextBird.y=800;Object.assign(nextBird.body,{top:775,bottom:825});targets=[nextBird];
falling.prevY=724;falling.y=900;const beforeFallingHit=player.gold;
context.checkFastHeadTargetCrossings(scene);
assert.equal(nextBird.collected,true,'A falling bird hits a target along its swept downward path');assert.equal(chainSource.targetCombo,2,'Falling bird keeps the original shot combo');assert.equal(player.gold,beforeFallingHit+120);assert.equal(nextBird.isFallingBird,true,'Chain-hit birds also tumble down');
context.checkFastHeadTargetCrossings(scene);assert.equal(player.gold,beforeFallingHit+120,'Falling collisions cannot pay the same target twice');
console.log('Hit birds retain gravity and spin, strike targets while falling, carry their original combo and award each bird once.');
let overlapCallback,colliderCreates=0,colliderDestroys=0,collisionHits=0;
context.handleTargetHit=()=>{collisionHits++;};
vm.runInContext(section('function setupProjectileCollisions(','function dropHitBird('),context);
scene.physics.add.overlap=(_bodies,_targets,callback)=>{colliderCreates++;overlapCallback=callback;return {destroy(){colliderDestroys++;}};};
context.setupProjectileCollisions(scene);
overlapCallback({isHead:true,body:{enable:true}},{});
overlapCallback({isFallingBird:true,body:{enable:true}},{});
overlapCallback({isCorpse:true,body:{enable:true}},{});
overlapCallback({isHead:true,hasSettled:true,body:{enable:true}},{});
overlapCallback({isHead:true,body:{enable:false}},{});
assert.equal(collisionHits,2,'Only live flying heads and fallen birds can hit targets');
for(let i=0;i<100;i++)context.dropHitBird(scene,bird('crow'),head);
assert.equal(colliderCreates,1,'Additional projectiles share the same collider');
context.setupProjectileCollisions(scene);assert.equal(colliderDestroys,1,'Reinitialization releases the old collider');
console.log('Heads and falling birds share one collision handler; settled remains and corpses cannot hit targets.');
