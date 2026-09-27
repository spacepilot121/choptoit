(() => {
  'use strict';
  let installEvent=null, installed=window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', event=>{event.preventDefault();installEvent=event;});
  window.addEventListener('appinstalled', ()=>{installed=true;installEvent=null;});
  window.ChopInstall={
    get available(){return !!installEvent && !installed;},
    get installed(){return installed;},
    async prompt(){
      if(!installEvent || installed) return 'unavailable';
      const event=installEvent;installEvent=null;
      try { await event.prompt();return (await event.userChoice).outcome; }
      catch (_) { return 'failed'; }
    }
  };
  // Leave localhost uncached during development. ?offline-test=1 exercises the
  // exact release path deliberately, without making normal previews stale.
  const local = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const allowed = !local || new URLSearchParams(location.search).has('offline-test');
  window.ChopOffline = {status:allowed?'Preparing offline play…':'Local development preview'};
  if (!allowed || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      const ready = () => { window.ChopOffline.status='Ready to play offline'; };
      if (registration.active) ready();
      else navigator.serviceWorker.ready.then(ready);
      registration.addEventListener('updatefound', () => {
        const worker=registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state==='installed' && registration.active) window.ChopOffline.status='Update ready · close all game tabs to use it';
          if (worker.state==='redundant' && !registration.active) window.ChopOffline.status='Offline download incomplete · reconnect and reopen';
        });
      });
    } catch (_) { window.ChopOffline.status='Offline play unavailable · keep a connection for now'; }
  });
})();
