const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {create,catalog}=require('../target-shop.js'),core=require('../game-core.js'),arcade=require('../arcade.js');
const shop=create(),player={gold:10000};
assert.equal(shop.buy('barrel',player,['York']),false,'A city key alone cannot discover a town speciality');
assert.equal(player.gold,10000);assert.ok(!shop.available(['York']).find(p=>p.id==='green').unlocked);
assert.ok(shop.available(['York']).filter(p=>p.unlocked).length===6);
assert.equal(shop.buy('barrel',player,['York','Newcastle']),true);assert.equal(player.gold,9820);
assert.equal(shop.buy('barrel',player,['York','Newcastle']),false);assert.equal(player.gold,9820,'Permanent purchases charge once');
assert.equal(shop.buy('missing',player,[]),false);
const poor={gold:0};assert.equal(shop.buy('green',poor,['York']),false);
assert.equal(catalog.length,76);for(const city of new Set(catalog.map(p=>p.city)))assert.equal(catalog.filter(p=>p.city===city).length,city==='York'?6:5);
for(const p of catalog){const local=create();assert.equal(local.buy(p.id,{gold:p.cost},[p.city]),!p.free);const reload=create();reload.restore(JSON.parse(JSON.stringify(local.state)));assert.ok(reload.owns(p.id));if(!['event','basket'].includes(p.type))assert.ok(Array.from({length:100},(_,r)=>reload.choose(r+1).id).includes(p.id));}
shop.restore(catalog.map(p=>p.id));
const seen=new Set();for(let r=1;r<=100;r++)seen.add(shop.choose(r).id);
for(const p of catalog.filter(p=>!['event','basket'].includes(p.type)))assert.ok(seen.has(p.id),'Purchased speciality enters the weighted target pool: '+p.id);
assert.ok(seen.has('red'),'Ordinary free targets stay in the mix');
for(let i=0;i<100;i++)assert.ok([2,3,4].includes(shop.basket()));
shop.restore(['green','unknown','green']);assert.deepEqual(shop.state,['green']);shop.restore(null);assert.equal(shop.basket(),0);
assert.deepEqual(core.castUnlocked(1),{faces:16,bodies:12});assert.deepEqual(core.castUnlocked(15),{faces:100,bodies:100});
for(let rank=1;rank<=30;rank++){const n=core.castUnlocked(rank);assert.ok(n.faces<=100&&n.bodies<=100);if(rank>1)assert.ok(n.faces>=core.castUnlocked(rank-1).faces);}
const a=arcade.create();a.chop(99,20,true);assert.equal(a.state.heads[99],1);
a.miss(99);a.miss(12);a.miss(12);assert.equal(a.state.missedHeads[99],1);assert.equal(a.state.heads[99],1,'Escaping never erases a previous collected head');
const roundtrip=arcade.create();roundtrip.restore(JSON.parse(JSON.stringify(a.state)));assert.equal(roundtrip.state.missedHeads[12],2);assert.equal(roundtrip.state.heads[99],1);
a.restore({heads:Array(16).fill(2),claimed:['first-show']},32);assert.equal(a.state.heads.length,100);assert.equal(a.state.heads[15],2);assert.equal(a.state.heads[16],0);assert.ok(a.state.claimed.includes('first-show'));
a.restore({chops:1000,heads:Array(100).fill(1)},1000);
assert.equal(new Set(arcade.challenges.map(c=>c.id)).size,100);
const locked=a.progress(1).find(c=>c.metric==='unique'&&c.goal===100);
assert.ok(locked.locked);assert.equal(a.claim(locked.id,14),0,'Meeting an objective cannot bypass its level gate');assert.ok(a.claim(locked.id,15)>0);assert.equal(a.claim(locked.id,15),0);
for(const name of ['heads','bodies']){
  const svg=fs.readFileSync(path.join(__dirname,'../assets/cast-'+name+'-angular.svg'),'utf8');
  const cells=svg.split(/<g transform="translate\(\d+ \d+\)">/).slice(1);
  assert.equal(new Set(cells.slice(0,100)).size,100,'Every '+name+' base illustration is distinct');
}
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.ok(html.includes('targetShop: window.TargetShop?.state'));assert.ok(html.includes('window.TargetShop?.restore(data.targetShop)'));
const mobile=fs.readFileSync(path.join(__dirname,'../mobile.js'),'utf8');
const ui={SpecialTargets:require('../special-targets.js'),window:{TargetShop:shop,Arcade:arcade.create()},Campaign:{state:{visited:['York','Durham']}},player:{gold:1000},ChopCore:core,level:1,killCount:1000};
vm.createContext(ui);vm.runInContext(mobile.slice(mobile.indexOf('  function arcadeMarkup()'),mobile.indexOf('  function campaignMarkup()')),ui);
const market=ui.targetMarketMarkup();assert.equal((market.match(/data-target-buy=/g)||[]).length,76);assert.ok(market.includes('Visit Newcastle'));assert.ok(market.includes('Buy permanently'));assert.ok(!market.includes('Load cargo'));
const journal=ui.arcadeMarkup();assert.equal((journal.match(/data-challenge=/g)||[]).length,100);assert.ok(journal.includes('100 FACES'));assert.ok(journal.includes('Level 15 required'));assert.ok(journal.includes('2000% 2000%'));
ui.window.Arcade.miss(12);assert.ok(ui.arcadeMarkup().includes('class="missed"'));assert.ok(ui.arcadeMarkup().includes('0 collected · 1 missed'));
const escape={window:{Arcade:ui.window.Arcade,MobileGame:{feedback(){}}},prisoner:{},prisonerHeadSprite:{castFaceIndex:12},GAME_WIDTH:800,CHARACTER_BASE_Y:1020,CastArt:{expression(){},walk(){}}};
vm.createContext(escape);vm.runInContext(html.slice(html.indexOf('function savePrisoner('),html.indexOf('function beheadPrisoner(')),escape);
escape.savePrisoner({tweens:{add(){}}});escape.savePrisoner({tweens:{add(){}}});assert.equal(ui.window.Arcade.state.missedHeads[12],2,'An escaped prisoner is counted once, even if an animation is retriggered');
const spread={GAME_WIDTH:800,Phaser:{Math:{Between:(min,max)=>min}}};vm.createContext(spread);vm.runInContext(html.slice(html.indexOf('function pickSpacedTargetX('),html.indexOf('function spawnTarget(')),spread);
assert.equal(spread.pickSpacedTargetX([],1),100);assert.ok(spread.pickSpacedTargetX([],.55)<-200,'A wide combo view offers targets beyond the original left boundary');
spread.Phaser.Math.Between=(min,max)=>max;assert.ok(spread.pickSpacedTargetX([],.55)>1000,'The expanded right side is playable too');
const local=create();assert.equal(local.basket('York'),0);assert.ok([2,3].includes(local.basket('Chester')));assert.ok(local.enabled('rings','Winchester'));assert.ok(!local.enabled('rings','York'));assert.ok(local.buy('rings',{gold:9999},['Winchester']));assert.ok(local.enabled('rings','York'));
for(const city of ['Durham','Newcastle','Hull','Lincoln','Canterbury','London','Dover','Norwich','Winchester','Colchester','Gloucester']){const ids=new Set(Array.from({length:100},(_,r)=>create().choose(r+1,city).id));for(const p of catalog.filter(p=>p.city===city&&p.type!=='event'))assert.ok(ids.has(p.id),'Local city demos speciality before buying: '+p.id);}
const motion=require('../target-shop.js').motion;
const residents=Array.from({length:5},(_,i)=>({jester:{x:100+i*100},targetType:'special',collected:false}));let refills=0;
const round={Phaser:{Math:{Between:()=>3}},player:{weaponLevel:8},FEATURES:{specialTargets:true},window:{TargetShop:create()},targetGroup:{getChildren:()=>residents},spawnTarget(_scene,_xs,option){refills++;assert.equal(option.id,'red');residents.push({jester:{x:650},targetType:option.type,collected:false});}};
vm.createContext(round);vm.runInContext(html.slice(html.indexOf('function populateRoundTargets('),html.indexOf('function spawnTarget(')),round);
round.populateRoundTargets({});assert.equal(residents.length,6);assert.equal(refills,1,'A square full of hard props gets one accessible bullseye');
round.populateRoundTargets({});assert.equal(refills,1,'An existing accessible target is not duplicated');
residents.pop();round.populateRoundTargets({});assert.equal(refills,2,'A collected bullseye is replenished without removing hard props');
assert.equal(residents.filter(t=>t.targetType==='special').length,5);
assert.deepEqual(motion({},400,200),{height:200,angle:0});assert.equal(motion({motion:'vertical'},400,200).height,245);assert.equal(motion({motion:'vertical'},400,200).angle,0);assert.equal(motion({motion:'horizontal'},0,200).height,200);assert.ok(motion({motion:'horizontal'},0,200).angle>0);assert.ok(motion({motion:'horizontal'},800,200).angle<0);assert.ok(motion({motion:'orbit'},200,200).height>200);assert.ok(motion({motion:'orbit'},200,200).angle>0);
console.log('100 distinct faces and bodies unlock with rank; 100 challenges enforce level gates; city-discovered target purchases persist, charge once and join every city.');
