(function (root) {
  'use strict';
  function advanceMeter(position, direction, speed, seconds, min = 250, max = 550) {
    const width = max - min;
    const phase = direction > 0 ? position - min : 2 * width - (position - min);
    const next = ((phase + speed * Math.max(0, seconds)) % (2 * width) + 2 * width) % (2 * width);
    return { position: min + (next <= width ? next : 2 * width - next), direction: next < width ? 1 : -1 };
  }
  // Each town has an export and a demand. Daily variation cannot erase the
  // margin between an export town and its buyer, but travel consumes days.
  const tradeProfiles = {
    York:['Wool','Spices'], Durham:['Salt','Wool'], Chester:['Mead','Salt'],
    Hull:['Iron Ore','Potatoes'], Newcastle:['Potatoes','Iron Ore'], Lincoln:['Ale Barrels','Wool'],
    Canterbury:['Tanned Leather','Ale Barrels'], London:['Silver Cups','Mead'],
    Dover:['Spices','Tanned Leather'], Norwich:['Gemstones','Silver Cups'],
    Winchester:['Obsidian Shards','Gemstones'], Colchester:['Blood Runes','Obsidian Shards'],
    Oxford:['Cursed Guillotine Blades','Blood Runes'], Southampton:['Dragon Eggs','Cursed Guillotine Blades'],
    Gloucester:['Wool','Dragon Eggs']
  };
  function tradeRole(city, item) {
    const profile = tradeProfiles[city] || [];
    return profile[0] === item ? 'export' : profile[1] === item ? 'demand' : 'ordinary';
  }
  function marketQuote(city, item, variation = 1, buySpecial = false, sellSpecial = false) {
    const role = tradeRole(city,item.name);
    const base = item.buy;
    const shift = Math.min(1.1,Math.max(.9,variation));
    const buyRate = role === 'export' ? .55 : role === 'demand' ? 1.4 : 1;
    const sellRate = role === 'export' ? .42 : role === 'demand' ? 1.12 : .7;
    const buy = Math.max(1,Math.round(base * buyRate * shift * (buySpecial ? .8 : 1)));
    const sell = Math.min(buy,Math.max(1,Math.round(base * sellRate * shift * (sellSpecial ? 1.15 : 1))));
    return {buy,sell};
  }
  function affordableQuantity(gold, price, stock, freeSpace) {
    if (![gold,price,stock,freeSpace].every(Number.isFinite) || price <= 0) return 0;
    return Math.max(0,Math.min(Math.floor(gold/price),Math.floor(stock),Math.floor(freeSpace)));
  }
  function launchVelocity(angle, power, weaponMultiplier=1, wind={x:0,y:0}) {
    const radians=angle*Math.PI/180, speed=250*power*weaponMultiplier;
    return {x:Math.sin(radians)*speed+wind.x,y:-Math.cos(radians)*speed+wind.y};
  }
  function launchPreview(angle,power,weaponMultiplier=1,wind={x:0,y:0},rain=false) {
    let {x:vx,y:vy}=launchVelocity(angle,power,weaponMultiplier,wind);
    let x=0,y=0,fallingInRain=false;
    const points=[],dt=1/60;
    for(let frame=1;frame<=40;frame++) {
      if(rain && vy>0) fallingInRain=true;
      vx=Math.sign(vx)*Math.max(0,Math.abs(vx)-50*dt);
      vy+=(fallingInRain?(rain==='snow'?520:700):400)*dt;
      x+=vx*dt;y+=vy*dt;
      if(frame%5===0) points.push({x,y});
    }
    return points;
  }
  function targetProfile(city,rank=1,blade=1,roll=50) {
    const veteran=rank>=7,advanced=blade>=4;
    const highTown=['London','Lincoln','Newcastle','Gloucester'].includes(city);
    const lively=['Chester','Norwich','Hull','Southampton'].includes(city);
    const high=advanced && (highTown || veteran) && roll<= (highTown?45:25);
    const moving=roll<= (lively?70:highTown?55:veteran?45:city==='York'?15:35);
    return {high,moving,amplitude:high?50:lively?42:26,duration:Math.max(650,(lively?1100:1500)-Math.min(8,rank-1)*65),reward:high?(highTown?3:2):moving?2:1};
  }
  function basketMultiplier(city,rank=1,blade=1) {
    if(city==='Hull'||city==='Southampton')return 2;
    if(city==='Chester'||city==='Norwich')return blade>=4?3:2;
    if(city==='Oxford')return blade>=8?4:blade>=4?3:2;
    if(city==='York'&&rank>=7)return 2;
    return 0;
  }
  function debugGrant(player,cities) { player.gold=Math.min(Number.MAX_SAFE_INTEGER,player.gold+1000000);cities.forEach(city=>{city.unlocked=true;}); }
  function cityKeyCost(city) { return city.name==='York'?0:50+city.fameReq*50; }
  function buyCityKey(city,player,rank=1) {
    if(!city || city.unlocked || rank<Math.max(1,city.fameReq) || player.gold<cityKeyCost(city))return false;
    player.gold-=cityKeyCost(city);city.unlocked=true;return true;
  }
  function basketCatch(previous,current,basket,radius=12) {
    if(!basket || current.y<=previous.y)return false;
    const before=previous.y+radius-basket.y,after=current.y+radius-basket.y;
    if(before>0 || after<0)return false;
    const t=-before/(after-before || 1),headX=previous.x+(current.x-previous.x)*t;
    const basketX=(basket.previousX??basket.x)+(basket.x-(basket.previousX??basket.x))*t;
    // A head's centre must enter the mouth; its full circular silhouette needn't fit inside.
    return Math.abs(headX-basketX)<=Math.max(0,basket.halfWidth-radius*.5);
  }
  function comboName(count,kind='chops') {
    const tiers=kind==='targets'?[[5,'CROWD PLEASER!'],[4,'HEAD PARADE!'],[3,'HAT TRICK!'],[2,'DOUBLE TROUBLE!']]:[[20,'AXE LEGEND!'],[12,'ROYAL FLUSH!'],[8,'GRAVY TRAIN!'],[5,'HEADS WILL ROLL!'],[3,'CHOP CHOP!'],[2,'A CUT ABOVE!']];
    return tiers.find(([threshold])=>count>=threshold)?.[1] || 'NICE CHOP!';
  }
  function castUnlocked(rank=1){return {faces:Math.min(100,16+Math.max(0,rank-1)*6),bodies:Math.min(100,12+Math.max(0,rank-1)*7)};}
  const api = { advanceMeter, tradeProfiles, tradeRole, marketQuote, affordableQuantity, launchVelocity, launchPreview,targetProfile,debugGrant,cityKeyCost,buyCityKey,basketMultiplier,basketCatch,comboName,castUnlocked };
  if (typeof module !== 'undefined') module.exports = api;
  else root.ChopCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
