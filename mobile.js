/* Readable mobile UI over the existing Phaser simulation. Menus pause the scene,
   so timers, physics and aim tweens all resume at exactly the same point. */
(() => {
  'use strict';
  let runtimeError=null;
  try{runtimeError=JSON.parse(localStorage.getItem('choptoit-runtime-error') || 'null');}catch(_){}
  function recordRuntimeError(event) {
    if(!event.error && !event.message)return;
    const message=String(event.error?.stack || event.message || 'Unknown runtime error');
    if(runtimeError?.message===message)return;
    runtimeError={message:message.slice(0,3000),file:String(event.filename || ''),line:event.lineno || 0,time:new Date().toISOString()};
    try{localStorage.setItem('choptoit-runtime-error',JSON.stringify(runtimeError));}catch(_){}
    try{toast('Game error recorded · open the ledger for details');}catch(_){}
  }
  window.addEventListener('error',recordRuntimeError);
  const ui = document.createElement('main');
  ui.id = 'mobile-ui';
  ui.hidden = true;
  ui.innerHTML = `
    <header class="mobile-hud">
      <div class="hud-row"><div class="hud-place"><strong id="hud-city">York</strong><small id="hud-date"></small></div><div class="hud-gold"><span id="hud-gold">0</span><small>GOLD IN YOUR PURSE</small><small id="hud-fame" aria-label="Fame"></small></div></div>
      <div class="hud-row hud-meta"><span id="hud-rank"></span><span id="hud-weather"></span></div><div class="rank-track"><i id="hud-xp"></i></div>
      <button id="contract-track" data-screen="journal" type="button"><small id="contract-caption"></small><span id="contract-next"></span><b aria-hidden="true">›</b></button>
      <button id="arcade-track" data-screen="journal" type="button"></button>
    </header>
    <div id="combo-banner" aria-hidden="true"></div><div class="mobile-toast" id="game-toast" role="status" hidden></div>
    <section class="mobile-controls" aria-label="Shot controls">
      <div class="shot-steps"><span id="step-timing">01 · TIMING</span><span id="step-aim">02 · AIM</span><span id="step-power">03 · POWER</span></div>
      <div class="shot-meter" id="shot-meter" aria-hidden="true"><i class="zone outer"></i><i class="zone middle"></i><i class="zone inner"></i><i class="needle"></i></div>
      <button id="shot-button" type="button">GET READY</button><p class="shot-hint" id="shot-hint">Your next customer is on the way.</p>
    </section>
    <nav class="mobile-nav" aria-label="Game menus"><button data-screen="workshop"><b>⚒</b>Workshop</button><button data-screen="market"><b>◇</b>Market</button><button data-screen="travel"><b>⌁</b>Travel</button><button data-screen="journal"><b>☷</b>Journal</button></nav>
    <section class="mobile-dialog" id="game-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" hidden>
      <header class="dialog-header"><div><small id="dialog-kicker">CHOP TO IT</small><h2 id="dialog-title"></h2></div><button id="dialog-close" aria-label="Return to game">×</button></header><div class="dialog-body" id="dialog-body"></div>
    </section>`;
  document.body.append(ui);
  const el = id => document.getElementById(id);
  let scene, screen = null, toastTimer, priorFocus, pendingHint = null;
  let introRead = false;
  let navigating = false;
  let travelLoading = false;
  let activeTravel = null;
  let loadingTimer, loadingFailed = false;
  let lastReadyChapter = -1;
  try { introRead = localStorage.getItem('choptoit-intro-read') === 'yes'; } catch (_) {}
  function toast(text, duration = 2300) {
    el('game-toast').textContent = text; el('game-toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el('game-toast').hidden = true; }, duration);
  }
  function showPendingHint() {
    if (!pendingHint || !scene || screen || el('game-loading')) return;
    toast(pendingHint, 4000);
    pendingHint = null;
  }
  function save() { if (navigating) return; SaveManager.performSave(); if (SaveManager.disabled && !SaveManager.conflict) toast('Saving is unavailable. Export a backup from the journal.'); }
  const stats = () => ({chops:killCount,weapon:player.weaponLevel,rank:level,fame});
  function arcadeMarkup(){
    const a=window.Arcade.state,unique=a.heads.filter(n=>n>0).length,cast=ChopCore.castUnlocked(level);
    const challenges=window.Arcade.progress(level),active=challenges.filter(c=>!c.locked&&!c.claimed),locked=challenges.filter(c=>c.locked&&!c.claimed),complete=challenges.filter(c=>c.claimed);
    const ready=active.filter(c=>c.current>=c.goal),unfinished=active.filter(c=>c.current<c.goal);
    const cards=list=>list.map(c=>`<article class="item-card challenge-card"><small>${c.claimed?'COMPLETED':c.locked?'UNLOCKS AT LEVEL '+c.level:Math.min(c.current,c.goal)+' / '+c.goal}</small><h3>${c.title}</h3><p>${c.tip}</p><button data-challenge="${c.id}" ${c.locked||c.claimed||c.current<c.goal?'disabled':''}>${c.claimed?'Reward collected':c.locked?'Level '+c.level+' required':'Collect '+c.reward+' gold'}</button></article>`).join('');
    return `<article class="item-card"><small>YOUR ARCADE RECORDS</small><div class="record-grid">${[['People beheaded',killCount],['People escaped',a.missedHeads.reduce((n,v)=>n+v,0)],['Best chop combo',a.bestCombo],['This town’s score',a.score],['Best town score',a.bestScore],['Targets in one shot',a.bestChain],['Basket catches',a.catches],['Perfect chops',a.perfects],['Bank shots',a.bankShots]].map(([label,n])=>`<div><b>${n.toLocaleString()}</b><small>${label}</small></div>`).join('')}</div><p>Scores build while you stay in a city. Travel starts a new performance; your records stay.</p></article><article class="item-card"><small>HEAD COLLECTION · ${unique} / 100 FACES</small><p>${cast.faces} faces and ${cast.bodies} bodies available at level ${level}. New combinations unlock as you level up; all 10,000 combinations are available at level 15.</p><p>Collected: successfully chopped. Missed: escaped after three misses. Both counts are kept for each face.</p><details><summary>Open the face collection</summary><div class="head-album">${a.heads.map((count,i)=>`<figure class="${count?'collected':a.missedHeads[i]?'missed':'unknown'}"><div role="img" aria-label="Face ${i+1}: ${count} collected, ${a.missedHeads[i]} missed" style="background-image:url('assets/cast-heads-angular.png');background-size:2000% 2000%;background-position:${(i%20)/19*100}% ${Math.floor((i+(!count&&a.missedHeads[i]?300:0))/20)/19*100}%"></div><figcaption>${count||a.missedHeads[i]?count+' collected · '+a.missedHeads[i]+' missed':i>=cast.faces?'Level '+(Math.ceil((i+1-16)/6)+1):'Not found'}</figcaption></figure>`).join('')}</div></details></article><h3>100 arcade challenges</h3><p>${complete.length} completed · ${active.length} available · ${locked.length} waiting for higher levels. Your lifetime progress counts towards newly unlocked milestones.</p>${cards(ready)}${cards(unfinished.slice(0,3))}<details class="challenge-section"><summary>More challenges · ${Math.max(0,unfinished.length-3)}</summary>${cards(unfinished.slice(3))}</details><details class="challenge-section"><summary>Coming next · ${locked.length} level-locked challenges</summary>${cards(locked.sort((a,b)=>a.level-b.level))}</details><details class="challenge-section"><summary>Completed · ${complete.length}</summary>${cards(complete)}</details>`;
  }
  function targetMarketMarkup(){
    const options=window.TargetShop.available(Campaign.state.visited);
    const art=p=>p.type==='special'?SpecialTargets.markup(p).replace(/<svg[^>]*>|<\/svg>/g,''):p.type==='explodingBarrel'?'<path d="M20 15h40l7 12v39l-7 12H20l-7-12V27z" fill="#aa7546"/><path d="M14 32h52M14 61h52" stroke="#e9bf72" stroke-width="7"/><path d="M40 14V7" stroke="#ef8964" stroke-width="5"/>':p.type==='basket'?'<path d="M8 34h64L63 73H17z" fill="#bd9660"/><path d="M10 34h60M17 47h46M21 59h38M27 36v35M40 36v35M53 36v35" stroke="#70543b" stroke-width="3"/>':p.type==='event'?'<path d="M7 47l24-19 39 14-24 26z" fill="#78ae91"/><path d="M43 43V12l20 7-20 6" stroke="#e6c774" stroke-width="3" fill="#bc6958"/>':'<circle cx="40" cy="43" r="29" fill="'+(p.type==='woodenShield'?'#aa7546':p.green?'#8bd1b2':p.free?'#ec805d':'#e1b665')+'"/><circle cx="40" cy="43" r="16" fill="#ede0bf"/><circle cx="40" cy="43" r="7" fill="#29414a"/>';
    const card=p=>'<article class="item-card target-shop-card"><svg class="target-shop-art" viewBox="'+(p.type==='special'?'0 0 128 128':'0 0 80 88')+'" aria-hidden="true">'+art(p)+'</svg><small>'+p.city.toUpperCase()+' · '+(p.free?'FREE YORK STARTER':p.owned?'ADDED TO EVERY CITY':p.unlocked?'DISCOVERED':'VISIT TO DISCOVER')+'</small><h3>'+p.name+'</h3><p>'+p.tip+'</p><button data-target-buy="'+p.id+'" '+(p.owned||!p.unlocked||player.gold<p.cost?'disabled':'')+'>'+(p.free?'Free · available everywhere':p.owned?'Owned · available everywhere':!p.unlocked?'Visit '+p.city:'Buy permanently · '+p.cost.toLocaleString()+' gold')+'</button></article>';
    const groups=[...new Set(options.map(p=>p.city))].map(name=>({name,options:options.filter(p=>p.city===name)}));
    const groupMarkup=group=>'<h3>'+group.name+' · '+group.options.length+' options</h3>'+group.options.map(card).join('');
    return '<p>Try each town’s targets free while you are there. After visiting, buy them once to add them to every city.</p>'+groups.filter(g=>g.options.some(p=>p.unlocked)).map(groupMarkup).join('')+'<details class="challenge-section"><summary>Discover targets in new cities</summary>'+groups.filter(g=>!g.options.some(p=>p.unlocked)).map(groupMarkup).join('')+'</details>';
  }
  function campaignMarkup() {
    const state = Campaign.state;
    if (state.ending) {
      const endings = {
        freedom:['The road is yours.','You count out one million and one coins. Oswin reaches for his fee. Agnes takes it first. “Processing,” she says. You leave the axe behind. At the city gate, Merrin is waiting with a cart and absolutely no plan. For the first time, that sounds wonderful.'],
        reform:['A different kind of office.','You buy the royal debt office, then unlock its doors. Agnes rewrites the books. Merrin becomes the least respectable public official in the kingdom. Your first order is a simple one: no sentence without a fair hearing. Oswin is given a very small desk.'],
        expired:['The year turns.','The clerk arrives before sunrise. You have not bought your way out. But the road has given you allies, and the ledger can no longer stay hidden. Merrin puts a hand on your shoulder. “Another route, then.” Your story deserves another attempt.']
      };
      const ending=endings[state.ending];
      return `<span class="eyebrow">${state.ending==='expired'?'THE DEADLINE':'CAMPAIGN COMPLETE'}</span><h3>${ending[0]}</h3><p class="journal-quote">${ending[1]}</p><article class="item-card"><small>YOUR STORY</small><p>${killCount} chops · ${state.targets} targets<br>${state.visited.length} towns · ${state.days} days<br>${state.claimed} of ${Campaign.chapters.length} contracts completed</p></article><p>You can keep playing freely after the ending, or start a new story below.</p>`;
    }
    const chapter=Campaign.chapters[state.claimed];
    if (!chapter) return `<span class="eyebrow">THE LAST PAGE · ${Math.max(0,360-state.days)} DAYS LEFT</span><h3>A million and one choices.</h3><p>The recovered money is yours. The road has changed you. Now decide what freedom means.</p><p>${Math.floor(player.gold).toLocaleString()} / 1,000,001 gold</p><button class="wide" data-ending="freedom" ${player.gold<1000001?'disabled':''}>Buy your freedom</button><button class="wide secondary" data-ending="reform" ${player.gold<1000001?'disabled':''}>Buy the office. Change the rules.</button><p>Either choice costs 1,000,001 gold and completes the campaign.</p>`;
    const progress=Campaign.progress(stats()), complete=progress.every(g=>g.current>=g.value);
    return `<span class="eyebrow">CHAPTER ${state.claimed+1} / ${Campaign.chapters.length} · ${Math.max(0,360-state.days)} DAYS LEFT</span><h3>${chapter.title}</h3><img class="journal-portrait" src="${chapter.portrait}" alt="${chapter.speaker}"><p><strong>${chapter.speaker}</strong></p><p class="journal-quote">${chapter.text}</p><article class="item-card"><small>YOUR CURRENT CONTRACT</small>${progress.map(g=>`<p>${g.current>=g.value?'✓':'○'} ${g.label}<br><small>${Math.min(g.current,g.value)} / ${g.value}</small></p>`).join('')}<button data-action="claim" ${complete?'':'disabled'}>Collect ${chapter.reward.toLocaleString()} gold</button></article><p>Contract rewards count toward your freedom. Open the ledger when a contract is ready.</p>`;
  }
  function close() {
    if (SaveManager.conflict || travelLoading) return;
    if (activeTravel) { activeTravel.scene.resume(); screen='journey';ui.hidden=true;return; }
    screen = null; el('game-dialog').hidden = true;
    ui.querySelectorAll('.mobile-hud,.mobile-controls,.mobile-nav').forEach(node => { node.inert = false; });
    if (scene?.scene.isPaused()) scene.scene.resume();
    priorFocus?.focus();
    showPendingHint();
  }
  function show(name) {
    if (!scene) return;
    const previousScreen = screen;
    const body = el('dialog-body');
    const scrollTop = body.scrollTop;
    const focused = previousScreen === name && body.contains(document.activeElement)
      ? document.activeElement.closest('button') : null;
    // Quantities and prices change after a trade; the item and action identify
    // the control that should keep focus when its card is rebuilt.
    const focusIdentity = focused ? Object.entries(focused.dataset).filter(([key]) => key !== 'quantity') : [];
    const wasBatch = focused?.hasAttribute('data-quantity');
    if (!screen) { priorFocus = document.activeElement; scene.scene.pause(); save(); }
    screen = name;
    ui.querySelectorAll('.mobile-hud,.mobile-controls,.mobile-nav').forEach(node => { node.inert = true; });
    el('game-dialog').hidden = false;
    el('dialog-kicker').textContent = `${currentCity.toUpperCase()} · ${Math.floor(player.gold).toLocaleString()} GOLD`;
    const titles = {workshop:'The workshop',market:'The target market',travel:'The open road',journal:'Your ledger',welcome:'A royal bargain',pause:'Take a breather'};
    el('dialog-title').textContent = titles[name] || 'Your ledger';
    el('dialog-close').hidden = name === 'conflict';
    if (name === 'conflict') {
      el('dialog-title').textContent='Your game moved on';
      body.innerHTML='<p>Another tab has changed your saved game. This copy is paused so it cannot overwrite that progress.</p><button class="wide" data-action="reload-save">Load latest progress</button><button class="wide secondary" data-action="export">Export this copy as a backup</button>';
    } else if (name === 'journey-pause') {
      el('dialog-title').textContent='A rest on the road';body.innerHTML='<p>Your caravan is waiting. The journey clock is paused.</p><button class="wide" data-action="resume">Continue the journey</button>';
    } else if (name === 'workshop') {
      const wCost = getWeaponUpgradeCost(), sCost = getStorageUpgradeCost();
      body.innerHTML = `<p>A better blade makes the sweet spot wider and sends your shots further. Caravan upgrades give your travelling show a grander wagon and decorations.</p>
      <article class="item-card">${CastArt.weaponMarkup(player.weaponLevel,scene.textures.get('castWeapons'))}<small>WEAPON · LEVEL ${player.weaponLevel}</small><h3>A sharper argument</h3><p>Strike strength ${getWeaponPowerMultiplier().toFixed(2)}×. Next level adds 6% of base power and more room for a clean hit.</p><button data-buy="weapon" ${player.weaponLevel >= 30 || player.gold < wCost ? 'disabled' : ''}>${player.weaponLevel >= 30 ? 'Fully upgraded' : `Upgrade · ${wCost.toLocaleString()} gold`}</button></article>
      <article class="item-card">${CastArt.caravanMarkup(player.storageLevel)}<small>CART · LEVEL ${player.storageLevel}</small><h3>${CastArt.caravanName(player.storageLevel)}</h3><p>${player.storageLevel >= 16 ? 'Your travelling show has its grandest caravan.' : 'Unlock the next caravan appearance for journeys between towns.'}</p><button data-buy="storage" ${player.storageLevel >= 16 || player.gold < sCost ? 'disabled' : ''}>${player.storageLevel >= 16 ? 'Fully upgraded' : `Upgrade · ${sCost.toLocaleString()} gold`}</button></article>`;
      const pLevel=player.platformLevel || 1,pCost=PlatformArt.cost(pLevel);
      body.insertAdjacentHTML('beforeend', `<article class="item-card"><div class="platform-preview">${PlatformArt.markup(pLevel)}</div><small>PLATFORM · LEVEL ${pLevel} / 25</small><h3>${PlatformArt.name(pLevel)}</h3><p>Improve the timber, paintwork, banners and gilding. Target fame earns ${fameMultiplier.toFixed(2)}×; each level adds 5% of base fame. Existing reputation bonuses are preserved.</p><button data-buy="platform" ${pLevel>=25||player.gold<pCost?'disabled':''}>${pLevel>=25?'Fully upgraded':`Upgrade · ${pCost.toLocaleString()} gold`}</button></article>`);
    } else if (name === 'market' || name === 'market-all') {
      body.innerHTML=targetMarketMarkup();
    } else if (name === 'travel') {
      body.innerHTML = `<p>Buy a permanent city key with gold to open each new road. Rank unlocks the right to purchase. Travel advances the calendar. Your caravan travels through each day. Arrival begins a fresh performance.</p>` + cities.map((c,i) => {
        const unlocked = c.unlocked, here = c.name === currentCity;
        const keyCost=ChopCore.cityKeyCost(c),eligible=level>=Math.max(1,c.fameReq);
        return `<article class="item-card"><small>${c.region.toUpperCase()}${here ? ' · YOU ARE HERE' : ''}</small><h3>${c.name}</h3><p>${c.desc} ${here ? '' : `${getTravelDays(currentCity,c.name)} days by road.`}</p><button ${unlocked?`data-travel="${i}"`:`data-key="${i}"`} ${here || (!unlocked&&(!eligible||player.gold<keyCost)) ? 'disabled' : ''}>${here ? 'Current town' : unlocked ? `Travel to ${c.name}` : !eligible?`Key available at rank ${Math.max(1,c.fameReq)}`:`Buy city key · ${keyCost} gold`}</button></article>`;
      }).join('');
    } else if (name === 'welcome') {
      body.innerHTML = `<span class="eyebrow">CHAPTER ONE · THE PRICE OF FREEDOM</span><h3>Welcome to York.</h3><img src="assets/oswin-angular.png" class="journal-portrait" alt="Oswin, the royal clerk"><p class="journal-quote">“One million and one gold. Before the year is out. Then your debt—and your service—are finished.”</p><p>The royal clerk smiles. The extra coin is his fee. You take the axe. Somewhere beyond York, there must be a better way to make a living.</p><article class="item-card"><small>YOUR FIRST DAY</small><h3>Find your rhythm</h3><p>1. Stop the marker in the mint centre.<br>2. Set your aim toward a flying target.<br>3. Choose your power and let it fly.</p><p>Land clean hits, build a streak, then spend your first 10 gold on a better blade.</p></article><button class="wide" data-action="begin">Let's get to work →</button>`;
    } else if (name === 'guide') {
      el('dialog-title').textContent='Targets & tricks';
      body.innerHTML='<article class="item-card"><small>BUILD A CROWD</small><h3>Aim for the rings</h3><p>Coral rings earn fame. Moving targets earn more, and high green targets in Lincoln are worth triple. Gold crown targets are worth five times a normal hit.</p></article><article class="item-card"><small>WINCHESTER CHALLENGE · BLADE LEVEL 8</small><h3>Thread the gold ring</h3><p>When guards throw a gold ring, send a flying head through its centre. A clean pass clears nearby targets and earns bonus fame.</p></article><article class="item-card"><small>MAKE YOUR SHOT COUNT</small><h3>New towns, new tricks</h3><p>York starts with steady, rising and swinging red targets. Durham introduces green bullseyes and oval movement; Newcastle brings two barrel sizes and fuses; Chester brings pausing and running baskets. Each city also has three arcade tricks: split targets, ricochets, timed openings and chain reactions. Try them locally, then purchase them after visiting to use them everywhere. The final city, Gloucester, has the floating sky green; Winchester has thrown rings. Both need blade level 8.</p><h3>Catch of the day</h3><p>Watch for basket carriers below the platform. A falling head landing cleanly inside earns extra gold: Chester introduces broad pausing 2× baskets and smaller running 3× baskets. Oxford adds 3× and 4× variants, and Southampton adds wide cargo baskets and quick captains. Each head can earn one catch bonus. Purchased specialities join every city, including York.</p><h3>Break through</h3><p>Wooden shields need a powerful launch. If your shot bounces, use more power or upgrade your blade. Barrels light a short fuse, then explode into nearby targets.</p></article><article class="item-card"><small>WATCH YOUR REPUTATION</small><h3>Choose your targets</h3><p>Birds fly higher as your blade improves. Crows earn 100 gold; white doves earn 1,000 gold. Both build fame and target combos. Canterbury’s golden halos reward precise shots.</p></article><article class="item-card"><small>KEEP YOUR RHYTHM</small><h3>Protect your streak</h3><p>Each successful chop increases your gold multiplier. A miss resets the streak and the crowd thins out. Watch the weather: wind pushes your shot, rain pulls it down, and fog drifts across your view.</p></article><button class="wide secondary" data-action="cancel-new">Back to ledger</button>';
    } else if (name === 'cast') {
      el('dialog-title').textContent='People on the road';
      const people=[
        ['oswin','Oswin','The royal clerk','He knows every rule, every fee, and exactly where you should sign. Your year of service begins at his desk.'],
        ['merrin','Merrin','The travelling fool','A good joke, a painted target, and a crowd willing to listen. There is usually more to his performance than the punchline.'],
        ['agnes','Agnes','The Durham merchant','She has spent a lifetime on the trading road. Ask her what something is worth, and expect a very honest answer.']
      ];
      body.innerHTML=people.map(([key,name,role,about])=>`<article class="item-card cast-card"><div class="cast-heading"><img class="journal-portrait" src="assets/${key}-angular.png" alt="${name}"><div><small>${role}</small><h3>${name}</h3></div></div><p>${about}</p></article>`).join('')+'<button class="wide secondary" data-action="cancel-new">Back to ledger</button>';
    } else if (name === 'recovery') {
      el('dialog-title').textContent='Your save needs attention';
      body.innerHTML='<p>This game could not read your saved progress or its recovery copy. Your saved data has been left untouched. A save from a newer version may need an updated game.</p><p>Restore an exported backup, or start a new story. Until then, automatic saving is paused.</p><button class="wide" data-action="import">Restore a save backup</button><button class="wide secondary" data-action="new-game">Start a new story</button>';
    } else if (name === 'import') {
      el('dialog-title').textContent='Restore a backup';
      body.innerHTML='<p>Choose a saved backup file or paste its contents below. A valid backup replaces this device’s current progress. Your current save is kept as a recovery copy.</p><label for="backup-file">Choose backup file</label><input id="backup-file" type="file" accept=".json,application/json"><label for="backup-text">Save data</label><textarea id="backup-text" rows="9" spellcheck="false" placeholder="Paste your save JSON here"></textarea><p id="import-message" role="status"></p><button class="wide" data-action="restore">Restore this save</button><button class="wide secondary" data-action="cancel-new">Back to ledger</button>';
    } else {
      body.innerHTML = campaignMarkup()+arcadeMarkup()+`<button class="wide" data-action="resume">Resume game</button><button class="wide secondary" data-action="sound">Effects ${ChopAudio.effects ? 'on' : 'off'} · tap to change</button><button class="wide secondary" data-action="music">Music ${ChopAudio.music ? 'on' : 'off'} · tap to change</button><button class="wide secondary" data-action="export">Export save backup</button><button class="wide secondary" data-action="tutorial">Read the opening & controls</button><button class="wide secondary" data-action="new-game">Start a new story</button><p>Your progress saves on this device. The clock pauses while a menu is open or the game is in the background.</p>`;
      body.insertAdjacentHTML('beforeend','<button class="wide secondary" data-action="import">Restore a save backup</button><article class="offline-card"><small>OFFLINE PLAY</small><p id="offline-status" role="status"></p></article>');
      body.insertAdjacentHTML('beforeend',window.ChopNative ? '<p>Installed on this device.</p>' : window.ChopInstall?.installed ? '<p>Playing from your home screen.</p>' : window.ChopInstall?.available ? '<button class="wide" data-action="install">Add game to home screen</button>' : '<p>Keep the game with your apps: on iPhone or iPad, open it in Safari and choose Share → Add to Home Screen. On Android, look in your browser menu for Install app or Add to Home Screen.</p>');
      el('offline-status').textContent=window.ChopOffline?.status || 'Offline support is starting…';
      body.insertAdjacentHTML('beforeend','<button class="wide secondary" data-action="cast">People on the road</button>');
      body.insertAdjacentHTML('beforeend','<button class="wide secondary" data-action="runtime-reload">Reload game · keep saved progress</button><button class="wide secondary" data-action="guide">Targets & tricks</button><article class="item-card"><small>PLAYTEST DEBUG</small><p>Add one million gold and unlock every city in this save. Your weapon, caravan and rank stay as they are.</p><button data-action="debug-grant">+1,000,000 gold & unlock all cities</button></article>');
      if(runtimeError){
        const diagnostic=document.createElement('article');diagnostic.className='item-card';
        const title=document.createElement('h3');title.textContent='Last recorded game error';
        const detail=document.createElement('pre');detail.className='runtime-error';detail.textContent=runtimeError.message+'\n'+runtimeError.file+':'+runtimeError.line+'\n'+runtimeError.time;
        diagnostic.append(title,detail);body.prepend(diagnostic);
      }
      if (SaveManager.unreadable) body.insertAdjacentHTML('afterbegin','<p role="status">Your previous save could not be read. Automatic saving is paused. Restore a backup or start a new story to save again.</p>');
    }
    let focusTarget = name === 'conflict' ? body.querySelector('button') : el('dialog-close');
    if (focusIdentity.length) {
      const replacement = [...body.querySelectorAll('button')].find(button =>
        button.hasAttribute('data-quantity') === wasBatch &&
        focusIdentity.every(([key,value]) => button.dataset[key] === value));
      if (replacement && !replacement.disabled) focusTarget = replacement;
      else if (replacement?.closest('.item-card')) {
        focusTarget = replacement.closest('.item-card');
        focusTarget.tabIndex = -1;
      }
    }
    focusTarget?.focus({preventScroll:true});
    body.scrollTop = previousScreen === name ? scrollTop : 0;
  }
  function strike() {
    if (!scene || screen || SaveManager.conflict || !inputEnabled || menuOpen) return;
    if (awaitingAngle) { chooseAngle(scene); ChopAudio.play('aim'); }
    else if (awaitingPower) { choosePower(scene); ChopAudio.play('launch'); }
    else if (swingActive) endSwing(scene);
  }
  function update() {
    if (!scene) return;
    if (SaveManager.conflict) {
      if (screen !== 'conflict') show('conflict');
      requestAnimationFrame(update); return;
    }
    if (!screen && Campaign.state.ending && !Campaign.state.epilogueSeen) {
      Campaign.state.epilogueSeen=true; show('journal'); save();
    }
    const chapterProgress = Campaign.progress(stats());
    const arcade=window.Arcade,progress=arcade.progress(level),challenge=progress.find(c=>!c.locked&&!c.claimed),nextLevel=progress.filter(c=>c.locked&&!c.claimed).sort((a,b)=>a.level-b.level)[0]?.level;
    const arcadeText=arcade.state.score.toLocaleString()+' PTS · '+(challenge?challenge.title+' '+Math.min(challenge.current,challenge.goal)+'/'+challenge.goal:nextLevel?'New challenges at level '+nextLevel:'All 100 arcade challenges complete');
    if(el('arcade-track').textContent!==arcadeText)el('arcade-track').textContent=arcadeText;
    const contract = Campaign.nextObjective(stats(), player.gold);
    if (el('contract-caption').textContent !== contract.caption) el('contract-caption').textContent = contract.caption;
    if (el('contract-next').textContent !== contract.text) el('contract-next').textContent = contract.text;
    el('contract-track').classList.toggle('reward-ready',contract.ready);
    ui.querySelector('[data-screen="journal"]:not(#contract-track)').classList.toggle('reward-ready',contract.ready);
    if (!Campaign.state.ending && chapterProgress.length && chapterProgress.every(g=>g.current>=g.value) && lastReadyChapter !== Campaign.state.claimed) {
      lastReadyChapter=Campaign.state.claimed; toast('Contract complete · collect your reward in the Journal');
    }
    el('hud-city').textContent = currentCity;
    const t = scene.dayNight.timeOfDay;
    el('hud-date').textContent = `${getDateString()} · ${String(Math.floor(t*24)).padStart(2,'0')}:${String(Math.floor(t*1440)%60).padStart(2,'0')}`;
    el('hud-gold').textContent = Math.floor(player.gold).toLocaleString();
    el('hud-fame').textContent = Math.floor(fame).toLocaleString()+' FAME';
    el('hud-rank').textContent = `RANK ${level} · ${killStreak ? `${killStreak} streak` : 'Find your rhythm'}`;
    const weatherNames = { clear: 'Clear skies', rain: 'Rain · heavier falls', wind: 'Wind '+arrowForWind(windForce.x,windForce.y)+' · drifting shots', fog: 'Thick fog · watch for gaps', snow:'Snow · heavier falls' };
    el('hud-weather').textContent = weatherNames[currentWeather];
    el('hud-xp').style.width = `${Math.min(100,xp/xpThreshold*100)}%`;
    let phase = awaitingAngle ? 'aim' : awaitingPower ? 'power' : swingActive ? 'timing' : 'wait';
    ['timing','aim','power'].forEach(p => el(`step-${p}`).classList.toggle('active',phase === p));
    const button = el('shot-button');
    button.textContent = {timing:'CHOP',aim:'LOCK AIM',power:'LET IT FLY',wait:'GET READY'}[phase];
    button.disabled = phase === 'wait' || !inputEnabled || !!screen;
    el('shot-hint').textContent = {timing:'Tap when the marker reaches the mint centre.',aim:'Turn the brass pointer toward a target.',power:'The ribbon previews your arc. Tap to launch.',wait:'Your next customer is on the way.'}[phase];
    let fraction = (cursor.x - 250)/300;
    if (phase === 'aim') fraction = (aimArrow.angle + 90)/180;
    if (phase === 'power') fraction = (aimArrow.scaleY-.5)/1.5;
    ui.querySelector('.needle').style.left = `${Math.max(0,Math.min(1,fraction))*100}%`;
    ['outer','middle','inner'].forEach((z,i) => { ui.querySelector(`.zone.${z}`).style.width = phase === 'timing' ? `${[redZone,yellowZone,greenZone][i].displayWidth/3}%` : '0'; });
    // Keep legacy display objects alive for simulation callbacks, but use the accessible HUD.
    [scene.popupText,versionText,goldText,fameText,missText,killText,weatherIndicator,weatherIndicatorBg,menuIcon,dateText,dateBg,locationText,xpText,xpBarFill,storageButton,weaponsButton,shopButton,travelButton,swingBar,redZone,yellowZone,greenZone,cursor].forEach(o => o?.setVisible(false));
    [storageButton,weaponsButton,shopButton,travelButton,menuIcon].forEach(o => o?.disableInteractive());
    requestAnimationFrame(update);
  }
  ui.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.action === 'reload-save' || button.dataset.action === 'runtime-reload') { navigating=true; location.reload(); return; }
    if (SaveManager.conflict && button.dataset.action !== 'export') return;
    if(button.dataset.challenge){const reward=window.Arcade.claim(button.dataset.challenge,level);if(reward){addGold(scene,reward);save();ChopAudio.play('reward');toast('Challenge complete · +'+reward+' gold');}show('journal');return;}
    if (button.dataset.action === 'install') {
      window.ChopInstall?.prompt().then(result=>{
        show('journal');
        if(result==='failed') toast('Use your browser menu to add the game to your home screen.');
      });
      return;
    }
    if (button.id === 'shot-button') return strike();
    if (button.id === 'dialog-close') return travelLoading ? undefined : close();
    if (button.dataset.screen) return show(button.dataset.screen);
    if (button.dataset.buy==='platform') {
      if(!PlatformArt.buy(player))return;
      fameMultiplier=Math.max(fameMultiplier,PlatformArt.boost(player.platformLevel));
      stage.setTexture('stageUpgrades',String(player.platformLevel-1));
      goldText.setText(formatGold(player.gold));
      save();ChopAudio.play('reward');show('workshop');toast('Platform upgraded · level '+player.platformLevel+' · '+PlatformArt.name(player.platformLevel));return;
    }
    if (button.dataset.buy) {
      const weapon = button.dataset.buy === 'weapon';
      const cost = weapon ? getWeaponUpgradeCost() : getStorageUpgradeCost();
      if (player.gold < cost || (weapon ? player.weaponLevel >= 30 : player.storageLevel >= 16)) return;
      player.gold -= cost;
      if (weapon) { player.weaponLevel++; updateZones(); updateExecutionerWeaponTexture(); }
      else { player.storageLevel++; player.maxStorage = player.storageLevel * 10; }
      save(); ChopAudio.play('reward'); show('workshop'); toast(weapon?'Blade level '+player.weaponLevel+(player.weaponLevel===4?' · stronger launches reach taller poles':player.weaponLevel===8?' · ring troupe and floating fairway challenges enabled':' · stronger launches'):'Caravan upgraded · '+CastArt.caravanName(player.storageLevel)); return;
    }
    if (button.dataset.fameUpgrade !== undefined) {
      if (buyUpgrade(scene, Number(button.dataset.fameUpgrade))) { save(); ChopAudio.play('reward'); }
      show('workshop'); return;
    }
    if(button.dataset.targetBuy){
      if(window.TargetShop.buy(button.dataset.targetBuy,player,Campaign.state.visited)){
        save();ChopAudio.play('reward');toast('New target option · added to every city');
      }
      show('market');return;
    }
    if (button.dataset.trade) {
      const i = Number(button.dataset.item), item = marketItems[i];
      if (!item) return;
      const buying = button.dataset.trade === 'buy';
      const quantity = Number(button.dataset.quantity || 1);
      const traded = buying ? buyMarketItem(scene,i,quantity) : sellMarketItem(scene,i,quantity);
      save(); show('market');
      if (traded) {
        const receipt=document.createElement('p'); receipt.setAttribute('role','status');
        receipt.textContent=`${buying ? 'Bought' : 'Sold'} ${traded} ${item.name} · ${buying ? '−' : '+'}${traded*(buying ? item.currentBuy : item.currentSell)} gold`;
        el('dialog-body').querySelector(`[data-item="${i}"]`)?.closest('.item-card').append(receipt);
        ChopAudio.play(buying ? 'aim' : 'reward');
      }
      return;
    }
    if (button.dataset.key !== undefined) {
      const city=cities[Number(button.dataset.key)];
      if(ChopCore.buyCityKey(city,player,level)){save();ChopAudio.play('reward');toast('Key to '+city.name+' acquired!');}
      show('travel');return;
    }
    if (button.dataset.travel) {
      if (travelLoading) return;
      const city = cities[Number(button.dataset.travel)];
      if (!city || city.name === currentCity || !city.unlocked) return;
      const days = getTravelDays(currentCity,city.name);
      travelLoading = true;
      el('dialog-close').disabled = true;
      el('dialog-body').querySelectorAll('[data-travel]').forEach(node => { node.disabled = true; });
      const status=document.createElement('p'); status.setAttribute('role','status');
      status.textContent=`Opening the road to ${city.name}…`;
      el('dialog-body').prepend(status);
      ensureCityBackground(scene,city.name).then(() => {
        travelLoading = false;
        el('dialog-close').disabled = false;
        city.unlocked = true;
        scene.scene.launch('TravelScene',{city,days,mainScene:scene});
      }).catch(error => {
        travelLoading = false;
        el('dialog-close').disabled = false;
        show('travel');
        el('dialog-body').insertAdjacentHTML('afterbegin',`<p role="alert">${error.message} Try this road again when it is available.</p>`);
      });
      return;
    }
    const action = button.dataset.action;
    if (button.dataset.ending) {
      if (Campaign.finish(button.dataset.ending,player.gold)) { player.gold-=1000001; Campaign.state.epilogueSeen=true; save(); show('journal'); }
      return;
    }
    if (action === 'claim') {
      const chapter=Campaign.claim(stats());
      if (chapter) { player.gold+=chapter.reward; save(); show('journal'); el('dialog-body').insertAdjacentHTML('afterbegin',`<article class="item-card"><small>CONTRACT COMPLETE · +${chapter.reward.toLocaleString()} GOLD</small><p>${chapter.after}</p></article>`); ChopAudio.play('reward'); }
    }
    if (action === 'new-game') {
      el('dialog-title').textContent='Start again?';
      el('dialog-body').innerHTML='<p>This replaces your progress on this device. Export a backup first if you want to keep this story.</p><button class="wide secondary" data-action="export">Export current save</button><button class="wide" data-action="confirm-new">Start a new story</button><button class="wide secondary" data-action="cancel-new">Keep playing</button>';
    }
    if(action === 'debug-grant'){ChopCore.debugGrant(player,cities);save();show('journal');toast('Debug: one million gold added · all city keys unlocked');return;}
    if (action === 'cancel-new') show('journal');
    if (action === 'confirm-new') {
      if (!SaveManager.clear()) { toast('Could not clear the save. Check that browser storage is available.'); return; }
      runtimeError=null;
      try { localStorage.removeItem('choptoit-runtime-error'); } catch (_) {}
      navigating=true; try { localStorage.removeItem('choptoit-intro-read'); } catch (_) {} SaveManager.disabled=true; location.reload();
    }
    if (action === 'import') show('import');
    if (action === 'restore') {
      const input=el('backup-text').value;
      try {
        if (input.length>1000000) throw new Error('This backup is too large.');
        const data=JSON.parse(input);
        SaveManager.restore(data);
        navigating=true;SaveManager.disabled=true;location.reload();
      } catch (error) { el('import-message').textContent=error instanceof SyntaxError ? 'That text is not valid save data. Paste the full exported file.' : error.message; }
    }
    if (action === 'begin') { introRead = true; try { localStorage.setItem('choptoit-intro-read','yes'); } catch (_) {} close(); }
    if (action === 'resume') close();
    if (action === 'sound' || action === 'music') { ChopAudio.toggle(action); show('journal'); }
    if (action === 'export') {
      if (window.ChopNative) {
        if (!window.ChopNativeAPI?.exportSave) toast('Backup sharing is unavailable. Try again after restarting the app.');
        else window.ChopNativeAPI.exportSave(SaveManager.export()).catch(() => toast('Could not share the backup. Try again.'));
      } else SaveManager.download();
    }
    if (action === 'tutorial') show('welcome');
    if (action === 'cast') show('cast');
    if (action === 'guide') show('guide');
  });
  ui.addEventListener('change', async event => {
    if (event.target.id !== 'backup-file') return;
    const file=event.target.files?.[0], message=el('import-message');
    if (!file) return;
    if (file.size > 1000000) { message.textContent='This backup is too large.'; return; }
    try { el('backup-text').value=await file.text(); message.textContent=`Ready to restore ${file.name}.`; }
    catch (_) { message.textContent='Could not open that backup file. Try pasting its contents.'; }
  });
  document.addEventListener('keydown', event => {
    if (!screen) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const nodes = [...el('game-dialog').querySelectorAll('button:not(:disabled),input:not(:disabled),textarea')];
      const first = nodes[0], last = nodes[nodes.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  function suspendGame() {
    if (!scene) return;
    if (activeTravel) { activeTravel.scene.pause();ui.hidden=false;show('journey-pause');return; }
    if (!screen) show('pause'); // show saves and pauses the entire scene.
    else save(); // Preserve an existing menu or unsent backup form.
  }
  window.ChopSuspend = suspendGame;
  window.ChopBack = () => {
    // Keep loading and save-conflict recovery intact. The next Back from the
    // pause screen may minimize the app after its progress has been saved.
    if (!scene || travelLoading || SaveManager.conflict) return true;
    if (activeTravel) { if(screen==='journey-pause'){save();return false;}suspendGame();return true; }
    if (!screen) { suspendGame(); return true; }
    if (screen === 'pause') { save(); return false; }
    if (['import','cast','guide'].includes(screen)) show('journal');
    else close();
    return true;
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspendGame(); });
  window.addEventListener('pagehide', suspendGame);
  window.addEventListener('storage', event => {
    if (event.key !== SaveManager.key && event.key !== null) return;
    try { SaveManager.checkCurrent(); } catch (error) { SaveManager.handleError(error); }
  });
  window.MobileGame = {
    loading() {
      loadingFailed = false;
      const loading = document.createElement('div'); loading.id = 'game-loading'; loading.setAttribute('role','status');
      loading.innerHTML = '<span class="eyebrow">CHOP TO IT</span><h2>Opening the gates…</h2><p id="loading-copy">Gathering the townsfolk and sharpening your axe.</p><progress id="loading-progress" max="100" value="0" aria-label="Game download progress"></progress><span id="loading-percent">0%</span><button id="loading-retry" type="button" hidden>Try again</button>';
      document.body.append(loading);
      el('loading-retry').addEventListener('click', () => location.reload());
      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(() => {
        if (!el('game-loading') || loadingFailed) return;
        el('loading-copy').textContent='The first download can take a moment. If the progress has stopped, check your connection and try again.';
        el('loading-retry').hidden=false;
      }, 30000);
    },
    loadProgress(value) {
      if (loadingFailed || !el('loading-progress')) return;
      const percent=Math.max(0,Math.min(100,Math.floor(value*100)));
      el('loading-progress').value=percent; el('loading-percent').textContent=`${percent}%`;
      if (percent===100) el('loading-copy').textContent='Opening the town square…';
    },
    loadFailed() {
      clearTimeout(loadingTimer); loadingFailed=true;
      const loading=el('game-loading'); if (!loading) return;
      loading.setAttribute('role','alert');
      loading.querySelector('h2').textContent='The gates are stuck';
      el('loading-copy').textContent='Some game artwork could not download. Check your connection and try again. Your saved progress has not been changed.';
      el('loading-progress').hidden=true; el('loading-percent').hidden=true;
      el('loading-retry').hidden=false;
    },
    ready(s) { clearTimeout(loadingTimer); el('game-loading')?.remove(); scene = s; ui.hidden = false; update(); if (SaveManager.unreadable) show('recovery'); else if (!introRead) show('welcome'); if (document.hidden) suspendGame(); if (SaveManager.recovered) toast('Recovered your progress from the last backup.'); else showPendingHint(); },
    journeyStart(travel) { activeTravel=travel;screen='journey';ui.hidden=true; },
    journeyFinish(city) { activeTravel=null;screen=null;el('game-dialog').hidden=true;ui.hidden=false;ui.querySelectorAll('.mobile-hud,.mobile-controls,.mobile-nav').forEach(n=>{n.inert=false;});const specialities=window.TargetShop.catalog.filter(p=>p.city===city&&!p.free&&!window.TargetShop.owns(p.id));toast('Welcome to '+city+(specialities.length?' · '+specialities.length+' specialities discovered! Try them here; buy them in the market.':'')); },
    combo(count,gold,kind) {
      if(count<2)return;
      el('game-toast').hidden=true;
      const banner=el('combo-banner'),name=kind==='frenzy'?'KETCHUP FRENZY!':kind==='basket'?'HEAD IN A BASKET!':ChopCore.comboName(count,kind);
      banner.replaceChildren();const title=document.createElement('b');
      title.textContent=name;banner.append(title);banner.dataset.tier=count>=8?'legend':count>=3?'hot':'warm';
      banner.classList.remove('burst');void banner.offsetWidth;banner.classList.add('burst');ChopAudio.play('combo');
    },
    strike, isPaused:() => !!screen,
    hint(message) { pendingHint = message; showPendingHint(); },
    rankUp(rank) {
      const keys=cities.filter(c=>Math.max(1,c.fameReq)===rank&&!c.unlocked).map(c=>c.name);
      const cast=ChopCore.castUnlocked(rank),newChallenges=window.Arcade.progress(rank).filter(c=>c.level===rank).length;
      const message=cast.faces+' faces · '+cast.bodies+' bodies available. '+newChallenges+' new arcade challenges! Visit new cities to discover target-shop specials.';
      const card=document.createElement('div');card.className='rank-celebration';card.setAttribute('role','status');
      card.innerHTML='<small>A CUT ABOVE!</small><h2>RANK '+rank+'!</h2><p>'+message+'</p>'+(keys.length?'<p>City keys available: '+keys.join(', ')+'</p>':'');
      ui.append(card);setTimeout(()=>card.remove(),4800);
      ui.querySelector('[data-screen="workshop"]')?.classList.add('upgrade-ready');
      setTimeout(()=>ui.querySelector('[data-screen="workshop"]')?.classList.remove('upgrade-ready'),8000);
      ChopAudio.play('reward');
    },
    reward(gold, silver) {
      ChopAudio.play(silver<0?'miss':'hit');
    },
    feedback(message, success) {
      if(!success || /Free at last/.test(message))toast(message.replace(/\n/g,' · '));
      ChopAudio.play(/Shield/.test(message) ? 'shield' : !success ? 'miss' : /in a row/.test(message) ? 'chop' : 'hit');
    }
  };
})();
