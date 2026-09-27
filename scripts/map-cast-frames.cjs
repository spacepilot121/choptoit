// Read alpha bounds to describe sprite frames. Source PNG pixels stay intact.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
(async()=>{
  for(const [name,cols,rows] of [['heads',4,4],['bodies',2,2],['jesters',2,2],['weapons',5,6]]) {
    const file=path.join(__dirname,`../assets/cast-${name}-v2.png`);
    const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const frames={};
    const cuts=Array.from({length:cols},(_,col)=>Array.from({length:rows+1},(_,row)=>{
      const expected=Math.floor(row*info.height/rows);
      if(name!=='weapons'||row===0||row===rows) return expected;
      const left=Math.floor(col*info.width/cols),right=Math.floor((col+1)*info.width/cols);
      let best=expected,bestCount=Infinity;
      const searchRadius=Math.floor(info.height/rows/3);
      for(let y=expected-searchRadius;y<=expected+searchRadius;y++) {
        let count=0;
        for(let x=left;x<right;x++) if(data[(y*info.width+x)*4+3]>30) count++;
        if(count<bestCount||(count===bestCount&&Math.abs(y-expected)<Math.abs(best-expected))) {best=y;bestCount=count;}
      }
      if(bestCount>0) throw new Error(`Weapon sprites overlap: column ${col}, row ${row}, ${bestCount} alpha pixels at best separator`);
      return best;
    }));
    for(let row=0;row<rows;row++) for(let col=0;col<cols;col++) {
      const x0=Math.floor(col*info.width/cols),x1=Math.floor((col+1)*info.width/cols);
      const y0=cuts[col][row],y1=cuts[col][row+1];
      let left=x1,top=y1,right=x0,bottom=y0;
      for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) if(data[(y*info.width+x)*4+3]>30) {left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
      if(left>=right) throw new Error('Empty sprite cell');
      const w=right-left+1,h=bottom-top+1;
      frames[String(row*cols+col)]={frame:{x:left,y:top,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};
    }
    fs.writeFileSync(file.replace('.png','.json'),JSON.stringify({frames,meta:{image:path.basename(file),size:{w:info.width,h:info.height},scale:'1'}},null,2)+'\n');
    console.log(`${name}: ${Object.keys(frames).length} alpha-bounded frames`);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
