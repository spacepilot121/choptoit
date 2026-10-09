const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const shop=require('../target-shop.js').create();
const context={window:{TargetShop:shop},FEATURES:{specialTargets:true},currentCity:'York',Phaser:{Math:{Between:()=>1},Scene:class{}},player:{weaponLevel:8},yorkFlyingIslandEvent:null,yorkRingPlatformEvent:null,YORK_ISLAND_EVENT_TEST_CHANCE:45};vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function chooseTargetType()'),html.indexOf('function createTargetAppearance(')),context);
for(let r=1;r<=100;r++){context.Phaser.Math.Between=()=>r;assert.ok(['standard','special'].includes(context.chooseTargetType()),'York offers its red starters and three local arcade tricks');}
for(const [id,type] of [['shield','woodenShield'],['barrel','explodingBarrel'],['monk','standard'],['royal','royal']]){shop.restore([id]);for(const town of ['York','Hull','Gloucester']){context.currentCity=town;let found=false;for(let r=1;r<=100;r++){context.Phaser.Math.Between=()=>r;const got=context.chooseTargetType();if(shop.lastChoice.id===id){assert.equal(got,type);found=true;}}assert.ok(found,'Purchased options appear in every town');}}
shop.restore([]);context.Phaser.Math.Between=()=>1;
vm.runInContext(html.slice(html.indexOf('function shouldSpawnYorkFlyingIslandEvent()'),html.indexOf('function getFlyingIslandMetrics(')),context);
context.currentCity='York';assert.equal(context.shouldSpawnYorkFlyingIslandEvent(),false);
shop.restore(['island']);context.currentCity='York';assert.equal(context.shouldSpawnYorkFlyingIslandEvent(),true,'Bought islands work outside Gloucester');
context.player.weaponLevel=7;assert.equal(context.shouldSpawnYorkFlyingIslandEvent(),false);
let days=0,visits=0,saves=0,resumes=0,arrivals=0;
Object.assign(context,{currentDay:29,currentMonth:0,months:['Jan','Feb'],advanceDays(n){days+=n;},selectCity(){},dailyMarketUpdate(){},Campaign:{visit(){visits++;}},SaveManager:{performSave(){saves++;}},window:{MobileGame:{journeyFinish(){arrivals++;}}}});
vm.runInContext(html.slice(html.indexOf('class TravelScene extends'),html.indexOf('/* Legacy desktop instructions'))+'\nthis.TravelTest=TravelScene;',context);
const trip=new context.TravelTest();trip.init({city:{name:'Durham'},days:4,mainScene:{scene:{resume(){resumes++;}}}});
trip.duration=4400;trip.clouds=[];trip.dayNight={update(){}};trip.date={setText(t){this.text=t;}};trip.progress={};trip.scene={stop(){}};
trip.update(0,2200);assert.equal(days,0,'Departure must not debit the whole journey before its animation');assert.match(trip.date.text,/1 Feb/);assert.equal(trip.progress.displayWidth,300);
trip.update(2200,2200);assert.equal(days,4);assert.equal(visits,1);assert.equal(saves,1);assert.equal(resumes,1);assert.equal(arrivals,1);
trip.finish();assert.equal(days,4,'Repeated finish must not advance the calendar twice');
console.log('Town challenges unlock progressively; animated travel counts calendar days and commits arrival once.');
Object.assign(context,{ChopCore:require('../game-core.js'),GROUND_Y:1588,CastArt:{expression(head,mood){head.mood=mood;}}});
vm.runInContext(html.slice(html.indexOf('function settleHead('),html.indexOf('function showAimArrow(')),context);
const pileScene={headPileCounts:Array(60).fill(0)};
function fallen(){return {x:88,displayHeight:58,setAlpha(){return this;},setScale(){return this;},setAngle(){return this;},setDepth(){return this;},body:{enable:true,stop(){},setAllowGravity(value){this.gravity=value;}}};}
const first=fallen(),second=fallen();context.settleHead(pileScene,first);context.settleHead(pileScene,second);
assert.equal(first.y,1559);assert.equal(second.y,1547,'Heads in the same landing column stack upward from the bottom');
assert.equal(first.mood,'dazed');assert.equal(first.body.enable,false);assert.equal(first.body.gravity,false);
context.settleHead(pileScene,first);assert.equal(pileScene.headPileCounts[22],2,'A settled head is retained without being added to the pile again');
const corpse={...fallen(),displayWidth:71,setOrigin(){return this;}};
pileScene.remainsFloor=1400;context.settleCorpse(pileScene,corpse);
assert.equal(corpse.y,1340.5,'Bodies lie above the phone navigation and stack with heads');assert.equal(corpse.x,88);
assert.equal(corpse.body.enable,false);context.settleCorpse(pileScene,corpse);assert.equal(pileScene.headPileCounts.reduce((a,b)=>a+b,0),3);
let struck=0;const motions=[];context.executionerWeapon={};context.slashTween=null;
vm.runInContext(html.slice(html.indexOf('function slashExecutioner('),html.indexOf('function introExecutioner(')),context);
context.slashExecutioner({tweens:{add(config){motions.push(config);return {stop(){}};}}},0,()=>struck++);
assert.equal(struck,0);assert.equal(motions[0].degrees,-45);motions[0].onComplete();assert.equal(struck,0);
assert.equal(motions[1].degrees,-290,'The cut sweeps down and round into an upward stroke');
const swing=motions[1].targets;for(const degrees of [-90,-180,-270]){swing.degrees=degrees;motions[1].onUpdate();assert.equal(context.executionerWeapon.angle,degrees,'Unwrapped swing state preserves the full circular path');}
motions[1].onComplete();assert.equal(struck,1,'Head launches once on the rising stroke');
assert.equal(motions[2].degrees,-335,'Follow-through continues in the same direction');motions[2].onComplete();assert.equal(struck,1,'Recovery must not chop twice');assert.equal(context.executionerWeapon.angle,25);assert.equal(context.executionerWeapon.x,28);assert.equal(context.executionerWeapon.y,-12);
const display=()=>({setDepth(){return this;},setScale(){return this;},setAlpha(){return this;},setOrigin(){return this;},setDisplaySize(){return this;},setText(){return this;}});
Object.assign(context,{CENTER_X:400,CENTER_Y:800,GAME_WIDTH:800,GAME_HEIGHT:1600,createCloudTextures(){},DayNightCycle:class{init(){}},player:{storageLevel:5}});
context.CastArt.caravanName=()=>"Trading cart";context.CastArt.caravan=()=>display();context.CastArt.roadScenery=()=>[];context.CastArt.roadLife=()=>{};context.window.MobileGame.journeyStart=()=>{};
const createdTrip=new context.TravelTest();createdTrip.init({city:{name:'Durham'},days:3,mainScene:{dayNight:{timeOfDay:.3}}});
createdTrip.add={rectangle:display,image:display,text:display,polygon:display};createdTrip.tweens={add(){}};createdTrip.create();
assert.equal(createdTrip.dayNight.timeOfDay,.3,'Journey initialization reads the actual main-scene clock');
assert.equal(createdTrip.duration,3300,'Longer routes play longer journeys');
for(const [city,route]of [['York','farmland'],['Hull','estuary'],['Dover','coast'],['Southampton','coast'],['Durham','uplands'],['Newcastle','uplands'],['Lincoln','uplands'],['Canterbury','woodland'],['Gloucester','woodland'],['Oxford','woodland']]){
  const journey=new context.TravelTest();journey.init({city:{name:city},days:2,mainScene:{dayNight:{timeOfDay:.3}}});
  journey.add=createdTrip.add;journey.tweens=createdTrip.tweens;journey.create();assert.equal(journey.route,route);
}
