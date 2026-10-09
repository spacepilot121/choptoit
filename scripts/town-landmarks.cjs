// Original polygon interpretations of real landmarks, arranged for portrait play.
// This is a theatrical skyline, not a reconstruction of a single historical date.
const names=['York','Canterbury','London','Dover','Durham','Norwich','Winchester','Chester','Hull','Newcastle','Colchester','Lincoln','Oxford','Southampton','Gloucester'];
const labels=['York Minster, Shambles and Clifford’s Tower','Bell Harry and Canterbury Cathedral','White Tower and the Thames','Dover Castle and white cliffs','Durham Cathedral above the Wear','Norwich Cathedral spire and castle','Winchester Cathedral’s long nave','Chester Rows and city walls','Hull Minster and merchant waterfront','Newcastle Castle Keep and the Tyne','Colchester’s broad Norman keep','Lincoln Cathedral and castle on the hill','Magdalen Great Tower and college quadrangles','Southampton Bargate and harbour walls','Gloucester Cathedral’s pinnacled tower'];
const p=(points,c)=>`<polygon points="${points}" fill="${c}"/>`,r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const l=(d,c='#655f52',w=2)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
function window(x,y,w,h,glass='#648f97'){
  return p(`${x},${y+h} ${x},${y+12} ${x+w/2},${y} ${x+w},${y+12} ${x+w},${y+h}`,glass)+l(`M${x+w/2} ${y+3}v${h-3}M${x} ${y+h*.6}h${w}`,'#dfd5b6',3)+p(`${x+3},${y+14} ${x+w/2-2},${y+7} ${x+w/2-2},${y+h*.55} ${x+3},${y+h*.55}`,'#c9a967');
}
function masonry(x,y,w,h){let s='';for(let row=0;row<h/29;row++){const yy=y+row*29;s+=l(`M${x+3} ${yy}h${w-6}`,'#625b4d22',1);for(let xx=x+12+(row%2)*17;xx<x+w-6;xx+=35){s+=l(`M${xx} ${yy}v20`,'#625b4d22',1);if((row+Math.floor(xx/35))%4===0)s+=p(`${xx+2},${yy+2} ${Math.min(xx+29,x+w-4)},${yy+2} ${Math.min(xx+26,x+w-4)},${yy+12} ${xx+2},${yy+18}`,'#fff5d31a');}}return s;}
function tower(x,y,w,h,c,spire=false,lace=false,norman=false){let s=r(x,y,w,h,c)+p(`${x+w*.72},${y} ${x+w},${y} ${x+w},${y+h} ${x+w*.72},${y+h}`,'#00000020')+masonry(x,y,w,h);
  s+=spire?p(`${x-8},${y} ${x+w/2},${y-190} ${x+w+8},${y}`,'#708680')+p(`${x+w/2},${y-190} ${x+w+8},${y} ${x+w/2},${y}`,'#00000023'):r(x-5,y-10,w+10,12,c);
  if(!norman)for(const dx of[0,w-10])s+=r(x+dx-2,y-23,12,h+23,c)+p(`${x+dx-4},${y-23} ${x+dx+4},${y-45} ${x+dx+12},${y-23}`,c);
  for(let yy=y+23;yy<y+h-30;yy+=76)s+=window(x+18,yy,w*.22,46)+window(x+w*.58,yy,w*.18,46)+r(x-4,yy+54,w+8,4,'#eee1bf');
  if(lace)for(let xx=x+9;xx<x+w-8;xx+=14)s+=l(`M${xx} ${y+8}v58`,'#eee1bf',2);
  if(norman){s+=r(x-5,y-14,w+10,15,c);for(let xx=x-3;xx<x+w;xx+=21)s+=r(xx,y-27,12,17,c);s+=r(x+10,y+4,8,h-8,'#e1ccb266');}
  return s;
}
function cathedral({x=185,w=430,roof=735,top=510,c='#d9c7a5',twin=false,spire=false,lace=false,long=false,norman=false}){
  const height=970-roof;
  let s=tower(x+w*.46-35,top,78,970-top,c,spire,lace,norman);
  s+=r(x,roof,w,height,c)+p(`${x-12},${roof} ${x+w*.5},${roof-88} ${x+w+12},${roof}`,'#627d7b')+p(`${x+w*.5},${roof-88} ${x+w+12},${roof} ${x+w*.54},${roof}`,'#3b5963');
  s+=masonry(x,roof,w,height);
  if(twin)s+=tower(x+10,top+30,73,940-top,c,false,lace,norman)+tower(x+w-83,top+30,73,940-top,c,false,lace,norman);
  for(let xx=x+20;xx<x+w-30;xx+=47)s+=window(xx,roof+27,24,108)+r(xx-8,roof+18,6,height-18,'#b29f7f')+p(`${xx-9},${roof+18} ${xx-4},${roof-5} ${xx+1},${roof+18}`,c);
  s+=window(x+w/2-39,roof-41,78,long?120:145,'#55788a')+p(`${x+w/2-28},${roof+70} ${x+w/2},${roof+49} ${x+w/2+28},${roof+70} ${x+w/2+20},${roof+91} ${x+w/2-20},${roof+91}`,'#ba6857')+l(`M${x+w/2} ${roof-32}v125`,'#e9d8b4',4);
  return s;
}
function keep(x,y,w,h,c='#c5ad85',white=false){let s=r(x,y,w,h,c)+p(`${x+w*.78},${y} ${x+w},${y} ${x+w},${y+h} ${x+w*.78},${y+h}`,'#00000022')+masonry(x,y,w,h);
  for(let xx=x-4;xx<x+w;xx+=25)s+=r(xx,y-18,16,22,c);
  for(const tx of[x-10,x+w-32]){s+=r(tx,y-28,42,h+28,c)+masonry(tx,y-28,42,h+28);if(white)s+=p(`${tx-4},${y-28} ${tx+21},${y-65} ${tx+46},${y-28}`,'#526778');}
  for(let yy=y+45;yy<y+h-35;yy+=71)for(let xx=x+45;xx<x+w-25;xx+=55)s+=window(xx,yy,17,31,'#455c60');
  s+=p(`${x+w/2-20},${y+h} ${x+w/2-20},${y+h-63} ${x+w/2},${y+h-86} ${x+w/2+20},${y+h-63} ${x+w/2+20},${y+h}`,'#41545b');return s;
}
function bridge(y,c='#bca686'){
  let d=`M0 ${y}H800V${y+76}H0Z`;
  for(let x=20;x<800;x+=112)d+=`M${x} ${y+77}V${y+49}L${x+12} ${y+28}L${x+38} ${y+18}L${x+64} ${y+28}L${x+76} ${y+49}V${y+77}Z`;
  return `<path d="${d}" fill="${c}" fill-rule="evenodd"/>`+r(0,y-9,800,11,c)+l(`M0 ${y+3}H800`,'#e5d7b7',3);
}
function detail(i){
  // Grounded civic details: walls, garden plots, quay fittings and carved doorways.
  let s='';const ports=[2,3,8,9,13].includes(i);
  if(ports){for(const x of[175,625])s+=r(x,966,9,33,'#665647')+r(x-6,960,21,9,'#938b73')+l(`M${x+5} 976q22 10 38 0`,'#d1ba89',3);for(let j=0;j<16;j++)s+=l(`M${j*53} ${948+(j%3)*13}h${17+(j%4)*6}`,'#bbd0c2',2);}
  else {for(let x=170;x<640;x+=78)s+=p(`${x},977 ${x+12},951 ${x+33},944 ${x+52},958 ${x+59},977`,'#677f67')+p(`${x+12},965 ${x+24},949 ${x+40},955 ${x+32},974`,'#99ab76');}
  for(const x of[162,621])s+=r(x,968,18,30,'#b7a383')+r(x-4,965,26,5,'#dccbac')+masonry(x,969,18,26);
  return s;
}
function draw(i){let s=`<title>${labels[i]}</title>`;
  switch(names[i]){
    case 'York': s+=cathedral({top:485,twin:true,c:'#e0cfaa'})+p('550,790 625,730 710,790 735,900 530,900','#8d9a79')+p('574,706 586,685 612,676 635,680 661,677 686,690 697,712 691,808 576,808','#c9b38b')+p('661,677 686,690 697,712 691,808 665,808','#a58e72')+masonry(585,712,99,88)+window(610,727,14,31)+window(656,724,14,31)+r(574,703,122,8,'#e2cfaa');break;
    case 'Canterbury':s+=cathedral({x:170,w:475,top:455,c:'#c8c4af'})+tower(180,630,61,315,'#c8c4af')+tower(565,595,62,350,'#c8c4af');break;
    case 'London':s+=r(0,910,800,110,'#5b8290')+keep(257,570,282,340,'#e2dac4',true)+keep(170,755,73,155,'#b6b4a4')+keep(560,732,77,178,'#b6b4a4')+bridge(935);break;
    case 'Dover':s+=p('0,680 145,624 270,690 205,933 0,956','#e8e1c7')+p('0,753 93,770 159,706 126,918 0,955','#bcbda7')+p('100,680 245,634 618,702 715,920 159,920','#8d9f78')+keep(298,493,215,283,'#d7c9ad')+keep(211,660,67,188,'#c1b99e');break;
    case 'Durham':s+=p('130,790 272,739 629,755 698,940 98,940','#869579')+r(0,930,800,77,'#647f8a')+cathedral({x:215,w:405,roof:727,top:525,twin:true,c:'#b9a98f',norman:true})+bridge(941,'#a8997d');break;
    case 'Norwich':s+=cathedral({x:230,w:375,roof:765,top:580,spire:true,c:'#d8ceb0'})+keep(105,698,125,150,'#baa989');break;
    case 'Winchester':s+=cathedral({x:135,w:535,roof:715,top:580,c:'#d5c2a0',long:true})+r(171,920,460,24,'#b49c7e');break;
    case 'Chester':s+=keep(289,636,211,264,'#c7866a')+r(160,862,490,85,'#aa705d')+bridge(903,'#a97762');break;
    case 'Hull':{
      s+=r(0,950,800,65,'#618d98');
      // A broad parish church with pale tower dressings and brick transepts.
      s+=cathedral({x:220,w:379,roof:786,top:588,c:'#c3b398',long:true});
      for(const x of[223,510])s+=r(x,835,85,114,'#ae765f')+masonry(x,836,85,108)+window(x+18,853,49,77)+r(x-3,942,91,7,'#d8c6a2');
      for(const x of[155,616]){s+=r(x,843,52,104,'#a77660')+p(`${x-3},843 ${x+26},812 ${x+55},843`,'#6e5b58')+window(x+12,859,27,38)+r(x+11,909,29,38,'#5a655e');}
      for(const x of[160,612])s+=r(x,948,8,47,'#715f4a')+r(x-7,945,22,5,'#baa887')+l(`M${x+3} 967q22 13 40 0`,'#d0b68a',3);
      s+=r(0,970,800,14,'#b4aa8c')+r(0,970,800,4,'#dbceb0');
      break;
    }
    case 'Newcastle':s+=p('90,786 345,732 588,795 718,933 54,933','#81916e')+keep(280,555,215,342,'#b69e7f')+keep(537,731,83,159,'#8f8875')+r(0,940,800,72,'#5a8490')+bridge(904,'#afa17e');break;
    case 'Colchester':s+=keep(208,665,388,278,'#b99f7d')+r(220,801,360,8,'#a77e69')+r(220,883,360,8,'#a77e69');break;
    case 'Lincoln':s+=p('80,840 280,660 465,650 706,852 800,978 0,978','#8d9a73')+cathedral({x:207,w:401,roof:706,top:379,twin:true,c:'#d6c99d'})+keep(112,732,82,163,'#a89571');break;
    case 'Oxford':s+=r(203,739,384,231,'#c7bba1');for(let x=220;x<570;x+=48)s+=window(x,786,24,83);s+=tower(511,447,77,515,'#d6c7a5',false,true)+keep(202,698,64,265,'#bcb494')+p('284,739 332,667 390,739','#728176');break;
    case 'Southampton':s+=r(130,834,520,122,'#c5b99c')+keep(290,659,215,288,'#c9b797')+tower(240,765,54,188,'#c5b99c')+tower(533,765,54,188,'#c5b99c')+p('350,947 350,838 369,818 409,818 430,838 430,947','#41545b')+l('M355 850h70M357 869h68M358 889h65','#82765f',3)+r(0,947,800,73,'#638c95');break;
    case 'Gloucester':s+=cathedral({x:189,w:437,roof:747,top:429,c:'#dccaaa',lace:true})+window(294,666,122,141,'#7496a2');break;
  }
  return s+detail(i);
}
module.exports={draw,names,labels};
