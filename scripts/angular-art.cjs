// Original vector artwork: flat shapes, modular costumes and three expressions.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets');
const ink='#25343b',paper='#e9d8b4';
const skins=['#dca875','#edc69c','#ab775b','#875744','#c68d65','#e0b18b'];
const clothes=['#8d453c','#46736c','#d5ad57','#424e69','#a26d48','#658057','#755777','#ce8152'];
const poly=(p,c)=>`<polygon points="${p}" fill="${c}"/>`;
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const svg=(w,h,s)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s}</svg>`;
function face(i,mood=0){const skin=skins[i%6],hair=['#473c38','#d6ab62','#703e31','#bab6a0'][i%4];
 let s=poly('23,20 94,14 109,40 101,94 78,119 40,109 19,78',skin)+poly('23,20 94,14 109,40 82,32 54,36 26,52',hair);
 s+=poly('23,50 39,101 78,119 40,109 19,78','#00000018');
 if(i%4===1)s+=poly('20,16 37,3 90,3 110,20 108,34 18,34',clothes[i%8]);
 if(i%4===2)s+=poly('19,25 39,9 93,12 109,39 84,28 73,42 40,31',hair);
 if(i%4===3)s+=poly('29,88 43,96 87,94 102,85 90,110 77,119 43,111',hair);
 const left=mood===0?'38,56 53,49 55,53 39,60':'37,46 55,43 55,47 37,50';
 s+=poly(left,ink)+poly(mood===0?'72,50 89,59 89,63 71,54':'72,44 91,47 91,51 72,48',ink);
 s+=rect(43,64,mood===1?9:5,mood===1?12:6,ink)+rect(77,64,mood===1?9:5,mood===1?12:6,ink);
 s+=poly('64,64 57,83 70,83','#b57b5c');
 s+=mood===1?poly('51,92 76,90 79,106 54,108',ink):mood===2?poly('48,100 61,93 80,100 77,104 61,98 49,105',ink):poly('49,100 62,93 79,99 79,103 62,97 49,104',ink);
 if(mood===2)s+=`<path d="M39 64l12 8m0-8l-12 8m35-8l12 8m0-8l-12 8" stroke="${ink}" stroke-width="3"/>`;
 return s;
}
function body(i){let c=clothes[i%8];return poly('29,14 95,14 117,65 101,122 25,122 10,67',c)+poly('29,14 63,31 95,14 77,52 48,52',paper)+rect(26,100,76,12,ink)+rect(26,121,27,47,ink)+rect(76,121,27,47,ink)+rect(18,160,36,16,'#443b34')+rect(75,160,36,16,'#443b34')+poly('10,67 27,73 28,100 14,105',skins[i%6])+poly('102,72 117,65 114,105 101,100',skins[i%6])+ (i>7?rect(44,48,39,45,i===11?'#879a9d':'#ddb967'):'');}
async function atlas(name,count,w,h,draw){let parts='',frames={};const cols=8,rows=Math.ceil(count/cols);
 for(let i=0;i<count;i++){let x=i%cols*w,y=Math.floor(i/cols)*h;parts+=`<g transform="translate(${x} ${y})">${draw(i)}</g>`;frames[i]={frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};}
 const source=svg(cols*w,rows*h,parts);fs.writeFileSync(path.join(out,name+'.svg'),source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify({frames,meta:{image:name+'.png',size:{w:cols*w,h:rows*h},scale:'1'}}));
}
async function image(name,w,h,s){let source=svg(w,h,s);fs.writeFileSync(path.join(out,name+'.svg'),source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));}
async function main(){
 await atlas('cast-heads-angular',48,128,128,i=>face(i%16,Math.floor(i/16)));
 await atlas('cast-bodies-angular',12,128,180,body);
 await atlas('cast-jesters-angular',4,128,240,i=>`<g transform="translate(0 68) scale(1 .93)">${body(i+4)}</g><g transform="translate(29 0) scale(.55)">${face(i+4)}</g>`+poly('27,26 8,8 15,52 45,37 61,3 73,44 103,7 119,50 82,47 57,36',clothes[i]));
 await atlas('cast-weapons-angular',30,80,180,i=>rect(36,20,10,154,'#b28657')+poly(`32,${12+i%4*2} 59,8 77,26 67,66 43,54 24,46 17,25`,i<10?'#b8c4bc':i<20?'#e4c577':'#e1dfc9')+rect(30,44,21,10,ink));
 await image('executioner-angular',160,240,poly('38,75 118,75 149,117 138,189 23,189 10,117','#38434c')+poly('44,14 116,14 136,53 122,87 38,87 25,53',ink)+poly('46,50 115,50 111,69 49,69','#b89271')+rect(56,53,10,5,ink)+rect(96,53,10,5,ink)+rect(24,171,113,15,'#9e7256')+rect(32,185,37,47,ink)+rect(92,185,37,47,ink)+rect(8,131,26,27,'#c3926d')+rect(129,131,24,27,'#c3926d'));
 for(const [n,i]of [['oswin',1],['merrin',4],['agnes',6]])await image(n+'-angular',256,256,rect(0,0,256,256,'#526f6a')+`<g transform="translate(64 120)">${body(i)}</g><g transform="translate(47 2) scale(1.3)">${face(i)}</g>`);
 await image('cart-angular',480,200,rect(25,45,240,80,'#b88b59')+rect(265,110,140,8,ink)+rect(350,55,80,40,'#967454')+rect(410,15,16,75,'#967454')+rect(415,9,45,24,'#967454')+rect(357,90,12,65,ink)+rect(414,90,12,65,ink)+`<circle cx="65" cy="138" r="33" fill="${ink}"/><circle cx="225" cy="138" r="33" fill="${ink}"/>`);
 const towns=['york','canterbury','london','dover','durham','norwich','winchester','chester','hull','newcastle','colchester','lincoln','oxford','southampton','gloucester'];
 for(let i=0;i<towns.length;i++){const c=clothes[i%8];let s='';
  for(let j=0;j<13;j++){let x=j*70-45,h=110+(j*53+i*31)%220; s+=rect(x,1080-h,66,h,'#76938b')+poly(`${x-5},${1080-h} ${x+33},${1040-h} ${x+71},${1080-h}`,'#4d706a');}
  const towerX=260+(i%4)*70,towerY=640-(i%3)*55;
  s+=rect(towerX,towerY,100,440,c)+poly(`${towerX-10},${towerY} ${towerX+50},${towerY-90} ${towerX+110},${towerY}`,ink);
  for(let j=0;j<4;j++)s+=rect(towerX+20+(j%2)*40,towerY+40+Math.floor(j/2)*100,18,55,'#d4ba80');
  for(const x of[-80,640]){s+=rect(x,680,220,400,'#b68d61')+poly(`${x-20},680 ${x+100},560 ${x+240},680`,ink);for(let j=0;j<3;j++)s+=rect(x+25+j*65,680,9,400,ink)+rect(x+10,820,210,12,ink);}
  s+=rect(0,1080,800,520,'#52605b')+rect(0,1080,800,20,'#c1a379')+rect(0,1100,800,100,'#554539');
  for(let j=0;j<8;j++)s+=rect(j*110,1110,12,90,'#332f2d');
  for(let j=0;j<9;j++)s+=poly(`0,${1210+j*44} 800,${1205+j*44} 800,${1212+j*44} 0,${1217+j*44}`,'#68706a');
  await image(towns[i]+'-angular',800,1600,s);
 }
 await image('road-angular',800,1600,poly('0,680 130,510 290,740 470,440 800,650 800,1600 0,1600','#72846d')+poly('0,960 240,780 410,1030 680,800 800,880 800,1600 0,1600','#4f685d')+poly('0,1260 800,1180 800,1490 0,1600','#c3ac83'));
 console.log('Original angular cast, expressions, weapons, portraits, towns and road rendered.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
