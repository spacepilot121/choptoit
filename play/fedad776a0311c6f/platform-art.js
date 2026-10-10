(function(root){
 const levels=25;
 const names=['Rough timber','Town scaffold','Painted playhouse','Guild stage','Royal theatre'];
 const cost=level=>level>=levels?0:Math.round(150*Math.pow(1.4,level-1));
 const boost=level=>1+(level-1)*.05;
 function buy(player){const level=player.platformLevel || 1,price=cost(level);if(level>=levels||!Number.isFinite(player.gold)||player.gold<price)return false;player.gold-=price;player.platformLevel=level+1;return true;}
 function markup(level){const n=Math.max(1,Math.min(levels,level)),tier=Math.floor((n-1)/5),detail=(n-1)%5;
 const wood=['#79604b','#956d4c','#855c4b','#654d44','#4a535a'][tier],trim=['#b89467','#c5a375','#d6af66','#e5bf73','#edcf85'][tier],cloth=['#9b5545','#557c71','#a35357','#536d91','#765778'][tier];
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="800" height="140" viewBox="0 0 800 140"><path d="M0 0H800V21H0z" fill="'+trim+'"/><path d="M0 21H800V124H0z" fill="'+wood+'"/><path d="M0 124H800V140H0z" fill="#344442"/>';
 for(let i=0;i<16;i++){let x=i*50;s+='<path d="M'+x+' 23v98m5-86h38m-32 18h26m-29 23h33m-31 24h24" stroke="#d6b28c" stroke-opacity=".32" stroke-width="2"/>';if(detail>=1||tier)s+='<circle cx="'+(x+8)+'" cy="30" r="3" fill="'+trim+'"/>';}
 for(let i=0;i<2+detail+tier;i++){const x=40+i*(720/(1+detail+tier));s+='<path d="M'+x+' 24v98" stroke="'+trim+'" stroke-width="'+(4+tier*2)+'"/>';}
 if(n>=6)for(let i=0;i<7;i++){let x=30+i*112;s+='<path d="M'+x+' 23h80v45l-40 18-40-18z" fill="'+cloth+'"/><path d="M'+(x+40)+' 30l12 17-12 17-12-17z" fill="'+trim+'"/>';}
 if(n>=11)s+='<path d="M0 107H800M0 117H800" stroke="'+trim+'" stroke-width="3"/>';
 if(n>=16)for(let i=0;i<10;i++){let x=15+i*80;s+='<path d="M'+x+' 94l12-14 12 14-12 14z" fill="'+trim+'"/>';}
 if(n>=21)for(let i=0;i<7;i++){let x=70+i*110;s+='<path d="M'+x+' 64l-12-14 4 20h16l4-20z" fill="#f2d18b"/><circle cx="'+x+'" cy="71" r="4" fill="#c56363"/>';}
 for(let i=0;i<n;i++){const x=10+i*31;s+='<path d="M'+x+' 5h20v4h-20z" fill="#fff0bc" opacity=".6"/>';}
 return s+'</svg>';
 }
 const api={levels,cost,boost,buy,markup,name:level=>names[Math.floor((Math.max(1,Math.min(levels,level))-1)/5)]};
 if(typeof module!=='undefined')module.exports=api;else root.PlatformArt=api;
})(typeof window!=='undefined'?window:globalThis);
