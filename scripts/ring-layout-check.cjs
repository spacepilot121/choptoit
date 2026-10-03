const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ChopCore=require('../game-core.js');
const png=fs.readFileSync(path.join(root,'platform.png'));
const dimensions={width:png.readUInt32BE(16),height:png.readUInt32BE(20)};
const context={currentCity:'Winchester',player:{weaponLevel:7},yorkRingPlatformEvent:null,YORK_RING_EVENT_TEST_CHANCE:45,Phaser:{Math:{Between:()=>1}}};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function shouldSpawnYorkRingPlatformEvent('),html.indexOf('function createYorkRingGuard(')),context);
assert.equal(context.shouldSpawnYorkRingPlatformEvent(),false);
context.player.weaponLevel=8;assert.equal(context.shouldSpawnYorkRingPlatformEvent(),true);
context.currentCity='London';assert.equal(context.shouldSpawnYorkRingPlatformEvent(),false);
context.currentCity='Winchester';context.yorkRingPlatformEvent={active:true};assert.equal(context.shouldSpawnYorkRingPlatformEvent(),false);
Object.assign(context,{GAME_HEIGHT:1600,CHARACTER_BASE_Y:1020,YORK_RING_THROW_ARC_HEIGHT:108,prisonerHead:{y:-64},getWeaponPowerMultiplier:()=>1.42,cleanupYorkRingPlatformEvent(){},scene:{textures:{get(){return {getSourceImage:()=>dimensions};}}}});
vm.runInContext(html.slice(html.indexOf('function minimumReachableYorkRingEventY('),html.indexOf('function spawnYorkRingPlatformEvent(')),context);
const start=html.indexOf('function spawnYorkRingPlatformEvent(');
const prefix=html.slice(start,html.indexOf('  const leftStopX',start));
vm.runInContext(prefix+'return {minEventY,maxEventY}; }',context);
const bounds=context.spawnYorkRingPlatformEvent(context.scene);
const highestRingEdge=bounds.minEventY-dimensions.height*.25+1-56-108-38;
assert.ok(highestRingEdge>=400,'The full ring arc must stay below the HUD');
assert.ok(bounds.maxEventY<=840,'The event must stay clear of the main stage');
assert.ok(bounds.minEventY>=750,'The first eligible blade gets a ring lane reachable in adverse wind');
for(let level=8;level<=30;level++) {
  const speedMultiplier=1+(level-1)*.06;
  const minY=Math.max(607,context.minimumReachableYorkRingEventY(956,speedMultiplier,dimensions.height*.25));
  for(const eventY of [minY,840]) for(const windX of [-100,100]) {
    const apexY=eventY-dimensions.height*.25+1-56-108;
    const angle=Math.asin(-windX/(500*speedMultiplier))*180/Math.PI;
    const velocity=ChopCore.launchVelocity(angle,2,speedMultiplier,{x:windX,y:100});
    assert.ok(Math.abs(velocity.x)<1e-8,'Aiming can cancel either worst crosswind');
    const rise=956-apexY,upwardSpeed=-velocity.y;
    const discriminant=upwardSpeed*upwardSpeed-800*rise;
    assert.ok(discriminant>0,'A full-power shot climbs through the ring apex');
    const hitTime=(upwardSpeed-Math.sqrt(discriminant))/400;
    assert.ok(hitTime>0 && hitTime<1.4,'The head reaches the ring after it is thrown and before the fastest throw midpoint');
  }
}
console.log('Winchester rings unlock at blade 8, avoid overlapping events and stay below the HUD and within reach in adverse wind.');
