(() => {
  function head(sprite,key) {
    const n=Number(key.match(/\d+$/)?.[0] || 1);
    const frame=key==='escortHead'?7:key.startsWith('priestHead')?12+(n-1)%4:(n-1)%12;
    sprite.setTexture('castHeads',String(frame));
    sprite.setScale(58/Math.max(sprite.width,sprite.height));
    return sprite;
  }
  function body(sprite,key,role='') {
    const frame=key==='escortBody'||role==='Knight'?3:key==='priestBody'?2:key==='prisonerBody2'||role==='Lord'?1:0;
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
    return `<svg class="item-art weapon-art" role="img" aria-label="Your current weapon" viewBox="${frame.cutX} ${frame.cutY} ${frame.cutWidth} ${frame.cutHeight}"><image href="assets/cast-weapons-v2.png" width="${frame.source.width}" height="${frame.source.height}" /></svg>`;
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
  window.CastArt={head,body,jester,weapon,weaponMarkup,bird};
})();
