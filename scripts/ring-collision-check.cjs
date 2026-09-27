const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const between=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
let saves=0, feedback=[];
const context={
  yorkRingHeadSerial:0,
  Phaser:{Math:{Clamp:(n,lo,hi)=>Math.max(lo,Math.min(hi,n)),Distance:{Between:between}}},
  yorkFlyingIslandEvent:null,
  yorkRingPlatformEvent:null,
  CENTER_X:360,
  CENTER_Y:640,
  fame:0,
  fameText:{setText(){}},
  SaveManager:{save(){saves++;}},
  window:{MobileGame:{feedback(message,success){feedback.push([message,success]);}}},
  formatGold:String,
  bodyGroup:null,
  targetGroup:{getChildren:()=>[]},
  didHeadSegmentHitTarget(){return false;},
  handleTargetHit(){},
};
vm.createContext(context);
const section=(from,to)=>html.slice(html.indexOf(from),html.indexOf(to,html.indexOf(from)));
vm.runInContext(section('function pointSegmentDistanceSq(','function segmentIntersectsExpandedRect('),context);
vm.runInContext(section('function didHeadPassThroughMovingRing(','function clearAllTargetsFromRingEvent('),context);
vm.runInContext(section('function clearAllTargetsFromRingEvent(','function cleanupYorkRingPlatformEvent('),context);
vm.runInContext(section('function checkFastHeadTargetCrossings(','function spawnHolyMonk('),context);
const head=()=>({active:true,isHead:true,displayWidth:30,x:0,y:0,prevX:0,prevY:0,body:{enable:true}});
const ring=(previousX,currentX,y=0)=>({prevX:previousX,prevY:y,centerY:y,innerRadius:26,outerRadius:38,spent:false,touchedHeadIds:new Set(),sprite:{active:true,x:currentX,y,destroy(){this.active=false;}}});
{
  const h=head(),r=ring(0,0);
  assert.equal(context.didHeadPassThroughMovingRing(h,r,0,50,0,-50),true,'A head through a still ring registers');
  assert.equal(context.didHeadPassThroughMovingRing(h,r,0,50,0,-50),false,'One head cannot claim the ring twice');
}
assert.equal(context.didHeadPassThroughMovingRing(head(),ring(0,0),30,50,30,-50),false,'A rim graze does not count');
assert.equal(context.didHeadPassThroughMovingRing(head(),ring(0,0),90,50,90,-50),false,'A distant head does not count');
assert.equal(context.didHeadPassThroughMovingRing(head(),ring(-60,60),0,0,0,0),true,'A moving ring can cross a nearly still head');
assert.equal(context.didHeadPassThroughMovingRing(head(),ring(-60,60,35),0,0,0,0),false,'A moving rim graze does not count');
{
  const h=head(),r=ring(-60,-30);
  context.bodyGroup={getChildren:()=>[h]};
  context.yorkRingPlatformEvent={activeRing:r};
  const scene={
    add:{text(){return {x:0,y:0,setOrigin(){return this;},setDepth(){return this;},destroy(){}};}},
    tweens:{killTweensOf(){},add(){}},
  };
  context.checkFastHeadTargetCrossings(scene);
  assert.equal(context.fame,0);
  assert.equal(r.prevX,-30,'The next frame starts from the last ring position');
  r.sprite.x=30;
  context.checkFastHeadTargetCrossings(scene);
  assert.equal(context.fame,3,'A moving-ring hit grants the actual fame reward');
  assert.equal(saves,1,'The ring bonus is saved even when no ordinary targets remain');
  assert.deepEqual(feedback,[['Ring clear! · +3 fame · nearby targets cleared',true]],'The mobile HUD announces the reward');
  assert.equal(r.spent,true);
  assert.equal(r.sprite.active,false);
  assert.equal(context.yorkRingPlatformEvent.activeRing,null);
  context.checkFastHeadTargetCrossings(scene);
  assert.equal(context.fame,3,'A spent ring cannot pay out twice');
  assert.equal(saves,1,'A spent ring cannot save a second bonus');
}
console.log('Moving-ring collisions use both paths, reject rim grazes and pay out only once.');
