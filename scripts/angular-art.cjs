// Original vector artwork: flat shapes, modular costumes and three expressions.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets');
const ink='#25343b',paper='#e9d8b4';
const skins=['#dca875','#edc69c','#ab775b','#875744','#c68d65','#e0b18b'];
const clothes=['#af594a','#54877d','#d2a44e','#596a90','#ba815c','#829262','#956b8d','#de9870'];
const poly=(p,c)=>`<polygon points="${p}" fill="${c}"/>`;
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const svg=(w,h,s)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s}</svg>`;
const line=(d,c=ink,w=3)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function face(i,mood=0){const skin=skins[i%6],hair=['#493f42','#d7ac64','#854b37','#bbb9a7'][i%4];
 let s=poly('29,27 82,16 101,36 106,75 90,105 66,118 37,102 23,71',skin);
 s+=poly('29,27 54,37 42,75 52,105 37,102 23,71','#00000016')+poly('82,16 101,36 106,75 90,105 76,88 84,52','#00000020')+poly('54,37 82,29 80,55 61,70 42,75','#ffffff20');
 s+=poly('18,58 28,55 30,77 23,83 17,70',skin)+poly('101,55 111,58 113,71 105,81 101,76',skin);
 s+=poly('25,45 29,24 46,12 82,11 101,32 104,49 84,34 51,28 32,49',hair)+poly('29,24 46,12 82,11 67,24 43,31','#ffffff22');
 if(i%4===1)s+=poly('24,29 34,10 84,6 101,26 89,35 47,31',clothes[i%8])+line('M29 28L94 25',paper,4);
 if(i%4===3)s+=poly('32,87 50,99 67,94 92,87 87,110 67,119 41,108',hair)+poly('67,94 92,87 87,110 67,119','#00000022');
 s+=line(mood===0?'M37 55L52 49 M76 49L91 55':'M37 49L52 46 M77 46L91 49',hair,4);
 if(mood===2)s+=line('M40 64l10 9m0-9l-10 9m36-9l10 9m0-9l-10 9',ink,3);
 else if(mood===3)s+=line('M39 69Q46 59 53 69 M76 69Q83 59 90 69',ink,3);
 else s+=rect(43,64,mood===1?8:5,mood===1?11:6,ink)+rect(79,64,mood===1?8:5,mood===1?11:6,ink);
 s+=poly('63,62 56,84 69,86 73,80','#00000022')+line('M57 86L70 87',skin,2);
 s+=poly('32,78 48,76 50,84 35,87','#d977682e')+poly('80,77 96,79 92,87 79,84','#d977682e');
 s+=mood===1?poly('53,94 73,92 78,106 58,109',ink):mood===3?poly('48,94 78,94 72,105 60,108 51,101',ink)+rect(53,95,21,4,paper):line('M49 101L61 95L77 99',ink,3);
 if(i%3===0)s+=line('M48 88L60 85L73 88',hair,4);
 if(i%5===0)s+=rect(89,71,3,3,hair);
 // Smaller planes give faces volume while expressions remain readable at phone size.
 s+=poly('31,51 40,45 48,47 38,54','#ffffff22')+poly('85,44 96,51 91,57 80,50','#00000017')+poly('45,85 55,91 54,97 39,94','#00000012')+poly('76,86 91,83 84,96 75,93','#ffffff19');
 s+=line('M22 62l4 4-2 8M107 62l-3 4 2 8','#835b463f',2)+line('M59 84l5 2 6-1','#f6d0a37a',2);
 for(let k=0;k<5;k++){const x=40+k*10;s+=line(`M${x} ${24-k%2*4}l7 -4`,k%2?'#ffffff26':'#00000026',2);}
 if(i%4===1)s+=poly('80,18 91,4 101,8 90,24','#e9d8b4')+line('M83 21l12-12','#a88356',2);
 if(i%4===3)for(let k=0;k<5;k++)s+=line(`M${47+k*8} 100l3 9`,'#ffffff18',1);
 if(mood!==2&&mood!==3){s+=rect(44,64,2,2,'#f6e4c4')+rect(80,64,2,2,'#f6e4c4');}
 if(i%3===2)s+=poly('34,73 38,71 40,74 36,76','#af6d4d')+poly('86,75 90,73 92,77 88,78','#af6d4d');
 if(i===14)s+=line('M87 57l7 7m-8-2l5-5','#8c5749',2)+circleSVG(109,83,3,'#e2ba69');
 if(i>=16){
   const style=Math.floor(i/10)%10,trim=clothes[(i+3)%8];
   if(style===0)s+=poly('28,31 38,9 88,9 99,31 79,25 48,25',trim)+line('M34 25h59',paper,3);
   if(style===1)s+=poly('28,35 32,13 60,3 92,16 100,37 80,31 53,24',hair)+poly('34,19 58,8 64,24','#ffffff20');
   if(style===2)s+=line('M39 71h18v-12H39z M73 71h18v-12H73z M57 64h16','#b8a378',3);
   if(style===3)s+=poly('27,33 31,17 48,5 80,5 100,27 93,35 70,23 45,30',trim)+rect(45,19,42,4,paper);
   if(style===4)s+=line('M32 83l6 30 8 5 M99 83l-6 30-8 5',hair,7)+line('M34 88l6 4m-4 6l7 4m-2 7l5 4',paper,1);
   if(style===5)s+=poly('28,33 37,11 81,7 101,26 107,35 74,32 47,36',trim)+poly('38,12 57,12 48,33','#ffffff25');
   if(style===6)s+=line('M38 80l10 9 M40 88l8-7','#855f52',2)+circleSVG(108,82,4,'#deb867');
   if(style===7)s+=poly('30,37 31,10 60,3 91,15 98,35 73,24 47,28',hair)+line('M43 20l8-10m4 10l8-10m4 10l8-8',paper,2);
   if(style===8)s+=poly('25,27 30,14 90,14 102,29 111,38 18,38',trim)+line('M34 25h56',paper,3);
   if(style===9)s+=line('M29 80l6 12 M99 79l-5 13',hair,6)+circleSVG(106,85,3,'#dab366')+line('M40 91l7 5',hair,2);
   s=`<g transform="translate(${64*(1-(.9+(i%5)*.045))} 0) scale(${.9+(i%5)*.045} 1)">${s}</g>`;
 }
 return s;
}
function body(i,carrier=false){const c=clothes[i%8];let s=poly(carrier?'38,10 86,10 92,32 98,132 29,132 33,32':'38,10 86,10 106,32 115,80 103,107 98,132 29,132 24,104 13,82 20,33',c);
 s+=poly(carrier?'38,10 52,24 45,106 29,132 33,32':'38,10 52,24 45,106 29,132 24,104 20,33','#ffffff19')+poly(carrier?'86,10 92,32 98,132 76,126 82,33':'86,10 106,32 115,80 103,107 98,132 76,126 82,33','#00000025');
 s+=poly('48,10 64,22 80,10 73,34 56,34',paper)+line('M64 24L64 98','#00000020',2)+line('M36 63L31 99 M94 63L98 99','#00000025',3);
 s+=rect(28,105,72,9,'#544338')+rect(58,104,13,12,'#d8b768')+rect(61,107,7,6,'#665342');
 s+=poly('30,130 57,130 54,166 28,166','#424b51')+poly('72,130 97,130 102,165 76,165','#343c45')+poly('28,157 52,158 55,174 17,174 17,166','#584839')+poly('76,157 102,158 111,172 75,174','#493a32')+line('M21 171L52 171 M78 171L107 170','#bc9562',2);
 if(!carrier)s+=poly('15,78 31,80 32,98 23,106 13,99',skins[i%6])+poly('99,80 113,77 116,97 107,105 98,99',skins[i%6]);
 if(i%3===0)s+=poly('46,42 78,42 83,101 42,101','#c9bba0')+line('M49 71L76 71 M50 76L74 76','#9f9079',2);
 if(i%3===1)s+=rect(45,46,8,6,'#ddb967')+rect(45,66,8,6,'#ddb967');
 if(i===9)s+=poly('40,25 63,39 90,23 80,73 64,84 45,70','#d6b45f')+line('M47 38L64 50L83 37','#f0d99b',4);
 if(i===10)s+=poly('33,20 61,36 88,21 80,99 51,98','#ded4b7')+line('M64 39L64 63 M55 49L73 49','#aa8757',4);
 if(i===11)s+=poly('37,28 64,22 92,28 88,87 63,101 38,86','#91a8aa')+poly('64,22 92,28 88,87 63,101','#607a87')+line('M45 38L81 38 M45 52L81 52 M44 68L82 68','#c3d2cd',3);
 s+=line('M32 37l10 9 M84 36l9 8 M36 96l10 4 M86 95l9 3','#ffffff24',2)+line('M34 114l-3 12 M94 115l2 11 M39 143l9 11 M85 142l-4 15','#0000002b',2);
 for(let yy=39;yy<96;yy+=12)s+=rect(63,yy,2,3,'#d7bd84');
 for(let k=0;k<7;k++)s+=line(`M${32+k*9} 108h3`,'#ddb481',1);
 s+=poly('29,158 36,155 47,160 49,165 30,166','#ffffff18')+poly('80,158 86,155 100,161 101,167 80,166','#ffffff18');
 for(const xx of[35,84])s+=line(`M${xx} 165h12m-11 3h10`,'#c9a373',1);
 if(i===11){for(let yy=42;yy<85;yy+=11)for(let xx=46;xx<86;xx+=10)s+=poly(`${xx},${yy} ${xx+3},${yy-2} ${xx+6},${yy} ${xx+3},${yy+3}`,'#d1d7c24a');s+=line('M40 37l-8 22 M88 36l7 22','#e4d5ae',3);}
 else if(i===9)s+=poly('58,54 67,44 77,54 71,69 62,69','#a66c52');
 else if(carrier)for(let k=0;k<6;k++)s+=poly(`${45+k%3*12},${45+Math.floor(k/3)*23} ${50+k%3*12},${38+Math.floor(k/3)*23} ${55+k%3*12},${45+Math.floor(k/3)*23} ${50+k%3*12},${52+Math.floor(k/3)*23}`,'#e7c688');
 if(i>=12){
   const trim=clothes[(Math.floor(i/10)+3)%8],style=Math.floor(i/10);
   s+=poly('36,29 50,37 44,96 30,96',trim)+poly('81,37 94,29 100,95 86,96',trim);
   if(style%5===0)s+=poly('43,41 83,41 88,103 38,103',trim)+line('M49 49h28m-29 8h30',paper,2);
   if(style%5===1)s+=poly('36,26 46,27 95,99 82,103',trim)+rect(42,78,18,20,'#634d3b');
   if(style%5===2)s+=poly('35,24 63,39 94,24 89,87 64,101 38,88','#8c9c9b')+line('M46 46h35m-35 14h35m-35 14h35',paper,2);
   if(style%5===3)s+=poly('43,32 65,44 85,32 80,98 49,98',trim)+line('M64 45v50',paper,3);
   if(style%5===4)s+=poly('32,36 49,42 43,124 29,126',trim)+poly('79,43 94,36 100,124 85,125',trim);
   const badge=clothes[(i+5)%8],cx=64+(i%3-1)*8;
   s+=poly(`${cx},52 ${cx+8},61 ${cx},72 ${cx-8},61`,badge)+line(`M${cx-4} 61h8 M${cx} 57v8`,paper,2);
   for(let k=0;k<(i%5)+1;k++)s+=rect(47+k*7,91,3,4,paper);
   if(style>=5)s+=line('M35 41l8 10 M92 42l-8 10',paper,3)+rect(87,112,12,16,'#75523f');
 }
 return s;
}
async function atlas(name,count,w,h,draw,cols=8){let parts='',frames={};const rows=Math.ceil(count/cols);
 for(let i=0;i<count;i++){let x=i%cols*w,y=Math.floor(i/cols)*h;parts+=`<g transform="translate(${x} ${y})">${draw(i)}</g>`;frames[i]={frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};}
 const source=svg(cols*w,rows*h,parts);fs.writeFileSync(path.join(out,name+'.svg'),source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify({frames,meta:{image:name+'.png',size:{w:cols*w,h:rows*h},scale:'1'}}));
}
async function image(name,w,h,s){
 if(name==='cart-angular'){const art=require('../caravan-art.js').markup(13);s='<g transform="scale(.73)">'+art.slice(art.indexOf('>')+1,art.lastIndexOf('</svg>'))+'</g>';}
 if(name==='executioner-angular')s+=poly('44,34 61,15 69,20 51,43','#9fac9b33')+line('M42 44l9-19 M113 39l7 20 M47 82l17-4 M97 78l16 4','#8da09a',2)+line('M52 101l-5 39 M110 102l10 36 M62 169l-5 7 M95 169l5 7','#ab9c76',2)+poly('64,107 77,102 88,110 83,134 73,141 66,133','#33474b')+line('M71 111l6 5 5-4 M76 117v15','#9eae9a',2)+rect(39,174,18,2,'#c5a477')+rect(104,174,13,2,'#c5a477');
 let source=svg(w,h,s);fs.writeFileSync(path.join(out,name+'.svg'),source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));}
function weapon(i){const tier=Math.floor(i/5),metal=['#8eaaa9','#b6c5c0','#cab788','#e2cf86','#bfced5','#e8d7ab'][tier],variant=i%5;
 let s=rect(36,20,9,151,'#825841')+poly('36,20 40,20 40,171 36,171','#c49968')+rect(33,117,15,32,ink)+line('M34 124L47 129 M34 137L47 142','#c3a071',3);
 const shapes=['19,17 40,10 67,18 76,35 64,62 41,52 26,44','7,16 34,9 44,24 62,9 78,16 74,54 53,64 41,43 24,64 8,54','32,3 45,3 45,29 69,19 76,29 66,57 43,57 43,81 32,81','21,12 42,6 73,21 76,57 64,75 42,58 22,44','30,4 50,4 51,15 74,19 77,43 50,48 48,63 28,63 25,46 6,43 8,19 29,15'];
 const edges=['67,18 76,35 64,62 62,56 71,34','78,16 74,54 53,64 54,58 69,51 73,17','69,19 76,29 66,57 63,51 71,29','73,21 76,57 64,75 62,68 71,55 69,24','74,19 77,43 50,48 50,44 72,39 70,21'];
 // The upward circular swing leads with the blade's left side. Mirror the
 // complete head, including its clipped bevel, while keeping the haft fixed.
 s+='<g transform="translate(80 0) scale(-1 1)">'+poly(shapes[variant],metal)+`<defs><clipPath id="blade-${i}"><polygon points="${shapes[variant]}"/></clipPath></defs><g clip-path="url(#blade-${i})">`+poly('41,10 45,25 42,53 26,44 19,17','#ffffff29')+poly(edges[variant],'#f1e6c7')+'</g>'+rect(30,43,20,8,'#786442');
 if(tier>=2)s+=rect(35,19,10,8,'#e4bc65');if(tier>=3)s+=poly('39,25 45,31 40,38 34,31',tier===5?'#cb6066':'#6db9af');
 if(tier>=4)s+=line('M48 29L60 34L53 43',ink,2);
 s+=`<g clip-path="url(#blade-${i})">`+poly('23,13 42,7 51,23 38,35 24,27','#ffffff18')+line('M26 26l9-5 5 9 M51 27l9 4-4 7','#25343b55',1.5)+line('M27 39l8-3 M53 48l8-3','#e6dab578',1)+circleSVG(38,24,3,'#cfb786')+'</g>';
 for(let k=0;k<5;k++)s+=rect(33+k*3,46,2,2,'#e4c88a');
 return s+'</g>'+line('M41 59v47 M38 71v17','#cba373',1)+line('M34 145l12 5 M34 151l12 5',paper,1.5)+rect(35,162,12,6,'#bb945e');
}
function circleSVG(x,y,r,c){return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;}
function house(x,y,w,h,i,rows=false){const walls=['#d4aa7d','#b9bea1','#cba28b','#b4c7ba'],roofs=['#8a5960','#526778','#77625f'];const c=rows?'#e4dcc5':walls[i%4],beam=y+h*.52;let s=rect(x,y,w,h,c)+poly(`${x+w*.7},${y} ${x+w},${y} ${x+w},${y+h} ${x+w*.7},${y+h}`,'#00000020');
 const chimneyX=x+w*(x>=650?.25:.72),chimneyTop=y-68;
 s+=rect(chimneyX-7,chimneyTop,14,46,roofs[i%3])+poly(`${chimneyX+2},${chimneyTop} ${chimneyX+7},${chimneyTop} ${chimneyX+7},${chimneyTop+46} ${chimneyX+2},${chimneyTop+46}`,'#00000025')+rect(chimneyX-9,chimneyTop-3,18,5,'#665248');
 s+=poly(`${x-8},${y} ${x+w*.5},${y-65} ${x+w+8},${y}`,roofs[i%3])+poly(`${x+w*.5},${y-65} ${x+w+8},${y} ${x+w*.55},${y}`,'#00000025');
 const roofId='roof-'+x+'-'+y+'-'+i;
 s+='<defs><clipPath id="'+roofId+'">'+poly(`${x-8},${y} ${x+w*.5},${y-65} ${x+w+8},${y}`,'white')+'</clipPath></defs><g clip-path="url(#'+roofId+')">';
 for(let row=0;row<4;row++){const yy=y-12-row*14;s+=line(`M${x-8} ${yy}h${w+16}`,'#ffffff16',2);for(let xx=x+(row%2)*15;xx<x+w;xx+=29)s+=line(`M${xx} ${yy}v-12`,'#00000020',2);}s+='</g>';
 s+=line(`M${x+w*.5} ${y-53}L${x+w*.5} ${y-8}M${x+w*.25} ${y-8}L${x+w*.5} ${y-38}L${x+w*.75} ${y-8}`,'#5b524a',4);
 for(const fraction of[.04,.5,.96])s+=rect(x+w*fraction-3,y,6,h,'#695647');
 s+=rect(x,y,w,6,'#695647')+rect(x,beam,w,6,'#695647')+rect(x,y+h-6,w,6,'#695647');
 const ww=Math.min(34,w*.22),wh=Math.min(38,h*.52-18),wy=y+10;
 for(const fraction of[.26,.74]){const wx=x+w*fraction-ww/2;s+=rect(wx-3,wy-2,ww+6,wh+4,'#765e49')+rect(wx,wy,ww,wh,'#415955')+rect(wx+3,wy+3,ww*.35,wh-6,'#d2b477')+rect(wx+ww*.49,wy,2,wh,'#765e49')+rect(wx-4,wy+wh,ww+8,3,'#dac292');}
 s+=line(`M${x+w*.08} ${beam+12}L${x+w*.44} ${y+h-12}`,'#89705b',4);
 if(w>100){
   // Shutters sit outside the window openings, rather than floating over the glass.
   for(const fraction of[.26,.74]){const wx=x+w*fraction-ww/2;s+=rect(wx-9,wy,5,wh,'#728f82')+rect(wx+ww+4,wy,5,wh,'#728f82');}
   s+=rect(x+w*.16,y+61,w*.22,8,'#72513e');
   for(let k=0;k<5;k++)s+=poly(`${x+w*.18+k*8},${y+60} ${x+w*.2+k*8},${y+51} ${x+w*.22+k*8},${y+60}`,k%2?'#cf8a67':'#87996f');
   s+=rect(x+w*.13,beam+19,38,27,'#547c78')+line(`M${x+w*.13+5} ${beam+23}l27 18m0-18l-27 18`,'#e2b668',3)+line(`M${x+w*.13+19} ${beam+19}v-14`,'#72513e',3);
 }
 const doorX=x+w*.66,doorY=beam+10,doorH=Math.max(10,y+h-beam-16);
 s+=rect(doorX-3,doorY-3,w*.17+6,doorH+6,'#b49b78')+rect(doorX,doorY,w*.17,doorH,'#725948')+rect(doorX+3,doorY+3,3,Math.max(5,doorH-6),'#ad8860');
 s+=rect(doorX-5,y+h-6,w*.17+10,6,'#c6b08b')+rect(doorX+w*.13,doorY+doorH*.6,3,3,'#e4bc65');
 for(let k=0;k<4;k++)s+=line(`M${doorX+7+k*4} ${doorY+4}v${doorH-8}`,'#4a4438',1);
 for(const xx of[x+w*.16,x+w*.46])s+=poly(`${xx},${y+h-8} ${xx+4},${y+h-24} ${xx+17},${y+h-24} ${xx+21},${y+h-8}`,'#a97558')+poly(`${xx+1},${y+h-24} ${xx+4},${y+h-35} ${xx+9},${y+h-29} ${xx+16},${y+h-39} ${xx+20},${y+h-24}`,'#758d65');
 for(let yy=y+8;yy<y+h-7;yy+=17){for(const xx of[x+3,x+w-11])s+=rect(xx,yy,8,6,yy%2?'#d7c6a2':'#a38a6a');}
 for(const xx of[x+w*.04,x+w*.5,x+w*.96])s+=line(`M${xx} ${y+12}v${h-26}`,'#cfaa7770',1);
 if(w>100){const lx=x+w*.59,ly=beam+22;s+=line(`M${lx} ${ly-12}v10`,'#5d5342',2)+poly(`${lx-5},${ly} ${lx+5},${ly} ${lx+7},${ly+14} ${lx-7},${ly+14}`,'#665849')+rect(lx-3,ly+3,6,8,'#e2ba70');}
 s+=rect(x,y+h-4,w,4,'#b9a483');return s;
}
function tower(x,y,w,h,c,spire=false){let s=rect(x,y,w,h,c)+poly(`${x+w*.68},${y} ${x+w},${y} ${x+w},${y+h} ${x+w*.68},${y+h}`,'#00000022');
 s+=spire?poly(`${x-6},${y} ${x+w/2},${y-130} ${x+w+6},${y}`,'#526778'):rect(x-4,y-12,w+8,14,c);
 if(!spire)for(let j=0;j<4;j++)s+=rect(x+j*w/4,y-25,w/7,20,c);
 for(let k=0;k<Math.floor(h/70);k++){const wy=y+22+k*65;s+=rect(x+w*.22,wy,w*.18,30,'#455c60')+rect(x+w*.59,wy,w*.13,30,'#455c60')+poly(`${x+w*.22},${wy} ${x+w*.31},${wy-9} ${x+w*.4},${wy}`,'#455c60')+line(`M${x+w*.2} ${wy+33}h${w*.23} M${x+w*.56} ${wy+33}h${w*.2}`,'#e4d5b9',2)+rect(x+3,wy-8,7,18,'#ffffff20')+line(`M${x+12} ${wy+44}h${w-22}`,'#00000016',2);}return s;}
function town(i, outskirts=0){const stone=['#c4bea5','#d0c0a0','#b8bdad','#c6b39b','#b9b69c','#c5b995','#c6bba8','#b2846e','#c6bca1','#b4a889','#b69a7d','#d2c3a2','#b9b89c','#c3b29b','#c9b99b'][i];let s='';
 s+=i===8?poly('0,875 130,856 300,870 490,852 660,870 800,858 800,1080 0,1080','#9aafa0'):poly('0,850 120,740 230,810 400,720 570,810 710,760 800,830 800,1080 0,1080','#9bafa0');
 if(!outskirts)s+='<g data-city-landmarks="'+i+'">'+require('./town-landmarks.cjs').draw(i)+'</g>';
 else {for(let j=0;j<9;j++){const x=j*105-28,h=38+(j*31+i*19+outskirts*17)%70;s+=house(x,955-h,96,h,j+i+outskirts*13,i===7);}}
 if([3,8,9,13].includes(i)){const waterY=i===8?984:950;s+=rect(0,waterY,800,1000-waterY,'#5b929a');for(let j=0;j<36;j++)s+=line(`M${(j*79)%800} ${waterY+3+j%3*4}h${13+j%5*8}`,'#bfd0bd',1.5);}

 for(let j=0;j<12;j++){if([2,3,8,9,13].includes(i)&&j>=2&&j<=8)continue;const h=65+(j*47+i*31)%105;s+=house(j*78-40,1000-h,74,h,j+i+outskirts*13,i===7);}
 s+=house(-75,760+(i%3)*35,225,240-(i%3)*35,i+outskirts*13,i===7)+house(650,795-(i%4)*20,240,205+(i%4)*20,i+2+outskirts*13,i===7);
 if(i===7){for(let j=0;j<6;j++){const x=162+j*79;s+=house(x,867+(j%2)*12,76,133-(j%2)*12,j+1,true)+rect(x,939,76,7,'#5c5148')+rect(x+5,944,5,56,'#5c5148')+rect(x+65,944,5,56,'#5c5148')+rect(x,958,76,4,'#5c5148');for(let k=0;k<4;k++)s+=rect(x+8+k*15,944,3,14,'#5c5148');}}
 if(i===0){for(let j=0;j<5;j++){const x=188+j*81;s+=house(x,855+(j%3)*14,79,145-(j%3)*14,j+2)+poly(`${x-5},927 ${x+84},927 ${x+76},937 ${x},937`,'#dcc4a5')+line(`M${x+3} 937l8 14m56-14l-8 14`,'#695647',3);}}
 // Residents' shoes touch this street at y=1050, behind the stage.
 s+=rect(0,1000,800,80,'#a9a591');for(let row=0;row<4;row++)for(let col=0;col<19;col++){const x=col*45-(row%2)*22,y=1004+row*18;s+=poly(`${x},${y} ${x+38},${y-2} ${x+43},${y+12} ${x+3},${y+14}`,['#b8b29b','#979d8d','#c6baa0','#929487'][(col+row+i)%4])+line(`M${x+5} ${y+2}h27`,'#e0d7bd66',1);}for(let j=0;j<22;j++)s+=line(`M${j*41} 1020l27 -2 M${j*41+14} 1052l28 -1`,'#868f7e',2);
 s+=rect(0,1080,800,22,'#ddbb85')+rect(0,1102,800,26,'#98735a')+rect(0,1128,800,72,'#665248');for(let j=0;j<12;j++)s+=rect(j*72,1110,3,84,'#423d39')+poly(`${j*72},1110 ${j*72+64},1110 ${j*72+59},1115 ${j*72+4},1115`,'#aa8865');
 for(let j=0;j<16;j++){const x=j*52;s+=line(`M${x+3} 1085h44m-38 7h31`,'#f0d7ac',2)+rect(x+6,1107,4,4,'#273d43')+rect(x+41,1117,4,4,'#273d43')+line(`M${x+8} 1141l32 2m-29 12l24 1m-22 15l27-2`,'#c29a7166',2);}
 for(const x of[80,680])s+=rect(x-23,1120,46,14,'#41545a')+rect(x-18,1124,36,3,'#95a6a4')+rect(x-16,1136,5,23,'#41545a')+rect(x+11,1136,5,23,'#41545a');
 s+=rect(0,1200,800,400,'#697b72');for(let j=0;j<60;j++){const x=(j*127+i*11)%800,y=1210+Math.floor(j/10)*63;s+=poly(`${x},${y} ${x+58},${y-3} ${x+68},${y+16} ${x+7},${y+20}`,'#7e8d80');}return s;
}
function panoramicTown(i){
 const clip='<defs><clipPath id="town-panel"><rect width="800" height="1600"/></clipPath></defs>';
 return clip+[1,0,2].map((outskirts,column)=>'<g transform="translate('+column*800+' 0)"><g clip-path="url(#town-panel)" data-town-panel="'+(outskirts?'outskirts':'landmark')+'">'+town(i,outskirts)+'</g></g>').join('');
}
async function main(){
 if(process.argv.includes('--roads-only')){for(const style of ['farmland','woodland','coast','estuary','uplands'])await image('road-'+style+'-angular',800,1600,require('./road-art.cjs').draw(style));return;}
 if(process.argv.includes('--towns-only')){const towns=['york','canterbury','london','dover','durham','norwich','winchester','chester','hull','newcastle','colchester','lincoln','oxford','southampton','gloucester'];for(let i=0;i<towns.length;i++)await image(towns[i]+'-angular',2400,1600,panoramicTown(i));return;}
 if(process.argv.includes('--weapons-only')){await atlas('cast-weapons-angular',30,80,180,weapon);return;}
 await atlas('cast-heads-angular',400,128,128,i=>face(i%100,Math.floor(i/100)),20);
 await atlas('cast-bodies-angular',100,128,180,body,10);
 if(process.argv.includes('--cast-only'))return;
 await atlas('cast-jesters-angular',4,128,240,i=>`<g transform="translate(0 65) scale(1 .97)">${body(i+4,true)}</g><g transform="translate(27 8) scale(.58)">${face(i+4)}</g>`+poly('36,25 42,7 69,2 87,13 97,28 82,29 72,16 59,17 52,29',clothes[i])+`<circle cx="91" cy="28" r="5" fill="#e4bd6c"/>`);
 await atlas('cast-weapons-angular',30,80,180,weapon);
 await image('executioner-angular',160,240,poly('47,77 111,77 133,104 141,156 120,184 34,184 18,153 27,104','#50616a')+poly('47,77 72,89 58,168 34,184 18,153 27,104','#6b7a7c')+poly('111,77 133,104 141,156 120,184 88,168 91,94','#344751')+poly('46,19 79,5 110,19 126,57 113,89 48,89 32,57','#344751')+poly('79,5 110,19 126,57 113,89 82,76 91,33','#22353f')+poly('46,19 79,5 69,36 40,64 32,57','#61737b')+poly('48,52 111,49 107,72 53,72','#bb9271')+poly('84,50 111,49 107,72 85,72','#95785f')+line('M58 58L67 56 M94 56L103 58',ink,4)+poly('48,89 80,82 113,89 100,162 62,165','#41535c')+line('M79 91L76 155','#829091',2)+rect(33,166,89,13,'#82644c')+rect(72,165,18,17,'#d3b476')+rect(76,169,10,9,'#665548')+poly('35,181 68,181 62,221 32,224',ink)+poly('91,181 120,181 125,224 96,223','#31434d')+poly('32,212 61,212 65,235 19,235 20,224','#4c4440')+poly('96,213 125,213 139,232 96,235','#443c38')+line('M23 230L61 230 M99 230L135 228','#bba57e',3));
 let deck=rect(0,0,300,20,'#755a43')+rect(0,0,300,4,'#d1ad77')+rect(0,16,300,4,'#493e34');
 for(let x=0;x<300;x+=30)deck+=rect(x,4,2,12,'#493e34')+line(`M${x+5} 8h18m-14 5h11`,'#bb966b',1)+circleSVG(x+6,6,1.5,'#39464a');
 await image('platform-angular',300,20,deck);
 for(const [n,i]of [['oswin',1],['merrin',4],['agnes',6]])await image(n+'-angular',256,256,rect(0,0,256,256,'#526f6a')+`<g transform="translate(64 120)">${body(i)}</g><g transform="translate(47 2) scale(1.3)">${face(i)}</g>`);
 await image('cart-angular',480,200,rect(25,72,240,65,'#b88b59')+poly('195,72 265,72 265,137 195,137','#91664f')+rect(20,68,250,10,'#dfb87d')+poly('25,60 39,14 250,14 265,60','#739c90')+poly('145,14 250,14 265,60 145,60','#4e746c')+line('M145 15L145 60',paper,5)+line('M45 80L45 132 M95 80L95 132 M145 80L145 132 M195 80L195 132 M245 80L245 132','#795846',3)+rect(265,114,90,7,ink)+poly('336,69 393,59 425,82 417,107 349,104','#a78762')+poly('390,65 395,30 418,17 451,26 461,43 429,47 426,80','#a78762')+poly('393,59 425,82 417,107 386,103','#7e604e')+poly('410,25 411,8 420,21','#39434a')+rect(443,31,4,4,ink)+poly('344,96 358,98 355,157 343,159',ink)+poly('409,99 421,100 428,155 414,156',ink)+line('M336 78L324 106L322 130',ink,8)+rect(348,56,45,25,'#64867b')+rect(367,56,5,26,paper)+`<circle cx="65" cy="148" r="30" fill="${ink}"/><circle cx="225" cy="148" r="30" fill="${ink}"/><circle cx="65" cy="148" r="19" fill="#bba57e"/><circle cx="225" cy="148" r="19" fill="#bba57e"/>`+line('M65 130L65 166 M47 148L83 148 M225 130L225 166 M207 148L243 148',ink,4));
 const towns=['york','canterbury','london','dover','durham','norwich','winchester','chester','hull','newcastle','colchester','lincoln','oxford','southampton','gloucester'];
 for(let i=0;i<towns.length;i++)await image(towns[i]+'-angular',2400,1600,panoramicTown(i));
 await image('road-angular',800,1600,poly('0,680 130,510 290,740 470,440 800,650 800,1600 0,1600','#72846d')+poly('0,960 240,780 410,1030 680,800 800,880 800,1600 0,1600','#4f685d')+rect(0,1205,800,260,'#c3ac83')+rect(0,1215,800,10,'#a79675')+line('M0 1310L800 1310 M0 1370L800 1370','#b19b77',4));
 for(const style of ['farmland','woodland','coast','estuary','uplands'])await image('road-'+style+'-angular',800,1600,require('./road-art.cjs').draw(style));
 console.log('Detailed angular cast, expressions, weapons, portraits, towns, caravan and five road landscapes rendered.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
