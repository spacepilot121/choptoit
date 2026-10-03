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
  function expression(sprite,mood) { sprite.setFrame(String((sprite.castFaceIndex || 0)+(mood==='startled'?16:mood==='dazed'?32:mood==='happy'?48:0))); }
  function walk(scene,actor,duration=1500,joy=false) {
    actor.walkTween?.stop();actor.stepTween?.stop();
    const base=actor.y;
    actor.walkTween=scene.tweens.add({targets:actor,y:base-(joy?10:4),angle:{from:joy?-5:-2,to:joy?5:2},duration:joy?110:170,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    const body=actor.list?.find(part=>part.texture?.key==='castBodies');
    if(body){const angle=body.angle;actor.stepTween=scene.tweens.add({targets:body,angle:{from:-3,to:3},duration:170,yoyo:true,repeat:-1});scene.time.delayedCall(duration,()=>{actor.stepTween?.stop();body.setAngle(angle);});}
    scene.time.delayedCall(duration,()=>{actor.walkTween?.stop();if(actor.active!==false)actor.setY(base).setAngle(0);});
    actor.once('destroy',()=>{actor.walkTween?.stop();actor.stepTween?.stop();});
  }
  function nervous(scene,head,body) {
    head.personaTween?.stop();body.personaTween?.stop();
    head.personaTween=scene.tweens.add({targets:head,angle:{from:-4,to:3},duration:650+(head.castFaceIndex%4)*170,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    body.personaTween=scene.tweens.add({targets:body,scaleX:{from:body.scaleX*.98,to:body.scaleX*1.02},duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }
  function caravan(scene,level,x,y) {
    const group=scene.add.container(x,y),parts=[];
    const block=(x,y,w,h,c)=>scene.add.rectangle(x,y,w,h,c);
    // Every journey keeps the companion dog; upgrades add a horse and cart.
    parts.push(scene.add.polygon(64,49,[0,6,10,0,43,3,54,13,43,25,7,22],0xb88b59),scene.add.polygon(75,55,[0,0,24,3,18,14,0,13],0x8a624a),scene.add.polygon(91,35,[0,7,9,0,25,6,31,18,18,27,1,23],0xd0a575),scene.add.polygon(86,28,[0,0,10,6,7,25,0,18],0x705440),block(104,36,9,6,0x25343b),block(89,43,3,18,0x6d8b7b));
    const legs=[];for(const x of[48,78]){const leg=block(x,68,8,24,0x25343b);parts.push(leg);legs.push(leg);}
    if(level>=2){parts.push(scene.add.polygon(-108,5,[0,14,18,0,90,4,113,25,98,48,16,45],0x967454),scene.add.polygon(-47,-29,[0,67,5,9,20,0,30,19,24,77],0xb28a60),scene.add.polygon(-26,-55,[0,3,32,0,51,14,43,27,11,25],0xb28a60),scene.add.polygon(-42,-66,[0,22,0,0,8,4,12,22],0x67554b),scene.add.polygon(-55,-63,[0,19,0,0,7,3,11,20],0x67554b),block(-24,-59,4,4,0x25343b),scene.add.polygon(-11,-46,[0,0,15,3,12,13,0,12],0x7c5d4b));for(const x of[-144,-70]){const leg=scene.add.polygon(x,49,[0,0,13,0,10,51,17,65,2,65,0,48],0x4c4942);parts.push(leg);legs.push(leg);}}
    if(level>=3){const width=90+Math.min(160,(level-3)*15);parts.push(block(-210-width/2,5,width,66,0xb88b59),block(-153,18,130,6,0x25343b));for(const x of[-200-width,-210]){const wheel=scene.add.circle(x,52,25,0x25343b);const spoke=block(x,52,4,42,0xe9d8b4);parts.push(wheel,spoke);scene.tweens.add({targets:spoke,angle:360,duration:650,repeat:-1});}}
    if(level>=2){parts.push(scene.add.polygon(-106,6,[0,-22,50,-12,49,14,6,21],0x6e5348),block(-48,-35,7,50,0xc0a07b),block(-25,-57,7,5,0xe9d8b4));const tail=scene.add.polygon(-165,13,[0,0,-15,20,-9,37,5,13],0x39434a);parts.push(tail);scene.tweens.add({targets:tail,angle:{from:-9,to:14},duration:220,yoyo:true,repeat:-1});}
    const dogTail=scene.add.polygon(40,44,[0,0,-19,-14,-12,-22,8,-5],0xb88b59);parts.push(dogTail,block(91,35,3,3,0x25343b));scene.tweens.add({targets:dogTail,angle:{from:-18,to:18},duration:130,yoyo:true,repeat:-1});
    if(level===2)parts.push(block(-105,-24,65,26,0x46736c),block(-105,-26,5,29,0xe9d8b4));
    if(level>=3){const width=90+Math.min(160,(level-3)*15),left=-210-width;parts.push(block(left+width/2,12,width,4,0xe3bc7e),block(left+width/2,-21,width+10,9,0xd3ab6c));for(let i=1;i<5;i++)parts.push(block(left+width*i/5,7,3,54,0x8d644c));}
    if(level>=4){parts.push(block(-250,-46,40,41,0x627b71),block(-216,-49,33,45,0xbb8758),block(-245,-47,4,42,0xe9d8b4),block(-216,-49,30,4,0x70574a));}
    if(level>=6){const width=100+Math.min(160,(level-3)*15);parts.push(block(-270,-53,width,5,0x72594b),scene.add.polygon(-270,-82,[0,41,13,0,width-13,0,width,41],0x739c90),scene.add.polygon(-270,-82,[0,0,width/2-13,0,width/2,41,0,41],0x4e746c),block(-270,-77,5,40,0xe9d8b4));}
    if(level>=9){parts.push(block(-165,-38,12,26,0xe4bd6c),block(-165,-38,6,16,0xf4e9d1));}
    if(level>=12){parts.push(block(-230,-133,4,66,0x72594b));const flag=scene.add.polygon(-208,-157,[0,-12,39,-5,30,12,0,7],0xba6857);parts.push(flag);scene.tweens.add({targets:flag,scaleX:{from:.8,to:1},duration:320,yoyo:true,repeat:-1});}
    group.add(parts);scene.tweens.add({targets:legs,angle:{from:-18,to:18},duration:180,yoyo:true,repeat:-1});
    scene.tweens.add({targets:group,y:y-3,duration:260,yoyo:true,repeat:-1});return group;
  }
  function townLife(scene,city) {
    scene.townLife?.destroy(true);
    const life=scene.add.container(0,0).setDepth(-1.9);scene.townLife=life;
    const animate=(object,config)=>{const tween=scene.tweens.add({targets:object,...config});object.once('destroy',()=>tween.stop());return object;};
    scene.crowdMembers=[];scene.crowdLevel=-1;
    for(let i=0;i<24;i++){
      const x=55+(i*71)%690,y=1016.5;
      const figure=scene.add.container(x,y);const coat=scene.add.polygon(0,0,[4,0,20,0,24,25,0,25],[0xa46c5d,0x799688,0xc1a16a,0x7b8098][i%4]).setOrigin(.5,0);
      const face=scene.add.image(0,-9,'castHeads',String((city.length+i*3)%16)).setDisplaySize(20,20);
      face.castFaceIndex=(city.length+i*3)%16;figure.crowdFace=face;
      figure.add([coat,face,scene.add.rectangle(-5,29,5,9,0x3d4d51),scene.add.rectangle(5,29,5,9,0x3d4d51)]);life.add(figure);
      figure.setAlpha(i<4?1:0);scene.crowdMembers.push(figure);
      animate(figure,{x:x+(i%2?-12:12),duration:4000+i*100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});animate(coat,{angle:{from:-3,to:3},duration:250+i*7,yoyo:true,repeat:-1});
    }
    for(const x of[180,610]){const pole=scene.add.rectangle(x,785,4,115,0x665548),flag=scene.add.polygon(x,737,[0,0,40,0,32,51,0,43],city.length%2?0xba6857:0x728ea0).setOrigin(0,0);life.add([pole,flag]);animate(flag,{scaleX:{from:.86,to:1},angle:{from:-3,to:3},duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
    for(let i=0;i<3;i++){const smoke=scene.add.ellipse(97+i*6,670-i*25,16+i*11,24+i*10,0xd0d3bd,.2);life.add(smoke);animate(smoke,{y:smoke.y-60,x:smoke.x+25,alpha:0,duration:2600+i*450,repeat:-1});}
    return life;
  }
  function crowd(scene,streak) {
    const count=Math.min(24,4+Math.max(0,streak)*2);if(scene.crowdLevel===count)return;
    scene.crowdLevel=count;
    scene.crowdMembers?.forEach((actor,i)=>{
      expression(actor.crowdFace,streak>=3?'happy':'worried');
      actor.crowdTween?.stop();actor.crowdTween=scene.tweens.add({targets:actor,alpha:i<count?1:0,duration:i<count?400+i*15:700});
      if(!actor.crowdCleanup){actor.crowdCleanup=true;actor.once('destroy',()=>actor.crowdTween?.stop());}
    });
  }
  function holdPole(g,angle=0) {
    if(!g)return;g.clear();
    for(const [i,distance]of [12,34].entries()){
      const x=23+Math.sin(angle)*distance,y=-20-Math.cos(angle)*distance;
      const shoulder=i?16:-16,elbow=i?35:-14;
      for(const [width,color]of [[10,0x25343b],[7,i?0x92735e:0xb08b6a]])g.lineStyle(width,color,1).beginPath().moveTo(shoulder,-21).lineTo(elbow,i?-34:-16).lineTo(x,y).strokePath();
      g.fillStyle(0xd2a075,1).fillEllipse(x,y,9,8);
    }
  }
  function poseExecutioner(g,axe) {
    if(!g || !axe)return;
    g.clear();
    const a=axe.rotation,grips=[{x:axe.x,y:axe.y},{x:axe.x+Math.sin(a)*24,y:axe.y-Math.cos(a)*24}];
    grips.forEach((hand,i)=>{
      const shoulder={x:i?32:-32,y:-46},elbow={x:(shoulder.x+hand.x)/2+(i?12:-12),y:(shoulder.y+hand.y)/2+13};
      for(const [width,color]of [[14,0x25343b],[10,i?0x344751:0x6b7a7c]])g.lineStyle(width,color,1).beginPath().moveTo(shoulder.x,shoulder.y).lineTo(elbow.x,elbow.y).lineTo(hand.x,hand.y).strokePath();
      g.fillStyle(i?0xab7e5e:0xc3926d,1).fillEllipse(hand.x,hand.y,12,10);
      g.lineStyle(2,0x715448,1).lineBetween(hand.x-3,hand.y,hand.x+3,hand.y);
    });
  }
  function roadLife(scene) {
    const animate=(actor,config)=>{const tween=scene.tweens.add({targets:actor,...config,onComplete:()=>actor.destroy(true)});actor.once('destroy',()=>tween.stop());};
    const spawn=()=>{
      const roll=Math.random();
      if(roll<.4){
        const birdArt=bird(scene,'dove',false).setPosition(-60,430+Math.random()*180).setScale(.65).setDepth(-.5);
        animate(birdArt,{x:860,y:birdArt.y-35,duration:4800});
      }else if(roll<.75){
        const passer=scene.add.container(880,1186).setDepth(9);
        const coat=body(scene.add.image(0,64,'castBodies','0').setOrigin(.5,1),'prisonerBody'+(1+Math.floor(Math.random()*8)));
        const face=head(scene.add.image(0,-64,'castHeads','0'),'head'+(1+Math.floor(Math.random()*12)));
        passer.add([coat,face]);walk(scene,passer,6200);animate(passer,{x:-80,duration:6200});
      }else{
        const deer=scene.add.container(900,1050).setDepth(-.4);
        deer.add([scene.add.ellipse(0,-24,65,27,0xb89768),scene.add.rectangle(30,-46,12,42,0xb89768),scene.add.ellipse(39,-65,27,15,0xb89768),scene.add.triangle(37,-78,0,12,4,0,10,12,0xb89768)]);
        for(const x of [-23,20]){const leg=scene.add.rectangle(x,-8,6,28,0x584c40);deer.add(leg);const gait=scene.tweens.add({targets:leg,angle:{from:-25,to:25},duration:160,yoyo:true,repeat:-1});leg.once('destroy',()=>gait.stop());}
        animate(deer,{x:-100,duration:3100});
      }
    };
    scene.time.delayedCall(1000,spawn);
    scene.time.addEvent({delay:4500,loop:true,callback:spawn});
  }
  function bird(scene,kind,fromRight) {
    const dove=kind==='dove', outline=0x152b31;
    const plumage=dove?0xf4e9d1:0x294953, feather=dove?0xd6c9ac:0x537a7c;
    const art=scene.add.container(0,0).setScale(fromRight?-1:1,1);
    const tail=scene.add.polygon(-24,5,[0,0,22,6,3,18,7,9],plumage).setStrokeStyle(2,outline);
    const body=scene.add.polygon(0,5,[0,13,9,1,30,0,43,13,34,27,9,25],plumage).setStrokeStyle(2,outline);
    const facet=scene.add.polygon(6,10,[0,0,17,4,21,15,3,13],feather);
    const wing=scene.add.polygon(-5,-4,[0,29,4,0,13,8,21,2,25,15,34,12,27,30],feather).setStrokeStyle(2,outline);
    const head=scene.add.polygon(19,-4,[0,8,7,0,19,2,25,14,17,25,4,23],plumage).setStrokeStyle(2,outline);
    const beak=scene.add.triangle(33,-3,0,0,13,5,0,8,0xf9c66b).setStrokeStyle(1,outline);
    const eye=scene.add.circle(23,-7,2.5,dove?outline:0xf9c66b);
    art.add([tail,body,facet,wing,head,beak,eye]);
    const flap=scene.tweens.add({targets:wing,angle:{from:-25,to:25},scaleY:{from:.65,to:1},duration:dove?230:280,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    art.once('destroy',()=>flap.stop());
    return art;
  }
  window.CastArt={head,body,jester,weapon,weaponMarkup,bird,expression,nervous,walk,caravan,townLife,poseExecutioner,roadLife,holdPole,crowd};
})();
