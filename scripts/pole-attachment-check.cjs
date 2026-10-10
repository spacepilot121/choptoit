const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../cast-art.js'),'utf8'),context);
for(const height of[60,180,540])for(const sway of[-.5,0,.5])for(const rotation of[-.12,0,.12])for(const scale of[.7,1,1.2]){
 const holder={active:true,x:271,y:1017,getWorldTransformMatrix(){return {transformPoint(x,y){return {x:holder.x+scale*(x*Math.cos(rotation)-y*Math.sin(rotation)),y:holder.y+scale*(x*Math.sin(rotation)+y*Math.cos(rotation))};}};}};
 const pole={x:23,y:-20,rotation:sway};const target={active:true,collected:false,jester:holder,jesterPole:pole,poleHeight:height,body:{enable:true,offset:{x:-20,y:-30}},setPosition(x,y){this.x=x;this.y=y;}};
 target.body.updateFromGameObject ||= function(){this.x=target.x+this.offset.x;this.y=target.y+this.offset.y;this.position={x:this.x,y:this.y};};target.body.prev ||= {copy(p){this.x=p.x;this.y=p.y;}};
 context.window.CastArt.syncPoleTarget(target);
 assert.equal(target.body.prev.x,target.body.position.x,'Scripted motion must not be applied twice by physics');
 const localX=23+Math.sin(sway)*height,localY=-20-Math.cos(sway)*height;
 assert.ok(Math.abs(target.x-(271+scale*(localX*Math.cos(rotation)-localY*Math.sin(rotation))))<1e-7);
 assert.ok(Math.abs(target.y-(1017+scale*(localX*Math.sin(rotation)+localY*Math.cos(rotation))))<1e-7);
 assert.equal(target.body.x,target.x-20);assert.equal(target.body.y,target.y-30);
 holder.y+=4;context.window.CastArt.syncPoleTarget(target);assert.ok(Math.abs(target.y-(1021+scale*(localX*Math.sin(rotation)+localY*Math.cos(rotation))))<1e-7,'Walking bob cannot detach the pole');
 target.collected=true;const previous=target.y;holder.y+=100;context.window.CastArt.syncPoleTarget(target);assert.equal(target.y,previous,'Caught targets release their pole attachment');
}
console.log('Pole tips and hitboxes stay attached at every height, sway angle, parent rotation, scale and walking bob; collected targets release cleanly.');

const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');context.window.TargetShop=require('../target-shop.js').create();
vm.runInContext(html.slice(html.indexOf('function updateTargetMotion('),html.indexOf('function spawnTarget(')),context);
for(const motion of ['vertical','horizontal','orbit','zigzag']){
 const pole={x:23,y:-20,rotation:0,setDisplaySize(w,h){this.height=h;return this;},setRotation(a){this.rotation=a;return this;}};
 const target={active:true,collected:false,targetOption:{motion},motionStartedAt:1000,basePoleHeight:200,poleHeight:200,jesterPole:pole,jester:{active:true,getWorldTransformMatrix(){return {transformPoint(x,y){return {x:x+300,y:y+1000};}};}},body:{enable:true,offset:{x:-14,y:-14}},setPosition(x,y){this.x=x;this.y=y;}};
 target.body.updateFromGameObject=function(){this.x=target.x+this.offset.x;this.y=target.y+this.offset.y;this.position={x:this.x,y:this.y};};target.body.prev={copy(p){this.x=p.x;this.y=p.y;}};
 for(let t=1000;t<=3000;t+=80){context.updateTargetMotion(target,t);context.window.CastArt.syncPoleTarget(target);assert.equal(pole.height,target.poleHeight);assert.ok(Math.abs(target.x-(323+Math.sin(pole.rotation)*pole.height))<1e-7);assert.ok(Math.abs(target.y-(980-Math.cos(pole.rotation)*pole.height))<1e-7);assert.equal(target.body.x,target.x-14);}
 target.collected=true;const h=pole.height;context.updateTargetMotion(target,3400);assert.equal(pole.height,h,'Caught targets stop moving');
}
