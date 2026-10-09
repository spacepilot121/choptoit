const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const tricks=require('../special-targets.js');
assert.equal(tricks.catalog.length,45);
assert.equal(new Set(tricks.catalog.map(t=>t.id)).size,45);
assert.equal(new Set(tricks.catalog.map(t=>tricks.markup(t))).size,45,'All 45 designs are distinct');
for(const city of new Set(tricks.catalog.map(t=>t.city)))assert.equal(tricks.catalog.filter(t=>t.city===city).length,3);
const atlas=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/special-targets.json'),'utf8'));
assert.equal(Object.keys(atlas.frames).length,53);
const projectile=()=>({active:true,body:{enable:true,velocity:{x:180,y:200},gravity:true,setVelocity(x,y){this.velocity={x,y};},setAllowGravity(v){this.gravity=v;},stop(){this.setVelocity(0,0);}}});
const option=effect=>tricks.catalog.find(t=>t.effect===effect);
const target=o=>({active:true,x:100,y:100,targetOption:o,body:{enable:true}});
let callbacks=[],calls=[];
const scene={time:{now:0,delayedCall(delay,fn){callbacks.push(fn);}}};
const neighbour={active:true,x:160,y:170,body:{enable:true}};
const api={windX:0,targets:()=>[neighbour],refresh(){},flash(){},clearFog:n=>calls.push(['fog',n]),pieces:(t,o)=>calls.push(['pieces',o.pieces]),chain:()=>calls.push(['chain']),gold:(t,p,n)=>calls.push(['gold',n])};
for(const o of tricks.catalog){
 const t=target(o);let accepted=false;
 for(let i=0;i<(o.hits||1);i++)accepted=tricks.before(scene,t,projectile(),false,api);
 assert.equal(accepted,true,o.name+' activates at its valid phase');
 assert.ok(Number.isInteger(t.specialGold)&&t.specialGold>=0,o.name+' has whole positive rewards');
 assert.doesNotThrow(()=>tricks.after(scene,t,projectile(),api),o.name+' effect runs');
}
for(const effect of ['gate','lift']){
 scene.time.now=1500;const t=target(option(effect)),p=projectile();
 assert.equal(tricks.before(scene,t,p,false,api),false,'Closed target rejects a shot');
 scene.time.now=0;assert.equal(tricks.before(scene,t,p,false,api),true,'An opening accepts the same deflected shot');
}
for(const effect of ['offering','bounce']){
 const t=target(option(effect)),p=projectile();p.body.velocity.y=-100;
 assert.equal(tricks.before(scene,t,p,false,api),false,'Rising shots miss the catcher');
 p.body.velocity.y=100;assert.equal(tricks.before(scene,t,p,false,api),true,'Descending shots activate the catcher');
}
for(const effect of ['armour','sequence']){
 const t=target(option(effect)),p=projectile();
 assert.equal(tricks.before(scene,t,p,false,api),false);assert.equal(t.trickHits,1);
 assert.equal(tricks.before(scene,t,p,false,api),false);assert.equal(t.trickHits,1,'One projectile cannot pay multiple hits');
 for(let i=1;i<t.targetOption.hits;i++)assert.equal(tricks.before(scene,t,projectile(),false,api),i===t.targetOption.hits-1);
}
const crowns=target(tricks.catalog.find(t=>t.art==='crowns'));crowns.trickHits=2;
const rising=projectile();rising.body.velocity.y=-20;
assert.equal(tricks.before(scene,crowns,rising,false,api),false);assert.equal(crowns.trickHits,0);
scene.time.now=0;const seal=target(option('charge'));
tricks.before(scene,seal,projectile(),false,api);assert.equal(seal.specialGold,10);
const chargeAPI={...api,targets:()=>[seal]};
for(let i=0;i<8;i++)tricks.notifyHit(scene,neighbour,chargeAPI);
assert.equal(seal.trickCharge,3);tricks.before(scene,seal,projectile(),false,api);assert.equal(seal.specialGold,120);
for(const [time,gold,fame]of [[0,80,1],[1200,5,8]]){
 scene.time.now=time;const coin=target(option('coin'));tricks.before(scene,coin,projectile(),false,api);assert.equal(coin.specialGold,gold);assert.equal(coin.fameMultiplier,fame);
}
for(const [time,gold]of [[0,300],[1300,15]]){
 scene.time.now=time;const jackpot=target(option('jackpot'));tricks.before(scene,jackpot,projectile(),false,api);assert.equal(jackpot.specialGold,gold);
}
for(const o of tricks.catalog.filter(t=>t.effect==='catch')){
 callbacks=[];const p=projectile();tricks.after(scene,target(o),p,api);
 assert.equal(p.body.gravity,false);assert.equal(p.body.velocity.y,0);assert.equal(callbacks.length,1);
 callbacks[0]();assert.equal(p.body.gravity,true);assert.ok(p.body.velocity.y<0);
 callbacks=[];const destroyed=projectile();tricks.after(scene,target(o),destroyed,api);destroyed.active=false;
 assert.doesNotThrow(()=>callbacks[0](),'Travel/removal during a held shot is safe');
}
scene.time.now=0;
const aimed=projectile();tricks.after(scene,target(option('aim')),aimed,api);
assert.ok(aimed.body.velocity.x>0&&aimed.body.velocity.y>0,'A mirror aims towards the actual nearby target');
const painted={...neighbour};tricks.after(scene,target(option('paint')),projectile(),{...api,targets:()=>[painted]});assert.equal(painted.mustardPaint,true);
tricks.after(scene,target(option('buff')),projectile(),api);assert.equal(scene.trickBuffUntil,8000);
assert.ok(calls.some(c=>c[0]==='chain'));assert.ok(calls.some(c=>c[0]==='fog'&&c[1]===8000));assert.ok(calls.some(c=>c[0]==='pieces'&&c[1]===6));
console.log('45 distinct city tricks: timing gates, descending catches, separate-shot armour, charged jackpots, whole rewards, chain reactions and safe delayed launches pass.');
