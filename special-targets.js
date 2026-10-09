(function(root){
  const towns=['York','Durham','Newcastle','Chester','Hull','Lincoln','Canterbury','London','Dover','Norwich','Winchester','Colchester','Oxford','Southampton','Gloucester'];
  const rows=[
    ['Dinner Bell','bell','buff','A sonic wave hits nearby targets and doubles fame for 8 seconds.',{}],
    ['Apple Crate','crate','scatter','Five apples scatter as falling projectiles, blown by wind and weighed down by rain.',{pieces:5}],
    ['Washing Line','line','parts','Two carriers hold a tall line of hats and clothes. Clear every item before they leave.',{pieces:4,partArt:'hat'}],
    ['Choir Chimes','chimes','sequence','Hit the lit bell three times, with separate projectiles, to complete the tune.',{hits:3,reward:4}],
    ['Stained-glass Wheel','glass','gate','A rotating shutter exposes the golden centre briefly.',{period:2200,window:.42,reward:5}],
    ['Incense Pot','incense','fog','A hit disperses the foreground fog for 8 seconds.',{}],
    ['Coal Hopper','hopper','rain','Tips five lumps of coal onto targets below.',{pieces:5,radius:220}],
    ['Chain Links','chain','parts','Break three links to release the suspended prizes.',{pieces:3,partArt:'link',release:3}],
    ['Furnace Vent','vent','lift','Timed hot-air bursts give a flying projectile a powerful upward lift.',{period:1800,window:.5,speed:560}],
    ['Market Scales','scales','launch','Striking the pan launches three small golden weights.',{pieces:3}],
    ['Juggling Clubs','clubs','alignment','Three spinning clubs briefly align for a triple reward.',{period:1600,window:.25,reward:3}],
    ['Tumbling Cheese Wheel','cheese','roll','Rolls across the square, knocking into nearby targets.',{radius:280}],
    ['Fishing Net','net','catch','Catches your projectile briefly, then flings it upwards.',{speed:530,hold:350}],
    ['Ship’s Wheel','wheel','redirect','Its turning pointer controls your projectile’s new direction.',{period:2600,speed:560}],
    ['Buoy Line','buoys','extreme','Three swinging buoys pay more at the extremes of their swing.',{motion:'horizontal',period:1900,reward:4}],
    ['Weathercock','cock','wind','The golden face turns with the wind: a narrow angle pays extra.',{period:2400,reward:6}],
    ['Bell-rope Pulley','pulley','raise','A hit raises a smaller golden prize on the same pulley.',{}],
    ['Stone Gargoyle','gargoyle','armour','Two separate projectiles break the stone; it crashes into targets below.',{hits:2,radius:220,reward:3}],
    ['Pilgrim’s Staff','staff','parts','Knock three dangling charms off separately.',{pieces:3,partArt:'charm'}],
    ['Offering Bowl','bowl','offering','Catch a descending projectile to earn a shower of silver.',{reward:6}],
    ['Illuminated Book','book','gate','Opens briefly to reveal its valuable golden pages.',{period:2400,window:.45,reward:5}],
    ['Royal Mint Press','press','gate','Strike while the press is open for a rich payout.',{period:1800,window:.4,gold:100,reward:3}],
    ['Crown Stack','crowns','sequence','Remove the three crowns with three separate projectiles; a rising shot resets the stack.',{hits:3,descending:true,reward:8}],
    ['Royal Seal','seal','charge','Nearby hits charge its three gems; a full seal earns a jackpot.',{needed:3,gold:120,reward:6}],
    ['Signal Mirror','mirror','aim','Reflects your projectile towards the closest remaining target.',{speed:540}],
    ['Smuggler’s Chest','chest','armour','One hit opens the lock; a second releases the treasure.',{hits:2,gold:120,reward:3}],
    ['Cliff Springboard','spring','bounce','Only a falling projectile activates this upward spring.',{speed:620}],
    ['Loom Shuttle','shuttle','gate','Darts sideways between protective looms; hit while exposed.',{motion:'zigzag',period:1000,window:.5,reward:5}],
    ['Silk Spool','spool','scatter','Unravels into six fluttering ribbon targets.',{pieces:6,partArt:'ribbon',slow:true}],
    ['Mustard Pot','mustard','paint','Splashes nearby targets: their next hit earns triple fame.',{radius:260}],
    ['Tournament Lance','lance','precision','The small gold tip pays six times the fame.',{radius:13,reward:6,motion:'vertical'}],
    ['Tilting Shield','shield','redirect','A rotating shield reflects your shot along its pointer.',{period:1800,speed:580,motion:'horizontal'}],
    ['Practice Dummy','dummy','sweep','Spins its arms around, sweeping into surrounding targets.',{radius:240}],
    ['Roman Coin Disc','coin','coin','Rotates between a rich gold face and a high-fame silver face.',{period:2000}],
    ['Amphora Stack','pots','cascade','Breaking the pots starts a three-target cascade.',{radius:300,limit:3}],
    ['Siege Sling','sling','catch','Holds your projectile briefly, then launches it across the square.',{speed:640,hold:450,sideways:true}],
    ['Exam Papers','papers','scatter','Five pages scatter into the air and drift down slowly.',{pieces:5,slow:true,partArt:'page'}],
    ['Scholar’s Pendulum','pendulum','speed','Earn extra fame by hitting at the fastest point of the swing.',{motion:'horizontal',period:1600,reward:5}],
    ['Alchemist’s Flask','flask','cycle','Cycles between bonus gold, an upward bounce and a chain blast.',{period:3000,radius:230}],
    ['Cargo Crane','crane','rain','Drops a heavy crate onto the nearest targets underneath.',{pieces:1,radius:320}],
    ['Captain’s Compass','compass','aim','Its pointer tracks a nearby target; a hit redirects your shot towards it.',{speed:620}],
    ['Sailcloth Catcher','sail','catch','Stretches as it catches your shot, then rebounds it upwards.',{speed:660,hold:500}],
    ['Sky Pinball Bumper','bumper','aim','A high bumper launches your shot towards another airborne target.',{high:true,speed:720}],
    ['Floating Treasure Balloon','balloon','balloon','Burst the balloon, then hit the falling treasure chest.',{high:true,gold:30}],
    ['Jester’s Jackpot','jackpot','jackpot','Three spinning symbols occasionally match for a huge jackpot.',{period:2600,gold:300,reward:10}]
  ];
  const catalog=rows.map(([name,art,effect,tip,extra],i)=>({id:'trick-'+art,city:towns[Math.floor(i/3)],name,art,effect,tip,type:'special',free:false,cost:120+Math.floor(i/3)*260+(i%3)*80,reward:2,gold:8+Math.floor(i/3)*5,...extra,frame:i}));
  const phase=(option,time)=>((time%(option.period || 2000))+(option.period || 2000))%(option.period || 2000)/(option.period || 2000);
  function state(option,time){const p=phase(option,time);return {phase:p,open:p<(option.window || .4),angle:p*Math.PI*2,mode:Math.floor(p*3),matched:p<.2};}
  function before(scene,target,projectile,blast,api){
    const o=target.targetOption;if(!o?.effect)return true;
    const now=scene.time.now,pose=state(o,now-(target.motionStartedAt || 0));
    target.hitSources ||= new WeakSet();
    if(projectile&&target.hitSources.has(projectile))return false;
    const reject=()=>{if(projectile?.body?.enable)projectile.body.setVelocity(-projectile.body.velocity.x*.55,Math.min(-100,-Math.abs(projectile.body.velocity.y)*.4));return false;};
    if(!blast && ['gate','lift'].includes(o.effect)&&!pose.open)return reject();
    if(!blast && ['offering','bounce'].includes(o.effect)&&!(projectile?.body?.velocity.y>0))return reject();
    if(o.effect==='sequence'&&o.descending&&projectile?.body?.velocity.y<0){target.trickHits=0;api.flash(target,'RESET',0xe0b668);return reject();}
    if(projectile)target.hitSources.add(projectile);
    if(['bell','chimes'].includes(o.art))api.sonic?.(target,projectile);
    target.specialGold=o.gold || 0;target.fameMultiplier=o.reward || 2;
    if(['armour','sequence'].includes(o.effect)){
      target.trickHits=(target.trickHits || 0)+1;
      if(target.trickHits<(o.hits || 2)){api.flash(target,(o.hits-target.trickHits)+' TO GO',0xe0b668);api.refresh(target);return false;}
    }
    if(o.effect==='charge'){const charge=Math.min(o.needed,target.trickCharge || 0);target.specialGold=charge===o.needed?o.gold:10;target.fameMultiplier=charge===o.needed?o.reward:1;}
    if(o.effect==='coin'){target.specialGold=pose.phase<.5?80:5;target.fameMultiplier=pose.phase<.5?1:8;}
    if(o.effect==='jackpot'){target.specialGold=pose.matched?o.gold:15;target.fameMultiplier=pose.matched?o.reward:1;if(pose.matched)api.flash(target,'JACKPOT!',0xf9c66b);}
    if(o.effect==='alignment'&&!pose.open){target.specialGold=5;target.fameMultiplier=1;}
    if(o.effect==='extreme'&&Math.abs(Math.sin(pose.angle))<.75)target.fameMultiplier=1;
    if(o.effect==='speed'&&Math.abs(Math.sin(pose.angle))>.35)target.fameMultiplier=1;
    if(o.effect==='wind'&&Math.abs(Math.cos(pose.angle+(api.windX || 0)*.01))>.3)target.fameMultiplier=1;
    return true;
  }
  function after(scene,target,projectile,api){
    const o=target.targetOption;if(!o?.effect)return;
    const nearby=api.targets().filter(t=>t!==target&&t.active&&!t.collected&&Math.hypot(t.x-target.x,t.y-target.y)<(o.radius || 260));
    const launch=(vx,vy,hold=0)=>{
      if(!projectile?.active || !projectile.body?.enable)return;
      const release=()=>{if(projectile.active&&projectile.body?.enable){projectile.body.setAllowGravity(true);projectile.body.setVelocity(vx,vy);}};
      if(hold){projectile.body.stop();projectile.body.setAllowGravity(false);scene.time.delayedCall(hold,release);}else release();
    };
    const nearest=()=>api.targets().filter(t=>t!==target&&t.active&&!t.collected&&t.body?.enable).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
    const aim=()=>{const t=nearest();if(t){const dx=t.x-target.x,dy=t.y-target.y,d=Math.hypot(dx,dy)||1;launch(dx/d*o.speed,dy/d*o.speed);}else launch(120,-(o.speed || 550));};
    const strike=(targets,delay=160)=>targets.forEach((t,i)=>api.chain(target,t,projectile,delay+i*90));
    switch(o.effect){
      case 'buff':scene.trickBuffUntil=scene.time.now+8000;api.flash(target,'DOUBLE FAME!',0xf9c66b);break;
      case 'fog':api.clearFog(8000);break;
      case 'scatter':case 'launch':api.pieces(target,o,projectile);break;
      case 'parts':if(o.release)api.pieces(target,{...o,pieces:o.release},projectile);break;
      case 'rain':strike(nearby.filter(t=>t.y>target.y).slice(0,o.pieces));api.flash(target,'LOOK OUT BELOW!',0xf9c66b);break;
      case 'armour':if(o.art==='gargoyle')strike(nearby.filter(t=>t.y>target.y).slice(0,3));break;
      case 'lift':case 'bounce':launch(projectile?.body?.velocity.x*.65 || 80,-o.speed);break;
      case 'catch':launch(o.sideways?(projectile?.body?.velocity.x<0?-o.speed:o.speed):120,-(o.sideways?260:o.speed),o.hold);api.flash(target,'BOING!',0x9ce2bf);break;
      case 'redirect':{const a=state(o,scene.time.now-(target.motionStartedAt || 0)).angle;launch(Math.cos(a)*o.speed,-Math.abs(Math.sin(a))*o.speed-100);break;}
      case 'aim':aim();break;
      case 'raise':api.pieces(target,{...o,pieces:1,stationary:true,high:true,partArt:'gold'},projectile);break;
      case 'paint':nearby.forEach(t=>{t.mustardPaint=true;api.refresh(t);});api.flash(target,'MUSTARD MONEY!',0xf9c66b);break;
      case 'roll':case 'sweep':case 'cascade':strike(nearby.slice(0,o.limit || 4),o.effect==='roll'?260:120);break;
      case 'cycle':{const mode=state(o,scene.time.now-(target.motionStartedAt || 0)).mode;if(mode===0)api.gold(target,projectile,60);else if(mode===1)launch(80,-580);else strike(nearby.slice(0,3));break;}
      case 'balloon':api.pieces(target,{...o,pieces:1,partArt:'chest',treasure:true},projectile);break;
    }
  }
  function notifyHit(scene,target,api){api.targets().forEach(t=>{if(t!==target&&t.active&&!t.collected&&t.targetOption?.effect==='charge'&&Math.hypot(t.x-target.x,t.y-target.y)<300){t.trickCharge=Math.min(3,(t.trickCharge || 0)+1);api.refresh(t);}});}
  function markup(option){
    const art=option.art || 'crate',ink='#25343b',gold='#e4bd70',wood='#a57b55',stone='#b5b8a3',cloth='#719e95';
    const p=(points,fill)=>'<polygon points="'+points+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="3" stroke-linejoin="round"/>',r=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="3"/>',c=(x,y,rad,fill)=>'<circle cx="'+x+'" cy="'+y+'" r="'+rad+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="3"/>',l=(d,color=ink,w=3)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round"/>';
    const bell=x=>p((x-16)+',42 '+(x-10)+',24 '+(x+10)+',24 '+(x+16)+',42 '+(x+24)+',67 '+(x-24)+',67',gold)+c(x,74,6,wood)+l('M'+(x-18)+' 59h36');
    const crown=(x,y)=>p(x+','+y+' '+(x+10)+','+(y+15)+' '+(x+24)+','+(y-8)+' '+(x+38)+','+(y+15)+' '+(x+48)+','+y+' '+(x+41)+','+(y+29)+' '+(x+7)+','+(y+29),gold)+c(x+24,y+20,4,'#b96161');
    let s='';
    switch(art){
      case 'bell':s=bell(64)+r(45,17,38,7,wood);break;
      case 'crate':case 'hopper':case 'crane':s=p('22,43 93,32 108,52 99,103 27,107',wood)+l('M25 63l77-10M28 82l71-9M46 42v63M81 36v66',gold,5);if(art==='crate')for(let i=0;i<5;i++)s+=c(34+i*14,43-(i%2)*6,9,i%2?'#d79355':'#be5f50');if(art==='hopper')s+=p('35,35 50,19 64,30 80,18 93,36','#41545a')+p('51,98 80,98 70,118 60,118',gold);if(art==='crane')s+=l('M8 112V10h103M82 10v24',wood,9)+l('M12 14l52 22M12 51l39-37',gold,3);break;
      case 'line':case 'staff':case 'chain':{s=l(art==='staff'?'M64 12v101M64 17l17 9': 'M10 23h108',wood,7);for(let i=0;i<(art==='line'?4:3);i++){const x=art==='staff'?42+i*22:23+i*36;s+=l('M'+x+' 23v25',gold,2);s+=art==='line'?p((x-10)+',55 '+(x-6)+',39 '+(x+6)+',39 '+(x+11)+',55 '+(x+17)+',61 '+(x-17)+',61',cloth):art==='chain'?'<ellipse cx="'+x+'" cy="56" rx="9" ry="18" fill="none" stroke="'+gold+'" stroke-width="6"/>':p(x+',48 '+(x+10)+',63 '+x+',78 '+(x-10)+',63',gold);}break;}
      case 'chimes':s=r(9,12,110,8,wood);for(let i=0;i<3;i++)s+='<g transform="translate('+(i*38-38)+' 20) scale(.65)">'+bell(98)+'</g>';break;
      case 'glass':case 'wheel':case 'compass':case 'bumper':case 'coin':s=c(64,64,44,art==='glass'?'#678ea2':gold)+c(64,64,32,art==='coin'?'#ccd5d0':cloth);for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=l('M64 64L'+(64+Math.cos(a)*37)+' '+(64+Math.sin(a)*37),art==='glass'?'#e9d4a7':ink,3);}s+=c(64,64,9,gold);if(art==='compass'||art==='wheel')s+=p('60,67 68,67 64,22','#bd6458');if(art==='coin')s+=p('52,48 67,42 80,59 70,70 57,65 54,87 42,79',gold);if(art==='bumper')s+=c(64,64,19,'#c77667')+c(64,64,8,'#f1df9c');break;
      case 'incense':case 'mustard':case 'flask':s=p('47,18 81,18 81,40 99,74 91,101 37,101 29,74 47,40',art==='flask'?'#8bb6a3':gold)+r(43,14,42,9,wood)+p('36,70 93,70 86,94 42,94',art==='mustard'?'#d2a044':'#b37681')+l('M43 48l-7 20M46 87h33','#fff3cb',3);if(art==='incense')s+=l('M51 12q-20-10 3-18M74 12q20-10-3-18',stone,5);break;
      case 'vent':s=r(24,25,80,77,stone)+r(33,35,62,55,'#41545a');for(let i=0;i<4;i++)s+=r(36+i*14,39,5,47,gold);s+=p('44,88 50,63 64,76 73,57 88,88','#e48758');break;
      case 'scales':s=l('M64 22v81M20 37h88',wood,8)+p('39,110 64,97 91,110',gold);for(const x of [28,100])s+=l('M'+x+' 37l-17 33M'+x+' 37l17 33',gold,2)+p((x-20)+',71 '+(x+20)+',71 '+(x+12)+',89 '+(x-12)+',89',gold);break;
      case 'clubs':s='';for(let i=0;i<3;i++)s+='<g transform="rotate('+(i*30-30)+' 64 64)">'+p('58,102 62,64 49,32 53,20 72,20 78,32 65,64 68,102',['#c77760',cloth,gold][i])+'</g>';break;
      case 'cheese':s=p('24,37 62,19 108,44 100,99 31,100',gold)+p('24,37 68,53 108,44 100,99 31,100','#f0cd7a');for(const [x,y]of [[48,68],[78,84],[91,63]])s+=c(x,y,6,'#b18647');break;
      case 'net':case 'sail':case 'sling':s=p('13,22 110,22 103,94 62,112 21,94',art==='sail'?'#e0cfad':cloth);for(let i=0;i<5;i++)s+=l('M'+(20+i*20)+' 25l-4 67M18 '+(30+i*15)+'h89',art==='net'?'#b6c9b0':wood,2);if(art==='sling')s+=l('M17 21l43 54 49-54',gold,6)+c(64,76,13,stone);break;
      case 'buoys':s=l('M9 24h110',wood,4);for(let i=0;i<3;i++){const x=26+i*38;s+=l('M'+x+' 24v20',gold,2)+p((x-12)+',45 '+(x+12)+',45 '+(x+15)+',81 '+x+',94 '+(x-15)+',81',i%2?cloth:'#ce715c')+l('M'+(x-12)+' 68h24','#e9d8b4',5);}break;
      case 'cock':s=l('M64 84v29M25 105h78',wood,4)+p('32,67 19,38 44,44 65,68 79,53 77,39 96,35 106,47 94,65 88,81 55,86',gold)+p('79,37 85,21 92,32 104,27 100,39','#b96358')+c(92,46,2,ink);break;
      case 'pulley':case 'pendulum':s=r(40,12,48,8,wood)+c(64,30,14,gold)+l(art==='pulley'?'M49 30v68M79 30v54':'M64 31v56',wood,4);s+=art==='pulley'?r(33,84,29,22,cloth)+c(80,71,13,gold):c(64,91,23,gold);break;
      case 'gargoyle':case 'dummy':s=p('44,18 85,18 95,45 80,63 83,105 45,105 48,63 32,45',art==='gargoyle'?stone:wood)+p('15,32 44,52 34,74 9,55',cloth)+p('85,50 116,30 120,55 94,74',cloth)+l('M50 34l8 5M72 39l9-5M57 50h15',ink,4);if(art==='dummy')s+=l('M64 107v15M24 62h80',gold,5);break;
      case 'bowl':s=p('17,54 111,54 98,89 78,105 47,105 30,89',gold)+p('17,54 45,44 84,44 111,54 82,65 47,65',wood)+l('M40 86h49','#f9e7b5',4);break;
      case 'book':case 'papers':s=p('13,29 50,23 64,33 78,23 115,29 109,101 78,96 64,108 50,96 19,101','#efe0b9')+l('M64 33v75M25 42l26-3M25 56l26-3M25 71l26-3M79 40l22 3M79 55l22 3',wood,3);if(art==='book')s+=p('82,69 92,56 104,72 93,86',gold);if(art==='papers')s+=p('30,10 90,17 91,52 27,45','#d7cba9');break;
      case 'press':s=r(19,15,14,96,wood)+r(95,15,14,96,wood)+r(15,13,98,13,gold)+r(35,48,58,15,stone)+r(40,99,48,9,gold)+l('M64 26v22',ink,10)+c(64,79,11,gold);break;
      case 'crowns':s=crown(40,15)+crown(33,48)+crown(26,81);break;
      case 'seal':s=p('64,16 78,24 94,22 103,39 114,48 109,65 113,80 95,89 87,107 69,102 51,110 39,94 22,87 27,69 18,54 32,40 36,24 53,25','#b76158')+c(64,65,31,gold)+crown(42,52);break;
      case 'mirror':s=p('34,15 91,15 108,36 108,90 89,110 35,110 20,91 20,36',gold)+p('40,24 85,24 98,40 98,84 82,98 41,98 30,83 30,40','#91bbc0')+p('40,24 85,24 32,75 30,40','#c7e1db');break;
      case 'chest':s=r(22,49,84,57,wood)+p('22,49 31,25 96,25 106,49',wood)+r(33,28,10,75,gold)+r(86,28,10,75,gold)+r(56,57,17,20,gold)+c(64,66,3,ink);break;
      case 'spring':s=r(19,19,90,16,wood)+l('M35 37l47 13-36 14 33 12-30 14 27 13',stone,6)+r(30,104,66,10,wood);break;
      case 'shuttle':s=r(11,15,12,96,wood)+r(106,15,12,96,wood)+p('27,63 44,47 87,47 103,63 86,79 43,79',gold)+c(64,63,9,cloth);break;
      case 'spool':s=r(36,16,56,96,gold)+r(20,16,88,10,wood)+r(20,101,88,11,wood);for(let i=0;i<7;i++)s+=l('M39 '+(32+i*9)+'h48',cloth,5);s+=l('M91 87q30 28 14 36',cloth,8);break;
      case 'lance':s=l('M22 106L96 30',wood,12)+p('82,38 111,13 103,47',gold)+l('M30 93l12 12M41 83l12 12',cloth,6);break;
      case 'shield':s=p('22,23 64,12 107,23 101,77 64,114 28,77',stone)+p('64,15 103,25 98,77 64,108',cloth)+c(64,62,15,gold);break;
      case 'pots':for(let i=0;i<3;i++){const y=15+i*30;s+=p('47,'+y+' 83,'+y+' 79,'+(y+8)+' 92,'+(y+20)+' 86,'+(y+33)+' 40,'+(y+33)+' 34,'+(y+20)+' 51,'+(y+8),'#bc8066')+l('M49 '+(y+22)+'h28',gold,4);}break;
      case 'balloon':s=p('64,9 90,20 103,49 91,76 67,96 61,96 37,76 25,49 38,20','#bd7368')+p('64,9 66,95 84,68 91,40',gold)+l('M61 96v16M67 96v16',wood,2)+r(47,112,36,13,wood);break;
      case 'jackpot':s=r(10,26,109,71,wood)+r(18,36,93,46,gold);for(let i=0;i<3;i++){const x=24+i*30;s+=r(x,43,22,30,'#e8dcb6')+p((x+11)+',48 '+(x+17)+',58 '+(x+11)+',68 '+(x+5)+',58',['#b76862',cloth,gold][i]);}s+=l('M118 39v38',gold,5)+c(118,30,8,'#bd675a');break;
      case 'hat':s=p('25,75 37,34 83,34 95,75 113,88 14,88',cloth)+r(32,66,60,10,gold);break;
      case 'apple':s=p('64,38 90,33 107,55 101,86 79,106 51,105 25,80 23,57 40,36','#be6652')+l('M64 39l4-21',wood,5)+p('68,28 88,12 101,20 78,34',cloth);break;
      case 'link':s='<ellipse cx="64" cy="64" rx="20" ry="43" fill="none" stroke="'+gold+'" stroke-width="12"/>'+l('M51 40v36','#f0dfac',3);break;
      case 'charm':case 'gold':s=p('64,19 103,62 64,106 24,62',gold)+p('64,19 64,106 24,62','#f0dca2')+c(64,61,10,cloth);break;
      case 'ribbon':s=p('29,17 57,20 48,48 91,59 99,91 64,117 53,102 76,85 69,72 33,62',cloth)+l('M40 24l-3 25 44 19 5 17-19 16',gold,3);break;
      case 'page':s=p('25,14 86,14 105,34 105,112 25,112','#efe1bd')+p('86,14 86,34 105,34',gold)+l('M36 45h48M36 59h48M36 73h34M36 87h48',wood,3);break;
    }
    if(art==='compass')s+=p('64,97 55,67 64,72 73,67','#eae4cf')+l('M54 17h20M54 111h20',wood,4);
    if(art==='wheel')for(const [x,y]of [[64,8],[8,64],[120,64],[64,120]])s+=c(x,y,5,wood);
    // Small highlights and surface facets preserve the established polygon style.
    s+='<path d="M37 36l6-4M82 88l8-3" fill="none" stroke="#fff2c8" stroke-opacity=".5" stroke-width="2"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">'+s+'</svg>';
  }
  const parts=['apple','hat','link','charm','page','ribbon','gold','chest'];
  const frameFor=art=>{const i=parts.indexOf(art);return i<0?catalog.find(p=>p.art===art)?.frame || 0:45+i;};
  const api={catalog,state,before,after,notifyHit,markup,parts,frameFor};
  if(typeof module!=='undefined')module.exports=api;else root.SpecialTargets=api;
})(typeof window!=='undefined'?window:globalThis);
