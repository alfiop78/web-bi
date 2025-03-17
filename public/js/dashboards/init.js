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

  // scarico il json dal DB, lo salvo in sessionStorage
  const template__layout = document.getElementById('template-layout');
  fetch(`/fetch_api/name/${template__layout.dataset.token}/dashboard_show`)
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
      getLayout();
    })
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    });

})();

