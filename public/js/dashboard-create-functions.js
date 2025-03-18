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

function drawDashboard() {
  Resource.multiData.forEach(datamart => {
    Resource.data = datamart.data;
    Resource.specs = datamart.specs;
    // console.log(Resource.specs);
    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    Resource.ref = document.getElementById(datamart.ref);
    let gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    const controls = Resource.drawDraggableControls(document.getElementById('filter__dashboard'));
    wrappers = [];
    for (const [ref, wrapper] of Object.entries(Resource.specs.wrappers)) {
      Resource.ref = document.getElementById(ref);
      const chartWrapper = new google.visualization.ChartWrapper();
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
      wrappers.push(chartWrapper);
    }
    gdashboard.bind(controls, wrappers);

    // NOTE: esempio array di View
    // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
    // table.setView({ columns: [1, 3, 5, 7, 9, 16] });

    google.visualization.events.addListener(gdashboard, 'ready', dashboardReady);
    gdashboard.draw(Resource.dataTable);
  })
}

function dashboardReady() {
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
      options: wrapper.options,
      dataTable: Resource.dataViewGrouped
      // dataTable: dataGroup
    });
    redraw.draw();
  }
}

// invocata da sheetSelected, apertura di un singolo report
function draw() {
  // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
  // è consentità con la DataView perchè questa è read-only
  Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
  // definisco la formattazione per le percentuali e per i valori currency
  // console.log(dataFormatted);
  let gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
  // disegno i filtri dal template, con l'icona draggable
  const controls = Resource.drawDraggableControls(document.getElementById('filter__dashboard'));
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
  // console.log(Resource.specs.wrapper.Table.options);
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


  gdashboard.bind(controls, Resource.chartWrapper);
  google.visualization.events.addListener(gdashboard, 'ready', onReady);
  gdashboard.draw(Resource.dataTable);
}

function onReady() {
  // esempio utilizzato senza impostare le metriche contenute nelle composite
  console.log('onReady');
  // let tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
  // console.log(groupColumnsIndex);
  // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
  Resource.group = Resource.specs.wrapper[Resource.wrapper].group;
  const dataGroup = Resource.createDataTableGrouped(Resource.chartWrapper.getDataTable());
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

  Resource.createDataViewGrouped(dataGroup);

  Resource.chartWrapperView.setDataTable(Resource.dataViewGrouped);
  Resource.chartWrapperView.draw();
}

function openGenerateUrl(e) {
  // dashboard token
  btn__url_generate.dataset.token = e.target.dataset.token;
  // recupero la proprietà 'resources[token].data.columns[nome_colonna]' di tutti gli sheets presenti nella dashboard
  const url_params = document.getElementById('url_params');
  for (const value of Resource.resources.values()) {
    console.log(value.data.columns);
    for (const column of Object.values(value.data.columns)) {
      // escludo le metriche
      if (column.p.data === 'column') {
        const template = tmpl__url_params.content.cloneNode(true);
        const section = template.querySelector('section');
        const checkbox = section.querySelector("input[type='checkbox']");
        const label = section.querySelector('label');
        checkbox.id = column.id;
        label.innerText = column.id;
        label.setAttribute('for', column.id);
        url_params.appendChild(section);
      }
    }
  }
  dlg__create_url.showModal();
}


function urlGenerate(e) {
  // TODO: recupero i parametri inseriti dall'utente
  let params = [];
  document.querySelectorAll("#url_params>section>input:checked").forEach(param => {
    console.log(param);
    const param_label = param.parentElement.querySelector('label').innerText;
    const param_name = param.parentElement.querySelector("input[type='text']").value;
    (param_name.length === 0) ? params.push(param_label) : params.push(param_name);
  });
  console.log(params);
  /* const url = `/dashboards/test/${e.target.dataset.token}`;
  const init = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    body: new URLSearchParams({ customer_code: e.target.id, host: e.target.dataset.ref })
  };
  const req = new Request(url, init); */
  debugger;
  // const url = document.getElementById('url');
  fetch(`/dashboards/test/${e.target.dataset.token}/params/${params}`)
    .then((response) => {
      // console.log(response);
      if (!response.ok) { throw Error(response.statusText); }
      return response;
    })
    .then((response) => response.text())
    .then(data => {
      console.log(data);
      url.innerHTML = data;
    })
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    });

}
