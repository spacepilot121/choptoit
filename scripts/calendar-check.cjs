const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {create} = require('../campaign.js');
const root = path.resolve(__dirname, '..');
const context = {window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dayNightCycle.js'),'utf8'), context);
const Cycle = context.window.DayNightCycle;
function clock(time=.25) {
  const cycle = new Cycle();
  cycle.scene = {};
  cycle.timeOfDay = time;
  cycle.updateOverlay = cycle.updateCelestials = () => {};
  return cycle;
}
for (const seconds of [0,-1,Infinity,NaN]) assert.throws(()=>new Cycle({dayLengthSeconds:seconds}),/positive/);
const exact=clock();
let days=0;
const hours=[];
exact.onFullDay(()=>days++);
exact.onHourlyExecution(hour=>hours.push(hour));
exact.update(180);
assert.equal(days,1,'A full day must advance even when the clock returns to the same time');
assert.equal(exact.timeOfDay,.25);
assert.deepEqual(hours,[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1,2,3,4,5,6]);
exact.update(360);
assert.equal(days,3);
assert.equal(hours.length,72);
const prior=exact.timeOfDay;
for (const delta of [-1,NaN,Infinity]) exact.update(delta);
assert.equal(exact.timeOfDay,prior);
assert.equal(days,3);
exact.update(0);
assert.equal(hours.length,72,'Redrawing a restored clock must not execute an hour twice');
for (const fps of [30,60,120,144]) {
  const cycle=clock();
  for(let frame=0;frame<fps*360;frame++) cycle.update(1/fps);
  assert.equal(cycle.currentDayCount,2,`Calendar drift at ${fps} FPS`);
  assert.ok(Math.abs(cycle.timeOfDay-.25)<1e-8);
}
// Exercise the actual game's date/deadline bridge, not a duplicate calendar.
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const calendar={Campaign:create(),currentDay:29,currentMonth:11,months:Array(12),dateText:null,SaveManager:{save(){}},dailyMarketUpdate(){}};
calendar.Campaign.restore({days:358});
vm.createContext(calendar);
vm.runInContext(html.slice(html.indexOf('function advanceDays('),html.indexOf('function isMenuOpen(')),calendar);
const deadline=clock(23/24);
deadline.onFullDay(()=>calendar.advanceCalendarDays(1));
deadline.update(187.5);
assert.equal(calendar.currentDay,1);
assert.equal(calendar.currentMonth,0);
assert.equal(calendar.Campaign.state.days,360);
assert.equal(calendar.Campaign.state.ending,'expired');
assert.equal(deadline.timeOfDay,0);
console.log('Calendar counts every midnight and hour across long updates; frame rates agree, invalid deltas are ignored, and year-end expires the real campaign.');
