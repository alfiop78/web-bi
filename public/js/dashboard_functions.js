function getDataView() {
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
    Resource.dataTable, Resource.groupKey, Resource.groupColumn
  );

  Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
  Resource.createDataView();
}

function newDraw() {
  Resource.multiData.forEach(datamart => {
    Resource.data = datamart.data;
    Resource.specs = datamart.specs;
    console.log(Resource.specs);
    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    Resource.ref = document.getElementById(datamart.ref);
    let gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    const controls = Resource.drawControls(document.getElementById('filter__dashboard'));
    let wrappers = [];
    for (const [ref, wrapper] of Object.entries(Resource.specs.wrappers)) {
      Resource.ref = document.getElementById(ref);
      Resource.chartWrapper = new google.visualization.ChartWrapper();
      // imposto sempre Table di default
      Resource.chartWrapper.setChartType(Resource.specs.wrappers[ref].chartType);
      Resource.chartWrapper.setContainerId(Resource.ref.id);
      if (wrapper.chartType === 'Table') {
        wrapper.options.height = 'auto';
        wrapper.options.pageSize = 15;
      }
      Resource.chartWrapper.setOptions(Resource.specs.wrappers[ref].options);
      // Resource.chartWrapper.setOptions(wrapper.options);
      getDataView();
      console.log(Resource.viewDefined);
      console.log(Resource.dataViewGrouped);
      debugger;
      // Resource.chartWrapper.setView(Resource.dataViewGrouped);
      let v = new google.visualization.DataView(Resource.dataTable);
      v.setColumns(Resource.viewDefined);
      console.log(v);
      Resource.chartWrapper.setView(v);
      console.log(Resource.chartWrapper.getView());
      wrappers.push(Resource.chartWrapper);
    }
    // TEST: 17.12.2024 logica utilizzata per condizionare un filtro in base a quello precedente (funzionante sui dashboard con un solo datatable)
    /* let binds;
    // Questa logica funziona con il bind() di un filtro verso quello successivo ma
    // possono esserci anche situazioni diverse, che sono da implementare
    Resource.specs.bind.forEach((v, index) => {
      // console.log('index', index);
      if (index === 0) {
        // il primo bind deve essere creato dall'istanza gdashboard, i successivi posso legarli ad una variabile
        binds = gdashboard.bind(controls[v[0]], controls[v[1]]);
      } else {
        binds.bind(controls[v[0]], controls[v[1]]);
      }
    });
    // Tutti i controlli influenzano i chartWrappers
    binds.bind(controls, wrappers); */

    gdashboard.bind(controls, wrappers);


    // NOTE: esempio array di View
    // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
    // table.setView({ columns: [1, 3, 5, 7, 9, 16] });

    // google.visualization.events.addListener(Resource.chartWrapper, 'ready', onReady);

    gdashboard.draw(Resource.dataTable);
  })
}

