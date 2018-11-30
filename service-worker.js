addEventListener('backgroundfetchsuccess', event => {
  console.log('[Service Worker]: Background Fetch Success', event.registration);
  event.waitUntil(
    (async function() {
      try {
        // Iterating the records to populate the cache
        const cache = await caches.open(event.registration.id);
        const records = await event.registration.matchAll();
        const promises = records.map(async record => {
          const response = await record.responseReady;
          await cache.put(record.request, response);
        });
        await Promise.all(promises);

        // [Optional] This could be an API call to our backend
        let assetsDataResponse = await fetch(
          `/assets/${event.registration.id}-data.json`
        );
        let assetsData = await assetsDataResponse.json();

        // Updating UI
        await event.updateUI({
          title: `${assetsData.title} is ready`,
          icons: assetsData.icons
        });
      } catch (err) {
        await event.updateUI({
          title: `${assetsData.title} failed: ${
            event.registration.failureReason
          }`
        });
      }
    })()
  );
});

addEventListener('backgroundfetchfail', event => {
  console.log('[Service Worker]: Background Fetch Fail', event.registration);
  event.waitUntil(
    (async function() {
      try {
        const cache = await caches.open(event.registration.id);
        const records = await event.registration.matchAll();
        const promises = records.map(async record => {
          const response = await record.responseReady;
          if (response && response.ok) {
            await cache.put(record.request, response);
          }
        });
        await Promise.all(promises);
      } finally {
        // [Optional] This could be an API call to our backend
        let assetsDataResponse = await fetch(
          `/assets/${event.registration.id}-data.json`
        );
        let assetsData = await assetsDataResponse.json();

        // Updating UI
        await event.updateUI({
          title: `${assetsData.title} failed: ${
            event.registration.failureReason
          }`
        });
      }
    })()
  );
});

addEventListener('backgroundfetchabort', event => {
  console.log('[Service Worker]: Background Fetch Abort', event.registration);
  console.error('Aborted by the user. No data was saved.');
});

addEventListener('backgroundfetchclick', event => {
  console.log('[Service Worker]: Background Fetch Click', event.registration);
  event.waitUntil(
    (async function() {
      let assetsDataResponse = await fetch(
        `/assets/${event.registration.id}-data.json`
      );
      let assetsData = await assetsDataResponse.json();

      clients.openWindow(assetsData.descriptionUrl);
    })()
  );
});

self.addEventListener('install', event => {
  console.log('[Service Worker]: Installed');
});

self.addEventListener('activate', event => {
  console.log('[Service Worker]: Active');
});
