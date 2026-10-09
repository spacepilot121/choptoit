const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const root = path.resolve(__dirname, '..');
// Use the shipped engine's actual containers and destroy events, without its DOM bootstrap.
const context = {module:{exports:{}}, exports:{}, window:{}, navigator:{userAgent:'node'},
  document:{documentElement:{},createElement:()=>({style:{},getContext:()=>({})})},
  Image:class{}, HTMLCanvasElement:class{}, console};
vm.createContext(context);
const engine = fs.readFileSync(path.join(root,'vendor/phaser-3.55.2.min.js'),'utf8');
const bootstrap = 's(s.s=1528);function s(t)';
assert.ok(engine.includes(bootstrap));
vm.runInContext(engine.replace(bootstrap,'s;function s(t)'),context);
const req = context.module.exports;
const objects = req(req.m.findIndex(fn=>fn.toString().includes('Container:i(214)')));
const frame = {width:128,height:180,realWidth:128,realHeight:180,cutWidth:128,cutHeight:180,
  customPivot:false,source:{resolution:1,width:128,height:180},updateUVs(){}};
const textures = {get:()=>({get:()=>frame}),getFrame:()=>frame};
const tweens = [], timers = [];
const displayed = new Set();
const list = {events:new EventEmitter(),exists:object=>displayed.has(object),
  add(object){displayed.add(object);},remove(object){displayed.delete(object);},queueDepthSort(){}};
const scene = {sys:{events:new EventEmitter(),game:{renderer:{type:1},config:{}},textures,
  displayList:list,updateList:list,queueDepthSort(){}},
  tweens:{add(config){const tween={config,stopped:false,stop(){this.stopped=true;}};tweens.push(tween);return tween;}},
  time:{addEvent(config){const timer={...config,removed:false,remove(){this.removed=true;}};timers.push(timer);return timer;},
    delayedCall(delay,callback){return this.addEvent({delay,callback});}},add:{}};
for(const [method,key] of [['container','Container'],['image','Image'],['graphics','Graphics'],
  ['rectangle','Rectangle'],['polygon','Polygon'],['circle','Arc'],['ellipse','Ellipse'],['triangle','Triangle']]) {
  scene.add[method]=(...args)=>new objects[key](scene,...args);
}
context.window.CaravanArt=require('../caravan-art.js');
vm.runInContext(fs.readFileSync(path.join(root,'cast-art.js'),'utf8'),context);
const art = context.window.CastArt;
for(let level=1;level<=16;level++){
  const first=tweens.length,caravan=art.caravan(scene,level,410,1170);
  assert.equal(caravan.caravanWheelCount,level>=3?2:0);
  for(const tween of tweens.slice(first))if(tween.config.onUpdate){
    for(const phase of [0,Math.PI/2,Math.PI,Math.PI*1.5,Math.PI*2]){
      tween.config.targets.phase=phase;assert.doesNotThrow(()=>tween.config.onUpdate());
    }
  }
  assert.doesNotThrow(()=>caravan.destroy());
  assert.ok(tweens.slice(first).every(tween=>tween.stopped),'All caravan animations stop on departure');
}
for(const silver of[false,true])assert.doesNotThrow(()=>art.coin(scene,10,10,silver).destroy());
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
context.ChopCore=require('../game-core.js');context.GROUND_Y=1270;
let catchGold=0,catchSaves=0;
context.addGold=(_scene,n)=>{catchGold+=n;};context.SaveManager={save(){catchSaves++;}};
const caught=scene.add.image(150,1170,'castHeads','0').setDisplaySize(58,58);
Object.assign(caught,{isHead:true,prevX:150,prevY:1100,chopGold:40,targetGold:20,targetCombo:2});
caught.body={enable:true,velocity:{y:100},stop(){},setAllowGravity(){},destroy(){}};
let looseHeads=[caught];context.bodyGroup={getChildren:()=>looseHeads,remove(head){looseHeads=looseHeads.filter(h=>h!==head);}};
const carrier=scene.add.container(150,1180);Object.assign(carrier,{halfWidth:43*.68,multiplier:4,exitX:910,previousX:150});carrier.basketArt=scene.add.container(0,0);carrier.add(carrier.basketArt);
scene.basketCarrier=carrier;scene.remainsFloor=1270;
vm.runInContext(html.slice(html.indexOf('function checkBasketCatch('),html.indexOf('function showAimArrow(')),context);
const firstCatchTween=tweens.length;
context.checkBasketCatch(scene);context.checkBasketCatch(scene);
assert.equal(catchGold,180,'The smallest basket multiplies chop and target-chain gold once');assert.equal(catchSaves,1);assert.equal(caught.parentContainer,carrier);assert.equal(looseHeads.length,0);
assert.doesNotThrow(()=>carrier.destroy());
assert.ok(tweens[firstCatchTween].stopped,'Leaving town releases the caught head animation');
context.CastArt=art;
vm.runInContext(html.slice(html.indexOf('function createTargetAppearance('),html.indexOf('function applyTargetWeather(')),context);
for(const type of['standard','woodenShield','explodingBarrel','holyMonk','royal','bird']){
  const target=scene.add.container(0,0);target.birdKind='crow';target.barrelScale=1.4;
  assert.doesNotThrow(()=>context.createTargetAppearance(scene,target,type));
  assert.doesNotThrow(()=>target.destroy());
}
for(const route of ['farmland','woodland','coast','estuary','uplands']) {
  const props=art.roadScenery(scene,route);
  assert.equal(props.length,12);
  for(const prop of props){assert.ok(Number.isFinite(prop.roadSpeed)&&prop.roadSpeed>0);assert.doesNotThrow(()=>prop.destroy());}
}
const life = art.townLife(scene,'York');
const birdTimer = timers.find(timer=>timer.delay===17000);
for(let flight=0;flight<5;flight++) {
  scene.cameras={main:{zoom:flight%2?1:.55,scrollX:35}};
  birdTimer.callback();
  const tween = tweens.at(-1), bird = tween.config.targets;
  assert.equal(bird.parentContainer,life);
  const viewLeft=435-800/(2*scene.cameras.main.zoom),viewRight=435+800/(2*scene.cameras.main.zoom);
  assert.ok(bird.x+30<viewLeft,'Background bird begins fully beyond the visible left edge');
  assert.ok(tween.config.x-30>viewRight,'Background bird finishes fully beyond the visible right edge');
  let destroyed=0;
  bird.once('destroy',()=>destroyed++);
  assert.doesNotThrow(()=>tween.config.onComplete(),'Completing a background bird flight must not crash the game loop');
  assert.equal(destroyed,1);
  assert.equal(bird.scene,undefined);
  assert.ok(!life.list.includes(bird));
  assert.ok(tween.stopped);
}
delete scene.cameras;
// Leaving town during a flight must also clean up its timer and animation safely.
birdTimer.callback();
const unfinished = tweens.at(-1);
assert.doesNotThrow(()=>art.townLife(scene,'Hull'));
assert.ok(birdTimer.removed);
assert.ok(unfinished.stopped);
assert.equal(unfinished.config.targets.scene,undefined);
assert.doesNotThrow(()=>unfinished.config.onComplete());
assert.doesNotThrow(()=>scene.townLife.destroy());
for(const city of require('./town-landmarks.cjs').names){
  assert.doesNotThrow(()=>art.townLife(scene,city),city+' scenery must create and replace safely');
}
assert.doesNotThrow(()=>scene.townLife.destroy());
// Exercise all three travel encounters with real parent/child destruction.
context.Math=Object.create(Math);
for(const roll of [.2,.6,.9]) {
  context.Math.random=()=>roll;
  const first=timers.length;
  art.roadLife(scene,'farmland');
  timers[first].callback();
  const encounter=tweens.at(-1);
  assert.doesNotThrow(()=>encounter.config.onComplete());
  assert.equal(encounter.config.targets.scene,undefined);
}
console.log('Actual Phaser background birds complete repeated flights and town changes without recursive destruction.');
// Verify the floor using the shipped camera's transform, not a duplicate formula.
const cameras=req(req.m.findIndex(fn=>fn.toString().includes('Camera:i(')));
context.window.MobileGame={};context.killStreak=0;context.CENTER_Y=800;
vm.runInContext(html.slice(html.indexOf('function updateComboCamera('),html.indexOf('function updateRemainsFloor(')),context);
for(const floor of [1270,1420,1588]) {
  const camera=new cameras.Camera(0,0,800,1600);
  const gameScene={cameras:{main:camera},remainsFloor:floor};
  context.killStreak=0;context.updateComboCamera(gameScene,16);assert.equal(camera.zoom,1);
  context.killStreak=20;
  for(let i=0;i<360;i++) {
    context.updateComboCamera(gameScene,16);camera.preRender();
    const worldFloor=camera.getWorldPoint(400,floor);
    assert.ok(Math.abs(worldFloor.y-floor)<.001,'The collection floor stays fixed above the controls throughout zoom');
    assert.ok(Math.abs(worldFloor.x-400)<.001,'The stage stays horizontally centred');
  }
  assert.ok(Math.abs(camera.zoom-.55)<.00001);assert.ok(camera.worldView.height>2800);assert.ok(camera.worldView.width>1400);
  assert.ok(camera.worldView.x>=-800&&camera.worldView.right<=1600&&camera.worldView.y>=-1600,'The expanded sky covers the entire zoomed viewport');
  context.killStreak=0;
  for(let i=0;i<360;i++)context.updateComboCamera(gameScene,16);
  assert.equal(camera.zoom,1);assert.equal(camera.scrollY,0,'A broken streak returns to the original camera');
  camera.destroy();
}
const zooms=[];
for(const fps of [30,60,120]) {
  const camera=new cameras.Camera(0,0,800,1600);context.killStreak=10;
  for(let i=0;i<fps;i++)context.updateComboCamera({cameras:{main:camera},remainsFloor:1420},1000/fps);
  zooms.push(camera.zoom);camera.destroy();
}
assert.ok(Math.max(...zooms)-Math.min(...zooms)<.00001,'Zoom pacing stays consistent across frame rates');
console.log('Actual Phaser camera widens with combos, anchors the floor, keeps scenery coverage and returns smoothly after a miss at 30/60/120 Hz.');
const fastCamera=new cameras.Camera(0,0,800,1600);context.killStreak=3;
for(let i=0;i<60;i++)context.updateComboCamera({cameras:{main:fastCamera},remainsFloor:1420},1000/60);
assert.ok(fastCamera.zoom<.89,'The first combo tier now opens ten times as much space');fastCamera.destroy();
let bounds;
Object.assign(context,{GAME_WIDTH:800,GAME_HEIGHT:1600,GROUND_Y:1588,STAGE_Y:1080,chest:null,bloodPool:null,bodyGroup:null,document:{querySelector:()=>null}});
vm.runInContext(html.slice(html.indexOf('function updateRemainsFloor('),html.indexOf('function spawnBasketCarrier(')),context);
context.updateRemainsFloor({game:{canvas:null},physics:{world:{setBounds(...args){bounds=args;}}}});
assert.equal(bounds[0],-400);assert.equal(bounds[2],1600);assert.equal(bounds[1]+bounds[3],1588);assert.equal(bounds[6],false,'Heads have more sideways room and no ceiling; the collection floor stays unchanged');

// Landmark art belongs only to the central panel; outskirts fill the wide view.
for(const town of ['york','canterbury','london','dover','durham','norwich','winchester','chester','hull','newcastle','colchester','lincoln','oxford','southampton','gloucester']){
 const svg=fs.readFileSync(path.join(__dirname,'../assets/'+town+'-angular.svg'),'utf8');
 assert.ok(svg.includes('width="2400" height="1600"'),'Panorama covers the expanded camera: '+town);
 assert.equal((svg.match(/data-city-landmarks=/g)||[]).length,1,'Major city landmarks appear once: '+town);
 assert.equal((svg.match(/data-town-panel="outskirts"/g)||[]).length,2);
 assert.equal((svg.match(/data-town-panel="landmark"/g)||[]).length,1);
 assert.ok(!svg.includes('clip-path="url(#town-panel)"'),'Scenery joins must not cut buildings in half: '+town);
 assert.equal((svg.match(/data-continuous-skyline=/g)||[]).length,1,'One skyline spans every join: '+town);
 assert.equal((svg.match(/data-continuous-street=/g)||[]).length,1,'Street and quay patterns do not restart at joins: '+town);
 const townAnimation=art.townLife(scene,town);
 const poles=townAnimation.list.filter(part=>part.width===4&&part.height===48);
 assert.equal(poles.length,2);
 for(const [side,seam] of [['left',800],['right',1600]]){
  const building=svg.match(new RegExp('<g data-seam-building="'+side+'">([\\s\\S]*?)</g>'))?.[1];
  const wall=building?.match(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/);
  assert.ok(wall&&Number(wall[1])<seam&&Number(wall[1])+Number(wall[2])>seam,'A complete building crosses the '+side+' join: '+town);
  const pole=poles[side==='left'?0:1];
  assert.equal(pole.x,Number(wall[1])+Number(wall[2])/2-800,'Animated flag stays on its house gable: '+town);
 }
}
const coverStart=html.indexOf('function setBackdropCover(');
vm.runInContext(html.slice(coverStart,html.indexOf('\n}',coverStart)+2),context);
const panorama={texture:{getSourceImage:()=>({width:2400,height:1600})},setScale(s){this.scale=s;return this;},setOrigin(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;}};
context.setBackdropCover(panorama,800,1600,true);assert.equal(panorama.scale,1);assert.equal(panorama.x,400);assert.equal(panorama.y,1600);
console.log('All fifteen panoramas retain unique landmarks, complete buildings across scenery joins and one continuous skyline and street.');

vm.runInContext(html.slice(html.indexOf('function offscreenActorX('),html.indexOf('function updateComboCamera(')),context);
const anchoredChest={active:true,setPosition(x,y){this.x=x;this.y=y;return this;},setScale(s){this.scale=s;return this;}};
context.chest=anchoredChest;context.CENTER_X=400;
for(const zoom of [1,.88,.7,.55])for(const floor of [1270,1420,1588]){
 const camera=new cameras.Camera(0,0,800,1600);camera.setZoom(zoom);camera.setScroll(0,(floor-800)*(1-1/zoom));camera.preRender();
 const coinScene={cameras:{main:camera},remainsFloor:floor};context.anchorCoinChest(coinScene);
 const expected=camera.getWorldPoint(740,floor-35);
 assert.ok(Math.abs(anchoredChest.x-expected.x)<.001);assert.ok(Math.abs(anchoredChest.y-expected.y)<.001);assert.ok(Math.abs(anchoredChest.scale*zoom-1)<1e-7,'Chest keeps its screen size');
 const left=context.offscreenActorX(coinScene,false),right=context.offscreenActorX(coinScene,true);
 assert.ok(left+100<camera.worldView.x,'Prisoner and either guard start fully beyond the left edge');assert.ok(right-100>camera.worldView.right,'Right-hand entrances and exits clear the visible edge');
 const coins=[];coinScene.tweens={add(t){coins.push(t);}};context.CastArt={coin(_scene,x,y,silver){return {x,y,silver};}};context.isMenuOpen=()=>false;
 anchoredChest.add=coin=>{assert.equal(coin.x,0);assert.ok((floor-35)+coin.y<0,'Both currencies begin above the screen');};
 vm.runInContext(html.slice(html.indexOf('function spawnCoin('),html.indexOf('function openChest(')),context);
 context.spawnCoin(coinScene);context.spawnFameCoin(coinScene);assert.equal(coins.length,2);for(const flight of coins)assert.equal(flight.y,-17,'Coins land at the same chest mouth at every zoom');
 camera.destroy();
}
console.log('Prisoner and guard entrances clear every zoom; chest size and position stay fixed; gold and silver fall from above the visible screen.');

// Repeated catches and departures use real Phaser parent destruction safely.
context.CastArt=art;context.gainFame=()=>{};context.Campaign={state:{targets:0}};context.splatEmitter={explode(){}};context.targetGroup={remove(){}};
vm.runInContext(html.slice(html.indexOf('function handleTargetHit('),html.indexOf('function armExplodingBarrel(')),context);
for(let hit=0;hit<22;hit++){
 const holder=scene.add.container(250,1020);holder.startFromRight=hit%2===1;holder.jesterPole=scene.add.rectangle(23,-20,6,180,0x76543a);holder.add(holder.jesterPole);
 const disc=scene.add.container(273,820);disc.add(scene.add.circle(0,0,20,0xec805d));
 Object.assign(disc,{targetType:'standard',collected:false,jester:holder,body:{enable:true,setVelocity(){},setAllowGravity(){},setImmovable(){},setCollideWorldBounds(){},destroy(){}}});
 context.handleTargetHit(scene,disc,null);const drop=tweens.at(-1);drop.config.onComplete();
 assert.equal(disc.parentContainer,holder,'Holder catches the hit target');const departure=tweens.at(-1);
 assert.equal(departure.config.x,holder.startFromRight?1250:-450,'Holder exits beyond the widest view');
 assert.ok(scene.departingCarriers.has(holder));assert.doesNotThrow(()=>departure.config.onComplete());
 assert.equal(holder.scene,undefined);assert.equal(disc.scene,undefined);assert.equal(scene.departingCarriers.size,0);
}
console.log('22 consecutive target catches leave safely without recycling spent targets or accumulating holders.');

// Exercise every new target with the shipped engine's real parent/child objects.
context.SpecialTargets=context.window.SpecialTargets=require('../special-targets.js');
context.window.MobileGame.combo=()=>{};
context.windForce={x:0};context.currentWeather='clear';context.fogEmitter=null;
vm.runInContext(fs.readFileSync(path.join(root,'special-runtime.js'),'utf8'),context);
const trickGroup=new Set();context.targetGroup={getChildren:()=>[...trickGroup],add:t=>trickGroup.add(t),remove:t=>trickGroup.delete(t)};
scene.time.now=0;
scene.physics={world:{enable(t){t.body={enable:true,offset:{x:0,y:0},velocity:{x:0,y:0},destroy(){},
 setCircle(){return this;},setOffset(x,y){this.offset={x,y};return this;},setAllowGravity(){return this;},setImmovable(){return this;},setCollideWorldBounds(){return this;},setGravityY(){return this;},setVelocity(x,y){this.velocity={x,y};return this;},stop(){return this;}};}}};
scene.add.text=(x,y)=>scene.add.image(x,y,'specialTargets','0');
let trickFame=0;context.gainFame=(_s,_t,f)=>{trickFame+=f;};
for(const option of context.SpecialTargets.catalog){
 const t=scene.add.container(200,700);Object.assign(t,{targetType:'special',targetOption:option,collected:false,motionStartedAt:0});
 context.createTargetAppearance(scene,t,'special');scene.physics.world.enable(t);trickGroup.add(t);
 context.initializeSpecialTarget(scene,t);
 for(const time of [0,600,1500,4000]){scene.time.now=time;assert.doesNotThrow(()=>context.updateSpecialTarget(scene,t),option.name+' animates');}
 if(option.effect==='parts'){
  assert.equal(t.specialParts.length,option.pieces);assert.equal(t.body.enable,false);
  for(const part of t.specialParts){assert.equal(part.body.enable,true);assert.equal(part.partParent,t);}
  t.setPosition(270,680);context.updateSpecialTarget(scene,t);
  for(const part of t.specialParts)assert.equal(part.x,270+part.partOffset);
 }
 assert.doesNotThrow(()=>t.destroy(),option.name+' cleans up');trickGroup.delete(t);
 assert.equal(trickGroup.size,0,'Multi-part children disappear with their holder');
}
scene.time.now=0;
const line=scene.add.container(200,700);Object.assign(line,{targetType:'special',targetOption:context.SpecialTargets.catalog.find(t=>t.art==='line'),collected:false});
context.createTargetAppearance(scene,line,'special');scene.physics.world.enable(line);trickGroup.add(line);context.initializeSpecialTarget(scene,line);
const shot={active:true,body:{enable:true,velocity:{x:0,y:100}}};
for(const part of line.specialParts)context.handleTargetHit(scene,part,shot);
assert.equal(line.collected,true,'Hitting every hat completes the washing line');assert.equal(trickGroup.size,0);
assert.equal(shot.targetCombo,5,'Four hats and their completed line build a five-hit combo');
for(const tween of tweens.filter(t=>!t.stopped&&t.config.targets?.targetType==='special'&&t.config.onComplete))assert.doesNotThrow(()=>tween.config.onComplete());
assert.equal(line.active,false);
const paintedDisc=scene.add.container(200,700);Object.assign(paintedDisc,{targetType:'standard',collected:false,mustardPaint:true,fameMultiplier:1});scene.physics.world.enable(paintedDisc);
scene.trickBuffUntil=8000;trickFame=0;context.handleTargetHit(scene,paintedDisc,null);
assert.equal(trickFame,6,'Mustard and bell bonuses apply to original targets as well');paintedDisc.destroy();
console.log('All 45 new targets animate and clean up with real Phaser objects; connected multi-part prizes complete safely and stack arcade bonuses.');
