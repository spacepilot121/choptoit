const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const events = {}, storage = new Map(), timers = new Map();
let created = 0, started = 0, stopped = 0, nextTimer = 0, context;
const param = {setValueAtTime(n){assert.ok(Number.isFinite(n));},linearRampToValueAtTime(n){assert.ok(n>0);},exponentialRampToValueAtTime(n){assert.ok(n>0);}};
class AudioContext {
  constructor(){created++;context=this;this.state='running';this.currentTime=0;}
  createOscillator(){return {frequency:param,connect(){},disconnect(){},start(){started++;},stop(){stopped++;}};}
  createGain(){return {gain:param,connect(){},disconnect(){}};}
  suspend(){this.state='suspended';return Promise.resolve();}
  resume(){this.state='running';return Promise.resolve();}
}
const sandbox = {window:{AudioContext},document:{hidden:false,addEventListener:(name,fn)=>events[name]=fn},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id)};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../audio.js'),'utf8'),sandbox);
(async()=>{
  const audio=sandbox.window.ChopAudio;
  assert.equal(created,0,'No audio context before interaction');
  await events.pointerdown();
  for(const cue of ['aim','launch','shield','reward','chop','miss','hit']) audio.play(cue);
  assert.ok(started>10);assert.equal(started,stopped,'Every voice gets a scheduled stop');
  audio.toggle('sound');const muted=started;audio.play('reward');assert.equal(started,muted);
  audio.toggle('music');assert.equal(timers.size,1);assert.ok(started>muted,'Music works with effects muted');
  await events.pointerdown();assert.equal(timers.size,1,'Repeated gestures do not duplicate music');
  sandbox.document.hidden=true;events.visibilitychange();assert.equal(timers.size,0);assert.equal(context.state,'suspended');
  const hidden=started;audio.play('hit');assert.equal(started,hidden);
  sandbox.document.hidden=false;await events.pointerdown();assert.equal(timers.size,1);assert.equal(created,1);
  audio.toggle('music');assert.equal(timers.size,0);assert.equal(storage.get('choptoit-music'),'off');
  console.log('Audio waits for interaction; cues stop; mute, independent music, background suspension and single-loop resume pass.');
})().catch(error=>{console.error(error);process.exitCode=1;});
