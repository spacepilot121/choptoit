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
  const api = { advanceMeter, tradeProfiles, tradeRole, marketQuote, affordableQuantity, launchVelocity, launchPreview };
  if (typeof module !== 'undefined') module.exports = api;
  else root.ChopCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
