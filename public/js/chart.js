var App = new Application();
var Template = new Templates();
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
  }

  App.init();

  // Load the Visualization API and the corechart package.
  google.charts.load('current', { 'packages': ['corechart'] });

  // Set a callback to run when the Google Visualization API is loaded.
  google.charts.setOnLoadCallback(drawChart);

  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  function drawChart() {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Mushrooms', 3],
      ['Onions', 1],
      ['Olives', 1],
      ['Zucchini', 1],
      ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {
      'title': 'How Much Pizza I Ate Last Night',
      'width': 400,
      'height': 300
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }

  app.getLayout = async () => {
    const templateLayoutName = 'layout-1';
    await fetch('/js/json-templates/' + templateLayoutName + '.json', { method: 'POST' })
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // app.createLayout(data);
        // imposto i dati di questo Template nella classe
        Template.templateLayoutData = data;
        // creo il template nel DOM
        Template.createLayout();
        // recupero i dati del template-reports-*
        // app.getTemplateReports();
      })
      .catch(err => console.error(err));
  }

  app.getLayout();

})();
