/* A fresh story begins with a quiet, interactive dawn. No save is written
   until normal play; returning players go straight through the title gate. */
(() => {
  if (!window.MobileGame || !window.Phaser) return;
  try { if (localStorage.getItem('choptoit-intro-read') === 'yes') return; } catch (_) {}
  const gate=document.getElementById('start-overlay');if(!gate)return;
  let selectedAim=0;
  let presses=0,finished=false,phase='wake',meterPosition=0,meterDirection=1,lastFrame=0,frame=0,readyScene=null,journeyDone=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.ChopOpening={get presses(){return presses;},get completed(){return finished;},get active(){return !finished;},get phase(){return phase;},get meterPosition(){return meterPosition;},onReady(scene){readyScene=scene;handoff();},loadFailed(){cancelAnimationFrame(frame);gate.hidden=true;gate.style.display='none';}};
  gate.classList.add('awakening');gate.setAttribute('role','region');gate.setAttribute('aria-label','A sleeping executioner beneath a tree');gate.removeAttribute('tabindex');
  gate.innerHTML=`<div class="wake-stage">
    <div class="wake-dawn"></div>
    <svg class="wake-world" viewBox="0 0 800 1600" aria-hidden="true">
      <defs><clipPath id="wake-town-window"><path d="M440 820H720V1050H440Z"/></clipPath><linearGradient id="wake-town-haze" x1="0" y1="820" x2="0" y2="1050" gradientUnits="userSpaceOnUse"><stop offset=".72" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="wake-town-mask" maskUnits="userSpaceOnUse" x="440" y="820" width="280" height="230"><path d="M440 820H720V1050H440Z" fill="url(#wake-town-haze)"/></mask><clipPath id="wake-stump"><path d="M0 1068H800V1600H0Z"/></clipPath><clipPath id="wake-upper"><path d="M0 0H800V1068H0Z"/></clipPath></defs><g class="wake-stars" fill="#d6e7de"><circle cx="140" cy="290" r="3"/><circle cx="590" cy="370" r="4"/><circle cx="350" cy="180" r="3"/><circle cx="650" cy="180" r="2"/><circle cx="70" cy="550" r="3"/><circle cx="480" cy="540" r="2"/><circle cx="720" cy="670" r="3"/><circle cx="220" cy="670" r="2"/></g>
      <path class="wake-moon" d="M205 390a40 40 0 1 1-45-55 32 32 0 0 0 45 55" fill="#d6e7de"/>
      <circle class="wake-sun" cx="115" cy="730" r="43" fill="#ffe5a0"/>
      <path d="M-100 1090L90 985 280 1050 530 925 900 1030V1900H-100Z" fill="#526b63"/>
      <path d="M-100 1230L150 1150 400 1200 670 1130 900 1200V1900H-100Z" fill="#799078"/>
      <path d="M-100 1280L220 1235 650 1280 900 1250V1900H-100Z" fill="#a38e68"/>
      <path d="M240 1300l100-12 42 9-105 14M490 1350l90-8 30 11-91 7M80 1430l160-16 50 13-170 13" fill="#c6af7c" opacity=".35"/>
      <g class="wake-york"><g clip-path="url(#wake-town-window)" mask="url(#wake-town-mask)"><svg class="wake-town-art" x="440" y="820" width="280" height="230" viewBox="800 420 800 650"><image href="assets/york-angular.png" width="2400" height="1600"/></svg></g><path d="M510 1110q-50 65-75 120" fill="none" stroke="#d0b285" stroke-width="24"/><text x="580" y="1150" text-anchor="middle" fill="#f0dfb8" font-family="Georgia" font-size="24">York</text></g>
      <ellipse cx="435" cy="1214" rx="150" ry="25" fill="#233d3a" opacity=".45"/>
      <path class="wake-trunk" d="M330 1205L347 825 306 689 335 680 387 805 425 703 451 712 390 871 397 1205Z" fill="#755b49"/>
      <path class="wake-trunk" d="M376 854l21 351h-30l-8-340 12-110 12 15z" fill="#a37d53"/>
      <g class="wake-crown"><path d="M330 1205L347 825 306 689 335 680 387 805 425 703 451 712 390 871 397 1205Z" fill="#755b49" clip-path="url(#wake-upper)"/>
      <path d="M190 845L115 750 170 624 298 555 413 599 496 568 603 672 593 785 489 843 343 871Z" fill="#385b50"/>
      <path d="M115 750L170 624 298 555 326 679 243 777Z" fill="#5c7c5d"/>
      <path d="M326 679L413 599 496 568 603 672 489 736 397 842 243 777Z" fill="#6f906a"/>
      <path d="M243 777l83-98 71 163-54 29-153-26zM489 736l114-64-10 113-104 58-92-1z" fill="#436a54"/>
      <path d="M214 652l57-32 29 20-57 27M433 650l59-23 37 29-74 21M189 782l43-16 16 19-48 13" fill="#91a97c" opacity=".4"/>
      </g>
      <path class="wake-cut" d="M342 1068l16-7 29 7-15 8z" fill="#e7bd7b"/>
      <g class="wake-chips" fill="#d7ac72"><path d="M340 1065l12-7 9 13-13 6z"/><path d="M363 1074l16-6 5 10-12 8z"/><path d="M347 1091l10-3 7 10-12 6z"/></g>
      <g class="wake-person" transform="translate(446 1154)">
        <g class="wake-pose">
          <path d="M-48-88L40-88 64-49 55 15-51 15-66-45Z" fill="#526975" stroke="#1c333e" stroke-width="4"/>
          <path d="M-48-88l29 15-9 69-23 19-15-60z" fill="#718590"/>
          <path d="M40-88l24 39-9 64-30-24 4-65z" fill="#314957"/>
          <path d="M-16-73l30 4 7 49-12 18-26-6z" fill="#344d56"/>
          <path d="M-12-60l12 9 12-8M0-49v34" fill="none" stroke="#a1b0a1" stroke-width="3"/>
          <path d="M-52 5h106v15H-52Z" fill="#99754f"/><path d="M-7 5h18v18H-7Z" fill="#d7b677"/>
          <g class="wake-legs"><path d="M-44 20h35l-11 47-47 5-4-16zM18 20h35l29 41-9 13-48-10z" fill="#304550" stroke="#1c333e" stroke-width="4"/><path d="M-67 59l40-3 4 18-49 3zM42 60l32 1 17 17-45 2z" fill="#5d4d44" stroke="#1c333e" stroke-width="3"/></g>
          <svg x="-65" y="-155" width="130" height="78" viewBox="0 0 160 96"><image href="assets/executioner-angular.png" width="160" height="240"/></svg>
          <g class="wake-grip" fill="none" stroke="#324957" stroke-width="20" stroke-linecap="round"><path d="M-45-64L-24-25 37-38M43-66L59-40 45-22"/><path d="M37-38l8 16" stroke="#c3936b" stroke-width="13"/></g>
          <g class="wake-held-axe"><path d="M0 42L0-108" stroke="#634b36" stroke-width="11"/><path d="M-4-111L-38-128-61-103-47-70-5-82 12-99Z" fill="#9eada5" stroke="#253b43" stroke-width="4"/><path d="M-61-103L-47-70-40-75-53-104-32-123-38-128Z" fill="#f3e6be"/></g>
          <g class="wake-eyes"><path d="M-21-107h15M12-107h15" stroke="#b98e6c" stroke-width="9"/><path d="M-20-108q6 5 13 0M13-108q6 5 13 0" fill="none" stroke="#23343c" stroke-width="3"/></g>
        </g>
      </g>
      <g class="wake-ground-axe"><path d="M542 1210l-35-145" stroke="#4d3e32" stroke-width="12"/><path d="M478 1070l27-27 31 12-7 29-32 9z" fill="#adc2b6" stroke="#253b43" stroke-width="4"/><path d="M478 1070l27-27 6 5-26 29z" fill="#ebdfb5"/></g>
    </svg>
    <div class="wake-shade"></div>
    <span class="wake-sleep" aria-hidden="true">z <small>z</small></span>
    <button id="wake-button" type="button" aria-label="Wake the executioner" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21L16 5M12 5L17 2 22 5 20 11 15 12 11 9"/></svg></button>
    <div class="wake-controls" hidden><div class="shot-steps" aria-hidden="true"><span data-step="timing">⚒</span><span data-step="aim">⌖</span><span data-step="power">↑</span></div><div class="shot-meter" role="meter" aria-label="Chopping timing" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="zone outer" style="width:32%"></span><span class="zone middle" style="width:21%"></span><span class="zone inner" style="width:12%"></span><span class="needle"></span></div><p class="wake-hint">Tap as the marker reaches the glowing centre.</p></div>
    <span id="wake-status" class="visually-hidden" role="status">The executioner is asleep. Tap the glowing axe to wake him.</span>
  </div>`;
  const button=gate.querySelector('#wake-button');
  setTimeout(()=>{if(gate.isConnected){button.hidden=false;button.focus({preventScroll:true});}},2200);
  const controls=gate.querySelector('.wake-controls'),meter=controls.querySelector('.shot-meter'),needle=meter.querySelector('.needle'),hint=controls.querySelector('.wake-hint'),status=gate.querySelector('#wake-status');
  const icons={timing:'<path d="M6 21L16 5M12 5L17 2 22 5 20 11 15 12 11 9"/>',aim:'<circle cx="12" cy="12" r="6"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/>',power:'<path d="M12 21V3m-6 6l6-6 6 6"/>'};
  function setPhase(next,message){
    phase=next;gate.dataset.phase=next;status.textContent=message;
    if(['timing','aim','power'].includes(next)){
      controls.hidden=false;button.classList.add('wake-chop-button');button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">'+icons[next]+'</svg>';
      controls.querySelectorAll('[data-step]').forEach(n=>n.classList.toggle('active',n.dataset.step===next));
      button.setAttribute('aria-label',next==='timing'?'Time the tree chop':next==='aim'?'Aim at the treetop':'Choose chopping power');
      meter.setAttribute('aria-label',next==='timing'?'Chopping timing':next==='aim'?'Chopping aim':'Chopping power');
      hint.textContent=message;
    }
  }
  function tick(now){
    if(finished||!gate.isConnected)return;
    const dt=lastFrame?Math.min(.05,(now-lastFrame)/1000):0;lastFrame=now;
    if(['timing','aim','power'].includes(phase)&&!button.disabled){
      const step=ChopCore.advanceMeter(meterPosition,meterDirection,phase==='timing'?65:phase==='aim'?42:55,dt,0,100);
      meterPosition=step.position;meterDirection=step.direction;needle.style.left=meterPosition+'%';meter.setAttribute('aria-valuenow',Math.round(meterPosition));
      if(phase==='aim')gate.style.setProperty('--tree-aim',(meterPosition-50)*.35+'deg');
    }
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
  function unlock(delay=500){setTimeout(()=>{if(gate.isConnected&&!finished)button.disabled=false;},delay);}
  function beginCut(){
    const force=.6+meterPosition/100*.8;gate.style.setProperty('--tree-pop-x',(220+force*100+selectedAim*2)+'px');gate.style.setProperty('--tree-pop-y',(-190-force*140)+'px');gate.style.setProperty('--tree-spin',(35+force*15)+'deg');
    button.disabled=true;controls.hidden=true;button.hidden=true;setPhase('chop','Your first chop.');gate.classList.add('tree-swing');window.ChopAudio?.play('launch');
    restoredTimeOfDay=.30;startGame({keepOpening:true});
    setTimeout(()=>{gate.classList.add('tree-cut');window.ChopAudio?.play('chop');setPhase('reveal','York. Your first town.');},reduced?200:650);
    setTimeout(()=>{gate.classList.add('road-walk');setPhase('walk','Follow the road into York.');},reduced?600:2500);
    setTimeout(()=>{gate.classList.add('town-approach');},reduced?1000:4300);
    setTimeout(()=>{journeyDone=true;handoff();},reduced?1500:5900);
  }
  function handoff(){
    if(!readyScene||!journeyDone||finished)return;
    finished=true;phase='play';cancelAnimationFrame(frame);
    window.MobileGame.finishOpening();gate.classList.add('opening-handoff');
    setTimeout(()=>gate.remove(),reduced?50:1200);
  }
  function press(){
    if(button.hidden||button.disabled||finished)return;
    presses++;button.disabled=true;window.ChopAudio?.play('aim');
    if(phase==='wake'){
      const wake=Math.min(presses,5);gate.style.setProperty('--wake-progress',wake/5);gate.dataset.wake=wake;
      status.textContent='Waking up. '+wake+' of 5.';
      if(wake===5){setPhase('reach','Pick up your axe.');button.setAttribute('aria-label','Reach for the axe');unlock(750);}
      else{button.setAttribute('aria-label','Wake the executioner · '+(5-wake)+' more taps');unlock(450);}
    }else if(phase==='reach'){
      gate.classList.add('picking-axe');setPhase('lift','Lift the axe.');button.setAttribute('aria-label','Lift the axe');unlock(700);
    }else if(phase==='lift'){
      gate.classList.add('axe-equipped');gate.classList.remove('picking-axe');setPhase('timing','Tap as the marker reaches the glowing centre.');unlock(750);
    }else if(phase==='timing'){
      if(Math.abs(meterPosition-50)>18){hint.textContent='Try the glowing centre.';status.textContent=hint.textContent;unlock(250);return;}
      setPhase('aim','Aim towards the treetop.');meterPosition=50;unlock(250);
    }else if(phase==='aim'){
      selectedAim=(meterPosition-50)*.35;
      setPhase('power','Choose the power of your first chop.');meterPosition=0;unlock(250);
    }else if(phase==='power')beginCut();
  }
  gate.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();if(event.target.closest('#wake-button'))press();},true);
  gate.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)press();}},true);
})();
