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
  // {method: 'GET', headers: {'Authorization': 'Basic ' + btoa('lynxuser:password')}}
  fetch(`/fetch_api/name/${template__layout.dataset.token}/dashboard_show`)
    .then((response) => {
      // console.log(response);
      if (!response.ok) { throw Error(response.statusText); }
      return response;
    })
    .then((response) => response.json())
    .then(async data => {
      Resource = new Resources();
      // console.log(data);
      Resource.json = JSON.parse(data.json_value);
      let urls = [];
      // TODO: recupero le metriche composte per scaricarle in sessionStorage, queste vengono utilizzate in CreateDataViewGrouped()
      for (const value of Object.values(Resource.json.resources)) {
        // key : il token del report
        for (const wrapper of Object.values(value.wrappers)) {
          wrapper.group.columns.forEach(column => {
            if (column.type === 'composite') {
              urls.push(`/fetch_api/name/${column.token}/metric_show`);
            }
          });
        }
      }
      document.getElementsByTagName('title')[0].innerText = Resource.json.title;
      await getCompositeMetrics(urls);
      getLayout();
    })
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    });

})();

