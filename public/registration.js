// reegistrazione del ServiceWorker. Prima fase del lifecycle del Service Worker.
(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // In uno script chiamato service-worker.js si ascoltano gli eventi di :
      // - installazione
      // - attivazione
      // che sono le altre due fasi del lifecycle del ServiceWorker
      navigator.serviceWorker.register('service-worker.js').then((registration) => {
        // console.log('registered');
        console.log(registration);
      }, (err) => {
        console.log(err);
      });
    });
  } else {
    // alert('No service worker support in this browser');
    console.error('No service worker support in this browser');
  }
})();
