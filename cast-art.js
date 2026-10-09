(() => {
    function paintShapes(scene,parent,shapes) {
      const g=scene.add.graphics();parent.add(g);
      for(const s of shapes){const color=parseInt(s.fill.slice(1),16);if(s.kind==='line'){g.lineStyle(s.width,color,1).beginPath();s.points.forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py));g.strokePath();}else{g.fillStyle(color,1);if(s.kind==='rect')g.fillRect(s.x,s.y,s.w,s.h);else if(s.kind==='circle')g.fillCircle(s.x,s.y,s.r);else g.fillPoints(s.points.map(([px,py])=>({x:px,y:py})),true);}}
      return g;
    }

  function head(sprite,key) {
    const n=Number(key.match(/\d+$/)?.[0] || 1);
    const frame=key==='escortHead'?7:key.startsWith('priestHead')?12+(n-1)%4:(n-1)%100;
    sprite.castFaceIndex=frame;
    sprite.setTexture('castHeads',String(frame));
    sprite.setScale(58/Math.max(sprite.width,sprite.height));
    return sprite;
  }
  function body(sprite,key,role='') {
    const variant=Number(key.match(/\d+$/)?.[0] || 1)-1;
    const frame=key==='escortBody'?11:key==='priestBody'?10:variant<12&&role==='Knight'?11:variant<12&&role==='Lord'?9:variant%100;
    sprite.castBodyIndex=frame;
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
  function expression(sprite,mood) { sprite.setFrame(String((sprite.castFaceIndex || 0)+(mood==='startled'?100:mood==='dazed'?200:mood==='happy'?300:0))); }
  function walk(scene,actor,duration=1500,joy=false) {
    // A new walk owns its timers: an old entrance must never stop a later exit.
    actor.walkEvent?.remove(false);actor.stepEvent?.remove(false);
    actor.walkTween?.stop();actor.stepTween?.stop();
    const base=actor.walkBaseY ?? actor.y;actor.walkBaseY=base;
    actor.walkTween=scene.tweens.add({targets:actor,y:base-(joy?10:4),angle:{from:joy?-5:-2,to:joy?5:2},duration:joy?110:170,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    const body=actor.list?.find(part=>part.texture?.key==='castBodies');
    if(body){const angle=body.angle;actor.stepTween=scene.tweens.add({targets:body,angle:{from:-3,to:3},duration:170,yoyo:true,repeat:-1});actor.stepEvent=scene.time.delayedCall(duration,()=>{actor.stepTween?.stop();if(body.scene)body.setAngle(angle);});}
    actor.walkEvent=scene.time.delayedCall(duration,()=>{actor.walkTween?.stop();if(actor.scene)actor.setY(base).setAngle(0);});
    if(!actor.walkCleanup){actor.walkCleanup=true;actor.once('destroy',()=>{actor.walkEvent?.remove(false);actor.stepEvent?.remove(false);actor.walkTween?.stop();actor.stepTween?.stop();});}
  }
  function nervous(scene,head,body) {
    head.personaTween?.stop();body.personaTween?.stop();
    head.personaTween=scene.tweens.add({targets:head,angle:{from:-4,to:3},duration:650+(head.castFaceIndex%4)*170,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    body.personaTween=scene.tweens.add({targets:body,scaleX:{from:body.scaleX*.98,to:body.scaleX*1.02},duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }
  function caravanName(level) {
    return level===1?'Faithful hound':level===2?'Pack horse':level<6?'Trading cart':level<9?'Covered wagon':level<12?'Merchant caravan':'Royal roadshow';
  }
  function caravanMarkup(level) { return window.CaravanArt.markup(level); }
  function strain(scene,actor,body,height,weight) {
    const effort=height>180||weight>1;
    if(!effort)return;
    const marks=scene.add.graphics();marks.lineStyle(2,0x25343b,1).lineBetween(-10,-49,-3,-46).lineBetween(5,-46,12,-49).lineBetween(-4,-33,5,-33);actor.add(marks);
    const sweat=scene.add.polygon(19,-47,[0,0,4,7,3,11,-2,10,-3,7],0x9ccbd0).setStrokeStyle(1,0x25343b);actor.add(sweat);
    const tween=scene.tweens.add({targets:sweat,y:-25,alpha:0,duration:1100,repeat:-1,repeatDelay:700});sweat.once('destroy',()=>tween.stop());
  }
  function caravan(scene,level,x,y) {
    const group=scene.add.container(x-390,y-116),art=window.CaravanArt;
    const paint=(parent,shapes)=>paintShapes(scene,parent,shapes);
    const animate=(object,config)=>{const tween=scene.tweens.add({targets:object,...config});group.once('destroy',()=>tween.stop());return tween;};
    const rigAnimal=(px,py,shapes,hips,length,pace)=>{
      const animal=scene.add.container(px,py),legs=[],near=[];group.add(animal);
      for(let i=0;i<4;i++){const hip=hips[i%2],leg=scene.add.graphics();animal.add(leg);legs.push({leg,hip,index:i});if(i>=2)near.push(leg);}
      const torso=paint(animal,shapes);near.forEach(leg=>animal.bringToTop(leg));
      const gait={phase:0};
      const pose=()=>{
        legs.forEach(({leg,hip,index})=>{
          const phase=gait.phase+([0,Math.PI,Math.PI,0][index]);
          const stride=Math.sin(phase)*length*.22, lift=Math.max(0,Math.cos(phase))*length*.13;
          const floor=hips[0][1]+length;
          const knee={x:hip[0]+stride*.45,y:(hip[1]+floor)/2-lift*.45};
          const foot={x:hip[0]+stride,y:floor-lift};
          leg.clear().lineStyle(index<2?7:9,index<2?0x6c5947:0xa27e5b,1).beginPath().moveTo(...hip).lineTo(knee.x,knee.y).lineTo(foot.x,foot.y).strokePath();
          leg.fillStyle(0x374248,1).fillRect(foot.x-5,foot.y-3,11,5);
        });
        // The torso breathes subtly; hooves remain on the road through the stance phase.
        torso.y=Math.sin(gait.phase*2)*.8;
      };pose();animate(gait,{phase:Math.PI*2,duration:pace,repeat:-1,onUpdate:pose});
      return animal;
    };
    if(level>=3){const plan=art.wagon(level);paint(group,plan.shapes);
      for(const wx of plan.wheels){const wheel=scene.add.container(wx,205);group.add(wheel);paint(wheel,[{kind:'circle',x:0,y:0,r:plan.radius,fill:'#263c42'},{kind:'circle',x:0,y:0,r:plan.radius-4,fill:'#b98d5c'}]);
        const spokes=[];for(let i=0;i<10;i++){const a=i*Math.PI/5;spokes.push({kind:'line',points:[[0,0],[Math.cos(a)*(plan.radius-6),Math.sin(a)*(plan.radius-6)]],fill:'#65513f',width:3});}
        paint(wheel,spokes);paint(wheel,[{kind:'circle',x:0,y:0,r:6,fill:'#d8b26b'}]);animate(wheel,{angle:360,duration:1400,repeat:-1});}
    }
    if(level>=2){const horse=rigAnimal(343,111,art.horse(level),[[25,70],[107,67]],54,920);
      const tail=paint(horse,[{kind:'polygon',points:[[0,0],[-12,9],[-21,31],[-15,47],[-10,29],[5,12]],fill:'#51473d'}]).setPosition(0,42);animate(tail,{angle:{from:-7,to:9},duration:680,yoyo:true,repeat:-1});}
    const dog=rigAnimal(548,188,art.dog(),[[11,31],[51,30]],16,600);
    const tail=paint(dog,[{kind:'polygon',points:[[0,0],[-11,-8],[-16,-20],[-9,-19],[1,-8],[7,-2]],fill:'#bd9267'}]).setPosition(2,15);animate(tail,{angle:{from:-12,to:14},duration:230,yoyo:true,repeat:-1});
    group.caravanLevel=level;group.caravanWheelCount=level>=3?2:0;return group;
  }
  function townLife(scene,city) {
    scene.townLife?.destroy();
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
    const townIndex=['york','canterbury','london','dover','durham','norwich','winchester','chester','hull','newcastle','colchester','lincoln','oxford','southampton','gloucester'].indexOf(city.toLowerCase());
    // Poles are fixed to the two house gables; only the fabric moves around its attachment.
    for(const [x,roof]of [[-52.5,695+(townIndex%3)*35],[810,730-(townIndex%4)*20]]){const pole=scene.add.rectangle(x,roof-22,4,48,0x665548),flag=scene.add.polygon(x,roof-45,[0,0,34,3,28,26,0,23],city.length%2?0xba6857:0x728ea0).setOrigin(0,0);life.add([pole,flag]);animate(flag,{scaleX:{from:.86,to:1},duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
    // Anchors match the chimneys painted into the two foreground house roofs.
    for(const [cx,cy]of [[-3,692+(townIndex%3)*35],[750,727-(townIndex%4)*20]]){
      for(let i=0;i<3;i++){const smoke=scene.add.ellipse(cx,cy-5,13+i*7,17+i*6,0xd0d3bd,.2);life.add(smoke);animate(smoke,{y:cy-80,x:cx+25,alpha:0,duration:2600,delay:i*750,repeat:-1});}
    }
    if(['Hull','Dover','Southampton','Newcastle'].includes(city)){

      for(let i=0;i<3;i++){
        const ship=scene.add.container(260+i*155,city==='Hull'?989:947-i*6).setScale(city==='Hull'?.42:1);
        ship.add([scene.add.polygon(0,8,[0,0,73,0,58,18,15,18],0x72594b).setStrokeStyle(2,0x25343b),scene.add.rectangle(0,-19,3,57,0x72594b),scene.add.polygon(3,-38,[0,0,0,40,31,32],0xe9d8b4),scene.add.polygon(-3,-34,[0,0,0,35,-24,29],i%2?0xba6857:0x9fb7a0)]);
        life.add(ship);animate(ship,{x:ship.x+22,y:ship.y-3,duration:3200+i*700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      }
    }
    for(const [i,x]of [240,560].entries()){
      const stall=scene.add.container(x,1048),cloth=scene.add.polygon(0,-80,[0,0,94,0,101,16,-7,16],i?0x728ea0:0xba6857).setStrokeStyle(2,0x25343b);
      const seller=scene.add.container(-17,0);const coat=body(scene.add.image(0,0,'castBodies','0').setOrigin(.5,1),'prisonerBody'+(i+2)).setScale(.18);
      const face=head(scene.add.image(0,-37,'castHeads','0'),'head'+(i+5)).setDisplaySize(19,19);expression(face,'happy');seller.add([coat,face]);
      stall.add([scene.add.rectangle(-44,-40,4,80,0x72594b),scene.add.rectangle(44,-40,4,80,0x72594b),seller,scene.add.rectangle(0,-12,88,24,0xb88b59).setStrokeStyle(2,0x72594b),scene.add.rectangle(0,-26,94,6,0xe2b668),cloth]);
      for(let k=0;k<5;k++)stall.add(scene.add.polygon(6+k*7,-30,[0,5,3,0,8,1,10,5,6,8,1,8],[0xe2b668,0xa46c5d,0x87996f][(k+i)%3]));
      life.add(stall);animate(cloth,{scaleY:{from:.96,to:1.03},duration:1400+i*250,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});animate(face,{angle:{from:-4,to:4},duration:1600,yoyo:true,repeat:-1});
    }
    for(const [x,y]of [[135,857],[665,899]]){
      life.add([scene.add.rectangle(x,y-13,3,24,0x72594b),scene.add.polygon(x,y,[0,0,12,0,15,16,-3,16],0x72594b)]);
      const glow=scene.add.rectangle(x,y+5,8,10,0xf9c66b,.8);life.add(glow);animate(glow,{alpha:{from:.45,to:.8},duration:1200,yoyo:true,repeat:-1});
    }
    const flyBy=()=>{
      if(!life.active)return;
      const edges=backgroundBirdEdges(scene);
      const flock=bird(scene,'crow',false).setPosition(edges.left,400+Math.random()*160).setScale(.35);life.add(flock);
      // Normal removal: Phaser's scene-shutdown flag causes parent containers to destroy this twice.
      animate(flock,{x:edges.right,y:flock.y-30,duration:7000,onComplete:()=>flock.destroy()});
    };
    const birdTimer=scene.time.addEvent({delay:17000,loop:true,callback:flyBy});life.once('destroy',()=>birdTimer.remove(false));
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
  function syncPoleTarget(target) {
    if(!target?.active || target.collected || !target.jester?.active || !target.jesterPole)return;
    const pole=target.jesterPole,a=pole.rotation || 0;
    const tip=target.jester.getWorldTransformMatrix().transformPoint(pole.x+Math.sin(a)*target.poleHeight,pole.y-Math.cos(a)*target.poleHeight);
    target.setPosition(tip.x,tip.y);
    if(target.body?.enable){target.body.x=tip.x+target.body.offset.x;target.body.y=tip.y+target.body.offset.y;}
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
  function roadScenery(scene,route) {
    const props=[];
    const animate=(object,config)=>{const tween=scene.tweens.add({targets:object,...config});object.once('destroy',()=>tween.stop());};
    if(route==='farmland'||route==='uplands'){
      const sails=scene.add.container(688,769).setDepth(-1);
      for(let i=0;i<4;i++)sails.add(scene.add.polygon(0,0,[0,-5,63,-5,63,6,16,6],0xdac7a0).setOrigin(0,0).setAngle(i*90));
      sails.add(scene.add.circle(0,0,6,0x665748));animate(sails,{angle:360,duration:14000,repeat:-1});
    }
    if(route!=='woodland')for(let i=0;i<3;i++){
      const smoke=scene.add.ellipse(464,814,14+i*6,19+i*4,0xd8d5bd,.25).setDepth(-1);
      animate(smoke,{x:480,y:746,alpha:0,duration:2800,delay:i*850,repeat:-1});
    }
    if(route==='coast'||route==='estuary')for(let i=0;i<5;i++){
      const wave=scene.add.rectangle(320+i*93,821+i%2*45,40,2,0xd5dfc7,.6).setDepth(-1);
      animate(wave,{x:wave.x+24,alpha:{from:.15,to:.65},duration:1900+i*250,yoyo:true,repeat:-1});
    }
    else for(let i=0;i<3;i++){
      const sheep=scene.add.container(230+i*58,1084).setDepth(-1).setScale(.75);
      sheep.add([scene.add.rectangle(-10,0,4,14,0x655748),scene.add.rectangle(10,0,4,14,0x655748),scene.add.polygon(0,-9,[0,6,5,-5,28,-8,41,2,34,13,9,14],0xe1d5b3)]);
      const face=scene.add.polygon(20,-5,[0,0,7,-3,13,5,9,14,2,12],0x655748);sheep.add(face);animate(face,{angle:{from:-12,to:18},duration:1300+i*330,yoyo:true,repeat:-1});
    }
    for(let i=0;i<12;i++){
      const near=i>=8,y=near?1440:1039-(i%3)*21;
      const prop=scene.add.container(i*115-100,y).setDepth(near?12:-1);
      prop.roadSpeed=near?.21:.065;
      const size=.6+((i*7)%5)*.17;prop.setScale(size);
      if(i%4===0){
        prop.add([scene.add.polygon(0,-8,[0,19,11,1,32,0,48,17,32,27,6,26],0x839383),scene.add.polygon(3,-12,[0,12,12,0,32,0,23,13],0xb1b6a0)]);
      }else if(i%4===1&&route!=='woodland'){
        prop.add([scene.add.rectangle(0,-25,8,50,0x79634c),scene.add.polygon(0,-45,[0,0,66,0,77,12,66,24,0,24],0xbfa57b).setStrokeStyle(2,0x665548),scene.add.rectangle(23,-45,18,3,0x665548)]);
      }else if(near){
        paintShapes(scene,prop,[{kind:'polygon',points:[[-12,0],[-8,-19],[-2,-4],[5,-28],[9,-4],[20,-14],[13,3]],fill:'#91a071'},{kind:'polygon',points:[[2,-21],[6,-28],[12,-22],[7,-17]],fill:'#dfb776'}]);
      }else{
        paintShapes(scene,prop,window.CaravanArt.tree(i+(route==='uplands'?2:0)));
      }
      props.push(prop);
    }
    // A separate foreground layer occludes trees and animals in the field.
    const fence=scene.add.graphics().setDepth(0);
    for(let i=0;i<13;i++){
      const x=i*69;
      fence.fillStyle(0x78664e).fillRect(x,1080,7,94);
      fence.fillStyle(0xbda476).fillTriangle(x,1080,x+4,1069,x+7,1080);
    }
    fence.lineStyle(7,0xb49770).lineBetween(0,1103,800,1103).lineBetween(0,1135,800,1135);
    return props;
  }
  function grazingHorse(scene) {
    const horse=scene.add.container(900,1053).setDepth(-.4).setScale(.88);
    horse.fieldGrazer=true;
    const facet=(points,fill)=>({kind:'polygon',points,fill});
    // Feet stay planted while the field passes; joints never rotate like walking legs.
    paintShapes(scene,horse,[
      facet([[-38,-49],[-26,-47],[-24,-25],[-31,-6],[-29,0],[-41,0],[-39,-9],[-35,-27]],'#735443'),
      facet([[24,-47],[35,-45],[33,-23],[27,-5],[31,0],[18,0],[21,-9],[23,-25]],'#735443'),
      facet([[-57,-63],[-43,-79],[16,-78],[43,-65],[39,-43],[25,-34],[-30,-36],[-51,-47]],'#ad7954'),
      facet([[-54,-61],[-39,-74],[9,-72],[27,-62],[-2,-53],[-35,-52]],'#ce9a6c'),
      facet([[-49,-48],[-24,-44],[16,-44],[36,-56],[27,-36],[-28,-36]],'#8b5f46'),
      facet([[-22,-69],[12,-72],[29,-60],[8,-54],[-17,-55]],'#ba865d'),
      facet([[-48,-49],[-35,-47],[-32,-25],[-39,-6],[-37,0],[-49,0],[-47,-10],[-42,-28]],'#b48059'),
      facet([[-40,-45],[-35,-47],[-32,-25],[-39,-6],[-43,-8],[-38,-27]],'#d1a579'),
      facet([[13,-44],[25,-47],[24,-25],[18,-6],[22,0],[9,0],[12,-10],[13,-26]],'#bc8b62'),
      facet([[20,-44],[25,-47],[24,-25],[18,-6],[14,-8],[19,-26]],'#dbb183'),
      facet([[-49,-5],[-38,-5],[-37,0],[-50,0]],'#3c4240'),
      facet([[10,-5],[20,-5],[22,0],[9,0]],'#3c4240')
    ]);
    const tail=scene.add.container(-53,-63);horse.add(tail);
    paintShapes(scene,tail,[facet([[0,0],[-10,5],[-14,25],[-24,40],[-13,36],[-6,21],[4,5]],'#493f37'),facet([[-6,7],[-10,26],[-20,37],[-10,32],[0,9]],'#786250')]);
    const neck=scene.add.container(29,-66);horse.add(neck);
    paintShapes(scene,neck,[
      facet([[0,-4],[12,-2],[20,16],[32,39],[22,47],[6,25],[-5,10]],'#ae7a52'),
      facet([[7,1],[12,-2],[20,16],[32,39],[26,42],[13,19]],'#d5a476'),
      facet([[-5,-4],[1,-5],[9,7],[16,23],[25,38],[19,42],[7,26],[-2,14]],'#4f4135'),
      facet([[19,31],[30,33],[38,47],[41,56],[35,62],[24,60],[15,47]],'#b9845d'),
      facet([[27,35],[33,38],[39,52],[32,55],[23,48]],'#dbb58a'),
      facet([[25,50],[40,52],[41,58],[35,62],[24,59]],'#d4b89a'),
      facet([[18,37],[13,27],[20,29],[25,39]],'#a1714e'),
      facet([[27,36],[27,24],[32,27],[33,39]],'#bf936e'),
      facet([[30,38],[33,46],[31,51],[27,45]],'#f0d8b0'),
      facet([[19,34],[24,36],[28,44],[22,44]],'#564639'),
      {kind:'circle',x:24,y:43,r:1.8,fill:'#263637'},
      {kind:'circle',x:36,y:56,r:1.5,fill:'#6d5e50'},
      {kind:'line',points:[[29,59],[35,60]],width:1,fill:'#8a6d56'}
    ]);
    const animate=(target,config)=>{const tween=scene.tweens.add({targets:target,...config});horse.once('destroy',()=>tween.stop());};
    animate(neck,{angle:{from:-3,to:3},duration:2100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    animate(tail,{angle:{from:-6,to:12},duration:900,hold:100,repeatDelay:2600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    return horse;
  }
  function roadLife(scene,route) {
    const animate=(actor,config)=>{const tween=scene.tweens.add({targets:actor,...config,onComplete:()=>actor.destroy()});actor.once('destroy',()=>tween.stop());};
    const spawn=()=>{
      const roll=Math.random();
      if(roll<.4||((route==='coast'||route==='estuary')&&roll>=.75)){
        const edges=backgroundBirdEdges(scene);
        const birdArt=bird(scene,'dove',false).setPosition(edges.left,430+Math.random()*180).setScale(.65).setDepth(-.5);
        animate(birdArt,{x:edges.right,y:birdArt.y-35,duration:4800});
      }else if(roll<.75){
        const fromRight=Math.random()<.5;
        const passer=scene.add.container(fromRight?880:-80,1250).setDepth(9).setScale(.62);
        const coat=body(scene.add.image(0,64,'castBodies','0').setOrigin(.5,1),'prisonerBody'+(1+Math.floor(Math.random()*8)));
        const face=head(scene.add.image(0,-64,'castHeads','0'),'head'+(1+Math.floor(Math.random()*12)));
        const pack=scene.add.polygon(-34,-16,[0,0,28,-8,32,28,6,35],0xb38d60).setStrokeStyle(2,0x655748);
        passer.add([pack,coat,face]);walk(scene,passer,6200);animate(passer,{x:fromRight?-80:880,duration:6200});
      }else{
        const horse=grazingHorse(scene);
        // Match the slow field parallax, rather than sliding a running animal past.
        animate(horse,{x:-160,duration:16300});
      }
    };
    scene.time.delayedCall(1000,spawn);
    scene.time.addEvent({delay:3500,loop:true,callback:spawn});
  }
  function backgroundBirdEdges(scene) {
    const width=scene.scale?.width || 800,camera=scene.cameras?.main;
    // Allow for the widest combo view during the entire flight.
    const zoom=camera?Math.min(camera.zoom || 1,.55):1;
    const centre=(camera?.scrollX || 0)+width/2,half=width/(2*zoom);
    return {left:centre-half-80,right:centre+half+80};
  }
  function bird(scene,kind,fromRight) {
    const dove=kind==='dove', outline=0x152b31;
    const palettes={crow:[0x294953,0x537a7c],dove:[0xf4e9d1,0xd6c9ac],swallow:[0x24546e,0xe5bc8b],magpie:[0x233e51,0xe4eddb],owl:[0x986950,0xe6bb7c],phoenix:[0xcb563c,0xffc54f]};
    const [plumage,feather]=palettes[kind] || palettes.crow;
    const art=scene.add.container(0,0).setScale(fromRight?-1:1,1);
    const tail=scene.add.polygon(-24,5,[0,0,22,6,3,18,7,9],plumage).setStrokeStyle(2,outline);
    const body=scene.add.polygon(0,5,[0,13,9,1,30,0,43,13,34,27,9,25],plumage).setStrokeStyle(2,outline);
    const facet=scene.add.polygon(6,10,[0,0,17,4,21,15,3,13],feather);
    const wing=scene.add.polygon(-5,-4,[0,29,4,0,13,8,21,2,25,15,34,12,27,30],feather).setStrokeStyle(2,outline);
    const head=scene.add.polygon(19,-4,[0,8,7,0,19,2,25,14,17,25,4,23],plumage).setStrokeStyle(2,outline);
    const beak=scene.add.triangle(33,-3,0,0,13,5,0,8,0xf9c66b).setStrokeStyle(1,outline);
    const eye=scene.add.circle(23,-7,2.5,dove?outline:0xf9c66b);
    art.add([tail,body,facet,wing,head,beak,eye]);
    if(kind==='owl'){art.add([scene.add.circle(18,-6,6,0xe5cba1),scene.add.circle(28,-6,6,0xe5cba1),scene.add.circle(18,-6,2,outline),scene.add.circle(28,-6,2,outline)]);}
    if(kind==='swallow')art.add(scene.add.polygon(-34,9,[0,0,20,6,0,20,9,9],plumage).setStrokeStyle(2,outline));
    if(kind==='phoenix')art.add(scene.add.polygon(19,-20,[0,15,-8,1,3,7,8,-4,13,14],feather).setStrokeStyle(2,outline));
    art.add([scene.add.polygon(-10,12,[0,0,14,4,6,9],dove?0xfff3d8:0x71918c),scene.add.polygon(14,-14,[0,0,12,3,5,8],dove?0xfff3d8:0x71918c),scene.add.polygon(-23,17,[0,0,8,3,4,5],dove?0xb2bca6:0x1d343c)]);
    const flap=scene.tweens.add({targets:wing,angle:{from:-25,to:25},scaleY:{from:.65,to:1},duration:dove?230:280,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    art.flapTween=flap;art.once('destroy',()=>flap.stop());
    return art;
  }
  function treasureChest(scene,x,y) {
    const c=scene.add.container(x,y).setSize(88,58);
    const shadow=scene.add.ellipse(0,24,90,12,0x152b31,.3);
    const mouth=scene.add.polygon(0,-13,[0,0,78,0,70,18,8,18],0x152b31);
    const box=scene.add.polygon(0,10,[0,0,78,0,72,36,6,36],0x9b6947).setStrokeStyle(3,0x25343b);
    const facet=scene.add.polygon(23,10,[0,0,16,0,10,36,0,36],0x72513e);
    const bandA=scene.add.rectangle(-24,10,6,36,0xe2b668),bandB=scene.add.rectangle(24,10,6,36,0xe2b668);
    const lid=scene.add.container(0,-8);
    lid.add([scene.add.polygon(0,-9,[0,10,9,0,69,0,78,10,78,23,0,23],0xb88955).setStrokeStyle(3,0x25343b),scene.add.rectangle(-24,-7,6,23,0xe2b668),scene.add.rectangle(24,-7,6,23,0xe2b668),scene.add.rectangle(0,3,13,13,0xe2b668)]);
    c.add([shadow,mouth,box,facet,bandA,bandB,lid]);c.lid=lid;
    const grain=scene.add.graphics();grain.lineStyle(1,0xc49762,.8).lineBetween(-33,4,32,4).lineBetween(-30,16,29,16).lineBetween(-28,24,25,24).lineBetween(-15,8,-2,10).lineBetween(7,20,18,21);c.add(grain);c.bringToTop(lid);
    for(const x of[-24,24])for(const y of[-3,21])c.add(scene.add.circle(x,y,1.8,0x755b3e));
    lid.add([scene.add.rectangle(0,3,7,9,0x806544),scene.add.circle(0,0,2,0x25343b),scene.add.rectangle(0,4,2,4,0x25343b)]);
    c.once('destroy',()=>{c.biteTween?.stop();c.closeEvent?.remove(false);});return c;
  }
  function coin(scene,x,y,silver=false){
    const c=scene.add.container(x,y).setDepth(101),base=silver?0xcbd5dc:0xf9c66b,edge=silver?0x70858e:0x9c7339;
    c.add([scene.add.circle(0,0,10,base).setStrokeStyle(2,edge),scene.add.circle(0,0,7,base).setStrokeStyle(1,edge),scene.add.polygon(0,0,[0,-5,4,-1,2,5,-2,5,-4,-1],edge),scene.add.polygon(-3,-4,[0,0,4,-2,8,0,3,2],silver?0xf1f0dd:0xffe8a6)]);
    return c;
  }
  window.CastArt={head,body,jester,weapon,weaponMarkup,caravanMarkup,caravanName,strain,treasureChest,coin,bird,expression,nervous,walk,caravan,townLife,poseExecutioner,roadScenery,roadLife,syncPoleTarget,holdPole,crowd};
})();
