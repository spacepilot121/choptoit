/* Original synthesized cues: no downloads, playback starts on user interaction. */
(() => {
  'use strict';
  let context, timer, step = 0, effects = true, music = false, unlocked = false;
  try {
    effects = localStorage.getItem('choptoit-sound') !== 'off';
    music = localStorage.getItem('choptoit-music') === 'on';
  } catch (_) {}
  function note(frequency, duration, volume = .04, offset = 0, end = frequency, type = 'triangle') {
    if (!context || context.state !== 'running') return;
    const start = context.currentTime + offset;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(end, start + duration);
    gain.gain.setValueAtTime(.001, start);
    gain.gain.linearRampToValueAtTime(volume, start + .008);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(start); oscillator.stop(start + duration + .02);
  }
  const melody = [293.66,349.23,440,392,349.23,293.66,261.63,0,293.66,440,523.25,440,392,349.23,293.66,0];
  function musicTick() {
    if (!music || document.hidden || !unlocked) return;
    const pitch = melody[step % melody.length];
    if (pitch) note(pitch, .32, .018);
    if (step % 4 === 0) note(step % 16 < 8 ? 146.83 : 130.81, .65, .014, 0, undefined, 'sine');
    step++; timer = setTimeout(musicTick, 380);
  }
  function refreshMusic() {
    clearTimeout(timer); timer = null;
    if (music && unlocked && !document.hidden && context?.state === 'running') musicTick();
  }
  async function unlock() {
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') await context.resume();
      if (!unlocked) { unlocked = true; refreshMusic(); }
    } catch (_) {}
  }
  function play(kind) {
    if (!effects || document.hidden) return;
    if (kind === 'launch') { note(420,.22,.035,0,85); note(100,.15,.045,.03,45,'sine'); }
    else if (kind === 'shield') { note(180,.16,.035,0,75,'square'); note(730,.08,.015); }
    else if (kind === 'reward') [523.25,659.25,783.99,1046.5].forEach((f,i)=>note(f,.2,.035,i*.075));
    else if (kind === 'chop') { note(150,.14,.065,0,45,'sine'); note(650,.045,.025,0,100); }
    else if (kind === 'miss') note(190,.22,.03,0,85);
    else if (kind === 'aim') note(480,.06,.025);
    else { note(880,.12,.035); note(1320,.1,.018,.03); }
  }
  document.addEventListener('pointerdown', unlock, {passive:true});
  document.addEventListener('keydown', unlock);
  function suspend() {
    clearTimeout(timer); timer = null;
    context?.suspend().catch(()=>{}); unlocked = false;
  }
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer); timer = null;
    if (document.hidden) suspend();
  });
  window.ChopAudio = {
    play, suspend,
    get effects() { return effects; }, get music() { return music; },
    toggle(kind) {
      if (kind === 'music') music = !music; else effects = !effects;
      try { localStorage.setItem(kind === 'music' ? 'choptoit-music' : 'choptoit-sound', (kind === 'music' ? music : effects) ? 'on' : 'off'); } catch (_) {}
      refreshMusic();
      if (kind !== 'music') play('aim');
    }
  };
})();
