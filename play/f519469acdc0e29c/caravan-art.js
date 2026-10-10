(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.CaravanArt=api;})(typeof window!=='undefined'?window:this,function(){
  const ink='#263c42',wood='#a9764e',gold='#d8b26b';
  const polygon=(points,fill)=>({kind:'polygon',points,fill});
  const rect=(x,y,w,h,fill)=>({kind:'rect',x,y,w,h,fill});
  const line=(points,fill,width=2)=>({kind:'line',points,fill,width});
  const circle=(x,y,r,fill)=>({kind:'circle',x,y,r,fill});
  function wagon(level){
    const width=150+Math.min(100,(level-3)*8),left=306-width,right=306,top=level<6?131:121;
    const paint=level<6?'#719084':level<9?'#527f87':level<12?'#8e5962':'#3f6e75';
    let shapes=[line([[right,180],[367,174]],wood,7),polygon([[left,top],[right-8,top-8],[right,top],[right,194],[left,194]],wood),polygon([[right-22,top],[right,top],[right,194],[right-22,185]],'#77583f'),rect(left-5,top-6,width+10,9,'#dbb47a')];
    for(let y=top+14;y<188;y+=15){shapes.push(line([[left+4,y],[right-24,y]],'#674f3f',2));for(let j=0;j<4;j++)shapes.push(line([[left+10+j*35,y-6],[left+23+j*35,y-4]],'#c59666',1));}
    for(let x=left+10;x<right-10;x+=38)shapes.push(rect(x,top+3,5,62,paint),circle(x+2,top+9,2,gold),circle(x+2,180,2,gold));
    shapes.push(rect(left-3,185,width+7,9,paint),rect(left+6,194,width-10,6,ink));
    for(let i=0;i<Math.min(7,level-2);i++){const x=left+15+i*(width-38)/Math.max(1,Math.min(6,level-3)),y=top-28-(i%3)*9;
      shapes.push(polygon([[x,y],[x+25,y-5],[x+31,y],[x+31,y+27],[x,y+27]],['#9c7753','#9d6250','#638575'][i%3]),rect(x+5,y,3,27,'#d4bb89'),line([[x+2,y+6],[x+28,y+21]],'#604d3d',2));}
    if(level>=6){const roof=top-78;
      shapes.push(polygon([[left-5,top-1],[left+8,roof+16],[left+24,roof],[right-27,roof],[right-9,roof+17],[right+3,top-1]],paint),polygon([[left-5,top-1],[left+8,roof+16],[left+24,roof],[left+width*.35,roof],[left+width*.26,top-1]],'#345b64'));
      for(let j=0;j<4;j++){const x=left+18+j*(width-36)/3;shapes.push(line([[x,top],[x+5,roof+14],[x+13,roof+4]],'#e7d6aa',4),line([[x+7,top-6],[x+11,roof+23]],'#adc0ab',1));}
      shapes.push(rect(left,top-8,width,8,'#d9bc81'));
      for(let x=left+6;x<right;x+=18)shapes.push(polygon([[x,top],[x+12,top],[x+6,top+10]],level>=12?gold:'#ded1ad'));
    }
    if(level>=9){for(const x of[left+7,right-6])shapes.push(line([[x,top-30],[x,top+1]],ink,3),rect(x-8,top-25,16,20,gold),rect(x-5,top-22,10,12,'#f7dfa0'),rect(x-2,top-22,2,12,'#8c7553'));
      shapes.push(polygon([[left+width*.5-17,151],[left+width*.5+17,151],[left+width*.5+13,174],[left+width*.5,184],[left+width*.5-13,174]],'#e0ba72'),line([[left+width*.5,156],[left+width*.5,174]],paint,4));}
    if(level>=12)shapes.push(line([[left+width*.45,top-77],[left+width*.45,15]],wood,4),polygon([[left+width*.45+2,17],[left+width*.45+62,22],[left+width*.45+47,38],[left+width*.45+2,33]],'#b95f54'),polygon([[left+width*.45+18,23],[left+width*.45+29,20],[left+width*.45+35,29],[left+width*.45+22,31]],gold));
    return {shapes,wheels:[left+27,right-28],radius:level>=9?30:26};
  }
  function horse(level){let shapes=[polygon([[0,48],[16,22],[102,23],[128,44],[112,76],[22,75]],'#ad8058'),polygon([[9,51],[30,31],[72,34],[91,61],[31,69]],'#c3996b'),polygon([[85,33],[108,15],[115,-30],[138,-47],[152,-29],[143,38],[123,70]],'#b78c61'),polygon([[109,12],[121,-29],[131,-36],[133,-3],[121,47]],'#d2aa7a'),polygon([[126,-45],[144,-57],[169,-47],[181,-27],[166,-16],[137,-21]],'#bd9267'),polygon([[158,-42],[181,-27],[166,-16],[157,-21]],'#8f6c50'),polygon([[127,-46],[126,-71],[135,-64],[139,-47]],'#9d7957'),polygon([[144,-53],[148,-73],[155,-69],[153,-48]],'#ad8058'),polygon([[105,20],[109,-20],[119,-41],[126,-47],[128,-22],[116,12]],'#574c42'),circle(151,-38,3,ink),circle(174,-25,2,'#5d5041'),line([[136,-42],[170,-29],[162,-18]],'#5b6252',4),line([[135,-26],[111,48],[35,61]],'#574d3f',4),rect(21,28,59,34,level===2?'#557c76':'#755b47'),line([[30,32],[30,57],[74,57]],'#ddc494',3)];
    if(level===2)shapes.push(polygon([[23,36],[67,32],[76,40],[73,75],[27,76]],'#688e83'),rect(33,36,4,38,gold),rect(58,36,4,38,gold),line([[27,50],[71,50]],'#345b59',2));
    if(level>=9)shapes.push(line([[121,-18],[117,23]],gold,4),polygon([[121,-17],[131,-8],[124,7],[115,-2]],'#b45f54'));
    return shapes;
  }
  function dog(){return [polygon([[0,17],[13,3],[46,4],[64,17],[52,38],[12,36]],'#bd9267'),polygon([[4,19],[22,8],[38,14],[32,30],[11,30]],'#dac09a'),polygon([[45,6],[54,-12],[73,-13],[89,-1],[88,11],[70,17],[55,17]],'#cda477'),polygon([[53,-11],[62,-6],[60,15],[52,7]],'#715641'),polygon([[75,-4],[89,-1],[88,11],[77,11]],'#e1c7a3'),circle(72,-6,2.3,ink),circle(89,1,3,ink),line([[57,14],[71,15]],'#537d72',4),circle(64,18,3,gold)];}
  function tree(kind=0){
    const evergreen=kind%4===3,colors=evergreen?['#3e6459','#547b66','#799277']:['#577858','#799260','#a2ad73'];
    const shapes=[polygon([[-9,0],[-5,-86],[-11,-138],[1,-165],[8,-128],[6,-77],[12,0]],'#77634a'),polygon([[1,-165],[8,-128],[6,-77],[12,0],[2,0]],'#514f3c'),line([[0,-65],[-26,-106],[-39,-113]],'#77634a',7),line([[1,-86],[30,-127],[43,-133]],'#77634a',6)];
    const clusters=evergreen?[[0,-178,29,32],[-8,-140,43,32],[4,-102,57,38]]:[[-32,-117,35,32],[32,-131,37,35],[-8,-158,39,36],[4,-104,40,31],[48,-106,25,27]];
    clusters.forEach(([x,y,w,h],i)=>{
      shapes.push(polygon([[x-w,y+3],[x-w*.83,y-h*.55],[x-w*.3,y-h],[x+w*.45,y-h*.93],[x+w,y-h*.2],[x+w*.88,y+h*.56],[x+w*.2,y+h],[x-w*.55,y+h*.8]],colors[0]));
      shapes.push(polygon([[x-w*.83,y-h*.55],[x-w*.3,y-h],[x+w*.45,y-h*.93],[x+w*.54,y-h*.2],[x-w*.2,y+h*.3],[x-w,y+3]],colors[1]));
      shapes.push(polygon([[x-w*.3,y-h],[x+w*.45,y-h*.93],[x+w*.54,y-h*.2],[x+w*.1,y-h*.04],[x-w*.2,y-h*.5]],colors[2]));
      for(let j=0;j<4;j++){const xx=x-w*.6+j*w*.35,yy=y+(j%2?8:-10);shapes.push(polygon([[xx,yy],[xx+6,yy-5],[xx+14,yy-3],[xx+9,yy+4]],colors[(i+j)%3]));}
    });
    shapes.push(line([[-4,-50],[-2,-18]],'#b69a69',2));return shapes;
  }
  function svgShapes(shapes){return shapes.map(s=>s.kind==='polygon'?`<polygon points="${s.points.map(p=>p.join(',')).join(' ')}" fill="${s.fill}"/>`:s.kind==='rect'?`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.fill}"/>`:s.kind==='circle'?`<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.fill}"/>`:`<polyline points="${s.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${s.fill}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');}
  function markup(level){let s='';if(level>=3){const w=wagon(level);s+=svgShapes(w.shapes);for(const x of w.wheels){s+=`<circle cx="${x}" cy="205" r="${w.radius}" fill="${ink}"/><circle cx="${x}" cy="205" r="${w.radius-5}" fill="#ba9160"/>`;for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=`<path d="M${x} 205l${Math.cos(a)*(w.radius-7)} ${Math.sin(a)*(w.radius-7)}" stroke="#68503e" stroke-width="3"/>`;}s+=`<circle cx="${x}" cy="205" r="6" fill="${gold}"/>`;}}
    if(level>=2)s+='<g transform="translate(343 111)">'+svgShapes(horse(level))+svgShapes([line([[24,70],[18,109],[24,121]],'#7e614a',10),line([[106,66],[115,107],[113,121]],'#85674c',10),line([[0,42],[-15,66],[-12,86]],'#51463d',8)])+'</g>';
    s+='<g transform="translate(548 188)">'+svgShapes(dog())+svgShapes([line([[10,31],[7,47]],'#8d6d51',6),line([[51,29],[55,47]],'#8d6d51',6),line([[2,15],[-9,6],[-14,-5]],'#bd9267',7)])+'</g>';
    return `<svg xmlns="http://www.w3.org/2000/svg" class="item-art cart-art" role="img" aria-label="Caravan upgrade ${level}" viewBox="${level===1?'523 165 124 78':level===2?'315 35 330 210':'0 0 650 240'}">${s}</svg>`;
  }
  return {wagon,horse,dog,tree,svgShapes,markup};
});
