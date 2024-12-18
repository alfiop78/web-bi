let dataTable;
let wrappers = [];

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
    // console.log(Resource.specs);
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
      chartWrapper.setChartType(wrapper.chartType);
      chartWrapper.setContainerId(Resource.ref.id);
      chartWrapper.setOptions(wrapper.options);
      if (wrapper.chartType === 'Table') {
        chartWrapper.setOption('height', 'auto');
        chartWrapper.setOption('pageSize', 15);
      }
      // effettuo il raggruppamento deciso in fase di creazione report e creo la DataViewGroup
      Resource.group = wrapper.group;
      const dataGroup = Resource.createDataTableGrouped();
      Resource.createDataViewGrouped(dataGroup);
      // ... a questo punto gli indici di colonna della Resource.dataViewGrouped non
      // corrispondono più alla DataTable che viene disegnata dalla Dashboard (sotto, Resource.dataTable)
      // per cui creo un ulteriore DataView che, con il setColumns(), imposta le colonne corrette riferendosi alla Resource.dataTable
      // utilizzando i nomi di colonna anzichè gli indici (che sono diversi tra DataTable/DataGroup)
      const dataView = new google.visualization.DataView(Resource.dataTable);
      dataView.setColumns(Resource.viewDefined);
      chartWrapper.setView(dataView);
      // console.log(chartWrapper.getView());
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
    Resource.group = wrapper.group;
    // WARN: 18.12.2024 al momento recupero il primo wrapper della dashboard, in questo modo
    // quando si utilizzano i filtri, passo a createDataTableGrouped() una DataTable già filtrata.
    // Valutare se utilizzare l'index del wrapper in ciclo perchè se, in una dashboard si decide che il primo
    // grafico NON è influenzato dai filtri, qui non funzionerà con wrappers[0]
    const dataGroup = Resource.createDataTableGrouped(wrappers[0].getDataTable());
    Resource.createDataViewGrouped(dataGroup);
    // console.log(dataGroup);
    // ridisegno utilizzando il chartWrapper
    let redraw = new google.visualization.ChartWrapper({
      chartType: wrapper.chartType,
      containerId: wrapper.containerId,
      options : wrapper.options,
      dataTable: Resource.dataViewGrouped
      // dataTable: dataGroup
    });
    redraw.draw();
  }
}
