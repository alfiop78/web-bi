var App = new Application();
const popover__progressBar = document.getElementById('popover__progressBar');
const progressBar = document.getElementById('progressBar');
const progressTo = document.getElementById('progressTo');
const progressTotal = document.getElementById('progressTotal');
const progressLabel = document.querySelector("label[for='progressBar']");
(() => {
  App.init();

  // Load the Visualization API and the corechart package.
  google.charts.load('current', { 'packages': ['corechart', 'controls'], 'language': 'it' });

  document.querySelectorAll('a[data-token]').forEach(a => {
    a.addEventListener('click', async (e) => {
      // scarico il json dal DB, lo salvo in sessionStorage
      await fetch(`/fetch_api/name/${e.currentTarget.dataset.token}/dashboard_show`)
        .then((response) => {
          // console.log(response);
          if (!response.ok) { throw Error(response.statusText); }
          return response;
        })
        .then((response) => response.json())
        .then(data => {
          Resource = new Resources();
          // console.log(data);
          Resource.json = JSON.parse(data.json_value);
          // debugger;
          document.querySelector('h1.title').innerHTML = Resource.json.title;
          getLayout()
        })
        .catch(err => {
          App.showConsole(err, 'error');
          console.error(err);
        });
    });
  });

  // Esempio di request in POST
  // WARN: per la chiamata in POST bisogna aggiungere la route in VerifyCrsfToken.php
  /* const params = sheet.id;
  const url = `/fetch_api/datamart`;
  const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
  const req = new Request(url, init);
  await fetch(req)
    .then((response) => {
      console.log(response);
      if (!response.ok) { throw Error(response.statusText); }
      return response;
    })
    .then((response) => response.json())
    .then(data => {
      console.log(data);
      // debugger;
      Resource.data = data;
      google.charts.setOnLoadCallback(app.drawDashboard(data));
      // google.charts.setOnLoadCallback(app.drawTable(data));
    })
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    }); */
  // end chiamta in POST

  // popover__progressBar.showPopover();
})();
