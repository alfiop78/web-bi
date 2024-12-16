var App = new Application();
var Template = new Templates();
// var Dashboard = new Dashboards(); // istanza della Classe Dashboards, da inizializzare quando ricevuti i dati dal datamart
var Resource = new Resources();
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    number: function(properties) {
      return new google.visualization.NumberFormat(properties);
    }
  }

  App.init();

  // Load the Visualization API and the corechart package.
  google.charts.load('current', { 'packages': ['corechart', 'controls'], 'language': 'it' });

  app.draw = () => {
    // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
    // è consentità con la DataView perchè questa è read-only
    // Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    // definisco la formattazione per le percentuali e per i valori currency
    // console.log(dataFormatted);
    // var gdashboard = new google.visualization.Dashboard(Resource.dashboardContent);
    Resource.gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    Resource.dashboardControls = Resource.drawControls_new(document.getElementById('filter__dashboard'));
  }

  app.drawTestOneDatasource = () => {
    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    let wrappers = [];
    // imposto i filtri per questa dashboard
    // per ogni wrapper presente in questo datamart...
    for (const [ref, wrapper] of Object.entries(Resource.specs.wrappers)) {
      // let controls = [];
      Resource.ref = document.getElementById(ref);
      // Creazione dell'oggetto grafico (ChartWrapper)
      Resource.chartWrapper = new google.visualization.ChartWrapper();
      // imposto sempre Table di default
      Resource.chartWrapper.setChartType(wrapper.chartType);
      Resource.chartWrapper.setContainerId(wrapper.containerId);
      if (wrapper.chartType === 'Table') {
        // wrapper.options.height = 'auto';
        wrapper.options.height = '100%';
        wrapper.options.pageSize = 15;
      }
      Resource.chartWrapper.setOptions(wrapper.options);
      app.getDataView();
      let v = new google.visualization.DataView(Resource.dataTable);
      v.setColumns(Resource.viewDefined);
      console.log(v);
      Resource.chartWrapper.setView(v);
      // google.visualization.events.addListener(Resource.chartWrapper, 'ready', chartWrapperReady);
      // Resource.chartWrapper.setView(Resource.dataViewGrouped);
      // console.log(Resource.chartWrapper.getView());
      wrappers.push(Resource.chartWrapper);
    }

    Resource.gdashboard.bind(Resource.dashboardControls, wrappers);
    // google.visualization.events.addListener(Resource.gdashboard, 'ready', chartWrapperReady);
    Resource.gdashboard.draw(Resource.dataTable);
  }

  function chartWrapperReady() {
    Resource.groupFunction();
    Resource.dataGroup = new google.visualization.data.group(
      Resource.dataTable, Resource.groupKey, Resource.groupColumn
    );
    debugger;
    Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
    // nel Metodo createDataViewSheet() viene impostata la DataView 'dataViewGrouped'
    Resource.createDataView();
    // TEST: 1
    /* let wrap = new google.visualization.ChartWrapper();
    wrap.setChartType('ColumnChart');
    wrap.setContainerId(Resource.ref.id);
    // wrap.setOptions(wrapper.options);
    wrap.setDataTable(Resource.dataGroup);
    // wrap.setView(Resource.dataViewGrouped);
    wrap.draw(); */
    // TEST: 1
    // TEST: 2
    Resource.chartWrapper.setDataTable(Resource.dataGroup);
    Resource.chartWrapper.setView(Resource.dataViewGrouped);
    Resource.chartWrapper.draw();
    // TEST: 2
    // TEST: 3
    // let cw = new google.visualization.ChartWrapper();
    // cw.setChartType('Table');
    // cw.setContainerId(Resource.ref.id);
    // cw.setDataTable(Resource.dataGroup);
    // cw.setView(Resource.dataViewGrouped);
    // cw.draw();
    // TEST: 3
  }

  app.getDataView = () => {
    // esempio utilizzato senza impostare le metriche contenute nelle composite
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
    console.log(Resource.dataGroup);

    Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
    Resource.createDataView();
  }

  app.drawResources = () => {
    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    // imposto i filtri per questa dashboard
    // per ogni wrapper presente in questo datamart...
    for (const [ref, wrapper] of Object.entries(Resource.specs.wrappers)) {
      // let controls = [];
      Resource.ref = document.getElementById(ref);
      Resource.gdashboard = new google.visualization.Dashboard(Resource.ref.parentElement);
      const controls = Resource.drawControls(document.getElementById(`flt__${Resource.ref.id}`));
      console.log('controls : ', controls);
      // console.log(JSON.parse(Resource.view.toJSON()));
      // utilizzo con i metodi setter
      // creo il ChartWrapper Table, anche se questo Sheet ha più ChartWrapper creati, imposterò un tasto per fare lo swicth e cambiare la visualizzazione
      Resource.chartWrapper = new google.visualization.ChartWrapper();
      // imposto sempre Table di default
      Resource.chartWrapper.setChartType(wrapper.chartType);
      Resource.chartWrapper.setContainerId(wrapper.containerId);
      // Resource.chartWrapper.setDataTable(Resource.dataTable);
      console.log(wrapper.options);
      Resource.chartWrapper.setOptions(wrapper.options);

      // NOTE: esempio array di View
      // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
      // table.setView({ columns: [1, 3, 5, 7, 9, 16] });

      // google.visualization.events.addListener(Resource.chartWrapper, 'ready', onReady);

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
        // Resource.chartWrapperView.setChartType(Resource.specs.wrapper[Resource.wrapper].chartType);
        Resource.chartWrapperView.setChartType(wrapper.chartType);
        // Resource.chartWrapperView.setContainerId(Resource.ref.id);
        Resource.chartWrapperView.setContainerId(wrapper.containerId);
        // TODO: reimpostare la proprietà cssClassNames corretto in fase di creazione dashboard
        Resource.chartWrapperView.setOptions(wrapper.options);
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

      let binds;
      debugger;
      if (Resource.specs.bind.length === 1) {
        Resource.gdashboard.bind(controls, Resource.chartWrapper);
      } else {
        // Questa logica funziona con il bind() di un filtro verso quello successivo ma
        // possono esserci anche situazioni diverse, che sono da implementare
        Resource.specs.bind.forEach((v, index) => {
          // console.log('index', index);
          if (index === 0) {
            // il primo bind deve essere creato dall'istanza gdashboard, i successivi posso legarli ad una variabile
            // binds = Resource.gdashboard.bind(Resource.dashboardControls[v[0]], Resource.dashboardControls[v[1]]);
            binds = Resource.gdashboard.bind(controls[v[0]], controls[v[1]]);
          } else {
            // binds.bind(Resource.dashboardControls[v[0]], Resource.dashboardControls[v[1]]);
            binds.bind(controls[v[0]], controls[v[1]]);
          }
        });
        // Tutti i controlli influenzano la table
        // binds.bind(controls, Resource.chartWrapper);
        // binds.bind(Resource.dashboardControls, Resource.chartWrapper);
        binds.bind(controls, Resource.chartWrapper);
      }

      // Resource.gdashboard.bind(controls, Resource.chartWrapper);
      // Resource.gdashboard.bind(Resource.dashboardControls, Resource.chartWrapper);
      Resource.gdashboard.draw(Resource.dataTable);
    }
  }

  /* app.draw = () => {
    // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
    // è consentità con la DataView perchè questa è read-only
    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    // definisco la formattazione per le percentuali e per i valori currency
    // console.log(dataFormatted);
    var gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    // Creo i filtri nella Classe Dashboards
    const controls = Resource.drawControls(document.getElementById('filter__dashboard'));
    debugger;

    // console.log(JSON.parse(Resource.view.toJSON()));
    // utilizzo senza i metodi setter. Le proprietà del ChartWrapper sono incluse in Resource.specs
    // var wrap = new google.visualization.ChartWrapper(Resource.specs.wrapper);
    // utilizzo con i metodi setter
    var wrap = new google.visualization.ChartWrapper();
    wrap.setChartType('Table');
    wrap.setContainerId(Resource.ref);
    wrap.setOptions(Resource.specs.wrapper.options);

    // NOTE: esempio array di View
    // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
    // table.setView({ columns: [1, 3, 5, 7, 9, 16] });

    google.visualization.events.addListener(wrap, 'ready', onReady);

    function onReady() {
      // esempio utilizzato senza impostare le metriche contenute nelle composite
      console.log('onReady');
      let tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
      // console.log(groupColumnsIndex);
      // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
      Resource.groupFunction();
      // Al momento non utilizzo il Metodo groupFunction() nella classe Dashboard
      // perchè da qui richiamo il wrapper del ChartWrapper invece dal report non c'è il ChartWrapper
      // TODO: potrei crearlo anche l' il ChartWrapper
      Resource.dataGroup = new google.visualization.data.group(
        wrap.getDataTable(), Resource.groupKey, Resource.groupColumn
      );
      console.log('group():', Resource.dataGroup);
      // formatter
      Resource.specs.data.group.columns.forEach(metric => {
        let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
        formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
      });

      Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
      Resource.createDataView();

      tableRef.draw(Resource.dataViewGrouped, Resource.specs.wrapper.options);
    }

    // "ubicazione_ds" influenza "marca_veicolo_ds" -> "marca_veicolo_ds" influenza "modello_ds"
    // -> "modello_ds" infleunza "settore_ds" e tutti (l'array Resource.controlsWrapper) influenzano la table
    // per ogni bind, nel template....
    let binds;
    // NOTE: Questa logica funziona con il bind() di un filtro verso quello successivo ma
    // possono esserci anche situazioni diverse, che sono da implementare

    // Se presente un solo filtro effettuo il bind tra l'unico controller e il wrap
    // altrimenti dovrò creare una struttura di bind(), commentata in
    if (Resource.specs.filters.length === 1) {
      gdashboard.bind(controls, wrap);
    } else {
      Resource.specs.bind.forEach((v, index) => {
        // console.log('index', index);
        if (index === 0) {
          // il primo bind deve essere creato dall'istanza gdashboard, i successivi posso legarli ad una variabile
          binds = gdashboard.bind(controls[v[0]], controls[v[1]]);
        } else {
          binds.bind(controls[v[0]], controls[v[1]]);
        }
      });
      console.log(controls);
      binds.bind(controls, wrap);
    }
    // gdashboard.bind(controls, wrap);
    gdashboard.draw(Resource.dataTable);
    // gdashboard.draw(view); // utilizzo della DataView
  } */

  app.draw_old = () => {
    const prepareData = Resource.prepareData();
    // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
    // è consentità con la DataView perchè questa è read-only
    let dataTable = new google.visualization.DataTable(prepareData);
    // definisco la formattazione per le percentuali e per i valori currency
    // console.log(dataFormatted);
    var gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    // Creo i filtri nella Classe Dashboards
    const controls = Resource.drawControls(document.getElementById('filter__dashboard'));

    // console.log(JSON.parse(Resource.view.toJSON()));
    // utilizzo senza i metodi setter. Le proprietà del ChartWrapper sono incluse in Resource.specs
    // var wrap = new google.visualization.ChartWrapper(Resource.specs.wrapper);
    // utilizzo con i metodi setter
    var wrap = new google.visualization.ChartWrapper();
    wrap.setChartType('Table');
    wrap.setContainerId(Resource.ref);
    wrap.setOptions(Resource.specs.wrapper.options);

    // NOTE: esempio array di View
    // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
    // table.setView({ columns: [1, 3, 5, 7, 9, 16] });

    google.visualization.events.addListener(wrap, 'ready', onReady);

    function onReady() {
      // esempio utilizzato senza impostare le metriche contenute nelle composite
      console.log('onReady');
      let tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
      let keyColumns = [];
      Resource.specs.data.group.key.forEach(column => {
        // if (column.properties.grouped) keyColumns.push(Resource.dataTable.getColumnIndex(column.id));
        // imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
        // che viene modificata dall'utente a runtime
        if (column.properties.grouped) {
          keyColumns.push({ id: column.id, column: dataTable.getColumnIndex(column.id), label: column.label, type: column.type });
        }
      });
      let groupColumnsIndex = [];
      Resource.specs.data.group.columns.forEach(metric => {
        // salvo in groupColumnsIndex TUTTE le metriche, deciderò nella DataView
        // quali dovranno essere visibili (quelle con dependencies:false)
        // recupero l'indice della colonna in base al suo nome
        const index = dataTable.getColumnIndex(metric.alias);
        // TODO modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
        const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
        let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', label: metric.label };
        groupColumnsIndex.push(object);
      });
      // console.log(groupColumnsIndex);
      // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
      Resource.dataGroup = new google.visualization.data.group(
        wrap.getDataTable(), keyColumns, groupColumnsIndex
      );
      console.log('group():', Resource.dataGroup);

      Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);

      let viewColumns = [], viewMetrics = [];
      Resource.specs.data.view.forEach(column => {
        if (column.properties.visible) viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
      });
      // dalla dataGroup, recupero gli indici di colonna delle metriche
      Resource.specs.data.group.columns.forEach(metric => {
        if (!metric.dependencies && metric.properties.visible) {
          const index = Resource.dataGroup.getColumnIndex(metric.alias);

          // Implementazione della func 'calc' per le metriche composite.
          if (metric.type === 'composite') {
            const formula = JSON.parse(localStorage.getItem(metric.token)).formula;
            let calcFunction = function(dt, row) {
              let formulaJoined = [];
              formula.forEach(formulaEl => {
                if (formulaEl.alias) {
                  formulaJoined.push(dt.getValue(row, dt.getColumnIndex(formulaEl.alias)));
                } else {
                  formulaJoined.push(formulaEl);
                }
              });
              const result = (isNaN(eval(formulaJoined.join('')))) ? 0 : eval(formulaJoined.join(''));
              let total = (result) ? { v: result } : { v: result, f: '-' };
              // console.log(result);
              // const result = (isNaN(eval(formulaJoined.join('')))) ? null : eval(formulaJoined.join(''));
              let resultFormatted;
              // formattazione della cella con formatValue()
              if (Resource.specs.data.formatter[metric.alias]) {
                const metricFormat = Resource.specs.data.formatter[metric.alias];
                let formatter;
                formatter = app[metricFormat.type](metricFormat.prop);
                resultFormatted = (result) ? formatter.formatValue(result) : '-';
                total = { v: result, f: resultFormatted };
              } else {
                resultFormatted = (result) ? result : '-';
                total = (result) ? { v: result } : { v: result, f: '-' };
              }
              return total;
            }
            viewMetrics.push({ id: metric.alias, calc: calcFunction, type: 'number', label: metric.label, properties: { className: 'col-metrics' } });
          } else {
            viewMetrics.push(index);
            Resource.dataGroup.setColumnProperty(index, 'className', 'col-metrics');
          }
        }
      });
      // concateno i due array che popoleranno la DataView.setColumns()
      let viewDefined = viewColumns.concat(viewMetrics)
      // Resource.dataGroup.setColumnProperty(0, 'className', 'cssc1')
      // console.log(Resource.dataGroup.getColumnProperty(0, 'className'));
      // console.log(Resource.dataGroup.getColumnProperties(0));
      Resource.dataViewGrouped.setColumns(viewDefined);
      tableRef.draw(Resource.dataViewGrouped, Resource.specs.wrapper.options);
    }

    // "ubicazione_ds" influenza "marca_veicolo_ds" -> "marca_veicolo_ds" influenza "modello_ds"
    // -> "modello_ds" infleunza "settore_ds" e tutti (l'array Resource.controlsWrapper) influenzano la table
    // per ogni bind, nel template....
    let binds;
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
    // Tutti i controlli influenzano la table
    binds.bind(controls, wrap);
    // gdashboard.bind(controls, wrap);
    gdashboard.draw(dataTable);
    // gdashboard.draw(view); // utilizzo della DataView
  }

  app.getLayout = async (dashboard) => {
    await fetch(`/js/json-templates/${dashboard.layout}.json`)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        if (!data) return;
        console.log(data);
        Template.data = data;
        Template.id = data.id;
        // creo il template nel DOM
        Template.create();
        // carico le risorse (sheet) necessarie alla dashboard
        // Resource.drawControls_new(document.getElementById('filter__dashboard'));
        // console.log(Resource.controls);
        app.loadResources(dashboard.resources);
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // recupero dati dagli Sheet collegati a questa Dashboard
  // TODO: predisporre una promise.all per scaricare tutte le risorse della Dashboard
  /* app.loadResources = (resources) => {
    for (const [token, value] of Object.entries(resources)) {
      Resource.datamart_id = value.datamart_id;
      // scarico la risorsa (le specs) dal DB e successivamente invoco getData()
      fetch(`/fetch_api/name/${token}/sheet_show`)
        .then((response) => {
          if (!response.ok) { throw Error(response.statusText); }
          return response;
        })
        .then((response) => response.json())
        .then((data) => {
          Resource.specs = JSON.parse(data.json_specs);
          // imposto il riferimento nel DOM, del layout, per questa risorsa/report
          Resource.ref = value.ref;
          app.getAllData();
        })
        .catch((err) => console.error(err));
    }
  } */

  app.loadResources = async (resources) => {
    console.log('loadResources');
    // preparo la dashboard e i controlli (filtri della dashboard)
    app.draw();
    for (const [token, value] of Object.entries(resources)) {
      console.log(value);
      Resource.specs = value;
      await app.getAllData();
    }
  }

  document.querySelectorAll('a[data-token]').forEach(a => {
    a.addEventListener('click', async (e) => {
      // scarico il json dal DB, lo salvo in sessionStorage
      await fetch(`/fetch_api/name/${e.currentTarget.dataset.token}/dashboard_show`)
        .then((response) => {
          console.log(response);
          if (!response.ok) { throw Error(response.statusText); }
          return response;
        })
        .then((response) => response.json())
        .then(data => {
          console.log(data);
          Resource.json = JSON.parse(data.json_value);
          // debugger;
          document.querySelector('h1.title').innerHTML = Resource.json.title;
          app.getLayout(Resource.json);
        })
        .catch(err => {
          App.showConsole(err, 'error');
          console.error(err);
        });
    });
  });

  // recupero il datamrt
  app.getData = async () => {
    // Chiamta in POST
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

    // Chiamata in GET con laravel paginate()
    const progressBar = document.getElementById('progress-bar');
    const progressTo = document.getElementById('progress-to');
    const progressTotal = document.getElementById('progress-total');
    const progressLabel = document.querySelector("label[for='progress-bar']");
    App.showLoader();
    App.showConsole('Apertura Dashboard in corso...', null, null);
    let partialData = [];
    await fetch(`/fetch_api/${Resource.specs.datamartId}/datamart?page=1`)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        console.log(paginateData);
        console.log(paginateData.data);
        progressBar.value = +((paginateData.to / paginateData.total) * 100);
        progressLabel.hidden = false;
        progressTo.innerText = paginateData.to;
        progressTotal.innerText = paginateData.total;
        // funzione ricorsiva fino a quando è presente next_page_url
        let recursivePaginate = async (url) => {
          // console.log(url);
          await fetch(url).then((response) => {
            // console.log(response);
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          }).then(response => response.json()).then((paginate) => {
            console.log(paginate);
            progressBar.value = +((paginate.to / paginate.total) * 100);
            progressTo.innerText = paginate.to;
            progressTotal.innerText = paginate.total;
            // console.log(progressBar.value);
            partialData = partialData.concat(paginate.data);
            if (paginate.next_page_url) {
              recursivePaginate(paginate.next_page_url);
              console.log(partialData);
            } else {
              // Non sono presenti altre pagine, visualizzo il dashboard
              console.log('tutte le paginate completate :', partialData);
              Resource.data = partialData;
              google.charts.setOnLoadCallback(app.draw());
              App.closeLoader();
              App.closeConsole();
            }
          }).catch((err) => {
            App.showConsole(err, 'error');
            console.error(err);
          });
        }
        partialData = paginateData.data;
        if (paginateData.next_page_url) {
          recursivePaginate(paginateData.next_page_url);
        } else {
          // Non sono presenti altre pagine, visualizzo la dashboard
          Resource.data = partialData;
          google.charts.setOnLoadCallback(app.draw());
          App.closeConsole();
          App.closeLoader();
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
    // end chiamata in GET
  }

  app.getAllData = async () => {
    const progressBar = document.getElementById('progress-bar');
    const progressTo = document.getElementById('progress-to');
    const progressTotal = document.getElementById('progress-total');
    const progressLabel = document.querySelector("label[for='progress-bar']");
    App.showLoader();
    App.showConsole('Apertura Dashboard in corso...', null, null);
    // TODO: implementare una lista di urls come fatto in init-dashboard-create.js
    const urls = [`/fetch_api/${Resource.specs.datamartId}/datamart?page=1`];
    let partialData = [];
    await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then(async (paginateData) => {
        paginateData.forEach((pagData, index) => {
          console.log(pagData.data);
          progressBar.value = +((pagData.to / pagData.total) * 100);
          progressLabel.hidden = false;
          progressTo.innerText = pagData.to;
          progressTotal.innerText = pagData.total;
          let recursivePaginate = async (url, index) => {
            await fetch(url).then((response) => {
              if (!response.ok) { throw Error(response.statusText); }
              return response;
            }).then(response => response.json())
              .then((paginate) => {
                progressBar.value = +((paginate.to / paginate.total) * 100);
                progressTo.innerText = paginate.to;
                progressTotal.innerText = paginate.total;
                partialData[index] = partialData[index].concat(paginate.data);
                if (paginate.next_page_url) {
                  recursivePaginate(paginate.next_page_url, index);
                  console.log(partialData[index]);
                } else {
                  // Non sono presenti altre pagine, visualizzo la dashboard
                  console.log('tutte le paginate completate :', partialData[index]);
                  Resource.data = partialData[index];
                  // google.charts.setOnLoadCallback(app.draw());
                  // google.charts.setOnLoadCallback(app.drawResources());
                  google.charts.setOnLoadCallback(app.drawTestOneDatasource());
                  App.closeConsole();
                  App.closeLoader();
                }
              }).catch((err) => {
                App.showConsole(err, 'error');
                console.error(err);
              });
          }
          partialData[index] = pagData.data;
          if (pagData.next_page_url) {
            recursivePaginate(pagData.next_page_url, index);
          } else {
            // Non sono presenti altre pagine, visualizzo il dashboard
            Resource.data = partialData[index];
            // google.charts.setOnLoadCallback(app.drawResources());
            google.charts.setOnLoadCallback(app.drawTestOneDatasource());
            App.closeConsole();
            App.closeLoader();
          }
        });
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

})();
