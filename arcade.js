(function(root){
  const challenges=[
    ['first-show','Opening act','Land 10 chops','chops',10,100],
    ['clean-cut','Clean sweep','Land 10 perfect chops','perfects',10,250],
    ['streak-five','Heads will roll','Reach a 5-chop streak','bestCombo',5,200],
    ['streak-twelve','Royal flush','Reach a 12-chop streak','bestCombo',12,750],
    ['catch','Basket case','Catch a head in a basket','catches',1,200],
    ['catch-ten','Special delivery','Make 10 basket catches','catches',10,1000],
    ['hat-trick','Hat trick','Hit 3 targets with one head','bestChain',3,500],
    ['chain-five','Pinball wizard','Hit 5 targets with one head','bestChain',5,1500],
    ['bank','Nothing but neck','Hit a target, then catch that head','bankShots',1,750],
    ['boom','Chain reaction','Set off 5 explosive barrels','barrels',5,500],
    ['weather','Storm chaser','Hit 10 targets in wind, rain or snow','weatherHits',10,600],
    ['collector','Faces of the kingdom','Collect 8 different faces','unique',8,1000]
  ].map(([id,title,tip,metric,goal,reward],i)=>({id,title,tip,metric,goal,reward,level:[1,2,2,5,3,6,3,7,4,3,4,5][i]}));
  const tours=[
    ['chops','The chopping tour','Land', 'chops',[25,50,100,200,350,500,750,1000]],
    ['perfects','The clean-cut club','Land','perfect chops',[15,25,40,60,90,130,180,250]],
    ['bestScore','The grand performance','Score','points in one town',[5000,10000,20000,40000,75000,120000,200000,350000]],
    ['bestCombo','The crowd goes wild','Reach','chops without a miss',[3,4,6,8,10,12,16,20]],
    ['bestChain','Pinball royalty','Hit','targets with one head',[2,3,4,5,6,7,8,9]],
    ['catches','Basket bonanza','Make','basket catches',[3,6,12,20,35,50,75,100]],
    ['bankShots','The banking guild','Make','target-to-basket bank shots',[2,4,8,12,20,30,45,60]],
    ['barrels','Powder party','Explode','barrels',[3,10,20,35,50,75,100,150]],
    ['weatherHits','Whatever the weather','Hit','targets in wind, rain or snow',[20,35,60,90,130,180,250,350]],
    ['unique','The royal portrait gallery','Collect','different faces',[12,24,36,48,60,72,84,100]],
    ['targets','The bullseye league','Hit','targets',[20,50,100,180,300,450,650,1000]]
  ];
  const medals=['Apprentice','Showman','Specialist','Veteran','Champion','Master','Royal favourite','Legend'];
  tours.forEach(([metric,title,verb,noun,goals],family)=>goals.forEach((goal,tier)=>challenges.push({id:'tour-'+family+'-'+tier,title:title+' · '+medals[tier],tip:verb+' '+goal.toLocaleString()+' '+noun+'.',metric,goal,reward:(tier+1)*(family+2)*100,level:metric==='unique'?Math.max(2,Math.ceil((goal-16)/6)+1):Math.min(14,2+tier+Math.floor(family/4))})));
  const clean=n=>Number.isSafeInteger(n)&&n>=0?n:0;
  const defaults=()=>({chops:0,score:0,bestScore:0,bestCombo:0,bestChain:0,perfects:0,catches:0,bankShots:0,barrels:0,weatherHits:0,targets:0,heads:Array(100).fill(0),missedHeads:Array(100).fill(0),claimed:[]});
  function create(){let state=defaults();
    function restore(data,legacyChops=0){state=defaults();if(data&&typeof data==='object'){for(const key of Object.keys(state))if(typeof state[key]==='number')state[key]=clean(data[key]);state.heads=state.heads.map((_,i)=>clean(data.heads?.[i]));state.missedHeads=state.missedHeads.map((_,i)=>clean(data.missedHeads?.[i]));state.claimed=challenges.filter(c=>data.claimed?.includes?.(c.id)).map(c=>c.id);}state.chops=Math.max(state.chops,clean(legacyChops));state.bestScore=Math.max(state.bestScore,state.score);}
    function points(n){state.score=Math.min(Number.MAX_SAFE_INTEGER,state.score+clean(Math.floor(n)));state.bestScore=Math.max(state.bestScore,state.score);return n;}
    function chop(face,streak,perfect){state.chops++;if(Number.isInteger(face)&&face>=0&&face<100)state.heads[face]++;state.bestCombo=Math.max(state.bestCombo,clean(streak));if(perfect)state.perfects++;return points(100*Math.min(12,1+Math.floor(streak/3))*(perfect?2:1));}
    function miss(face){if(Number.isInteger(face)&&face>=0&&face<100)state.missedHeads[face]++;}
    function target(chain,type,weather){state.targets++;state.bestChain=Math.max(state.bestChain,clean(chain));if(type==='explodingBarrel')state.barrels++;if(['wind','rain','snow'].includes(weather))state.weatherHits++;return points(250*Math.min(10,Math.max(1,chain)));}
    function catchHead(multiplier,chain){state.catches++;if(chain>0)state.bankShots++;return points((500+250*clean(chain))*Math.max(2,multiplier));}
    function progress(rank=1){return challenges.map(c=>({...c,current:c.metric==='unique'?state.heads.filter(n=>n>0).length:state[c.metric],locked:rank<c.level,claimed:state.claimed.includes(c.id)}));}
    function claim(id,rank=1){const c=progress(rank).find(c=>c.id===id);if(!c||c.locked||c.claimed||c.current<c.goal)return 0;state.claimed.push(id);return c.reward;}
    function newShow(){state.score=0;}
    return {get state(){return state;},restore,chop,miss,target,catchHead,points,progress,claim,newShow};
  }
  if(typeof module!=='undefined')module.exports={create,challenges};else root.Arcade=create();
})(typeof window!=='undefined'?window:globalThis);
