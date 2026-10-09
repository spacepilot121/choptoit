/* A fresh story begins with a quiet, interactive dawn. No save is written
   until normal play; returning players go straight through the title gate. */
(() => {
  if (!window.MobileGame || !window.Phaser) return;
  try { if (localStorage.getItem('choptoit-intro-read') === 'yes') return; } catch (_) {}
  const gate=document.getElementById('start-overlay');if(!gate)return;
  let presses=0,finished=false;
  window.ChopOpening={get presses(){return presses;},get completed(){return finished;}};
  gate.classList.add('awakening');gate.setAttribute('role','region');gate.setAttribute('aria-label','A sleeping executioner beneath a tree');gate.removeAttribute('tabindex');
  gate.innerHTML=`<div class="wake-stage">
    <div class="wake-dawn"></div>
    <svg class="wake-world" viewBox="0 0 800 1600" aria-hidden="true">
      <g class="wake-stars" fill="#d6e7de"><circle cx="140" cy="290" r="3"/><circle cx="590" cy="370" r="4"/><circle cx="350" cy="180" r="3"/><circle cx="650" cy="180" r="2"/><circle cx="70" cy="550" r="3"/><circle cx="480" cy="540" r="2"/><circle cx="720" cy="670" r="3"/><circle cx="220" cy="670" r="2"/></g>
      <path class="wake-moon" d="M205 390a40 40 0 1 1-45-55 32 32 0 0 0 45 55" fill="#d6e7de"/>
      <circle class="wake-sun" cx="115" cy="730" r="43" fill="#ffe5a0"/>
      <path d="M-100 1090L90 985 280 1050 530 925 900 1030V1700H-100Z" fill="#526b63"/>
      <path d="M-100 1230L150 1150 400 1200 670 1130 900 1200V1700H-100Z" fill="#799078"/>
      <path d="M-100 1280L220 1235 650 1280 900 1250V1700H-100Z" fill="#a38e68"/>
      <path d="M240 1300l100-12 42 9-105 14M490 1350l90-8 30 11-91 7M80 1430l160-16 50 13-170 13" fill="#c6af7c" opacity=".35"/>
      <ellipse cx="435" cy="1214" rx="150" ry="25" fill="#233d3a" opacity=".45"/>
      <path d="M330 1205L347 825 306 689 335 680 387 805 425 703 451 712 390 871 397 1205Z" fill="#755b49"/>
      <path d="M376 854l21 351h-30l-8-340 12-110 12 15z" fill="#a37d53"/>
      <path d="M190 845L115 750 170 624 298 555 413 599 496 568 603 672 593 785 489 843 343 871Z" fill="#385b50"/>
      <path d="M115 750L170 624 298 555 326 679 243 777Z" fill="#5c7c5d"/>
      <path d="M326 679L413 599 496 568 603 672 489 736 397 842 243 777Z" fill="#6f906a"/>
      <path d="M243 777l83-98 71 163-54 29-153-26zM489 736l114-64-10 113-104 58-92-1z" fill="#436a54"/>
      <path d="M214 652l57-32 29 20-57 27M433 650l59-23 37 29-74 21M189 782l43-16 16 19-48 13" fill="#91a97c" opacity=".4"/>
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
          <g class="wake-eyes"><path d="M-21-107h15M12-107h15" stroke="#b98e6c" stroke-width="9"/><path d="M-20-108q6 5 13 0M13-108q6 5 13 0" fill="none" stroke="#23343c" stroke-width="3"/></g>
        </g>
      </g>
      <g transform="translate(90 35)"><path d="M542 1210l-35-145" stroke="#4d3e32" stroke-width="12"/><path d="M478 1070l27-27 31 12-7 29-32 9z" fill="#adc2b6" stroke="#253b43" stroke-width="4"/><path d="M478 1070l27-27 6 5-26 29z" fill="#ebdfb5"/></g>
    </svg>
    <div class="wake-shade"></div>
    <span class="wake-sleep" aria-hidden="true">z <small>z</small></span>
    <button id="wake-button" type="button" aria-label="Wake the executioner" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21L16 5M12 5L17 2 22 5 20 11 15 12 11 9"/></svg></button>
    <span id="wake-status" class="visually-hidden" role="status">The executioner is asleep. Tap the glowing axe to wake him.</span>
  </div>`;
  const button=gate.querySelector('#wake-button');
  setTimeout(()=>{if(gate.isConnected){button.hidden=false;button.focus({preventScroll:true});}},2200);
  function press(){
    if(button.hidden||button.disabled||finished)return;
    presses++;button.disabled=true;gate.style.setProperty('--wake-progress',presses/5);gate.dataset.wake=presses;
    gate.querySelector('#wake-status').textContent=presses===5?'Awake. Your first day begins.':'Waking up. '+presses+' of 5.';
    button.setAttribute('aria-label',presses<5?'Wake the executioner · '+(5-presses)+' more taps':'Begin your first day');
    window.ChopAudio?.play('aim');
    if(presses===5){finished=true;restoredTimeOfDay=.30;setTimeout(()=>startGame(),900);}
    else setTimeout(()=>{if(gate.isConnected)button.disabled=false;},450);
  }
  gate.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();if(event.target.closest('#wake-button'))press();},true);
  gate.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)press();}},true);
})();
