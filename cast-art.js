(() => {
  function head(sprite,key) {
    const n=Number(key.match(/\d+$/)?.[0] || 1);
    const frame=key==='escortHead'?7:key.startsWith('priestHead')?12+(n-1)%4:(n-1)%12;
    sprite.castFaceIndex=frame;
    sprite.setTexture('castHeads',String(frame));
    sprite.setScale(58/Math.max(sprite.width,sprite.height));
    return sprite;
  }
  function body(sprite,key,role='') {
    const variant=Number(key.match(/\d+$/)?.[0] || 1)-1;
    const frame=key==='escortBody'||role==='Knight'?11:key==='priestBody'?10:role==='Lord'?9:variant%9;
    sprite.setTexture('castBodies',String(frame)).setScale(100/sprite.height).clearTint();
    return sprite;
  }
  function jester(sprite,key) {
    const frame=Number(key.match(/\d+$/)?.[0] || 1)-1;
    sprite.setTexture('castJesters',String(frame)).setScale(130/sprite.height);
    return sprite;
  }
  function weapon(sprite,level,height=145) {
    sprite.setTexture('castWeapons',String(Math.max(0,Math.min(29,level-1))));
    sprite.setScale(height/sprite.height);
    return sprite;
  }
  function weaponMarkup(level,texture) {
    const frame=texture.get(String(Math.max(0,Math.min(29,level-1))));
    return `<svg class="item-art weapon-art" role="img" aria-label="Your current weapon" viewBox="${frame.cutX} ${frame.cutY} ${frame.cutWidth} ${frame.cutHeight}"><image href="assets/cast-weapons-angular.png" width="${frame.source.width}" height="${frame.source.height}" /></svg>`;
  }
  function expression(sprite,mood) { sprite.setFrame(String((sprite.castFaceIndex || 0)+(mood==='startled'?16:mood==='dazed'?32:0))); }
  function nervous(scene,head,body) {
    head.personaTween?.stop();body.personaTween?.stop();
    head.personaTween=scene.tweens.add({targets:head,angle:{from:-4,to:3},duration:650+(head.castFaceIndex%4)*170,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    body.personaTween=scene.tweens.add({targets:body,scaleX:{from:body.scaleX*.98,to:body.scaleX*1.02},duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }
  function caravan(scene,level,x,y) {
    const group=scene.add.container(x,y),parts=[];
    const block=(x,y,w,h,c)=>scene.add.rectangle(x,y,w,h,c);
    // Every journey keeps the companion dog; upgrades add a horse and cart.
    parts.push(block(65,22,52,22,0xb88b59),block(89,10,24,24,0xb88b59),block(100,5,12,8,0x25343b));
    const legs=[];for(const x of[48,78]){const leg=block(x,40,8,24,0x25343b);parts.push(leg);legs.push(leg);}
    if(level>=2){parts.push(block(-105,4,110,42,0x967454),block(-47,-31,23,70,0x967454),block(-30,-57,49,24,0x967454),scene.add.triangle(-47,-79,0,17,4,0,13,17,0x25343b),block(-24,-59,5,5,0x25343b));for(const x of[-144,-70]){const leg=block(x,49,12,65,0x25343b);parts.push(leg);legs.push(leg);}}
    if(level>=3){const width=90+Math.min(160,(level-3)*15);parts.push(block(-210-width/2,5,width,66,0xb88b59),block(-153,18,130,6,0x25343b));for(const x of[-200-width,-210]){const wheel=scene.add.circle(x,52,25,0x25343b);const spoke=block(x,52,4,42,0xe9d8b4);parts.push(wheel,spoke);scene.tweens.add({targets:spoke,angle:360,duration:650,repeat:-1});}}
    if(level===2)parts.push(block(-105,-24,65,26,0x46736c));
    group.add(parts);scene.tweens.add({targets:legs,angle:{from:-18,to:18},duration:180,yoyo:true,repeat:-1});
    scene.tweens.add({targets:group,y:y-3,duration:260,yoyo:true,repeat:-1});return group;
  }
  function bird(scene,kind,fromRight) {
    const dove=kind==='dove', outline=0x152b31;
    const plumage=dove?0xf4e9d1:0x294953, feather=dove?0xd6c9ac:0x537a7c;
    const art=scene.add.container(0,0).setScale(fromRight?-1:1,1);
    const tail=scene.add.polygon(-24,5,[0,0,22,6,3,18,7,9],plumage).setStrokeStyle(2,outline);
    const body=scene.add.ellipse(0,5,43,27,plumage).setStrokeStyle(2,outline);
    const wing=scene.add.polygon(-5,-4,[0,29,4,0,13,8,21,2,25,15,34,12,27,30],feather).setStrokeStyle(2,outline);
    const head=scene.add.circle(19,-4,12,plumage).setStrokeStyle(2,outline);
    const beak=scene.add.triangle(33,-3,0,0,13,5,0,8,0xf9c66b).setStrokeStyle(1,outline);
    const eye=scene.add.circle(23,-7,2.5,dove?outline:0xf9c66b);
    art.add([tail,body,wing,head,beak,eye]);
    const flap=scene.tweens.add({targets:wing,angle:{from:-25,to:25},scaleY:{from:.65,to:1},duration:dove?230:280,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    art.once('destroy',()=>flap.stop());
    return art;
  }
  window.CastArt={head,body,jester,weapon,weaponMarkup,bird,expression,nervous,caravan};
})();
