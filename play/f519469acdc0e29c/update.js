(() => {
  const button=document.getElementById('update'),status=document.getElementById('status');
  let updating=false;
  navigator.serviceWorker?.addEventListener('message',event=>{
    const d=event.data;if(updating&&d?.type==='choptoit-offline-progress')status.textContent='Downloading the latest game · '+d.completed+' / '+d.total;
  });
  button.addEventListener('click',async()=>{
    if(updating)return;updating=true;button.disabled=true;status.textContent='Checking for the latest game…';
    try{
      if(!('serviceWorker' in navigator))throw Error('Open this page in Chrome or Safari while connected to the internet.');
      const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      await registration.update();
      let worker=registration.installing || registration.waiting;
      if(worker&&worker.state!=='installed'&&worker.state!=='activated'){
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(Error('The download is taking too long. Check your connection and try again.'));},120000);
          function changed(){if(worker.state==='installed'||worker.state==='activated'){clearTimeout(timer);worker.removeEventListener('statechange',changed);resolve();}else if(worker.state==='redundant'){clearTimeout(timer);worker.removeEventListener('statechange',changed);reject(Error('The download could not finish. Your saved progress is safe. Please try again.'));}}
          worker.addEventListener('statechange',changed);changed();
        });
      }
      worker=registration.waiting || worker;
      if(worker&&worker.state==='installed'){
        status.textContent='Opening your updated game…';
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(Error('The update is ready. Please try again to open it.'));},20000);
          function changed(){if(worker.state==='activated'){clearTimeout(timer);worker.removeEventListener('statechange',changed);resolve();}}
          worker.addEventListener('statechange',changed);worker.postMessage({type:'choptoit-activate-update'});changed();
        });
      }
      location.replace(new URL('index.html',location.href).href);
    }catch(error){status.textContent=error.message || 'Could not update. Check your connection and try again.';button.disabled=false;button.textContent='Try again';updating=false;}
  });
})();
