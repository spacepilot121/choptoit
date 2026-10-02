const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const section=(from,to)=>html.slice(html.indexOf(from),html.indexOf(to,html.indexOf(from)));
const feedback=[],saved=[];
let targets=[];
const player={gold:0};
const context={
  player,fame:0,fameMultiplier:1,Campaign:{state:{targets:0}},
  goldText:{setText(){}},fameText:{setText(){}},formatGold:String,
  SaveManager:{save(){saved.push([player.gold,context.fame,context.Campaign.state.targets]);}},
  window:{MobileGame:{feedback(message){feedback.push(message);}}},
  bloodFireworkEmitter:{explode(){}},
  targetGroup:{getChildren:()=>targets,remove(target){targets=targets.filter(item=>item!==target);}},
  bodyGroup:{getChildren:()=>[head]},
  yorkFlyingIslandEvent:null,yorkRingPlatformEvent:null,
  Phaser:{Math:{Distance:{Between:(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1)}}},
  addXP(){},spawnCoin(){},spawnFameCoin(){},isMenuOpen:()=>false,
  pendingCoins:0,MAX_COIN_ANIMS:8
};
const head={active:true,isHead:true,displayWidth:36,x:400,y:650,prevX:400,prevY:800,body:{enable:true}};
const scene={
  time:{delayedCall(){}},
  add:{text(){return {x:0,y:0,setOrigin(){return this;},destroy(){}};}},
  tweens:{add(){},killTweensOf(){}}
};
vm.createContext(context);
for(const [from,to] of [
  ['function addGold(','function spawnCoin('],
  ['function gainFame(','function showGoldGain('],
  ['function handleTargetHit(','function armExplodingBarrel('],
  ['function pointSegmentDistanceSq(','function checkFastHeadTargetCrossings('],
  ['function checkFastHeadTargetCrossings(','function spawnHolyMonk(']
]) vm.runInContext(section(from,to),context);
const bird=kind=>({
  active:true,collected:false,targetType:'bird',birdKind:kind,x:400,y:724,
  body:{enable:true,left:350,top:704,right:450,bottom:754,
    setVelocity(){},setAllowGravity(){},setImmovable(){},setCollideWorldBounds(){}},
  moveTween:{stop(){}}
});
targets=[bird('crow')];
context.checkFastHeadTargetCrossings(scene);
assert.equal(player.gold,1,'A live crossing earns the crow gold');
assert.equal(context.fame,1,'A live crossing earns crow fame');
assert.equal(context.Campaign.state.targets,1,'A crow counts toward target contracts');
assert.equal(targets.length,0,'The hit crow leaves the collision group');
assert.equal(saved.at(-1)[0],1,'The reward is saved after the gold is added');
assert.ok(feedback.some(message=>message.includes('Crow hit')&&message.includes('+1 gold')));
context.checkFastHeadTargetCrossings(scene);
assert.equal(player.gold,1,'The same head cannot earn the crow reward twice');
context.fame=1;
head.y=650;head.prevY=800;
targets=[bird('dove')];
context.checkFastHeadTargetCrossings(scene);
assert.equal(context.fame,0,'Doves reduce fame without going negative');
assert.equal(player.gold,1,'Doves never grant crow gold');
assert.equal(context.Campaign.state.targets,1,'Doves do not advance target contracts');
assert.ok(feedback.some(message=>message.includes('Avoid the doves')));
console.log('Real head crossings pay crow rewards once, while doves penalize fame without contract progress.');
const comboCalls=[];context.window.MobileGame.combo=(count,bonus)=>comboCalls.push([count,bonus]);
const comboHead={...head,targetCombo:0};const beforeCombo=player.gold;
const firstCrow=bird('crow'),secondCrow=bird('crow');
context.handleTargetHit(scene,firstCrow,comboHead);context.handleTargetHit(scene,secondCrow,comboHead);
assert.equal(player.gold,beforeCombo+3,'Two targets in one flight earn both rewards plus a combo coin');
assert.deepEqual(comboCalls,[[2,1]]);
context.handleTargetHit(scene,secondCrow,comboHead);assert.equal(player.gold,beforeCombo+3,'A collected target cannot pay the combo twice');
