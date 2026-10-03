(function(root) {
  'use strict';
  const chapters = [
    {title:'The price of freedom',speaker:'Oswin · royal clerk',portrait:'assets/oswin-angular.png',reward:40,
      text:'“A million and one, before the year ends. The one is my processing fee.” Oswin slides the contract across the table. Three clean jobs will cover a proper blade. For now, that is enough of a plan.',
      after:'A folded note arrives with your first wages: “The debt is real. The amount is not. Find me in Durham. — M.”',
      goals:[{key:'chops',value:3,label:'Land 3 successful chops'}]},
    {title:'A crowd worth keeping',speaker:'Merrin · travelling fool',portrait:'assets/merrin-angular.png',reward:400,
      text:'Merrin hangs a painted target over the square. “The crowd pays for a show. Give them one, and I will introduce you to people who keep better records than the Crown.”',
      after:'Merrin takes a bow. Under the paint on his target is a scrap of the royal accounts. Your debt appears twice, in two different hands.',
      goals:[{key:'targets',value:5,label:'Hit 5 flying targets'},{key:'weapon',value:2,label:'Upgrade your weapon to level 2'}]},
    {title:'The other ledger',speaker:'Agnes · Durham merchant',portrait:'assets/agnes-angular.png',reward:4000,
      text:'Agnes has spent twenty years paying the same tax. “Buy something useful. Sell it on. Learn what a fair price looks like. Then you will understand what they stole.”',
      after:'Agnes opens her strongbox. Every merchant on the road has been charged for a bridge that was never built. She hires you to carry their claim south.',
      goals:[{key:'Durham',value:1,label:'Visit Durham'},{key:'sold',value:10,label:'Sell 10 goods at market'}]},
    {title:'A most public secret',speaker:'Merrin · no longer joking',portrait:'assets/merrin-angular.png',reward:30000,
      text:'“In Chester, they listen to celebrities. Unfortunately, that means you.” Merrin has booked the square. Draw a crowd big enough to make the missing bridge impossible to ignore.',
      after:'The square erupts. A guard quietly gives you a sealed order: the missing money went to the royal clerk. Oswin is waiting in London.',
      goals:[{key:'Chester',value:1,label:'Visit Chester'},{key:'rank',value:5,label:'Reach rank 5'},{key:'targets',value:20,label:'Hit 20 flying targets'}]},
    {title:'The clerk of all things',speaker:'Oswin · increasingly nervous',portrait:'assets/oswin-angular.png',reward:180000,
      text:'“An accounting discrepancy,” says Oswin. “A very large one.” He offers a purse for your silence. Agnes has a better idea: earn the crowd, open the accounts, and make him return every coin.',
      after:'The accounts are read aloud. For the first time, Oswin has nothing to add. The recovered money belongs to the towns. They vote to pay you for finishing the job.',
      goals:[{key:'London',value:1,label:'Reach London'},{key:'weapon',value:8,label:'Upgrade your weapon to level 8'},{key:'targets',value:40,label:'Hit 40 flying targets'}]},
    {title:'One last performance',speaker:'Agnes · keeper of the new ledger',portrait:'assets/agnes-angular.png',reward:850000,
      text:'The towns commission one final tour. No secret taxes. No invented debt. Fifty successful chops and sixty targets will put your name on a contract that actually means what it says.',
      after:'A purse arrives from every town on the road. Merrin weighs the last one. “You could buy your freedom. Or buy the whole rotten office and change how it works.” For once, the choice is yours.',
      goals:[{key:'chops',value:50,label:'Land 50 successful chops'},{key:'targets',value:60,label:'Hit 60 flying targets'},{key:'fame',value:15,label:'Earn 15 fame'}]}
  ];
  function create() {
    let state = {claimed:0,targets:0,sold:0,days:0,visited:['York'],ending:null,epilogueSeen:false};
    const cleanNumber = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
    function restore(data, fallbackDays=0) {
      const d=data && typeof data==='object' ? data : {};
      state={claimed:Math.min(chapters.length,cleanNumber(d.claimed)),targets:cleanNumber(d.targets),sold:cleanNumber(d.sold),days:cleanNumber(d.days ?? fallbackDays),visited:Array.isArray(d.visited) ? d.visited.filter(x=>typeof x==='string').slice(0,20):['York'],ending:['freedom','reform','expired'].includes(d.ending)?d.ending:null,epilogueSeen:d.epilogueSeen===true};
      if (state.days >= 360 && !state.ending) { state.ending='expired'; state.epilogueSeen=false; }
    }
    function progress(stats) {
      const chapter=chapters[state.claimed];
      if (!chapter) return [];
      const values={chops:stats.chops,weapon:stats.weapon,rank:stats.rank,fame:stats.fame,targets:state.targets,sold:state.sold};
      return chapter.goals.map(goal=>({...goal,current:values[goal.key] ?? (state.visited.includes(goal.key)?1:0)}));
    }
    function claim(stats) {
      if (state.ending || state.days>=360 || state.claimed>=chapters.length || !progress(stats).every(g=>g.current>=g.value)) return null;
      const chapter=chapters[state.claimed++];
      return chapter;
    }
    function nextObjective(stats, gold=0) {
      if (state.ending) return {caption:'FREE PLAY · YOUR STORY IS IN THE LEDGER',text:state.ending==='expired'?'Keep playing or begin a new story':'Your debt is settled. The road is yours.',ready:false};
      const caption=`CHAPTER ${Math.min(chapters.length,state.claimed+1)} · ${Math.max(0,360-state.days)} DAYS LEFT`;
      const chapter=chapters[state.claimed];
      if (!chapter) return {caption,text:gold>=1000001?'Choose your ending →':`${Math.floor(gold).toLocaleString()} / 1,000,001 gold for freedom`,ready:gold>=1000001};
      const remaining=progress(stats).filter(g=>g.current<g.value);
      if (!remaining.length) return {caption:'CONTRACT COMPLETE',text:`Collect ${chapter.reward.toLocaleString()} gold →`,ready:true};
      // Surface concrete preparation before asking for more target hits.
      const next=remaining.find(g=>g.key==='weapon') || remaining[0];
      return {caption,text:`${next.label} · ${Math.min(next.current,next.value)}/${next.value}`,ready:false};
    }
    function visit(city) { if (!state.visited.includes(city)) state.visited.push(city); }
    function advance(days) { state.days += cleanNumber(days); if (state.days>=360 && !state.ending) state.ending='expired'; }
    function finish(choice,gold) {
      if (!['freedom','reform'].includes(choice) || state.ending || state.days>=360 || state.claimed!==chapters.length || gold<1000001) return false;
      state.ending=choice;return true;
    }
    return {get state(){return state;},chapters,restore,progress,claim,nextObjective,visit,advance,finish};
  }
  if(typeof module!=='undefined') module.exports={create,chapters};
  else root.Campaign=create();
})(typeof window!=='undefined'?window:globalThis);
