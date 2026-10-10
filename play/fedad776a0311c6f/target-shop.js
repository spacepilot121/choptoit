(function(root){
  const catalog=[
    ['red','York','Red bullseye',0,'standard','A steady red target: learn the launch.',{}],
    ['red-bob','York','Red bobber',0,'standard','Rises and falls on an extending pole.',{motion:'vertical',reward:2}],
    ['red-sway','York','Red swinger',0,'standard','Swings from side to side.',{motion:'horizontal',reward:2}],
    ['green','Durham','Emerald bullseye',100,'standard','Green targets pay twice the fame.',{green:true,reward:2}],
    ['green-orbit','Durham','Emerald orbit',160,'standard','Circles in an oval: time both height and direction.',{green:true,motion:'orbit',reward:3}],
    ['barrel','Newcastle','Pocket powder barrel',180,'explodingBarrel','A small blast with a short fuse.',{size:1,fuse:400}],
    ['barrel-medium','Newcastle','Powder keg',260,'explodingBarrel','A larger blast with a longer fuse for chaining nearby hits.',{size:2,fuse:1100}],
    ['basket','Chester','Market basket',350,'basket','A broad basket pauses along its route. Bank the shot for 2× gold.',{multiplier:2,pace:1}],
    ['basket-runner','Chester','Running basket',500,'basket','A smaller basket moves without pauses. Bank the shot for 3× gold.',{multiplier:3,pace:1.5,continuous:true}],
    ['shield','Hull','Dockside shield',550,'woodenShield','A steady armoured target: use more strike power.',{}],
    ['shield-sway','Hull','Swinging shield',650,'woodenShield','Armour sways sideways: combine power and timing.',{motion:'horizontal',reward:2}],
    ['high','Lincoln','Cathedral spire',700,'standard','A high green target worth triple fame.',{high:true,green:true,reward:3}],
    ['high-bob','Lincoln','Rising spire',850,'standard','A tall target rises and falls above the square.',{high:true,green:true,motion:'vertical',reward:4}],
    ['monk','Canterbury','Rising halo',900,'standard','A golden halo rises and falls, rewarding a clean hit.',{color:0xe5d6a3,motion:'vertical',reward:4}],
    ['halo-orbit','Canterbury','Orbiting halo',1050,'standard','A cream and gold target loops in an oval.',{color:0xe5d6a3,motion:'orbit',reward:5}],
    ['royal','London','Royal visitor',1100,'royal','A crowned visitor stops to pose. Earn five times the fame.',{}],
    ['royal-courier','London','Royal courier',1300,'royal','A crowned courier crosses the whole square quickly: 10× fame.',{courier:true,reward:2}],
    ['barrel-drift','Dover','Rocking smuggler keg',1400,'explodingBarrel','A medium keg swings sideways before a quick blast.',{size:2,fuse:550,motion:'horizontal'}],
    ['barrel-siege','Dover','Harbour powder store',1650,'explodingBarrel','A huge, slow-fuse barrel reaches many neighbouring targets.',{size:3,fuse:1500}],
    ['nimble','Norwich','Quickstep bullseye',1750,'standard','A green target changes direction sharply.',{green:true,motion:'zigzag',period:850,reward:4}],
    ['sway','Norwich','Whirling bullseye',1950,'standard','A fast oval flight needs precise timing.',{green:true,motion:'orbit',period:900,reward:4}],
    ['rings','Winchester','The ring troupe',2100,'event','Knights throw rings to thread. Requires blade level 8.',{}],
    ['needle','Winchester','Needle-eye bullseye',2350,'standard','A small gold bullseye bobs vertically. Six times the fame.',{color:0xe2bd6b,motion:'vertical',radius:14,reward:6}],
    ['barrel-large','Colchester','Siege powder barrel',2500,'explodingBarrel','The largest blast on a short fuse.',{size:3,fuse:450}],
    ['barrel-bob','Colchester','Bobbing powder barrel',2700,'explodingBarrel','A little barrel rises and falls: trigger its fast chain blast.',{size:1,fuse:350,motion:'vertical'}],
    ['basket-three','Oxford','Scholar basket',2850,'basket','A smaller basket waits at each stop. Bank 3× gold.',{multiplier:3,pace:.85}],
    ['basket-four','Oxford','Exam basket',3200,'basket','A narrow basket never stops walking. Bank 4× gold.',{multiplier:4,pace:1.6,continuous:true}],
    ['basket-wide','Southampton','Cargo basket',3350,'basket','An extra broad basket cruises slowly without stopping. Bank 2× gold.',{multiplier:2,width:1.25,pace:.7,continuous:true}],
    ['basket-captain','Southampton','Captain’s basket',3600,'basket','A narrow basket pauses briefly, then hurries onwards. Bank 4× gold.',{multiplier:4,pace:1.3,pause:600}],
    ['island','Gloucester','Floating fairways',3900,'event','The floating golf-island challenge. Requires blade level 8.',{}],
    ['sky-orbit','Gloucester','Royal sky dancer',4300,'standard','A small high gold target traces a fast oval. Eight times the fame.',{high:true,color:0xe2bd6b,motion:'orbit',period:1000,radius:16,reward:8}]
  ].map(([id,city,name,cost,type,tip,options])=>({id,city,name,cost,type,tip,free:cost===0,...options}));
  const tricks=typeof module!=='undefined'?require('./special-targets.js'):root.SpecialTargets;
  catalog.push(...tricks.catalog);catalog.sort((a,b)=>tricks.catalog.findIndex(p=>p.city===a.city)-tricks.catalog.findIndex(p=>p.city===b.city));
  function motion(option,time,height){const phase=time*2*Math.PI/(option.period||1600),mode=option.motion;const amplitude=Math.min(45,height*.24);return {height:height+(['vertical','orbit'].includes(mode)?Math.sin(phase)*amplitude:0),angle:['horizontal','orbit','zigzag'].includes(mode)?Math.asin(Math.min(.5,55/height))*(mode==='zigzag'?2/Math.PI*Math.asin(Math.sin(phase)):Math.cos(phase)):0};}
  function create(){let owned=[],lastChoice=null,lastBasket=null;
    const owns=id=>catalog.some(p=>p.id===id&&p.free)||owned.includes(id);
    const enabled=(id,city)=>owns(id)||catalog.some(p=>p.id===id&&p.city===city);
    function restore(data){owned=catalog.filter(p=>!p.free&&Array.isArray(data)&&data.includes(p.id)).map(p=>p.id);lastChoice=null;}
    function available(visited){return catalog.map(p=>({...p,unlocked:p.free||visited.includes(p.city),owned:owns(p.id)}));}
    function buy(id,player,visited){const p=catalog.find(p=>p.id===id);if(!p||owns(id)||!visited.includes(p.city)||!Number.isFinite(player.gold)||player.gold<p.cost)return false;player.gold-=p.cost;owned.push(id);return true;}
    function choose(roll,city='York'){const pool=catalog.filter(p=>enabled(p.id,city)&&!['event','basket'].includes(p.type));const total=pool.reduce((n,p)=>n+(p.free?20:p.city===city?25:10),0);let ticket=Math.max(0,Math.min(.999999,(roll-1)/100))*total;lastChoice=pool.find(p=>{ticket-=p.free?20:p.city===city?25:10;return ticket<0;})||pool[0];return lastChoice;}
    function basket(city='York'){const pool=catalog.filter(p=>enabled(p.id,city)&&p.type==='basket');lastBasket=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;return lastBasket?.multiplier || 0;}
    return {catalog,get state(){return [...owned];},get lastChoice(){return lastChoice;},get lastBasket(){return lastBasket;},owns,enabled,restore,available,buy,choose,basket,motion};
  }
  if(typeof module!=='undefined')module.exports={catalog,create,motion};else root.TargetShop=create();
})(typeof window!=='undefined'?window:globalThis);
