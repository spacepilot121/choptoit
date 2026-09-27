const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
class Object2D extends EventEmitter {
  constructor(x,y){super();this.x=x;this.y=y;this.children=[];}
  setScale(x,y){this.scaleX=x;this.scaleY=y;return this;}
  setStrokeStyle(){return this;}
  setDepth(){return this;}
  add(children){this.children.push(...(Array.isArray(children)?children:[children]));return this;}
  destroy(){this.emit('destroy');this.children.forEach(child=>child.destroy());}
}
for(const direction of [0,1]) {
  const active=new Set(),objects=[];
  const scene={add:{},tweens:{add(config){const tween={config,stop(){active.delete(tween);}};active.add(tween);return tween;}},physics:{world:{enable(bird){bird.body={setAllowGravity(){},setImmovable(){},setSize(w,h){this.size=[w,h];},setOffset(x,y){this.offset=[x,y];}};}}}};
  for(const shape of ['container','polygon','ellipse','circle','triangle'])scene.add[shape]=(x,y)=>new Object2D(x,y);
  const context={window:{},Phaser:{Math:{Between:()=>direction}},targetGroup:{add:bird=>objects.push(bird)},applyTargetWeather(){}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'cast-art.js'),'utf8'),context);
  context.CastArt=context.window.CastArt;
  context.createTargetAppearance=(s,bird)=>{bird.birdSprite=context.CastArt.bird(s,bird.birdKind,bird.fromRight);bird.add(bird.birdSprite);};
  vm.runInContext(html.slice(html.indexOf('function spawnBird('),html.indexOf('function pickSpacedTargetX(')),context);
  context.spawnBird(scene);
  const bird=objects[0],motion=bird.moveTween.config;
  assert.equal(bird.y,420,'Bird lane remains below the portrait HUD');
  assert.equal(bird.birdSprite.scaleX,direction?-1:1,'Bird faces its outbound path');
  assert.equal(motion.x,direction?-50:850);
  assert.deepEqual(bird.body.size,[58,36]);
  assert.deepEqual(bird.body.offset,[-29,-18]);
  motion.onYoyo();
  assert.equal(bird.birdSprite.scaleX,direction?1:-1,'Bird faces its return path');
  assert.equal(active.size,2);
  bird.destroy();
  assert.equal(active.size,0,'Hit or departing birds release wing and flight animations');
}
console.log('Both bird directions face their flight path, use a visible lane and centered hitbox, and release flight/wing animations on destruction.');
