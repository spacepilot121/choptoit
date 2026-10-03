const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context={window:{},Phaser:{Math:{Clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),Easing:{Quadratic:{InOut:n=>n}}}}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dayNightCycle.js'),'utf8'),context);
const stars=[];
function object(){return {setAlpha(n){this.alpha=n;return this;},setPosition(x,y){this.x=x;this.y=y;return this;},setDepth(){return this;},setDisplaySize(){return this;},setScrollFactor(){return this;},add(){return this;},fillStyle(){return this;},fillCircle(x,y){stars.push({x,y});return this;}};}
const sky=new context.window.DayNightCycle();sky.init({scale:{width:800,height:1600},textures:{exists:()=>true},add:{container:object,graphics:object,circle:object,image:object,rectangle:object}});
assert.ok(Math.min(...stars.map(p=>p.x))<20&&Math.max(...stars.map(p=>p.x))>780,'Stars span the whole sky width');
assert.ok(Math.max(...stars.map(p=>p.y))>900,'Stars cover the visible sky vertically');
for(const [time,expected]of [[.2,-60],[.5,400],[.8,860]]){sky.timeOfDay=time;sky.updateCelestials();assert.ok(Math.abs(sky.sun.x-expected)<1e-7,'Sun crosses the full sky from off-screen edges');}
sky.timeOfDay=.7;sky.updateCelestials();assert.equal(sky.moon.x,-60);
sky.timeOfDay=.3;sky.updateCelestials();assert.ok(Math.abs(sky.moon.x-860)<1e-7);
sky.timeOfDay=.999;sky.updateCelestials();const midnight=sky.moon.x;sky.timeOfDay=.001;sky.updateCelestials();assert.ok(Math.abs(sky.moon.x-midnight)<5,'Moon position remains continuous across midnight');
let snowStarts=0,snowStops=0;
const weather={FEATURES:{weather:true},currentMonth:0,currentWeather:'clear',Math:{random:()=>.9},Phaser:{Utils:{Array:{GetRandom:items=>items.at(-1)}}},weatherText:{setText(){}},weatherIndicator:{setText(){}},targetGroup:{getChildren:()=>[]},rainEmitter:null,fogEmitter:null,windEmitter:null,snowEmitter:{start(){snowStarts++;},stop(){snowStops++;}}};vm.createContext(weather);
vm.runInContext(html.slice(html.indexOf('function applyRandomWeather('),html.indexOf('function arrowForWind(')),weather);
weather.applyRandomWeather({});assert.equal(weather.currentWeather,'snow');assert.equal(snowStarts,1);
weather.currentMonth=5;weather.applyRandomWeather({});assert.notEqual(weather.currentWeather,'snow');assert.equal(snowStops,2);
const fallBlock=html.slice(html.indexOf('  // Apply extra gravity once heads'),html.indexOf('  checkFastHeadTargetCrossings(this);'));
let gravity=0;const head={isHead:true,rainGravityApplied:false,body:{velocity:{y:40},setGravityY(n){gravity=n;}}};
weather.bodyGroup={getChildren:()=>[head]};weather.currentWeather='snow';vm.runInContext(fallBlock,weather);assert.equal(gravity,120);assert.equal(head.rainGravityApplied,true);
gravity=0;vm.runInContext(fallBlock,weather);assert.equal(gravity,0,'Snow gravity is applied once per falling head');
const {launchPreview}=require('../game-core.js');
const clear=launchPreview(0,.5),snow=launchPreview(0,.5,1,{x:0,y:0},'snow'),rain=launchPreview(0,.5,1,{x:0,y:0},true);
assert.ok(clear.at(-1).y<snow.at(-1).y&&snow.at(-1).y<rain.at(-1).y,'Snow and rain visibly change the guide by their different falling acceleration');
const calls=[];const escape={prisoner:{},prisonerHeadSprite:{personaTween:{stop(){calls.push('stop');}}},CHARACTER_BASE_Y:1020,CastArt:{expression(o,mood){calls.push(mood);},walk(s,o,duration,joy){calls.push({duration,joy});}},window:{MobileGame:{feedback(){}}}};vm.createContext(escape);
vm.runInContext(html.slice(html.indexOf('function savePrisoner('),html.indexOf('function beheadPrisoner(')),escape);
let run;escape.savePrisoner({tweens:{add(config){run=config;}}});assert.ok(calls.includes('happy'));assert.equal(calls[2].joy,true);assert.equal(run.x,850);assert.equal(run.duration,1200);
console.log('Full-width stars, continuous edge-to-edge sky paths, seasonal snow physics and smiling animated escapes pass.');
