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
 return s;
}
function body(i){const c=clothes[i%8];let s=poly('38,10 86,10 106,32 115,80 103,107 98,132 29,132 24,104 13,82 20,33',c);
 s+=poly('38,10 52,24 45,106 29,132 24,104 20,33','#ffffff19')+poly('86,10 106,32 115,80 103,107 98,132 76,126 82,33','#00000025');
 s+=poly('48,10 64,22 80,10 73,34 56,34',paper)+line('M64 24L64 98','#00000020',2)+line('M36 63L31 99 M94 63L98 99','#00000025',3);
 s+=rect(28,105,72,9,'#544338')+rect(58,104,13,12,'#d8b768')+rect(61,107,7,6,'#665342');
 s+=poly('30,130 57,130 54,166 28,166','#424b51')+poly('72,130 97,130 102,165 76,165','#343c45')+poly('28,157 52,158 55,174 17,174 17,166','#584839')+poly('76,157 102,158 111,172 75,174','#493a32')+line('M21 171L52 171 M78 171L107 170','#bc9562',2);
 s+=poly('15,78 31,80 32,98 23,106 13,99',skins[i%6])+poly('99,80 113,77 116,97 107,105 98,99',skins[i%6]);
 if(i%3===0)s+=poly('46,42 78,42 83,101 42,101','#c9bba0')+line('M49 71L76 71 M50 76L74 76','#9f9079',2);
 if(i%3===1)s+=rect(45,46,8,6,'#ddb967')+rect(45,66,8,6,'#ddb967');
 if(i===9)s+=poly('40,25 63,39 90,23 80,73 64,84 45,70','#d6b45f')+line('M47 38L64 50L83 37','#f0d99b',4);
 if(i===10)s+=poly('33,20 61,36 88,21 80,99 51,98','#ded4b7')+line('M64 39L64 63 M55 49L73 49','#aa8757',4);
 if(i===11)s+=poly('37,28 64,22 92,28 88,87 63,101 38,86','#91a8aa')+poly('64,22 92,28 88,87 63,101','#607a87')+line('M45 38L81 38 M45 52L81 52 M44 68L82 68','#c3d2cd',3);
 return s;
}
async function atlas(name,count,w,h,draw){let parts='',frames={};const cols=8,rows=Math.ceil(count/cols);
 for(let i=0;i<count;i++){let x=i%cols*w,y=Math.floor(i/cols)*h;parts+=`<g transform="translate(${x} ${y})">${draw(i)}</g>`;frames[i]={frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};}
 const source=svg(cols*w,rows*h,parts);fs.writeFileSync(path.join(out,name+'.svg'),source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify({frames,meta:{image:name+'.png',size:{w:cols*w,h:rows*h},scale:'1'}}));
}
async function image(name,w,h,s){let source=svg(w,h,s);fs.writeFileSync(path.join(out,name+'.svg'),source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));}
function weapon(i){const tier=Math.floor(i/5),metal=['#8eaaa9','#b6c5c0','#cab788','#e2cf86','#bfced5','#e8d7ab'][tier],variant=i%5;
 let s=rect(36,20,9,151,'#825841')+poly('36,20 40,20 40,171 36,171','#c49968')+rect(33,117,15,32,ink)+line('M34 124L47 129 M34 137L47 142','#c3a071',3);
 const shapes=['19,17 40,10 67,18 76,35 64,62 41,52 26,44','7,16 34,9 44,24 62,9 78,16 74,54 53,64 41,43 24,64 8,54','32,3 45,3 45,29 69,19 76,29 66,57 43,57 43,81 32,81','21,12 42,6 73,21 76,57 64,75 42,58 22,44','30,4 50,4 51,15 74,19 77,43 50,48 48,63 28,63 25,46 6,43 8,19 29,15'];
 s+=poly(shapes[variant],metal)+poly('41,10 45,25 42,53 26,44 19,17','#ffffff29')+line(variant===2?'M69 19L76 29L66 57':'M67 18L76 35L64 62','#f7ecd0',3)+rect(30,43,20,8,'#786442');
 if(tier>=2)s+=rect(35,19,10,8,'#e4bc65');if(tier>=3)s+=poly('39,25 45,31 40,38 34,31',tier===5?'#cb6066':'#6db9af');
 if(tier>=4)s+=line('M48 29L60 34L53 43',ink,2);return s;
}
function house(x,y,w,h,i){const walls=['#d4aa7d','#b9bea1','#cba28b','#b4c7ba'],roofs=['#8a5960','#526778','#77625f'];const c=walls[i%4];let s=rect(x,y,w,h,c)+poly(`${x+w*.7},${y} ${x+w},${y} ${x+w},${y+h} ${x+w*.7},${y+h}`,'#00000020');
 s+=poly(`${x-8},${y} ${x+w*.5},${y-65} ${x+w+8},${y}`,roofs[i%3])+poly(`${x+w*.5},${y-65} ${x+w+8},${y} ${x+w*.55},${y}`,'#00000025');
 for(let j=0;j<3;j++){s+=rect(x+10+j*(w-20)/3,y+15,7,h-15,'#695647');if(j<2)s+=rect(x+23+j*w*.43,y+25,17,30,'#475c5b')+rect(x+25+j*w*.43,y+27,5,24,'#d2b477');}
 s+=rect(x,y+65,w,7,'#695647')+line(`M${x+10} ${y+65}L${x+w*.45} ${y+h-5}M${x+w-10} ${y+65}L${x+w*.55} ${y+h-5}`,'#89705b',5);return s;
}
function tower(x,y,w,h,c,spire=false){let s=rect(x,y,w,h,c)+poly(`${x+w*.68},${y} ${x+w},${y} ${x+w},${y+h} ${x+w*.68},${y+h}`,'#00000022');
 s+=spire?poly(`${x-6},${y} ${x+w/2},${y-130} ${x+w+6},${y}`,'#526778'):rect(x-4,y-12,w+8,14,c);
 if(!spire)for(let j=0;j<4;j++)s+=rect(x+j*w/4,y-25,w/7,20,c);
 for(let k=0;k<Math.floor(h/70);k++)s+=rect(x+w*.22,y+22+k*65,w*.18,30,'#455c60')+rect(x+w*.59,y+22+k*65,w*.13,30,'#455c60');return s;}
function town(i){const stone=['#c4bea5','#d0c0a0','#b8bdad','#c6b39b','#b9b69c','#c5b995','#c6bba8','#b2846e','#c6bca1','#b4a889','#b69a7d','#d2c3a2','#b9b89c','#c3b29b','#c9b99b'][i];let s='';
 s+=poly('0,850 120,740 230,810 400,720 570,810 710,760 800,830 800,1080 0,1080','#9bafa0');
 // Recognisable medieval landmarks with varied skyline heights.
 if([0,1,4,6,8,11,14].includes(i)){
   const central=[460,450,480,610,555,405,420][[0,1,4,6,8,11,14].indexOf(i)];
   s+=rect(195,740,410,230,stone)+poly('175,740 400,650 625,740','#657a78');
   s+=tower(355,central,90,970-central,stone);
   if([0,1,4,11].includes(i)){s+=tower(215,central+65,67,905-central,stone)+tower(515,central+65,67,905-central,stone);}
   for(let x=225;x<600;x+=52)s+=poly(`${x},830 ${x+10},808 ${x+22},830 ${x+22},905 ${x},905`,'#566965');
   s+=poly('365,970 365,894 400,862 435,894 435,970','#455c60');
 }else if(i===5){s+=rect(230,820,360,150,stone)+poly('210,820 400,755 610,820','#657a78')+tower(355,550,90,420,stone,true)+tower(130,715,95,255,'#bba68e');
 }else if(i===12){for(let j=0;j<3;j++)s+=rect(205+j*115,760+j%2*35,108,210-j%2*35,stone)+poly(`${200+j*115},${760+j%2*35} ${259+j*115},${699+j%2*35} ${318+j*115},${760+j%2*35}`,'#647579');s+=tower(525,620,70,350,stone,true);
 }else if(i===7||i===13){s+=rect(190,825,420,145,stone)+tower(230,715,80,255,stone)+tower(490,715,80,255,stone)+poly('355,970 355,883 400,849 445,883 445,970','#455c60');
 }else{const wide=i===10?330:i===2?230:190,x=400-wide/2,y=i===3?540:i===9?625:650;s+=rect(x,y,wide,970-y,stone)+poly(`${x+wide*.75},${y} ${x+wide},${y} ${x+wide},970 ${x+wide*.75},970`,'#00000020');for(let j=0;j<7;j++)s+=rect(x+j*wide/7,y-20,wide/11,25,stone);for(const tx of [x-15,x+wide-50])s+=tower(tx,y-35,65,100,stone,i===2);for(let j=0;j<4;j++)s+=rect(x+35+j*(wide-50)/4,y+100,14,43,'#455c60');}
 if([3,8,9,13].includes(i)){s+=rect(0,935,800,100,'#5b929a');if(i===3)s+=poly('0,730 110,650 190,690 160,960 0,960','#d9d3b7');for(let j=0;j<2;j++){const x=125+j*530;s+=rect(x,745,5,240,'#72594b')+poly(`${x+5},755 ${x+5},930 ${x+90},930`,'#e9d8b4')+poly(`${x-55},975 ${x+100},975 ${x+75},1000 ${x-30},1000`,'#5f4d45');}}
 for(let j=0;j<12;j++){const h=65+(j*47+i*31)%105;s+=house(j*78-40,1000-h,74,h,j+i);}
 s+=house(-75,760+(i%3)*35,225,240-(i%3)*35,i)+house(650,795-(i%4)*20,240,205+(i%4)*20,i+2);
 // Residents' shoes touch this street at y=1050, behind the stage.
 s+=rect(0,1000,800,80,'#a9a591');for(let j=0;j<22;j++)s+=line(`M${j*41} 1020l27 -2 M${j*41+14} 1052l28 -1`,'#868f7e',2);
 s+=rect(0,1080,800,22,'#ddbb85')+rect(0,1102,800,26,'#98735a')+rect(0,1128,800,72,'#665248');for(let j=0;j<12;j++)s+=rect(j*72,1110,3,84,'#423d39')+poly(`${j*72},1110 ${j*72+64},1110 ${j*72+59},1115 ${j*72+4},1115`,'#aa8865');
 s+=rect(0,1200,800,400,'#697b72');for(let j=0;j<60;j++){const x=(j*127+i*11)%800,y=1210+Math.floor(j/10)*63;s+=poly(`${x},${y} ${x+58},${y-3} ${x+68},${y+16} ${x+7},${y+20}`,'#7e8d80');}return s;
}
async function main(){
 await atlas('cast-heads-angular',64,128,128,i=>face(i%16,Math.floor(i/16)));
 await atlas('cast-bodies-angular',12,128,180,body);
 await atlas('cast-jesters-angular',4,128,240,i=>`<g transform="translate(0 65) scale(1 .97)">${body(i+4)}</g><g transform="translate(27 8) scale(.58)">${face(i+4)}</g>`+poly('36,25 42,7 69,2 87,13 97,28 82,29 72,16 59,17 52,29',clothes[i])+`<circle cx="91" cy="28" r="5" fill="#e4bd6c"/>`);
 await atlas('cast-weapons-angular',30,80,180,weapon);
 await image('executioner-angular',160,240,poly('47,77 111,77 133,104 141,156 120,184 34,184 18,153 27,104','#50616a')+poly('47,77 72,89 58,168 34,184 18,153 27,104','#6b7a7c')+poly('111,77 133,104 141,156 120,184 88,168 91,94','#344751')+poly('46,19 79,5 110,19 126,57 113,89 48,89 32,57','#344751')+poly('79,5 110,19 126,57 113,89 82,76 91,33','#22353f')+poly('46,19 79,5 69,36 40,64 32,57','#61737b')+poly('48,52 111,49 107,72 53,72','#bb9271')+poly('84,50 111,49 107,72 85,72','#95785f')+line('M58 58L67 56 M94 56L103 58',ink,4)+poly('48,89 80,82 113,89 100,162 62,165','#41535c')+line('M79 91L76 155','#829091',2)+rect(33,166,89,13,'#82644c')+rect(72,165,18,17,'#d3b476')+rect(76,169,10,9,'#665548')+poly('35,181 68,181 62,221 32,224',ink)+poly('91,181 120,181 125,224 96,223','#31434d')+poly('32,212 61,212 65,235 19,235 20,224','#4c4440')+poly('96,213 125,213 139,232 96,235','#443c38')+line('M23 230L61 230 M99 230L135 228','#bba57e',3));
 for(const [n,i]of [['oswin',1],['merrin',4],['agnes',6]])await image(n+'-angular',256,256,rect(0,0,256,256,'#526f6a')+`<g transform="translate(64 120)">${body(i)}</g><g transform="translate(47 2) scale(1.3)">${face(i)}</g>`);
 await image('cart-angular',480,200,rect(25,72,240,65,'#b88b59')+poly('195,72 265,72 265,137 195,137','#91664f')+rect(20,68,250,10,'#dfb87d')+poly('25,60 39,14 250,14 265,60','#739c90')+poly('145,14 250,14 265,60 145,60','#4e746c')+line('M145 15L145 60',paper,5)+line('M45 80L45 132 M95 80L95 132 M145 80L145 132 M195 80L195 132 M245 80L245 132','#795846',3)+rect(265,114,90,7,ink)+poly('336,69 393,59 425,82 417,107 349,104','#a78762')+poly('390,65 395,30 418,17 451,26 461,43 429,47 426,80','#a78762')+poly('393,59 425,82 417,107 386,103','#7e604e')+poly('410,25 411,8 420,21','#39434a')+rect(443,31,4,4,ink)+poly('344,96 358,98 355,157 343,159',ink)+poly('409,99 421,100 428,155 414,156',ink)+line('M336 78L324 106L322 130',ink,8)+rect(348,56,45,25,'#64867b')+rect(367,56,5,26,paper)+`<circle cx="65" cy="148" r="30" fill="${ink}"/><circle cx="225" cy="148" r="30" fill="${ink}"/><circle cx="65" cy="148" r="19" fill="#bba57e"/><circle cx="225" cy="148" r="19" fill="#bba57e"/>`+line('M65 130L65 166 M47 148L83 148 M225 130L225 166 M207 148L243 148',ink,4));
 const towns=['york','canterbury','london','dover','durham','norwich','winchester','chester','hull','newcastle','colchester','lincoln','oxford','southampton','gloucester'];
 for(let i=0;i<towns.length;i++)await image(towns[i]+'-angular',800,1600,town(i));
 await image('road-angular',800,1600,poly('0,680 130,510 290,740 470,440 800,650 800,1600 0,1600','#72846d')+poly('0,960 240,780 410,1030 680,800 800,880 800,1600 0,1600','#4f685d')+rect(0,1205,800,260,'#c3ac83')+rect(0,1215,800,10,'#a79675')+line('M0 1310L800 1310 M0 1370L800 1370','#b19b77',4));
 console.log('Original angular cast, expressions, weapons, portraits, towns and road rendered.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
