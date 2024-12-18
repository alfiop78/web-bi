let dataTable;
let wrappers = [];
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

function filterSelected(e) {
  // console.log(this);
  // console.log(e.getControl());
  // console.log(this.getControl());
  // console.log(this.getOption('filterColumnLabel'));
  // console.log(e.getState());
  const controlColumn = this.getOption('filterColumnLabel');
  // il controllo selezionato deve essere clonato se viene trovato un altro controllo con lo stesso nome
  const currentControl = this;
  // valore selezionato nel Control
  const value = e.getState().selectedValues;
  // cerco tutti i Control che hanno la stessa colonna (es. : 'sede')
  Resource.dashboardControls.forEach(control => {
    if (control.getOption('filterColumnLabel') === controlColumn) {
      control.setState({ selectedValues: [value] });
      currentControl.clone();
      control.draw();
    }
  });

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
    wrappers = [];
    for (const [ref, wrapper] of Object.entries(Resource.specs.wrappers)) {
      Resource.ref = document.getElementById(ref);
      const chartWrapper = new google.visualization.ChartWrapper();
      // Resource.chartWrapper = new google.visualization.ChartWrapper();
      // imposto sempre Table di default
      chartWrapper.setChartType(Resource.specs.wrappers[ref].chartType);
      chartWrapper.setContainerId(Resource.ref.id);
      chartWrapper.setOptions(wrapper.options);
      if (wrapper.chartType === 'Table') {
        chartWrapper.setOption('height', 'auto');
        chartWrapper.setOption('pageSize', 15);
      }
      getDataView();
      console.log(Resource.viewDefined);
      console.log(Resource.dataViewGrouped);
      // debugger;
      // Resource.chartWrapper.setView(Resource.dataViewGrouped);
      let v = new google.visualization.DataView(Resource.dataTable);
      v.setColumns(Resource.viewDefined);
      console.log(v);
      chartWrapper.setView(v);
      console.log(chartWrapper.getView());
      // google.visualization.events.addListener(chartWrapper, 'ready', ready);
      wrappers.push(chartWrapper);
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

    google.visualization.events.addListener(gdashboard, 'ready', ready);

    gdashboard.draw(Resource.dataTable);
  })
}

function ready() {
  for (const wrapper of Object.values(Resource.specs.wrappers)) {
    // console.log(wrapper.group);
    // creo il secondo parametro della funzione 'group'
    let keys = [], columns = [];
    // valorizzo l'elenco di key con cui raggruppare (parametro 'key' della funzione google.visualization.group)
    wrapper.group.key.forEach(value => {
      if (value.properties.grouped) {
        // è una colonna che deve far parte della funzione 'group'
        keys.push({ id: value.id, column: Resource.dataTable.getColumnIndex(value.id), label: value.label, type: value.type })
      }
    });
    // valorizzo l'elenco delle metriche (parametro 'columns' della funzione google.visualization.group)
    wrapper.group.columns.forEach(column => {
      // const index = Resource.dataTable.getColumnIndex(column.alias);
      // TODO: modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
      let aggregation;
      switch (column.aggregateFn) {
        case 'COUNT':
        case 'MIN':
        case 'MAX':
          aggregation = 'sum';
          break;
        default:
          aggregation = (column.aggregateFn) ? column.aggregateFn.toLowerCase() : 'sum';
          break;
      }
      columns.push({
        id: column.alias,
        column: Resource.dataTable.getColumnIndex(column.alias),
        aggregation: google.visualization.data[aggregation],
        type: 'number',
        label: column.label
      });
    });
    // console.log(keys, columns);
    // calcolo la funzione 'group'
    const dataGroup = google.visualization.data.group(
      // Resource.dataTable, keys, columns
      // in questo caso, utilizzando sempre la DataTable iniziale, questa non è filtrata quando si modificano i filtri.
      // utilizzando invece uno degli elementi chart presente nella dashboard (es.: il primo) questo è filtrato quando si applica un filtro
      wrappers[0].getDataTable(), keys, columns
    );
    console.log(dataGroup);
    // ridisegno utilizzando il chartWrapper
    let redraw = new google.visualization.ChartWrapper({
      chartType: wrapper.chartType,
      containerId: wrapper.containerId,
      dataTable: dataGroup
    });
    redraw.draw();
  }
}
