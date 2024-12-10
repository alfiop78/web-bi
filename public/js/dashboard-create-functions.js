function draw() {
  // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
  // è consentità con la DataView perchè questa è read-only
  Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
  // definisco la formattazione per le percentuali e per i valori currency
  // console.log(dataFormatted);
  var gdashboard = new google.visualization.Dashboard(Resource.dashboardContent);
  // imposto i filtri per questa dashboard
  const controls = Resource.drawControls_create(document.getElementById(`flt__${Resource.ref.id}`));

  // console.log(JSON.parse(Resource.view.toJSON()));
  // utilizzo senza i metodi setter. Le proprietà del ChartWrapper sono incluse in Resource.specs
  // var wrap = new google.visualization.ChartWrapper(Resource.specs.wrapper);
  // utilizzo con i metodi setter
  // creo il ChartWrapper Table, anche se questo Sheet ha più ChartWrapper creati, imposterò un tasto per fare lo swicth e cambiare la visualizzazione
  Resource.chartWrapper = new google.visualization.ChartWrapper();
  // imposto sempre Table di default
  Resource.chartWrapper.setChartType('Table');
  Resource.chartWrapper.setContainerId(Resource.ref.id);
  Resource.chartWrapper.setDataTable(Resource.dataTable);
  console.log(Resource.specs.wrapper.Table.options);
  Resource.chartWrapper.setOption('height', 'auto');
  Resource.chartWrapper.setOption('allowHTML', true);
  Resource.chartWrapper.setOption('page', 'enabled');
  Resource.chartWrapper.setOption('pageSize', 15);
  Resource.chartWrapper.setOption('width', '100%');
  Resource.chartWrapper.setOption('cssClassNames', {
    "headerRow": "g-table-header",
    "tableRow": "g-table-row",
    "oddTableRow": null,
    "selectedTableRow": null,
    "hoverTableRow": null,
    "headerCell": "g-header-cell",
    "tableCell": "g-table-cell",
    "rowNumberCell": null
  });

  // NOTE: esempio array di View
  // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
  // table.setView({ columns: [1, 3, 5, 7, 9, 16] });

  google.visualization.events.addListener(Resource.chartWrapper, 'ready', onReady);

  gdashboard.bind(controls, Resource.chartWrapper);
  gdashboard.draw(Resource.dataTable);
}

function onReady() {
  // esempio utilizzato senza impostare le metriche contenute nelle composite
  console.log('onReady');
  // let tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
  // console.log(groupColumnsIndex);
  // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
  Resource.groupFunction();
  // Al momento non utilizzo il Metodo groupFunction() nella classe Dashboard
  // perchè da qui richiamo il wrapper del ChartWrapper invece dal report non c'è il ChartWrapper
  // TODO: potrei crearlo anche l' il ChartWrapper
  Resource.dataGroup = new google.visualization.data.group(
    Resource.chartWrapper.getDataTable(), Resource.groupKey, Resource.groupColumn
  );
  console.log('dataGroup : ', Resource.dataGroup);
  Resource.chartWrapperView = new google.visualization.ChartWrapper();
  Resource.chartWrapperView.setChartType(Resource.specs.wrapper[Resource.wrapper].chartType);
  Resource.chartWrapperView.setContainerId(Resource.ref.id);
  if (Resource.wrapper === 'Table') {
    Resource.chartWrapperView.setOption('height', 'auto');
    Resource.chartWrapperView.setOption('allowHTML', true);
    Resource.chartWrapperView.setOption('page', 'enabled');
    Resource.chartWrapperView.setOption('pageSize', 15);
    Resource.chartWrapperView.setOption('width', '100%');
    Resource.chartWrapperView.setOption('cssClassNames', {
      "headerRow": "g-table-header",
      "tableRow": "g-table-row",
      "oddTableRow": null,
      "selectedTableRow": null,
      "hoverTableRow": null,
      "headerCell": "g-header-cell",
      "tableCell": "g-table-cell",
      "rowNumberCell": null
    });
  } else {
    Resource.chartWrapperView.setOptions(Resource.specs.wrapper[Resource.wrapper].options);
  }
  // formatter
  /* Resource.specs.wrapper[Resource.wrapper].group.columns.forEach(metric => {
    let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
    formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
  }); */

  Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
  Resource.createDataView();

  Resource.chartWrapperView.setDataTable(Resource.dataViewGrouped);
  Resource.chartWrapperView.draw();
}

function addDashboardFilters(e) {
  const parent = document.getElementById('filter__dashboard');
  console.log(e.currentTarget.dataset.id);
  e.currentTarget.style.color = 'red';
  const div = document.createElement('div');
  div.dataset.id = e.currentTarget.dataset.id;
  div.innerText = e.currentTarget.dataset.name;
  parent.appendChild(div);

}
