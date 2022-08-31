var App = new Application();
var Query = new Queries();
var StorageDimension = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();
var StorageMetric = new MetricStorage();
var List = new Lists();
(() => {
  App.init();
  const rand = () => Math.random(0).toString(36).substr(2);
  // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
  // console.info('Date.now() : ', Date.now());

  // la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
  var Step = new Steps('stepTranslate');

  var app = {
    // templates
    tmplUlList: document.getElementById('template_ulList'), // contiene le <ul>
    tmplList: document.getElementById('templateList'), // contiene i section
    tmplSublists: document.getElementById('template-sublists'),
    tmplFilterFormula: document.getElementById('tmpl-filter-formula'),
    absoluteWindow: document.getElementById('absolute-window'),

    processList: document.getElementById('reportProcessList'),
    // ul
    ulMetrics: document.getElementById('ul-metrics'),
    ulDefinedMetrics: document.getElementById('ul-defined-metrics'),
    ulCompositeMetrics: document.getElementById('ul-composite-metrics'),
    ulDefinedCompositeMetrics: document.getElementById('ul-defined-composite-metrics'),
    ulColumns: document.getElementById('ul-columns'),
    ulDefinedColumns: document.getElementById('ul-defined-columns'),
    ulFilters: document.getElementById('ul-filters'),
    ulDefinedFilters: document.getElementById('ul-defined-filters'),

    // btn
    btnAddFilters: document.getElementById('btn-add-filters'),
    btnAddColumns: document.getElementById('btn-add-columns'),
    btnAddMetrics: document.getElementById('btn-add-metrics'),
    btnAddCompositeMetrics: document.getElementById('btn-add-composite-metrics'),
    btnPreviousStep: document.getElementById('prev'),
    btnNextStep: document.getElementById('next'),
    btnSQLProcess: document.getElementById('sql_process'),
    btnSearchValue: document.getElementById('search-field-values'),

    btnProcessReport: document.getElementById('btnProcessReport'), // apre la lista dei report da processare "Crea FX"

    // dialog
    dialogSaveReport: document.getElementById('dialog-save-report'),
    dialogSQLInfo: document.getElementById('dialog-sqlInfo'),
    dialogFilter: document.getElementById('dialog-filter'),
    dialogMetricFilter: document.getElementById('dialog-metric-filter'),
    dialogColumns: document.getElementById('dialog-column'),
    dialogValue: document.getElementById('dialog-value'),
    dialogMetric: document.getElementById('dialog-metric'),
    dialogCompositeMetric: document.getElementById('dialog-composite-metric'),
    btnFilterSave: document.getElementById('btnFilterSave'), //tasto salva nella dialog filter
    btnFilterDone: document.getElementById('btnFilterDone'), //tasto fatto nella dialog filter
    btnColumnDone: document.getElementById('btnColumnDone'), // tasto ok nella dialogColumns
    btnColumnSave: document.getElementById('btnColumnSave'), // tasto ok nella dialogColumns
    btnMetricSave: document.getElementById('btnMetricSave'), // tasto salva nella dialogMetric
    btnCompositeMetricSave: document.getElementById('btnCompositeMetricSave'), // tasto salva nella dialog-composite-metric
    btnCompositeMetricDone: document.getElementById('btnCompositeMetricDone'),
    btnMetricDone: document.getElementById('btnMetricDone'), // tasto Salva nella dialogMetric
    btnMetricFilterDone: document.getElementById('btnMetricFilterDone'), // tasto ok nella dialog-metric-filter
    btnSetMetricFilter: document.getElementById('metric-filtered'), // apre la dialog-metric-filter
    btnValueDone: document.getElementById('btnValueDone'), // tasto done nella dialogValue
    btnSaveReport: document.getElementById('save'), // apre la dialogSaveReport
    btnSaveReportDone: document.getElementById('btnReportSaveName'),

    // inputs
    columnAlias: document.getElementById('columnAlias'), // input nella dialog-columns

    btnBackPage: document.getElementById('mdcBack'), // da definire
    ulDimensions: document.getElementById('dimensions'),
    aggregationFunction: document.getElementById('ul-aggregation-functions'),
    btnMapping: document.getElementById('mdcMapping'),
    tooltip: document.getElementById('tooltip'),
    tooltipTimeoutId: null,
    btnToggleHierarchyDrawer: document.getElementById('toggle-hierarchy-drawer'),
    btnToggleCubesDrawer: document.getElementById('toggle-cubes-drawer'),
    btnToggleDimensionsDrawer: document.getElementById('toggle-dimensions-drawer')
  }

  app.editReport = (token, name) => {
    const ul = document.getElementById('ul-processes');
    const section = ul.querySelector("section[data-report-token='" + token + "']");
    section.dataset.label = name;
    section.querySelector("span[data-process]").innerText = name;
  }

  // creo la lista degli elementi da processare
  app.getReports = () => {
    for (const [token, value] of StorageProcess.processes) {
      // utilizzo addReport() perchè questa funzione viene chiamata anche quando si duplica il report o si crea un nuovo report e viene aggiunto all'elenco
      List.addReport(token, value);
    }
  }

  // popolo la lista dei filtri esistenti
  app.getFilters = (hidden) => {
    for (const [token, filter] of StorageFilter.filters) {
      StorageFilter.selected = token;
      List.addFilter(hidden);
    }
  }

  // popolo la lista dei filtri esistenti nella dialog metric
  app.getMetricFilters = (hidden) => {
    for (const [token, filter] of StorageFilter.filters) {
      StorageFilter.selected = token;
      List.addMetricFilter(hidden);
    }
  }
  // verifico se ci sono object selezionati per poter attivare/disattivare alcuni tasti
  app.checkObjectSelected = () => {
    if (Query.objects.size > 0) {
      app.btnSQLProcess.disabled = false;
      app.btnSaveReport.disabled = false;
    } else {
      app.btnSQLProcess.disabled = true;
      app.btnSaveReport.disabled = true;
    }
  }

  // visualizzo metriche / filtri appartenenti al cubo
  app.showCubeObjects = () => {
    document.querySelectorAll("section[data-related-object*='cube'][data-cube-token='" + StorageCube.selected.token + "']").forEach(item => {
      item.hidden = false;
      item.toggleAttribute('data-searchable');
    });
  }

  app.hideCubeObjects = () => {
    document.querySelectorAll("section[data-related-object*='cube'][data-cube-token='" + StorageCube.selected.token + "']").forEach(item => {
      item.hidden = true;
      item.toggleAttribute('data-searchable');
    });
  }

  app.showDimensions = () => {
    // visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
    document.querySelectorAll("#ul-dimensions > section[data-cube-token='" + StorageCube.selected.token + "']").forEach((dimension) => {
      // console.log('Dimensioni del cubo selezionato : ', dimension);
      dimension.hidden = false;
      dimension.dataset.searchable = true;
    });
  }

  app.hideDimensions = () => {
    document.querySelectorAll("#ul-dimensions > section[data-cube-token='" + StorageCube.selected.token + "']").forEach((table) => {
      table.hidden = true;
      table.toggleAttribute('data-searchable');
    });
  }

  app.showDimensionObjects = () => {
    document.querySelectorAll("section[data-related-object*='dimension'][data-dimension-token*='" + StorageDimension.selected.token + "']").forEach(hier => {
      hier.hidden = false;
      hier.dataset.searchable = true;
    });
  }

  app.hideDimensionObjects = () => {
    document.querySelectorAll("section[data-related-object*='dimension'][data-dimension-token*='" + StorageDimension.selected.token + "']").forEach(hier => {
      hier.hidden = true;
      delete hier.dataset.searchable;
    });
  }

  app.showAllElements = () => {
    // per ogni dimensione in #elementDimension...
    for (const [token, value] of Query.elementHierarchy) {
      document.querySelectorAll("ul > section.data-item[data-dimension-token='" + value.dimensionToken + "'][data-hier-token='" + token + "']").forEach((item) => {
        item.hidden = false;
        item.toggleAttribute('data-searchable');
      });
    }
  }

  app.hideAllElements = () => {
    for (const [token, value] of Query.elementHierarchy) {
      document.querySelectorAll("ul section.data-item[data-dimension-token='" + value.dimensionToken + "'][data-hier-token='" + token + "']").forEach((item) => {
        item.hidden = true;
        item.toggleAttribute('data-searchable');
      });
    }
  }

  // lista metriche composte
  app.getCompositeMetrics = () => {
    // TODO: 2022-05-27 in futuro ci sarà da valutare metriche composte appartenenti a più cubi
    StorageMetric.compositeMetrics.forEach(metric => {
      StorageMetric.selected = metric.token;
      // aggiungo la metrica alla #ul-composite-metrics
      app.addCompositeMetric(); // questa function viene usata anche quando si crea una nuova metrica composta
    });
  }

  // execute report
  app.handlerReportSelected = async (e) => {
    console.clear();
    const processToken = e.currentTarget.dataset.processToken;
    let jsonDataParsed = JSON.parse(window.localStorage.getItem(processToken));
    console.dir(jsonDataParsed.report);
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(jsonDataParsed.report);
    App.showConsole('Elaborazione in corso...', 'info');
    // chiudo la lista dei report da eseguire
    app.processList.toggleAttribute('hidden');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/cube/process";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        // TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          App.closeConsole();
          App.showConsole('Datamart creato con successo!', 'done', 5000);
          // console.log('data : ', response);
          // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: Da testare se il codice arriva qui o viene gestito sempre dal catch()
          console.debug('FX non è stata creata');
          debugger;
          App.showConsole('Errori nella creazione del datamart', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.handlerReportEdit = (e) => {
    StorageProcess.selected = e.target.dataset.processToken;
    Query.token = e.target.dataset.processToken;
    Query.processId = +e.target.dataset.id;
    // cubi
    StorageProcess.selected.edit.cubes.forEach(token => {
      //debugger;
      console.log(token);
      StorageCube.selected = token;
      // selezione del cubo nella #ul-cubes
      document.querySelector("#ul-cubes section[data-cube-token='" + token + "'] .selectable").dataset.selected = 'true';
      Query.cubes = token;
      app.showCubeObjects();
      app.btnToggleDimensionsDrawer.disabled = false;
    });
    // dimensioni
    StorageProcess.selected.edit.dimensions.forEach(token => {
      //debugger;
      StorageDimension.selected = token;
      document.querySelector("#ul-dimensions section[data-dimension-token='" + token + "'] .selectable").dataset.selected = 'true';
      Query.dimensions = token;
      app.showDimensionObjects();
    });
    // colonne
    for (const [token, column] of Object.entries(StorageProcess.selected.edit.columns)) {
      // Query.select = { field: Query.field, SQLReport: textarea, alias : alias.value };
      app.ulColumns.querySelector(".selectable[data-token-column='" + token + "']").dataset.selected = 'true';
      Query.field = column.field;
      // reimposto la colonna come quando viene selezionata
      Query.select = column;
      console.log(column);
      if (!column.hasOwnProperty('cubeToken')) {
        const hierarchiesObject = new Map([[column.hier, column.tableId]]);
        Query.objects = {
          token,
          hierarchies: Object.fromEntries(hierarchiesObject),
          dimensions: [column.dimensionToken]
        };
      } else {
        Query.objects = {
          token,
          cubeToken: column.cubeToken
        };
      }
      // aggiungo alla #ul-defined-columns
      app.addDefinedColumn(column.alias, token);
    }
    // filtri
    StorageProcess.selected.edit.filters.forEach(token => {
      StorageFilter.selected = token;
      // seleziono i filtri impostati nel report
      document.querySelector("#ul-filters .selectable[data-filter-token='" + token + "']").dataset.selected = 'true';
      // reimposto il filtro come se fosse stato selezionato
      Query.filters = StorageFilter.selected;
      let object = {};
      object.token = token;
      if (StorageFilter.selected.hasOwnProperty('cubes')) object.cubes = StorageFilter.selected.cubes;
      if (StorageFilter.selected.hasOwnProperty('dimensions')) object.dimensions = StorageFilter.selected.dimensions;
      if (StorageFilter.selected.hasOwnProperty('hierarchies')) object.hierarchies = StorageFilter.selected.hierarchies;

      Query.objects = object;
      // aggiungo alla lista #ul-defined-filters
      app.addDefinedFilter();
    });

    // metriche composte
    StorageProcess.selected.edit.compositeMetrics.forEach(token => {
      StorageMetric.selected = token;
      // seleziono le metriche (0, 1, 2, 3) impostate nel report
      app.ulCompositeMetrics.querySelector(".selectable[data-metric-token='" + token + "']").dataset.selected = 'true';
      Query.objects = { token, cubes: StorageMetric.selected.cubes };
      app.setCompositeMetrics();
      app.addDefinedCompositeMetric();

      for (const [metricName, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
        StorageMetric.selected = metric.token;
        if (StorageMetric.selected.metric_type !== 4) {
          app.addDefinedMetric(token);
        } else {
          app.addDefinedCompositeMetric(token)
        }
      }
    });

    // metriche
    // NOTE: il codice per le metriche composte và messo necessariamente prima di questo per aggiungere metriche già inserite nelle metriche composte
    StorageProcess.selected.edit.metrics.forEach(token => {
      StorageMetric.selected = token;
      // seleziono le metriche (0, 1, 2, 3) impostate nel report
      app.ulMetrics.querySelector(".selectable[data-metric-token='" + token + "']").dataset.selected = 'true';
      Query.objects = { token, cubes: StorageMetric.selected.cubes };
      switch (StorageMetric.selected.metric_type) {
        case 1:
          app.setCompositeBaseMetrics();
          break;
        case 2:
        case 3:
          app.setFilteredMetrics();
          break;
        default:
          app.setMetrics();
          break;
      }
      // aggiungo alla lista #ul-defined-metrics se questa metrica non è stata già aggiunta da qualche metrica composta
      if (!app.ulDefinedMetrics.querySelector("section[data-metric-token='" + token + "']")) app.addDefinedMetric();
    });

    app.processList.toggleAttribute('hidden');
    app.checkObjectSelected();
  }

  app.handlerReportCopy = (e) => {
    console.clear();
    StorageProcess.selected = e.target.dataset.processToken;
    const process = StorageProcess.selected;
    console.log('process selected : ', process);
    // modifico il token e il processId
    process.token = rand().substr(0, 21);;
    process.report.processId = Date.now();
    // salvo il process duplicato con lo stesso nome aggiungendo un prefix _copy_of_
    process.name = '_copy_of_' + process.name;
    // modifico la data creazione e updated
    const date = new Date();
    process.created_at = date.toLocaleDateString('it-IT', options);
    process.updated_at = date.toLocaleDateString('it-IT', options);
    // salvo il process duplicato
    StorageProcess.save(process);
    // lo aggiungo alla #ul-processes
    List.addReport(process.token, process);
  }

  // edit filter
  app.handlerFilterEdit = (e) => {
    // recupero il filtro selezionato
    // apro la #dialog-filter
    // carico l'elenco delle colonne della tabella (da valutare per i filtri su più tabelle)
    // inserisco i dati del filtro nella dialog (formula, name, table)
    const filterName = document.getElementById('filterName');
    // imposto un attributo data-edit = true sul tasto app.btnFilterSave che verrà verificato in fase di salvataggio del filtro
    app.btnFilterSave.dataset.token = e.currentTarget.dataset.objectToken;
    const textarea = document.getElementById('composite-filter-formula');
    StorageFilter.selected = e.currentTarget.dataset.objectToken;
    // imposto il nome del filtro nella input. Lo imposto in due modi perchè con setAttribute viene riconosciuto dal MutationObserve e gli viene applicata la classe 'has-content' sulla label
    filterName.setAttribute('value', StorageFilter.selected.name);
    filterName.value = StorageFilter.selected.name;
    filterName.focus();

    app.dialogFilter.showModal();
    StorageFilter.selected.editFormula.forEach(item => {
      if (item.hasOwnProperty('table')) {
        // recupero la formula inserita nel div contenteditable e la re-inserisco 
        // template utilizzato per il mark
        const templateContent = app.tmplFilterFormula.content.cloneNode(true);
        const i = templateContent.querySelector('i');
        i.addEventListener('click', app.cancelFormulaObject);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        const small = templateContent.querySelector('small');
        // l'item contiene il nome dell'alias della tabella, il field selezionato per creare il filtro e il nome della tabella.
        // riprendo il template che ho utilizzato per creare il filtro.
        mark.dataset.tableAlias = item.alias;
        mark.dataset.table = item.table;
        mark.dataset.field = item.field;
        if (item.tableId) {
          mark.dataset.tableId = item.tableId;
          mark.dataset.hierToken = item.hierToken;
          mark.dataset.dimensionToken = item.dimensionToken;
        } else {
          mark.dataset.cubeToken = item.cubeToken;
        }
        mark.innerText = item.field;
        small.innerText = item.table;
        textarea.appendChild(span);
      } else {
        // l'item contiene gli operatori e il valore/i della formula
        app.addSpan(textarea, item, 'filter');
      }
    });
  }

  app.handlerMetricEdit = (e) => {
    // recupero la metrica selezionata
    // apro la #dialog-metrics
    // inserisco i dati della metrica nella dialog
    console.log(e.currentTarget.dataset.objectToken);
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    Query.table = StorageMetric.selected.formula.table;
    Query.tableAlias = StorageMetric.selected.formula.tableAlias;
    app.btnMetricSave.dataset.token = e.currentTarget.dataset.objectToken;
    // seleziono il field che riguarda la metrica
    if (StorageMetric.selected.metric_type === 1 || StorageMetric.selected.metric_type === 3) {
      // metriche di base composte e composte con filtri, qui è presente la prop 'fieldName'
      Query.fieldName = StorageMetric.selected.fieldName;
      document.querySelector("#ul-available-metrics .selectable[data-label='" + Query.fieldName + "']").dataset.selected = 'true';
    } else {
      Query.field = StorageMetric.selected.formula.field;
      // TODO: qui, se viene impostato il nome UNIVOCO della metrica legata al cubo, non serve aggiungere query.table/tableAlias ma basta Query.field
      document.querySelector("#ul-available-metrics .selectable[data-label='" + Query.field + "'][data-table-name='" + Query.table + "'][data-table-alias='" + Query.tableAlias + "']").dataset.selected = 'true';
    }
    // prima di selezionare la Fn di aggregazione che riguarda la metrica da editare, rimuovo la selezione dal valore di default SUM
    delete document.querySelector("#ul-aggregation-functions .selectable[data-selected]").dataset.selected;
    // seleziono la aggregateFn selezionata per la metrica
    document.querySelector("#ul-aggregation-functions .selectable[data-label='" + StorageMetric.selected.formula.aggregateFn + "']").dataset.selected = 'true';
    // nome e alias della metrica
    document.getElementById('metric-name').value = StorageMetric.selected.name;
    document.getElementById('metric-name').setAttribute('value', StorageMetric.selected.name);
    document.getElementById('alias-metric').value = StorageMetric.selected.formula.alias;
    document.getElementById('alias-metric').setAttribute('value', StorageMetric.selected.formula.alias);
    // se ci sono filtri impostati (in base al metric_type) li re-imposto nella ul-metric-filters
    if (StorageMetric.selected.metric_type === 2 || StorageMetric.selected.metric_type === 3) {
      // metrica filtrata
      StorageMetric.selected.formula.filters.forEach(filterToken => {
        document.querySelector("#ul-metric-filters .selectable[data-filter-token='" + filterToken + "']").dataset.selected = 'true';
      });
    }
    app.dialogMetric.showModal();
    // abilito le input
    document.getElementById('metric-name').disabled = false;
    document.getElementById('alias-metric').disabled = false;
  }

  // edit di una metrica composta
  app.handlerCompositeMetricEdit = (e) => {
    // recupero, dal token, la metrica selezionata 
    // inserisco la formula, il nome e l'alias della metrica selezionata
    // apro la dialogCompositeMetric
    const inputName = document.getElementById('composite-metric-name');
    const helper = document.querySelector('#composite-metric-name ~ .helper');
    const inputAlias = document.getElementById('composite-alias-metric');
    console.log(e.currentTarget.dataset.objectToken);
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    // imposto il tasto #btnCompositeMetricSave con l'attributo 'token', in questo modo sono in modalità 'edit'
    app.btnCompositeMetricSave.dataset.token = e.currentTarget.dataset.objectToken;
    const textarea = document.getElementById('composite-metric-formula');
    // imposto il nome e alias della metrica nella dialog
    inputName.value = StorageMetric.selected.name;
    inputName.setAttribute('value', StorageMetric.selected.name);
    helper.classList.remove('error');
    helper.innerText = "";
    inputAlias.value = StorageMetric.selected.formula.alias;
    inputAlias.setAttribute('value', StorageMetric.selected.formula.alias);
    // re-inserisco la formula nella textarea
    StorageMetric.selected.formula.formula_sql.forEach(item => {
      // template utilizzato per il mark
      const templateContent = app.tmplFilterFormula.content.cloneNode(true);
      const i = templateContent.querySelector('i');
      i.addEventListener('click', app.cancelFormulaObject);
      const span = templateContent.querySelector('span');
      const mark = templateContent.querySelector('mark');
      const small = templateContent.querySelector('small');
      // se l'elemento della formula (item) è contenuto anche all'interno della prop 'metrics_alias' allora è il nome di una metrica e va messo nel tag <mark>
      if (StorageMetric.selected.formula.metrics_alias[item]) {
        // console.log('metrica : ', item);
        // è una metrica, ne recupero il token
        mark.dataset.metricToken = StorageMetric.selected.formula.metrics_alias[item].token;
        mark.innerText = item;
        textarea.appendChild(span);
      } else {
        app.addSpan(textarea, item, 'metric');
      }
    });
    // aggiungo, nella ul-metrics, le metriche già create
    // ripulisco la lista, prima di popolarla
    app.ulMetrics.querySelectorAll('section').forEach(item => item.remove());
    app.addMetricToDialogComposite('ul-all-metrics');
    app.dialogCompositeMetric.showModal();
  }

  // edit di una colonna
  app.handlerColumnEdit = (e) => {
    debugger;
  }

  // selezione di un cubo (step-1)
  app.handlerCubeSelected = (e) => {
    StorageCube.selected = e.currentTarget.dataset.cubeToken;
    // Query.tableAlias = StorageCube.selected.alias;
    // al momento non serve l'object con tableAlias e from, lo recupero direttamente dal nome del cubo in handlerEditReport, se così potrei anche utilizzare un oggetto Set anziche Map in Query.js
    // Query.elementCube = {token : e.currentTarget.dataset.cubeToken, tableAlias : StorageCube.selected.alias, from : Query.from, FACT : StorageCube.selected.FACT, name : StorageCube.selected.name};
    if (e.currentTarget.hasAttribute('data-selected')) {
      // nascondo tutti gli elementi relativi al cubo deselezionato
      // TODO: oltre a nascondere gli elementi del cubo deselezionato, devo anche rimuoverli dalla proprietà #objects della classe Query
      app.hideCubeObjects();
      e.currentTarget.toggleAttribute('data-selected');
    } else {
      // abilito il tasto #toggle-dimensions-drawer che consente di aprire il drawer con l'elenco delle dimensioni
      app.btnToggleDimensionsDrawer.disabled = false;
      app.showCubeObjects();
      // visualizzo la tabelle fact del cubo selezionato
      // document.querySelector("#ul-fact-tables > section[data-cube-token='" + StorageCube.selected.token + "']").hidden = false;
      // aggiungo l'attr data-selected
      e.currentTarget.toggleAttribute('data-selected');
    }
    Query.cubes = e.currentTarget.dataset.cubeToken;
  }

  // selezione delle dimensioni
  app.handlerDimensionSelected = (e) => {
    StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
    console.log('Dimensione selezionata : ', StorageDimension.selected);
    // Query.elementDimension = { token : e.currentTarget.dataset.dimensionToken, cubes : StorageDimension.selected.cubes};
    if (e.currentTarget.hasAttribute('data-selected')) {
      e.currentTarget.toggleAttribute('data-selected');
      // TODO: oltre a nascondere gli elementi della dimensione deselezionata, devo anche eliminarli dalla proprietà #objects della classe Query.
      app.hideDimensionObjects();
    } else {
      // imposto l'attr data-selected
      e.currentTarget.toggleAttribute('data-selected');
      app.showDimensionObjects();

      app.btnToggleHierarchyDrawer.disabled = false;
    }
    Query.dimensions = e.currentTarget.dataset.dimensionToken;
  }
  // selezione di un filtro già presente, lo salvo nell'oggetto Query
  app.handlerFilterSelected = (e) => {
    StorageFilter.selected = e.currentTarget.dataset.filterToken;
    let object = {};
    if (!e.currentTarget.hasAttribute('data-selected')) {
      e.currentTarget.toggleAttribute('data-selected');
      // creo l'oggetto da passare a Query.objects
      object.token = e.currentTarget.dataset.filterToken;
      if (StorageFilter.selected.hasOwnProperty('cubes')) object.cubes = StorageFilter.selected.cubes;
      if (StorageFilter.selected.hasOwnProperty('dimensions')) object.dimensions = StorageFilter.selected.dimensions;
      if (StorageFilter.selected.hasOwnProperty('hierarchies')) object.hierarchies = StorageFilter.selected.hierarchies;
      Query.objects = object;
      // console.log(StorageFilter.selected.formula);
      // nel salvare il filtro nel report attuale devo impostarne anche l'alias della tabella selezionata nella dialog
      Query.filters = StorageFilter.selected;
      // Query.filters = { token : e.currentTarget.dataset.filterToken, SQL : `${StorageFilter.selected.tableAlias}.${StorageFilter.selected.formula}` };
      app.addDefinedFilter();
      app.checkObjectSelected();
    }
  }

  app.handlerMetricFilterSelected = e => e.currentTarget.toggleAttribute('data-selected');

  // aggiunta di una metrica al report
  app.handlerMetricSelected = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.metricToken;
    if (!e.currentTarget.hasAttribute('data-selected')) {
      e.currentTarget.toggleAttribute('data-selected');
      // TODO: per le metriche composte (metric_type: 4) c'è da definire se inserire nel JSON i cubi a cui appartengono le metriche che compongono la composta
      if (+e.currentTarget.dataset.metricType === 4) {
        // quando viene selezionata una metrica composta, le metriche al suo interno verranno incluse nel datamart finale.
        // Potrei selezionarle sulla pagina con un colore diverso per evidenziare il fatto che sono già incluse nel report, inoltre
        // ... devo nascondere il tasto 'delete' perchè queste possono essere rimosse solo rimuovendo la metrica composta.

        // la prop formula->metrics_alias contiene {nome_metrica : metricToken, metricAlias}.
        // Tramite il metricToken posso selezionare le metriche incluse nella formula della composta.
        // all'interno delle metriche composte possono trovarsi anche altre metriche composte, quindi vado a cercare
        // ...anche in #ul-composite-metrics

        for (const [metricName, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
          // seleziono nello storage la metrica in ciclo contenuta all'interno della composta
          StorageMetric.selected = metric.token;
          if (StorageMetric.selected.metric_type !== 4) {
            // aggiungo la metrica che si trova all'interno della formula, alla ulDefinedMetrics
            // se la metrica che sto per aggiungere è già stata aggiunta, aggiungo solo lo small con all'interno la metrica composta qui selezionata
            if (!app.ulMetrics.querySelector(".selectable[data-metric-token='" + metric.token + "']").hasAttribute('data-selected')) {
              app.ulMetrics.querySelector(".selectable[data-metric-token='" + metric.token + "']").dataset.selected = 'true';
              // includo, con show-datamart = true, anche le metriche contenute nella formula all'interno del datamart finale
              app.ulMetrics.querySelector(".selectable[data-metric-token='" + metric.token + "']").dataset.showDatamart = 'true';
              app.addDefinedMetric();
            }
            // aggiungo uno <small> per indicare che la metrica è stata aggiunta perchè è inclusa in una metrica composta
            app.addSmallMetric(metric.token, e.currentTarget.dataset.metricToken);
          } else {
            app.ulCompositeMetrics.querySelector(".selectable[data-metric-token='" + metric.token + "']").dataset.selected = 'true';
            app.ulCompositeMetrics.querySelector(".selectable[data-metric-token='" + metric.token + "']").dataset.showDatamart = 'false';
          }
        }
        StorageMetric.selected = e.currentTarget.dataset.metricToken;
        // aggiungo alla ulDefinedCompositeMetric la metrica composta appena selezionata
        app.addDefinedCompositeMetric();
      } else {
        app.addDefinedMetric();
      }
      Query.objects = { token: e.currentTarget.dataset.metricToken, cubes: StorageMetric.selected.cubes };
      app.checkObjectSelected();
      app.setMetrics();
      app.setCompositeBaseMetrics();
      app.setFilteredMetrics();
      app.setCompositeMetrics();
    }
  }

  // selezione di una metrica per la creazione di una metrica composta
  app.handlerMetricSelectedComposite = (e) => {
    // aggiungo la metrica alla textarea
    Query.table = e.currentTarget.dataset.tableName;
    const textarea = document.getElementById('composite-metric-formula');
    const templateContent = app.tmplFilterFormula.content.cloneNode(true);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');

    mark.dataset.metricToken = e.currentTarget.dataset.metricToken;
    mark.innerText = e.currentTarget.dataset.label;
    textarea.appendChild(span);
    // aggiungo anche uno span per il proseguimento della scrittura della formula
    app.addSpan(textarea, null, 'metric');
  }

  // div contenteditable della formula per la metrica composta
  document.getElementById('composite-metric-formula').onclick = (e) => {
    console.log('e : ', e);
    console.log('e.target : ', e.target);
    console.log('e.currentTarget : ', e.currentTarget);
    if (e.target.localName === 'div') {
      app.addSpan(e.target, null, 'metric');
    }
  }

  app.addSpan = (target, value, check) => {
    /*
    * target : il div che contiene la formula
    * check : filter, metric (filter se sto creando una formula per il filtro, metric per le metriche composte)
    */
    const span = document.createElement('span');
    span.dataset.check = check;
    span.setAttribute('contenteditable', 'true');
    span.setAttribute('tabindex', 0);
    // let evt = new KeyboardEvent("keydown", {
    //   shiftKey: true,
    //   key: "Tab"
    // });
    span.addEventListener('input', app.checkSpanFormula);
    span.onkeydown = (e) => {
      if (e.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }
      /* verifico prima se questo span è l'ultimo elemento della formula.
      * In caso che lo span è l'ultimo elemento della formula ne aggiungo un'altro, altrimenti il Tab avrà il comportamento di default
      */
      const lastSpan = (e.target === target.querySelector('span[contenteditable]:last-child'));
      console.log(e.key);
      switch (e.key) {
        case 'Tab':
          // console.log(e.ctrlKey);
          // se il tasto shift non è premuto e mi trovo sull'ultimo span, aggiungo un altro span. In caso contrario, la combinazione shift+tab oppure tab su un qualsiasi altro
          // ...span che non sia l'ultimo, avrà il comportamento di default
          if (!e.shiftKey && lastSpan) {
            app.addSpan(target, null, check);
            e.preventDefault();
          }
          break;
        case 'Backspace':
          // se lo span è vuoto devo eliminarlo, in caso contrario ha il comportamento di default
          if (span.textContent.length === 0) {
            // posiziono il focus sul primo span disponibile andando indietro nel DOM
            /* const event = new Event('build');

            // Listen for the event.
             span.addEventListener('build', function(e) { console.log(e) }, false);

            // Dispatch the event.
            span.dispatchEvent(event);
            */
            // span.dispatchEvent(evt);

            // verifico il primo span[contenteditable] presente andando all'indietro (backspace keydown event)
            let previousContentEditable = (span) => {
              // se viene trovate uno <span> precedente a quello passato come argomento, lo restituisco, altrimenti restituisco quello passato come argomento
              if (span.previousElementSibling) {
                span = (span.previousElementSibling.hasAttribute('contenteditable')) ? span.previousElementSibling : previousContentEditable(span.previousElementSibling);
              }
              return span;
            }
            previousContentEditable(span).focus();
            span.remove();
          }
          break;

        default:
          break;
      }

    }
    if (value) span.innerText = value;
    target.appendChild(span);
    span.focus();
  }

  app.checkSpanFormula = (e) => {
    // TODO: qui potrei fare dei controlli sulla sintassi inserita, per il momento sull'evento input abilito solo il tasto btnSaveFilter.
    // e.target.dataset.check contiene il nome della formula da verificare, data-check='filter' la dialog che consente di creare/aggiornare i filtri , data-check='metric' per la dialog delle metriche composte
    switch (e.target.dataset.check) {
      case 'filter':
        app.checkFormulaFilter();
        break;
      case 'metric':
        app.checkFormulaMetric();
        break;
      default:
        break;
    }
  }

  // div contenteditable della formula per il filtro
  document.getElementById('composite-filter-formula').onclick = (e) => {
    console.log('e : ', e);
    // elimino lo span che contiene il "placeholder"
    console.log('e.target : ', e.target);
    console.log('e.currentTarget : ', e.currentTarget);
    if (e.target.localName === 'div') {
      app.addSpan(e.target, null, 'filter');
    }
  }

  // selezione delle colonne
  app.handlerSelectColumn = (e) => {
    console.log('addColumns');
    // verifico che almeno una dimension sia stata selezionata
    if (Query.dimensions.size === 0) {
      App.showConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
    } else {
      Query.table = e.currentTarget.dataset.tableName;
      Query.tableAlias = e.currentTarget.dataset.tableAlias;
      Query.columnToken = e.currentTarget.dataset.tokenColumn;
      // la FACT table non ha un data-table-id
      if (e.currentTarget.hasAttribute('data-table-id')) {
        StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
        Query.tableId = +e.currentTarget.dataset.tableId;
        Query.field = { [Query.columnToken]: StorageDimension.selected.hierarchies[e.currentTarget.dataset.hierToken].columns[Query.tableAlias][Query.columnToken] };
      } else {
        StorageCube.selected = e.currentTarget.dataset.cubeToken;
        Query.field = { [Query.columnToken]: StorageCube.selected.columns[Query.tableAlias][Query.columnToken] };
      }

      if (e.currentTarget.hasAttribute('data-selected')) {
        Query.objects = { token: Query.columnToken };
        // TODO: colonna deselezionata, implementare la logica in Query.deleteSelect
        // Query.deleteSelect();				
      } else {
        document.getElementById('columnAlias').value = '';
        document.getElementById('columnAlias').focus();
        // TODO: anche le colonne possono essere "composte", nel senso che possono includere campi di diverse tabelle, quindi anche di diverse gerarchie e dimensioni
        // imposto, nella section della dialog, l'attributo data-hier-token e data-dimension-name selezionata
        if (e.currentTarget.hasAttribute('data-hier-token')) {
          app.dialogColumns.querySelector('section').dataset.hierToken = e.currentTarget.dataset.hierToken;
          app.dialogColumns.querySelector('section').dataset.dimensionToken = e.currentTarget.dataset.dimensionToken;
        } else {
          // selezione di una colonna della Fact, elimino l'attributo data-hier-token perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
          delete app.dialogColumns.querySelector('section').dataset.hierToken;
        }
      }
      e.currentTarget.toggleAttribute('data-selected');
    }
  }

  // selezione della tabella nella dialog-tables (columns)
  app.handlerTableSelected = (e) => {
    debugger;
    const dimension = e.currentTarget.dataset.dimensionToken;
    Query.table = e.currentTarget.getAttribute('label'); // TODO: impostare data-label
    Query.tableAlias = e.currentTarget.dataset.tableAlias;
    Query.tableId = +e.currentTarget.dataset.tableId;
    const hier = e.currentTarget.dataset.hierToken;
    // deseleziono le precedenti tabelle selezionate
    // let activeDialog = document.querySelector('dialog[open]');
    if (app.dialogColumns.querySelector('#fieldList-tables ul li[selected]')) {
      const li = app.dialogColumns.querySelector('#fieldList-tables ul li[selected]');
      li.toggleAttribute('selected');
      // nascondo tutte le colonne che fanno parte della tabella precedentemente selezionata
      app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((field) => {
        field.hidden = true;
        delete field.dataset.searchable;
      });
    }
    e.currentTarget.toggleAttribute('selected');
    if (e.currentTarget.hasAttribute('selected')) {
      // visualizzo le colonne appartenenti alla tabella selezionata
      app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'][data-table-name='" + Query.table + "']").forEach((field) => {
        field.hidden = false;
        field.dataset.searchable = 'true';
      });
    }
  }

  // selezione di una tabella nella dialog-filter
  app.handlerSelectTable = async (e) => {
    if (!e.currentTarget.hasAttribute('data-selected')) {
      // de-seleziono le tabelle precedentemente selezionate se ce ne sono
      if (document.querySelector('#ul-tables .selectable[data-selected]')) document.querySelector('#ul-tables .selectable[data-selected]').toggleAttribute('data-selected');
      // disabilito il tasto "Ricerca valori", viene riattivato quando si seleziona una colonna della tabella
      app.btnSearchValue.disabled = true;
      // query per visualizzare tutti i field della tabella
      e.currentTarget.toggleAttribute('data-selected');

      Query.table = e.currentTarget.dataset.tableName;
      Query.tableAlias = e.currentTarget.dataset.tableAlias;
      Query.schema = e.currentTarget.dataset.schema;
      if (e.currentTarget.hasAttribute('data-hier-token')) {
        Query.tableId = +e.currentTarget.dataset.tableId;
        Query.hierToken = e.currentTarget.dataset.hierToken;
        Query.dimensionToken = e.currentTarget.dataset.dimensionToken;
      } else {
        // selezione di una tabella della Fact, elimino l'attributo data-hier-token perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
        // TODO: da ricontrollare se questi due attributi vengono utilizzati quando si seleziona una tabella appartenente a una dimensione->hier
        Query.tableId = null;
        // StorageCube.selected = e.currentTarget.dataset.cubeToken;
        Query.cubeToken = e.currentTarget.dataset.cubeToken;
      }
      // pulisco la <ul> dialog-filter-fields contenente la lista dei campi recuperata dal db, della selezione precedente
      app.dialogFilter.querySelectorAll('#dialog-filter-fields > section').forEach(section => section.remove());
      //app.dialogFilter.querySelector('section').dataset.tableName = e.currentTarget.dataset.tableName;
      app.addFields(await List.getFields());
    }
  }

  // selezione di una metrica mappata, disponibile per la creazione
  app.handlerMetricAvailable = (e) => {
    if (e.currentTarget.hasAttribute('data-selected')) return;
    const ul = document.getElementById('ul-available-metrics');
    const inputMetricName = document.getElementById('metric-name');
    const inputMetricAlias = document.getElementById('alias-metric');
    // elimino la precedente selezione
    if (ul.querySelector('.selectable[data-selected]')) delete ul.querySelector('.selectable[data-selected]').dataset.selected;
    e.currentTarget.dataset.selected = true;
    inputMetricName.value = '';
    inputMetricName.disabled = false;
    inputMetricAlias.value = '';
    inputMetricAlias.disabled = false;
    inputMetricName.focus();
    StorageCube.selected = e.currentTarget.dataset.cubeToken;
    // se la metrica selezionata è metric_type: 1 si tratta di una metrica composta, legata al cubo (es.: prezzo * quantità)
    if (StorageCube.selected.metrics[e.currentTarget.dataset.label].metric_type === 1) {
      // in Query.field devo impostare (alias_tabella.prezzo * alias_tabella.quantita)
      // l'array fields, nella metrica legata al cubo, la utilizzo come "controllo" per verificare quali metriche sono state messe nella formula e modificarle di conseguenza
      const fields = StorageCube.selected.metrics[e.currentTarget.dataset.label].fields;
      // baseFormula contiene la mappatura fatta su DB (es. : [prezzo, *, quantita])
      let baseFormula = StorageCube.selected.metrics[e.currentTarget.dataset.label].formula;
      // per ogni metrica presente nella baseFormula ...
      // NOTE: utilizzo di map()
      const newFormula = baseFormula.map(formulaElement => {
        // ...vado a modificare l'elemento dell'array che è contenuto nella formula, generando l'array newFormula : [DocVenditaDettaglio_444.prezzo, *, DocVenditaDettaglio_444.quantita]
        return (fields.includes(formulaElement)) ? `${e.currentTarget.dataset.tableAlias}.${formulaElement}` : formulaElement;
        // ...che successivamente lego con join creando DocVenditaDettaglio_444.prezzo * DocVenditaDettaglio_444.quantita.
        // ...in PHP, questo Query.field, verrà convertito in SUM(DocVenditaDettaglio_444.prezzo * DocVenditaDettaglio_444.quantita) AS 'alias_metric'
      }).join(' ');
      Query.field = newFormula;
      Query.fieldName = e.currentTarget.dataset.label;
    } else {
      Query.field = e.currentTarget.dataset.label;
      // per le metriche composte di primo livello non è necessario impostare le 2 prop tableAlias e table, sono già impostate con il map() qui sopra
      Query.table = e.currentTarget.dataset.tableName;
      Query.tableAlias = e.currentTarget.dataset.tableAlias;
    }
  }

  // apertura dialog per impostare le colonne nel report
  app.openDialogColumns = (e) => {
    const hier = e.currentTarget.dataset.hierToken;
    const table = e.currentTarget.dataset.tableName;
    const dimension = e.currentTarget.dataset.dimensionToken;
    app.dialogColumns.querySelector('section').dataset.hierToken = hier;
    app.dialogColumns.querySelector('section').dataset.dimensionToken = dimension;
    // nascondo le tabelle NON appartenenti alla gerarchia selezionata
    app.dialogColumns.querySelectorAll("#list-columns > section:not([data-table-name='" + table + "'])").forEach((column) => {
      column.hidden = true;
      delete column.dataset.searchable;
    });
    // visualizzo le tabelle appartenenti alla hier selezionata
    document.querySelectorAll("#list-columns > section[data-table-name='" + table + "']").forEach((column) => {
      // console.log('tabelle appartententi alla gerarchia selezionata : ', table);
      column.hidden = false;
      // imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
      // senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
      column.dataset.searchable = true;
    });
    app.dialogColumns.showModal();
  }

  // selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
  app.openDialogFilters = (e) => {
    if (!e.target.hasAttribute('data-fact-name')) {
      const hier = e.currentTarget.dataset.hierToken;
      const dimension = e.currentTarget.dataset.dimensionToken;
      app.dialogFilter.querySelector('section').dataset.hierToken = hier;
      app.dialogFilter.querySelector('section').dataset.dimensionToken = dimension;
      // nascondo le tabelle NON appartenenti alla hier selezionata
      app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section:not([data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'])").forEach(table => table.hidden = true);
      // visualizzo le tabelle appartenenti alla hier selezionata
      app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "']").forEach((table) => {
        // console.log('tabelle appartententi alla gerarchia selezionata : ', table);
        table.hidden = false;
        // imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
        // senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
        table.toggleAttribute('data-searchable');
      });
      // rimuovo, se già presente, la <ul> contenuto all'interno di #fieldList-filter per mostrare le colonne (recuperate dal DB) della tabella selezionata (esiste su selezione precedente)
      const listRef = app.dialogFilter.querySelector('#fieldList-filter');
      if (listRef.querySelector('ul')) listRef.querySelector('ul').remove();
    } else {
      // FACT
      const fact = e.currentTarget.dataset.factName;
      app.dialogFilter.querySelector('section').dataset.factName = fact;
      // visualizzo le tabelle appartenenti alla FACT selezionata
      app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section[data-fact-name='" + fact + "']").forEach((table) => {
        // console.log('tabelle appartententi alla gerarchia selezionata : ', table);
        table.hidden = false;
        // imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
        // senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
        table.toggleAttribute('data-searchable');
      });
    }
    app.dialogPopup = app.dialogFilter.querySelector('#dialog-popup');
    app.dialogFilter.showModal();
  }

  // cancellazione di un oggetto inserito nelle textarea formula SQL
  app.cancelFormulaObject = (e) => {
    console.log(e.currentTarget);
    e.currentTarget.parentElement.remove();
  }

  // selezione del field nella dialogFilter, questo metodo farà partire la query per ottenere i campi distinti (in getDistinctValues())
  app.handlerSelectField = (e) => {
    // field selezionato
    Query.field = e.currentTarget.dataset.label;
    // TODO: il fieldType mi servirà per scegliere di trattare il datatype del valore da inserire nell'SQL.
    // ... se string ad esempio, potrei inserire automaticamente degli apici, come in CodAziendaSId = 'XXXX'
    Query.fieldType = e.currentTarget.dataset.type;
    // ul con i valori contenuti nella colonna
    const valueList = app.dialogValue.querySelector('#ul-filter-values');
    valueList.querySelectorAll('section').forEach(section => section.remove());
    const textarea = document.getElementById('composite-filter-formula');
    const templateContent = app.tmplFilterFormula.content.cloneNode(true);
    const i = templateContent.querySelector('i');
    i.addEventListener('click', app.cancelFormulaObject);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    const small = templateContent.querySelector('small');

    // aggiungo il tableAlias e table come attributo.
    // ...in questo modo visualizzo solo il nome della colonna ma quando andrò a salvare la formula del filtro salverò table.field
    mark.dataset.tableAlias = Query.tableAlias;
    mark.dataset.table = Query.table;
    //mark.dataset.attr = Query.table;
    //debugger;
    if (Query.tableId === null) {
      // tabella selezionata è la FACT
      mark.dataset.cubeToken = Query.cubeToken;
    } else {
      mark.dataset.tableId = Query.tableId;
      mark.dataset.hierToken = Query.hierToken;
      mark.dataset.dimensionToken = Query.dimensionToken;
    }
    mark.dataset.field = Query.field;
    mark.innerText = Query.field;
    small.innerText = Query.table;
    textarea.appendChild(span);

    app.addSpan(textarea, null, 'filter');
    // TODO: checkFormulaValid()
    app.btnSearchValue.disabled = false;
    app.btnFilterSave.disabled = false;
  }

  app.addFields = (response) => {
    for (const [key, value] of Object.entries(response)) {
      List.addField(value);
      List.generic.selectable.onclick = app.handlerSelectField;
    }
  }

  // tasto 'Fatto' nella dialogFilter
  app.btnFilterDone.onclick = () => app.dialogFilter.close();

  // salvataggio della metrica nel db
  app.saveMetricDB = async (json) => {
    // console.log(json);
    // console.log(JSON.stringify(json));
    const params = JSON.stringify(json);
    const url = "/fetch_api/json/metric_store";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);

    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('METRICA SALVATA CORRETTAMENTE');
          // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: no data
          console.debug('ERRORE NEL SALVATAGGIO DELLA METRICA SU DB');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.btnMetricDone.onclick = () => app.dialogMetric.close();

  app.btnCompositeMetricDone.onclick = () => app.dialogCompositeMetric.close();

  // dialog-metric-filter, recupero i filtri selezionati per inserirli nella metrica filtrata
  app.btnMetricFilterDone.onclick = e => app.dialogMetricFilter.close();

  // save metric
  app.btnMetricSave.onclick = (e) => {
    const inputName = document.getElementById('metric-name');
    const inputAlias = document.getElementById('alias-metric');
    const aggregateFn = document.querySelector('#ul-aggregation-functions .selectable[data-selected]').dataset.label;
    let metric_type = +document.querySelector('#ul-available-metrics .selectable[data-selected]').dataset.metricType;
    const distinctOption = document.getElementById('checkbox-distinct').checked;
    const date = new Date();
    // console.log('Query.table : ', Query.table);
    // console.log('Query.tableAlias : ', Query.tableAlias);
    // console.log('Query.field : ', Query.field);
    // console.log('cube selected : ', StorageCube.selected.name);
    // console.log('cube selected token : ', StorageCube.selected.token);
    // edit o salvataggio di una metrica
    const token = (!e.target.dataset.token) ? rand().substr(0, 21) : e.target.dataset.token;
    // se la metrica è in fase di 'edit' la recupero dallo storage
    if (e.target.dataset.token) StorageMetric.selected = token;
    // verifico se ci sono filtri da associare a questa metrica
    let associatedFilters = new Set();
    document.querySelectorAll('#ul-metric-filters .selectable[data-selected]').forEach(filterSelected => {
      associatedFilters.add(filterSelected.dataset.filterToken);
    });
    let metricObj = {
      type: 'METRIC',
      name: inputName.value,
      updated_at: date.toLocaleDateString('it-IT', options),
      token,
      cubes: [StorageCube.selected.token]
    };
    metricObj.created_at = (e.target.dataset.token) ? StorageMetric.selected.created_at : date.toLocaleDateString('it-IT', options);
    /* se sono presenti dei filtri per la metrica che si sta creando, il metric_type sarà :
    * 2 : metrica di base con filtri
    * 3 : metrica di base composta, con filtri
    */
    if (associatedFilters.size > 0) metric_type = (metric_type === 0) ? 2 : 3;
    metricObj.metric_type = metric_type;

    let formulaObj = { token, aggregateFn, field: Query.field, distinct: distinctOption, alias: inputAlias.value };
    debugger;

    switch (metric_type) {
      case 1:
        // base composta (legata al cubo) senza filtri es.: prezzo*quantita
        // aggiungo l'oggetto fieldName
        metricObj.fieldName = Query.fieldName;
        metricObj.formula = formulaObj;
        break;
      case 2:
        // base filtrata (es.: venduto con filtro manodopera)
        formulaObj.table = Query.table;
        formulaObj.tableAlias = Query.tableAlias
        formulaObj.filters = [...associatedFilters];
        metricObj.formula = formulaObj;
        break;
      case 3:
        // base composta filtrata (es.: prezzo * qta impostate sul cubo e con filtro)
        metricObj.fieldName = Query.fieldName;
        formulaObj.filters = [...associatedFilters];
        metricObj.formula = formulaObj;
        break;
      default:
        // base
        console.info('metrica di base');
        formulaObj.table = Query.table;
        formulaObj.tableAlias = Query.tableAlias;
        metricObj.formula = formulaObj;
        break;
    }

    // salvo la nuova metrica nello storage
    StorageMetric.save(metricObj);
    // salvo nel DB
    // app.saveMetricDB(metricObj);
    // Imposto la metrica appena create come "selezionata" in modo da andare a creare il nuovo elemento nella #ul-metrics
    StorageMetric.selected = token;
    // aggiungo oppure aggiorno la metrica in #ul-metrics
    if (e.target.dataset.token) {
      // edit metrica
      app.ulMetrics.querySelector("section[data-metric-token='" + token + "']").dataset.label = inputName.value;
      app.ulMetrics.querySelector(".selectable[data-metric-token='" + token + "'] span[metric]").innerText = inputName.value;
    } else {
      List.addMetric();
    }
    app.resetDialogMetric();

    app.btnMetricSave.disabled = true;
  }

  app.resetDialogMetric = () => {
    // resetto le input, i filtri aggiunti alla metrica (#ul-metric-filters) e la metrica selezionata da #ul-available-metrics
    const inputName = document.getElementById('metric-name');
    const inputAlias = document.getElementById('alias-metric');
    inputName.value = "";
    inputAlias.value = "";
    inputName.disabled = true;
    inputAliasdisabled = true;
    document.querySelectorAll('#ul-metric-filters .selectable[data-selected]').forEach(filter => delete filter.dataset.selected);
    document.querySelectorAll('#ul-available-metrics .selectable[data-selected]').forEach(metric => delete metric.dataset.selected);
  }

  // app.addFilter = (hidden) => {
  //   const ul = document.getElementById(ul_id);
  //   const contentElement = app.tmplList.content.cloneNode(true);
  //   const section = contentElement.querySelector('section[data-sublist-filters]');
  //   const spanHContent = section.querySelector('.h-content');
  //   const selectable = spanHContent.querySelector('.selectable');
  //   const span = selectable.querySelector('span[filter]');
  //   //const smallTable = selectable.querySelector('small[table]');
  //   const smallHier = selectable.querySelector('small:last-child');
  //   const btnEdit = spanHContent.querySelector('button[data-edit]');
  //   section.hidden = hiddenStatus;
  //   // il filtro può contenere tabelle dei livelli dimensionali insieme alla FACT
  //   section.dataset.relatedObject = 'dimension cube';
  //   section.dataset.elementSearch = 'search-exist-filters';
  //   section.dataset.label = StorageFilter.selected.name;
  //   section.dataset.filterToken = StorageFilter.selected.token;
  //   if (StorageFilter.selected.hasOwnProperty('dimensions')) {
  //     section.dataset.dimensionToken = StorageFilter.selected.dimensions.join(' ');
  //     // elenco token hier separate da spazi
  //     section.dataset.hierToken = Object.keys(StorageFilter.selected.hierarchies).join(' ');
  //   } else {
  //     section.dataset.cubeToken = StorageFilter.selected.cubes;
  //   }
  //   selectable.dataset.filterToken = StorageFilter.selected.token;
  //   selectable.onclick = app[fn];
  //   span.innerText = StorageFilter.selected.name;
  //   // smallTable.innerText = table.table;
  //   smallHier.setAttribute('hier', 'true'); // TODO: dataset
  //   btnEdit.dataset.objectToken = StorageFilter.selected.token;
  //   btnEdit.onclick = app.handlerFilterEdit;
  //   // smallHier.innerText = hier.name;
  //   ul.appendChild(section);
  // }

  app.addDefinedColumn = (alias, token) => {
    const ul = document.getElementById('ul-defined-columns');
    const contentElement = app.tmplList.content.cloneNode(true);
    const section = contentElement.querySelector('section[data-sublist-columns-defined]');
    const spanHContent = section.querySelector('.h-content');
    const defined = spanHContent.querySelector('.defined');
    const span = defined.querySelector('span[column]');
    const btnEdit = spanHContent.querySelector('button[data-edit]');
    const btnRemove = spanHContent.querySelector('button[data-remove]');
    section.dataset.relatedObject = 'dimension cube';
    section.dataset.elementSearch = 'search-defined-columns';
    section.dataset.label = alias;
    section.dataset.tokenColumn = token;
    span.innerText = alias;
    btnRemove.addEventListener('click', app.handlerColumnRemove);
    btnRemove.dataset.objectToken = token;
    ul.appendChild(section);
  }

  app.addDefinedFilter = () => {
    const ul = document.getElementById('ul-defined-filters');
    const contentElement = app.tmplList.content.cloneNode(true);
    const section = contentElement.querySelector('section[data-sublist-filters-defined]');
    const spanHContent = section.querySelector('.h-content');
    const defined = spanHContent.querySelector('.defined');
    const span = defined.querySelector('span[filter]');
    const btnRemove = spanHContent.querySelector('button[data-remove]');
    // il filtro può contenere tabelle dei livelli dimensionali insieme alla FACT
    section.dataset.relatedObject = 'dimension cube';
    section.dataset.elementSearch = 'search-defined-filters';
    section.dataset.label = StorageFilter.selected.name;
    section.dataset.filterToken = StorageFilter.selected.token;
    if (StorageFilter.selected.hasOwnProperty('dimensions')) {
      section.dataset.dimensionToken = StorageFilter.selected.dimensions.join(' ');
      // elenco token hier separate da spazi
      section.dataset.hierToken = Object.keys(StorageFilter.selected.hierarchies).join(' ');
    } else {
      section.dataset.cubeToken = StorageFilter.selected.cubes;
    }
    defined.dataset.filterToken = StorageFilter.selected.token;
    span.innerText = StorageFilter.selected.name;
    btnRemove.dataset.objectToken = StorageFilter.selected.token;
    btnRemove.onclick = app.handlerFilterRemove;
    // smallHier.innerText = hier.name;
    ul.appendChild(section);
  }

  app.addSmallMetric = (metricToken, token) => {
    // metricToken : la metrica di base inclusa nella composta
    // token : la metrica composta
    StorageMetric.selected = token;
    const section = app.ulDefinedMetrics.querySelector("section[data-metric-token='" + metricToken + "']");
    section.querySelector('button[data-remove]').disabled = true;
    const defined = app.ulDefinedMetrics.querySelector(".defined[data-metric-token='" + metricToken + "']");
    const contentSub = app.tmplSublists.content.cloneNode(true);
    const small = contentSub.querySelector('small');
    // questo dataset mi servirà in fase di rimozione della metrica (rimozione della metrica composta)
    section.dataset[token] = token;
    small.dataset.compositeMetric = StorageMetric.selected.token;
    small.innerText = StorageMetric.selected.name;
    defined.appendChild(small);
  }

  app.addDefinedMetric = () => {
    const contentElement = app.tmplList.content.cloneNode(true);
    const section = contentElement.querySelector('section[data-sublist-metrics-defined]');
    const spanHContent = section.querySelector('.h-content');
    const defined = spanHContent.querySelector('.defined');
    const span = defined.querySelector('span[metric]');
    const btnRemove = spanHContent.querySelector('button[data-remove]');
    section.dataset.relatedObject = 'dimension cube';
    section.dataset.elementSearch = 'search-defined-metrics';
    section.dataset.label = StorageMetric.selected.name;
    section.dataset.metricToken = StorageMetric.selected.token;
    defined.dataset.metricToken = StorageMetric.selected.token;
    span.innerText = StorageMetric.selected.name;
    btnRemove.dataset.objectToken = StorageMetric.selected.token;
    btnRemove.dataset.metricType = StorageMetric.selected.metric_type;
    btnRemove.onclick = app.handlerMetricRemove;
    app.ulDefinedMetrics.appendChild(section);
  }

  app.addDefinedCompositeMetric = (tokenCompositeMetric) => {
    const contentElement = app.tmplList.content.cloneNode(true);
    const section = contentElement.querySelector('section[data-sublist-composite-metrics-defined]');
    const spanHContent = section.querySelector('.h-content');
    const defined = spanHContent.querySelector('.defined');
    const span = defined.querySelector('span[metric]');
    const btnRemove = spanHContent.querySelector('button[data-remove]');
    section.dataset.relatedObject = 'dimension cube';
    section.dataset.elementSearch = 'search-defined-metrics';
    section.dataset.label = StorageMetric.selected.name;
    section.dataset.metricToken = StorageMetric.selected.token;
    defined.dataset.metricToken = StorageMetric.selected.token;
    span.innerText = StorageMetric.selected.name;
    btnRemove.dataset.objectToken = StorageMetric.selected.token;
    btnRemove.onclick = app.handlerCompositeMetricRemove;
    if (tokenCompositeMetric) {
      StorageMetric.selected = tokenCompositeMetric;
      section.dataset.compositeMetric = StorageMetric.selected.token;
      small.innerText = StorageMetric.selected.name;
      btnRemove.disabled = true;
    }
    app.ulDefinedCompositeMetrics.appendChild(section);
  }

  // aggiungo la metrica appena creata alla <ul> (metrica composta)
  app.addCompositeMetric = () => {
    const contentElement = app.tmplList.content.cloneNode(true);
    const section = contentElement.querySelector('section[data-sublist-composite-metrics]');
    const spanHContent = section.querySelector('.h-content');
    const selectable = spanHContent.querySelector('.selectable');
    const smalls = selectable.querySelector('.smalls');
    const spanMetric = spanHContent.querySelector('span[metric]');
    const btnInfo = spanHContent.querySelector('button[data-info-object-token]')
    const btnEdit = spanHContent.querySelector('button[data-object-token]')
    section.dataset.relatedObject = 'cube';
    // non esiste nessun cubo legato a una metrica composta, quindi la rendo subito visibile
    section.hidden = false;
    section.dataset.metricToken = StorageMetric.selected.token;
    // const smallTable = spanHContent.querySelector('small[table]');
    // const smallCube = spanHContent.querySelector('small[cube]');
    section.dataset.elementSearch = 'search-exist-metrics';
    section.dataset.label = StorageMetric.selected.name; // ricerca
    // section.dataset.cubeToken = cubeToken;
    selectable.dataset.metricToken = StorageMetric.selected.token;
    selectable.dataset.metricType = StorageMetric.selected.metric_type;
    // selectable.dataset.tableName = value.FACT;
    // selectable.dataset.tableAlias = value.alias;
    // selectable.dataset.cubeToken = cubeToken;
    selectable.onclick = app.handlerMetricSelected;
    spanMetric.innerText = StorageMetric.selected.name;
    btnEdit.addEventListener('click', app.handlerCompositeMetricEdit);
    btnEdit.dataset.objectToken = StorageMetric.selected.token;
    // per ogni cubo in StorageMetric.selected.metric_cubes
    for (const [cubeToken, cube] of Object.entries(StorageMetric.selected.cubes)) {
      // debugger;
      const contentSub = app.tmplSublists.content.cloneNode(true);
      const small = contentSub.querySelector('small');
      small.dataset.cubeToken = cubeToken;
      // small.dataset.metricToken = StorageMetric.selected.token;
      // small.dataset.searchable = true;
      // small.dataset.tableAlias = table.alias;
      // small.dataset.tableId = tableId;
      // small.dataset.elementSearch = 'search-hierarchy';
      small.innerText = cube;
      small.dataset.attr = cube + 'test';
      smalls.appendChild(small);
    }
    app.ulCompositeMetrics.appendChild(section);
  }

  // remove filter from report
  app.handlerFilterRemove = (e) => {
    Query.filters = { token: e.currentTarget.dataset.objectToken };
    Query.objects = { token: e.currentTarget.dataset.objectToken };
    app.ulDefinedFilters.querySelector("section[data-filter-token='" + e.currentTarget.dataset.objectToken + "']").remove();
    delete app.ulFilters.querySelector("section[data-filter-token='" + e.currentTarget.dataset.objectToken + "'] .selectable").dataset.selected;
  }

  // remove metrics from report
  app.handlerMetricRemove = (e) => {
    Query.objects = { token: e.currentTarget.dataset.objectToken };
    // metrica di base deve essere eliminata da Query.metrics, filtrata invece, da Query.filteredMetrics
    // debugger;
    switch (+e.currentTarget.dataset.metricType) {
      case 0:
      case 1:
        Query.metrics = { token: e.currentTarget.dataset.objectToken };
        break;
      default:
        Query.filteredMetrics = { token: e.currentTarget.dataset.objectToken };
        break;
    }
    app.ulDefinedMetrics.querySelector("section[data-metric-token='" + e.currentTarget.dataset.objectToken + "']").remove();
    delete app.ulMetrics.querySelector("section[data-metric-token='" + e.currentTarget.dataset.objectToken + "'] .selectable").dataset.selected;
  }

  // remove composite metrics from report
  app.handlerCompositeMetricRemove = (e) => {
    Query.objects = { token: e.currentTarget.dataset.objectToken };
    Query.compositeMetrics = { token: e.currentTarget.dataset.objectToken };
    // recupero tutte le metriche che sono incluse nella metrica composta selezionata qui
    app.ulDefinedMetrics.querySelectorAll("section[data-" + e.currentTarget.dataset.objectToken + "]").forEach(metric => {
      // metric : è la metrica base/filtrata presente nella ulDefinedMetrics
      // elimino la metrica composta associata alla metrica in ciclo
      metric.querySelector("small[data-composite-metric='" + e.currentTarget.dataset.objectToken + "']").remove();
      // se, tra le metriche aggiunte al report, non ci sono più metriche utilizzate nella composta selezionata, allora le elimino dal report
      // ... le elimino in base al metric_type 
      if (metric.querySelectorAll("small[data-composite-metric]").length === 0) {
        StorageMetric.selected = metric.dataset.metricToken;
        switch (StorageMetric.selected.metric_type) {
          case 0:
          case 1:
            Query.metrics = { token: metric.dataset.metricToken };
            break;
          case 2:
          case 3:
            Query.filteredMetrics = { token: metric.dataset.metricToken };
            break;
          default:
            // metrica composta
            // in questo caso c'è una metrica composta all'interno della metrica composta selezionata
            // TODO: in questo caso c'è da verificare, a cascata, se ci sono altre metriche da eliminare contenute in questa composta
            Query.compositeMetrics = { token: metric.dataset.metricToken };
            break;
        }
        app.ulDefinedMetrics.querySelector("section[data-metric-token='" + metric.dataset.metricToken + "']").remove();
        delete app.ulMetrics.querySelector("section[data-metric-token='" + metric.dataset.metricToken + "'] .selectable").dataset.selected;
      }
    });
    // elimino anche la metrica composta selezionata per la cancellazione
    app.ulDefinedCompositeMetrics.querySelector("section[data-metric-token='" + e.currentTarget.dataset.objectToken + "']").remove();
    delete app.ulCompositeMetrics.querySelector("section[data-metric-token='" + e.currentTarget.dataset.objectToken + "'] .selectable").dataset.selected;
  }

  // remove column from report
  app.handlerColumnRemove = (e) => {
    Query.objects = { token: e.currentTarget.dataset.objectToken };
    // TODO: colonna deselezionata, implementare la logica in Query.deleteSelect
    // Query.deleteSelect();				
    app.ulDefinedColumns.querySelector("section[data-token-column='" + e.currentTarget.dataset.objectToken + "']").remove();
    delete app.ulColumns.querySelector(".selectable[data-token-column='" + e.currentTarget.dataset.objectToken + "']").dataset.selected;
  }

  // save compositeMetric
  app.btnCompositeMetricSave.onclick = (e) => {
    const inputName = document.getElementById('composite-metric-name');
    const inputAlias = document.getElementById('composite-alias-metric');
    let arr_sql = [];
    const date = new Date();
    //const rand = () => Math.random(0).toString(36).substr(2);
    const token = (!e.target.dataset.token) ? rand().substr(0, 21) : e.target.dataset.token;
    let metricsAlias = {}; // contiene un'elenco di object con nome_metrica : alias che compongono la metrica composta
    let cubes = new Set(); // contiene i cubi relativi alle metriche all'interno della metrica composta
    if (e.target.dataset.token) StorageMetric.selected = token;
    document.querySelectorAll('#composite-metric-formula *').forEach(element => {
      console.log('element : ', element);
      // debugger;
      // console.log('element : ', element.nodeName);
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      // se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
      if (element.nodeName === 'MARK') {
        StorageMetric.selected = element.dataset.metricToken;
        // recupero il nome del cubo a cui appartiene la metrica. Questo lo visualizzerò nell'elenco delle metriche composte
        // TODO: qui dovranno essere ciclati i cubi per le metriche create su più cubi
        StorageCube.selected = StorageMetric.selected.cubes;
        cubes.add(StorageCube.selected.token);
        // metrics[element.innerText] = StorageMetric.selected.formula.alias;
        // TODO: probabilmente qui meglio inserire tutto il contenuto della metrica e non solo l'alias
        metricsAlias[element.innerText] = { token: element.dataset.metricToken, alias: StorageMetric.selected.formula.alias };
        // TODO: verificare se è presente il distinct : true in ogni metrica
        arr_sql.push(StorageMetric.selected.name);
      } else {
        arr_sql.push(element.innerText.trim());
      }
    });
    // arr_sql.push(`AS '${inputAlias.value}'`);
    let metricObj = {
      type: 'METRIC',
      name: inputName.value,
      token,
      metric_type: 4,
      formula: { token, formula_sql: arr_sql, alias: inputAlias.value, metrics_alias: metricsAlias },
      cubes: [...cubes],
      updated_at: date.toLocaleDateString('it-IT', options),
    };
    metricObj.created_at = (e.target.dataset.token) ? StorageMetric.selected.created_at : date.toLocaleDateString('it-IT', options);
    console.log(metricObj);
    StorageMetric.save(metricObj);
    // salvo nel DB
    // app.saveMetricDB(metricObj);
    // reimposto, come metrica selezionata, la metrica appena creata che è da aggiungere a #ul-composite-metrics
    StorageMetric.selected = token;
    // aggiungo la metrica alla <ul>
    if (e.target.dataset.token) {
      // aggiornamento metrica
      app.ulCompositeMetrics.querySelector("section[data-metric-token='" + token + "']").dataset.label = inputName.value;
      app.ulCompositeMetrics.querySelector(".selectable[data-metric-token='" + token + "'] span[metric]").innerText = inputName.value;
    } else {
      // salvataggio nuova metrica, la aggiungo alla ul
      app.addCompositeMetric();
    }
    // resetto le input e la formula
    inputName.value = "";
    inputAlias.value = "";
    document.querySelectorAll('#composite-metric-formula *').forEach(item => item.remove());
    app.btnCompositeMetricSave.disabled = true;
  }

  // salvo il filtro nel DB, table : bi_filters
  app.saveFilterDB = async (json) => {
    const params = JSON.stringify(json);
    const url = "/fetch_api/json/filter_store";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('FILTRO SALVATO CORRETTAMENTE');
          // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: no data
          console.debug('ERRORE NEL SALVATAGGIO DEL FILTRO SU DB');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // save filter
  app.btnFilterSave.onclick = (e) => {
    console.log(Query.table);
    // per i filtri creati sulla Fact, hier e dimension devono essere = null ma và salvato, nel filtro, il nome del cubo a cui accede
    const filterName = document.getElementById('filterName');
    // edit o salvataggio di un filtro
    // se è presente l'attributo data-token, sul tasto, allora sono in modifica di un filtro, altrimenti sto inserendo un nuovo filtro.
    const token = (!e.target.dataset.token) ? rand().substr(0, 21) : e.target.dataset.token;
    // se il filtro è in fase di aggiornamento lo recupero dallo storage perchè la prop created_at deve restare invariata
    if (e.target.dataset.token) StorageFilter.selected = token;
    const date = new Date();
    let filterObject = {};
    let sql_formula = [];
    let hierarchiesMap = new Map(); // tabelle (e quindi gerarchie) utilizzate nel filtro
    let dimensions = new Set();
    let cubes = new Set();
    // questa proprietà, salvata all'interno del filtro, mi servirà per visualizzare la formula SQL del filtro in fase di Edit
    let editFormula = [];
    // Un filtro impostato la FACT avrà al suo interno il nome del cubo a cui è associato e l'alias della FACT
    document.querySelectorAll('#composite-filter-formula *').forEach(element => {
      // console.log(element);
      // se, nell'elemento <mark> è presente il tableId allora posso recuperare anche hierToken, hierName e dimensionToken
      // ... altrimenti devo recuperare il cubeToken. Ci sono anche filtri che possono essere fatti su un livello dimensionale e su una FACT
      // console.log(element);
      // debugger;
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        //const mark = element.querySelector('mark');
        if (element.dataset.tableId) {
          // tabella appartenente a un livello dimensionale
          editFormula.push(
            {
              table: element.dataset.table,
              alias: element.dataset.tableAlias,
              field: element.dataset.field,
              tableId: element.dataset.tableId,
              hierToken: element.dataset.hierToken,
              dimensionToken: element.dataset.dimensionToken
            }
          );
          dimensions.add(element.dataset.dimensionToken);
          sql_formula.push(`${element.dataset.tableAlias}.${element.dataset.field}`); // Azienda_444.id
          if (hierarchiesMap.has(element.dataset.hierToken)) {
            if (+element.dataset.tableId < hierarchiesMap.get(element.dataset.hierToken)) {
              hierarchiesMap.set(element.dataset.hierToken, +element.dataset.tableId);
            }
          } else {
            hierarchiesMap.set(element.dataset.hierToken, +element.dataset.tableId);
          }
        } else {
          editFormula.push(
            {
              table: element.dataset.table,
              alias: element.dataset.tableAlias,
              field: element.dataset.field,
              cubeToken: element.dataset.cubeToken
            }
          );
          // tabella appartenente alla FACT.
          cubes.add(element.dataset.cubeToken);
          // ...non dovrebbe servire il cubeToken su un filtro associato alla FACT, perchè in ogni caso, la FACT viene aggiunta in base alle metriche (che devono essere obbligatorie)
          sql_formula.push(`${element.dataset.tableAlias}.${element.dataset.field}`);
        }
      } else {
        sql_formula.push(element.innerText.trim());
        editFormula.push(element.innerText.trim());
      }
    });
    // console.log(sql_formula);
    // console.log(editFormula);
    // debugger;
    // console.log(hierarchiesMap);
    // TODO: la prop 'editFormula' va rinominata in 'edit'
    filterObject = {
      token,
      editFormula,
      type: 'FILTER',
      name: filterName.value,
      formula: sql_formula.join(' '), // Azienda_444.id = 43
      updated_at: date.toLocaleDateString('it-IT', options)
    };
    // aggiornamento oppure nuovo filtri, per l'aggiornamento del filtro andrò a modificare solo la data updated_at
    filterObject.created_at = (e.target.dataset.token) ? StorageFilter.selected.created_at : date.toLocaleDateString('it-IT', options);
    if (hierarchiesMap.size !== 0) {
      filterObject.hierarchies = Object.fromEntries(hierarchiesMap);
      filterObject.dimensions = [...dimensions];
    }
    // non sono presenti, tra gli elementi che compongono il filtro, che fanno riferimento a qualche livello dimensionale
    if (cubes.size !== 0) filterObject.cubes = [...cubes];
    StorageFilter.save(filterObject);
    StorageFilter.selected = token;
    // salvataggio nel DB
    // app.saveFilterDB(filterObject);
    // aggiorno la lista dei filtri esistenti
    if (e.target.dataset.token) {
      // aggiornamento del filtro
      document.querySelector("#ul-filters section[data-filter-token='" + token + "']").dataset.label = filterName.value;
      document.querySelector("#ul-metric-filters section[data-filter-token='" + token + "']").dataset.label = filterName.value;
      document.querySelector("#ul-filters .selectable[data-filter-token='" + token + "'] span[filter]").innerText = filterName.value;
      document.querySelector("#ul-metric-filters .selectable[data-filter-token='" + token + "'] span[filter]").innerText = filterName.value;
    } else {
      // nuovo filtro, lo aggiungo alle #ul
      List.addFilter(false);
      // filtri presenti nella dialog-metrics (metriche avanzate)
      List.addMetricFilter(false);
    }
    // pulisco la textarea
    document.querySelectorAll('#composite-filter-formula *').forEach(element => element.remove());
    // reset del form
    filterName.value = "";
    filterName.focus();
  }

  // tasto OK nella dialogValue
  app.btnValueDone.onclick = () => {
    // recupero tutti i valori selezionati.
    const valueSelected = app.dialogValue.querySelectorAll('#ul-filter-values .selectable[data-selected]');
    // TODO: Elaborare un sistema per effettuare la IN(), la BETWEEN, AND, OR, ecc...in base alla selezione dei valori
    const textarea = document.getElementById('composite-filter-formula');
    let arrayValues = [];
    valueSelected.forEach(element => arrayValues.push(element.dataset.label));
    // aggiungo i valori selezionati alla textarea
    app.addSpan(textarea, arrayValues.join(', '), 'filter');

    // TODO: impostare app.checkFormulaFilter(); nella creazione di un nuovo filtro

    app.dialogValue.close();
  }

  // recupero valori distinti per inserimento nella dialogFilter
  app.getDistinctValues = async () => {
    await fetch('fetch_api/schema/' + Query.schema + '/table/' + Query.table + '/field/' + Query.field + '/distinct_values')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data) {
          const ul = document.getElementById('ul-filter-values');
          for (const [key, value] of Object.entries(data)) {
            const content = app.tmplList.content.cloneNode(true);
            const section = content.querySelector('section[data-sublist-gen');
            const div = section.querySelector('div.selectable');
            const span = div.querySelector('span');
            section.hidden = false;
            section.dataset.label = value[Query.field];
            section.dataset.elementSearch = 'dialog-value-search';
            section.dataset.searchable = true;
            div.dataset.label = value[Query.field];
            span.innerText = value[Query.field];
            span.id = key;
            div.onclick = app.handlerSelectValue;
            ul.appendChild(section);
          }
        } else {
          // TODO: no data
          console.warning('Dati non recuperati');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
  app.handlerSelectValue = e => e.currentTarget.toggleAttribute('data-selected');

  List.getCubes();

  List.getDimensions();

  List.getHierarchies('ul-hierarchies');

  List.getHierarchies('ul-hierarchies-struct');

  List.getColumns();

  List.getFactColumns();

  app.getFilters(true);

  app.getMetricFilters(true);

  app.getCompositeMetrics(); // metriche composite

  List.getTables(); //  elenco tabelle nella dialogFilter

  List.getFactTables();

  List.getMetrics();

  List.getAvailableMetrics();

  app.getReports();

  // abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
  app.checkFormulaFilter = (check) => {
    // TODO: Implementazione
    const filterName = document.getElementById('filterName').value;
    const filterFormula = document.getElementById('composite-filter-formula');
    app.btnFilterSave.disabled = ((filterName.length !== 0) && (filterFormula.childElementCount !== 0) || !check) ? false : true;
  }

  // selezione di un operatore logica da inserire nella formula (AND, OR, NOT, ecc...)
  // TODO: da rivedere/ricostruire 22.04.2022
  app.handlerLogicalOperatorSelected = (e) => {
    // TODO: e.currentTarget
    console.log(e.target);
    e.target.toggleAttribute('selected');
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaLogicalOperator';
    span.innerText = e.target.getAttribute('label'); // TODO: dataset data-label
    textarea.appendChild(span);
  }
  /* events */

  // TODO: da ricontrollare 22.04.2022
  app.checkSelection = () => {
    // TODO: devo sapere in quale step mi trovo per poter verificare se sono stati selezionati gli elementi per proseguire
    const activeStep = document.querySelector('.step[selected]');
    const dataStep = +activeStep.dataset.step;
    switch (dataStep) {
      case 1:
        // cubi e dimensioni
        if (StorageCube.cubeSelected.size === 0) {
          App.showConsole('Cubo non selezionato', 'warning');
          return false;
        }
        if (StorageDimension.dimensionDimensions.size === 0) {
          App.showConsole('Dimensione non selezionata', 'warning');
          return false;
        }
        break;
      case 2:
        // colonne/filtri
        // deve essere selezionata almeno una colonna per proseguire
        if (Object.keys(Query.select).length === 0) {
          App.showConsole('Selezionare almeno un livello dimensionale', 'warning')
          return false;
        }
        break;
      default:
      // step 3
    }
    return true;
  }

  app.btnPreviousStep.onclick = () => Step.previous();

  app.btnNextStep.onclick = () => Step.next();

  // aggiungi filtri (step-2)
  app.btnAddFilters.onclick = () => {
    if (Query.dimensions.size === 0) {
      App.showConsole('Selezionare una dimensione per poter aggiungere colonne al report', 'warning');
    } else {
      app.dialogFilter.showModal();
      delete app.btnFilterSave.dataset.token;
      document.getElementById('filterName').value = '';
      document.getElementById('filterName').focus();
    }
  }

  // aggiungi colonne
  app.btnAddColumns.onclick = () => {
    if (Query.dimensions.size === 0) {
      App.showConsole('Selezionare una dimensione per poter aggiungere colonne al report', 'warning');
    } else {
      // ripulisco la dialog
      app.columnAlias.value = '';
      // document.querySelectorAll('#ul-columns .selectable').forEach(item => delete item.dataset.selected);
      app.btnColumnDone.disabled = true;
      app.dialogColumns.showModal();
    }
  }
  // aggiungi metriche (step-2)
  app.btnAddMetrics.onclick = () => {
    // verifico se è stato selezionato almeno un cubo
    if (Query.cubes.size === 0) {
      App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
    } else {
      app.dialogMetric.showModal();
      // nuova metrica, rimuovo il data-token dal tasto btnMetricSave
      delete app.btnMetricSave.dataset.token;
      document.getElementById('metric-name').disabled = true;
      document.getElementById('alias-metric').disabled = true;
    }
  }

  app.addMetricToDialogComposite = (ulId) => {
    const ul = document.getElementById(ulId);
    // per ogni cubo selezionato ne recupero le metriche ad esso appartenenti
    Query.cubes.forEach(cubeToken => {
      StorageCube.selected = cubeToken;
      // recupero lista aggiornata delle metriche
      StorageMetric.cubeMetrics = cubeToken;
      for (const [token, metric] of Object.entries(StorageMetric.cubeMetrics)) {
        const contentElement = app.tmplList.content.cloneNode(true);
        const section = contentElement.querySelector('section[data-sublist-metrics]');
        const spanHContent = section.querySelector('.h-content');
        const selectable = spanHContent.querySelector('.selectable');
        const span = spanHContent.querySelector('span[metric]');
        const smallTable = spanHContent.querySelector('small[table]');
        const smallCube = spanHContent.querySelector('small[cube]');
        // rimuovo i tasti edit e info che in  questa lista non servono.
        spanHContent.querySelectorAll('button').forEach(button => button.hidden = true);
        // TODO: quando passo sopra una metrica da questa lista, per poterla inserire nella formula, potrei visualizzare, in un div, il dettaglio della metrica selezionata, per capire meglio come sto creando la formula
        section.hidden = false;
        section.dataset.elementSearch = 'search-metrics';
        section.dataset.searchable = 'true';
        section.dataset.label = metric.name;
        section.dataset.cubeToken = metric.cubeToken;
        // metriche composte di base e composte non hanno le prop table, tableAlias
        if (metric.metric_type !== 1 && metric.metric_type !== 4 && metric.metric_type !== 3) {
          selectable.dataset.tableName = metric.formula.table;
          selectable.dataset.tableAlias = metric.formula.tableAlias;
          smallTable.innerText = metric.formula.table;
        }
        selectable.dataset.label = metric.name;
        selectable.dataset.cubeToken = metric.cubeToken;
        selectable.dataset.metricToken = token;
        selectable.onclick = app.handlerMetricSelectedComposite;
        span.innerText = metric.name;
        smallCube.innerText = StorageCube.selected.name;
        ul.appendChild(section);
      }
    });
  }

  // aggiungi metrica composta
  app.btnAddCompositeMetrics.onclick = () => {
    // console.log(Query.elementCube);
    // TODO: questo controllo lo farò sul tasto next degli step
    if (Query.cubes.size === 0) {
      App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
    } else {
      // ripulisco la lista, prima di popolarla
      document.querySelectorAll('#ul-all-metrics > section').forEach(item => item.remove());
      // const ul = document.getElementById('ul-metrics');
      app.addMetricToDialogComposite('ul-all-metrics');
      delete app.btnCompositeMetricSave.dataset.token;
      app.dialogCompositeMetric.showModal();
      document.getElementById('composite-metric-name').focus();
    }
  }

  // salvo il process nel DB
  app.saveReport = async () => {
    console.log(JSON.stringify(Query.reportProcessStringify));
    const params = JSON.stringify(Query.reportProcessStringify);
    const url = "/fetch_api/json/process_store";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('PROCESS SALVATO CORRETTAMENTE');
          // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: no data
          console.debug('PROCESS non salvato nel DB');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.updateReport = async () => {
    console.log(JSON.stringify(Query.reportProcessStringify));
    const params = JSON.stringify(Query.reportProcessStringify);
    const url = "/fetch_api/json/process_update";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('PROCESS AGGIORNATO CORRETTAMENTE');
          // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: no data
          console.debug('PROCESS non salvato nel DB');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // input reportName
  document.getElementById('reportName').oninput = (e) => {
    // verifico se il nome inserito è presente nello storage
    // console.log(window.localStorage);
    const check = StorageProcess.checkNames(e.target.value);
    if (check) {
      // nome già presente nello storage
      // console.log(e.target.querySelector(':scope'));
      e.target.parentElement.querySelector('.helper').classList.add('warning');
      e.target.parentElement.querySelector('.helper').innerText = "Il nome inserito è già presente";
    } else {
      e.target.parentElement.querySelector('.helper').classList.remove('warning');
      e.target.parentElement.querySelector('.helper').innerText = "";
    }
  }

  app.btnSaveReport.onclick = () => {
    // edit report inserisco il titolo nella input
    (!Query.token) ?
      document.getElementById('reportName').value = '' :
      document.getElementById('reportName').value = StorageProcess.selected.name;
    app.dialogSaveReport.showModal();
  }

  app.setFrom = () => {
    // imposto la FROM per le gerarchie
    document.querySelectorAll("#ul-hierarchies section:not([hidden]) .unselectable").forEach(hier => {
      // per ogni gerarchia VISIBILE, aggiungo le tabelle con data-include-query alla FROM
      // recuperare qui la FROM tra gli elementi contenenti data-include-query
      // ...in questo modo dovrei avere le tabelle anche ordinate secondo la logica della gerarchia
      hier.querySelectorAll("small[data-include-query]").forEach(tableRef => {
        Query.FROM = { tableAlias: tableRef.dataset.tableAlias, SQL: `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}` };
        StorageDimension.selected = tableRef.dataset.dimensionToken;
        // per l'ultima tabella della gerarchia non esiste la join perchè è quella che si lega al cubo e il legame è fatto nella proprietà 'cubes' della dimensione
        if (StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]) {
          // console.log(Object.keys(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]));
          // debugger;
          for (const [token, join] of Object.entries(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias])) {
            Query.WHERE = { token, join };
          }
        }
      });
    });
  }

  app.setMetrics = () => {
    app.ulMetrics.querySelectorAll(".selectable[data-selected][data-metric-type='0']").forEach(metricRef => {
      StorageMetric.selected = metricRef.dataset.metricToken;
      /* La metrica potrebbe già essere stata inclusa in Query.metrics se, ad esempio si è attivato il SQLinfo più volte (il Metodo Query.metrics è un Map che aggiunge/elimina)
      * oppure si clicca prima SQLInfo e poi Salva report. Per questo motivo faccio qui il controllo se la metrica già esiste nella classe Query non la aggiungo
      */
      if (!Query.metrics.has(metricRef.dataset.metricToken))
        Query.metrics = {
          token: metricRef.dataset.metricToken,
          name: StorageMetric.selected.name,
          metric_type: StorageMetric.selected.metric_type,
          aggregateFn: StorageMetric.selected.formula.aggregateFn,
          field: StorageMetric.selected.formula.field,
          distinct: StorageMetric.selected.formula.distinct,
          alias: StorageMetric.selected.formula.alias,
          table: StorageMetric.selected.formula.table,
          tableAlias: StorageMetric.selected.formula.tableAlias/*,
          show_datamart: metricRef.dataset.showDatamart*/
        };
    });
  }

  // metrica di base composta : 1 (es.: prezzo * quantita) impostate sul cubo
  app.setCompositeBaseMetrics = () => {
    // TODO: questo tipo di metrica potrei metterlo insieme a quelle di base (metric_type : 0) perchè le uniche differenze riguardano le prop 'table' e 'tableAlias'
    app.ulMetrics.querySelectorAll(".selectable[data-selected][data-metric-type='1']").forEach(metricRef => {
      StorageMetric.selected = metricRef.dataset.metricToken;
      if (!Query.metrics.has(metricRef.dataset.metricToken))
        Query.metrics = {
          token: metricRef.dataset.metricToken,
          name: StorageMetric.selected.name,
          metric_type: StorageMetric.selected.metric_type,
          aggregateFn: StorageMetric.selected.formula.aggregateFn,
          field: StorageMetric.selected.formula.field, // contiene la formula (es.: prezzo * quantita)
          distinct: StorageMetric.selected.formula.distinct,
          alias: StorageMetric.selected.formula.alias/*,
          show_datamart: metricRef.dataset.showDatamart*/
        };
    });
  }

  app.setFilteredMetrics = () => {
    document.querySelectorAll("#ul-metrics .selectable[data-selected][data-metric-type='2'], #ul-metrics .selectable[data-selected][data-metric-type='3']").forEach(metricRef => {
      StorageMetric.selected = metricRef.dataset.metricToken;
      //debugger;
      let object = {
        token: metricRef.dataset.metricToken,
        name: StorageMetric.selected.name,
        metric_type: StorageMetric.selected.metric_type,
        aggregateFn: StorageMetric.selected.formula.aggregateFn,
        alias: StorageMetric.selected.formula.alias,
        distinct: StorageMetric.selected.formula.distinct,
        field: StorageMetric.selected.formula.field,
        table: StorageMetric.selected.formula.table,
        tableAlias: StorageMetric.selected.formula.tableAlias
      };
      let FROM = new Map(), WHERE = new Map(), filters = new Map();
      // associo la FROM e WHERE in base ai filtri contenuti nella metrica
      StorageMetric.selected.formula.filters.forEach(filterToken => {
        StorageFilter.selected = filterToken;
        filters.set(filterToken, { SQL: StorageFilter.selected.formula });
        // se su quseto filtro sono presneti gerarchie...
        if (StorageFilter.selected.hasOwnProperty('hierarchies')) {
          for (const [token, tableId] of Object.entries(StorageFilter.selected.hierarchies)) {
            const hier = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='" + token + "']");
            hier.querySelectorAll("small").forEach(tableRef => {
              FROM.set(tableRef.dataset.tableAlias, `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}`);
              StorageDimension.selected = tableRef.dataset.dimensionToken;
              // per ogni dimensione contenuta all'interno del filtro recupero le join con il cubo
              // debugger;
              for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
                if (StorageFilter.selected.cubes) {
                  if (StorageFilter.selected.cubes.includes(cubeToken)) {
                    for (const [token, join] of Object.entries(joins)) {
                      WHERE.set(token, join);
                    }
                  }
                }

              }
              // per l'ultima tabella della gerarchia non esiste la join perchè è quella che si lega al cubo e il legame è fatto nella proprietà 'cubes' della dimensione
              if (StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]) {
                for (const [token, join] of Object.entries(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias])) {
                  WHERE.set(token, join);
                }
              }
            });
          }
        }
        /*
        * un filtro può contenere anche una tabella di un livello dimensionale e una FACT. Es.: Azienda.id =43 AND tiporiga = 'M'
        * in questo caso, dopo aver verificato le prop hierarchies e dimensions del filtro vado a verificare anche se è presente il cubeToken
        */
        if (StorageFilter.selected.hasOwnProperty('cubes')) {
          StorageFilter.selected.cubes.forEach(cubeToken => {
            StorageCube.selected = cubeToken;
            FROM.set(StorageCube.selected.alias, `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${StorageCube.selected.alias}`);
          });
        }
        object.FROM = Object.fromEntries(FROM);
        if (WHERE.size !== 0) object.WHERE = Object.fromEntries(WHERE);
        object.filters = Object.fromEntries(filters);
      });
      if (!Query.filteredMetrics.has(metricRef.dataset.metricToken)) Query.filteredMetrics = object;
    });
  }

  // metriche composte selezionate
  app.setCompositeMetrics = () => {
    // Siccome le metriche composte contengono le metriche "base"/"filtrate" vanno aggiunte anche queste all'elaborazione di baseTable() (metriche base) oppure metricTable() (metriche filtrate)
    app.ulCompositeMetrics.querySelectorAll(".selectable[data-selected][data-metric-type='4']").forEach(metricRef => {
      StorageMetric.selected = metricRef.dataset.metricToken;
      // ottengo le metriche inserite nella composta
      for (const [name, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
        StorageMetric.selected = metric.token;
        // se c'è una metrica filtrata memorizzo in Query.filteredMetrics altrimenti in Query.metrics
        switch (StorageMetric.selected.metric_type) {
          case 0:
          case 1:
            if (!Query.metrics.has(metric.token))
              Query.metrics = {
                token: metric.token,
                name,
                metric_type: StorageMetric.selected.metric_type,
                aggregateFn: StorageMetric.selected.formula.aggregateFn,
                field: StorageMetric.selected.formula.field,
                distinct: StorageMetric.selected.formula.distinct,
                alias: StorageMetric.selected.formula.alias,
                table: StorageMetric.selected.formula.table,
                tableAlias: StorageMetric.selected.formula.tableAlias
              };
            break;
          case 2:
          case 3:
            // metrica filtrata (es.: nettoriga manodopera) e metrica di base composta filtrata (prezzo*quantita manodopera)
            if (!Query.filteredMetrics.has(metric.token))
              Query.filteredMetrics = {
                token: metric.token,
                name,
                metric_type: StorageMetric.selected.metric_type,
                formula: StorageMetric.selected.formula,
                field: StorageMetric.selected.formula.field,
                distinct: StorageMetric.selected.formula.distinct,
                alias: StorageMetric.selected.formula.alias,
                table: StorageMetric.selected.formula.table,
                tableAlias: StorageMetric.selected.formula.tableAlias
              };
            break;
          default:
            // metrica composta (è contenuto dentro un'altra metrica composta)
            if (!Query.compositeMetrics.has(metric.token)) {
              Query.compositeMetrics = { token: metric.token, name, formula: StorageMetric.selected.formula };
            }
            break;
        }
      }
      // reimposto la metrica composta selezionata
      StorageMetric.selected = metricRef.dataset.metricToken;
      // aggiungo alle metriche selezionate per il report
      if (!Query.compositeMetrics.has(metricRef.dataset.metricToken)) Query.compositeMetrics = { token: metricRef.dataset.metricToken, name: StorageMetric.selected.name, formula: StorageMetric.selected.formula };
    });
  }

  // save report
  app.btnSaveReportDone.onclick = () => {
    const name = document.getElementById('reportName').value;
    app.setFrom();

    // imposto la factJoin che è presente solo sulla dimensione
    document.querySelectorAll('#ul-dimensions .selectable[data-include-query]').forEach(dimension => {
      StorageDimension.selected = dimension.dataset.dimensionToken;
      // per ogni dimensione con includeQuery recupero le join con il cubo
      for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
        // debugger;
        if (document.querySelector("#ul-cubes section[data-cube-token='" + cubeToken + "'] .selectable").hasAttribute('data-include-query')) {
          for (const [token, join] of Object.entries(joins)) {
            Query.WHERE = { token, join };
          }
        }
      }
    });
    // imposto la FROM per gli elementi del cubo/i selezionati
    document.querySelectorAll("#ul-cubes section:not([hidden]) .selectable[data-include-query]").forEach(cubeRef => {
      Query.FROM = { tableAlias: cubeRef.dataset.tableAlias, SQL: `${cubeRef.dataset.schema}.${cubeRef.dataset.tableName} AS ${cubeRef.dataset.tableAlias}` };
    });

    app.setMetrics();
    // metrica di base composta
    app.setCompositeBaseMetrics();
    // metriche filtrate
    app.setFilteredMetrics();
    // metriche composte
    app.setCompositeMetrics();

    // il datamart sarà creato come FX_processId
    // se è stato già definito un token significa che sto editando un report
    if (Query.token) {
      // edit del report
      Query.save(name);
      // Aggiorno nel database tabella : bi_processes
      app.editReport(Query.token, name);
      // app.updateReport();
      // TODO: aggiorno il nome del report nella lista #ul-processes
    } else {
      // nuovo report
      Query.token = rand().substr(0, 21);
      Query.processId = Date.now();
      Query.save(name);
      // app.saveReport();
      // recupero da Query la proprietà this.#reportProcess appena creata e la aggiungo a #ul-processes
      // aggiungo alla lista #ul-processes
      List.addReport(Query.token, Query.process);
    }
    app.dialogSaveReport.close();
  }

  // visualizzo in una dialog l'SQL della baseTable e delle metricTable
  app.btnSQLProcess.onclick = async () => {
    const name = document.getElementById('reportName').value;

    app.setFrom();

    // imposto la factJoin che è presente solo sulla dimensione
    document.querySelectorAll('#ul-dimensions .selectable[data-include-query]').forEach(dimension => {
      StorageDimension.selected = dimension.dataset.dimensionToken;
      // per ogni dimensione con includeQuery recupero le join con il cubo
      for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
        // debugger;
        if (document.querySelector("#ul-cubes section[data-cube-token='" + cubeToken + "'] .selectable").hasAttribute('data-include-query')) {
          for (const [token, join] of Object.entries(joins)) {
            Query.WHERE = { token, join };
          }
        }
      }
    });
    // imposto la FROM per gli elementi del cubo/i selezionati
    document.querySelectorAll("#ul-cubes section:not([hidden]) .selectable[data-include-query]").forEach(cubeRef => {
      Query.FROM = { tableAlias: cubeRef.dataset.tableAlias, SQL: `${cubeRef.dataset.schema}.${cubeRef.dataset.tableName} AS ${cubeRef.dataset.tableAlias}` };
    });

    app.setMetrics();
    // metrica di base composta
    app.setCompositeBaseMetrics();
    // metriche filtrate
    app.setFilteredMetrics();
    // metriche composte
    app.setCompositeMetrics();
    if (!Query.processId) Query.processId = '_process_id_';

    Query.SQLProcess(name);
    const params = JSON.stringify(Query.getSQLProcess().report);
    const url = "/fetch_api/cube/sqlInfo";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        // TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.text())
      .then((response) => {
        if (response) {
          // console.log(response);
          app.dialogSQLInfo.showModal();
          document.getElementById('SQL').innerHTML = response;
          App.showConsole('SQL generato!', 'done', 5000);
        } else {
          App.showConsole('Errori nella creazione del datamart', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // apro la dialog-metric-filter
  app.btnSetMetricFilter.onclick = () => app.dialogMetricFilter.showModal();

  // visualizzo la lista dei report da processare
  app.btnProcessReport.onclick = () => {
    app.processList.toggleAttribute('hidden');
  }

  // app.btnSearchValue.addEventListener('click', () => app.dialogValue.showModal());
  // apertura dialog-value per ricerca dei valori all'interno del database relativo alla colonna selezionata
  app.btnSearchValue.onclick = (e) => {
    app.getDistinctValues();
    app.dialogValue.showModal();
  }

  document.getElementById('columnAlias').oninput = (e) => {
    app.checkColumnForm();
  }

  app.checkDialogMetric = () => {
    const metricName = document.getElementById('metric-name').value;
    const aliasMetric = document.getElementById('alias-metric').value;
    // oltre a verificare il nome e l'alias devo anche verificare se è stata selezionata una metrica, mentre, la funzione di aggregazione è sempre selezionata almeno una
    const metricSelected = document.querySelectorAll('#ul-available-metrics .selectable[data-selected]').length;
    (metricName.length !== 0 && aliasMetric.length !== 0 && metricSelected !== 0) ? app.btnMetricSave.disabled = false : app.btnMetricSave.disabled = true;
  }

  app.checkFormulaMetric = () => {
    const inputName = document.getElementById('composite-metric-name');
    const helper = document.querySelector('#composite-metric-name ~ .helper');
    const alias = document.getElementById('composite-alias-metric').value;
    const formula = document.getElementById('composite-metric-formula');
    if (!app.btnCompositeMetricSave.dataset.token) {
      const check = StorageMetric.checkNames(inputName.value);
      if (check) {
        // nome già presente nello storage
        helper.classList.add('error');
        helper.innerText = "Il nome inserito è già presente";
        app.btnCompositeMetricSave.disabled = true;
      } else {
        helper.classList.remove('error');
        helper.innerText = "";
      }
      // controllo anche che la formula abbia dei contenuti
      app.btnCompositeMetricSave.disabled = (inputName.value.length !== 0 && alias.length !== 0 && !check && formula.childElementCount !== 0) ? false : true;
    } else {
      // edit della metrica
      // rimuovo eventuali avvisi sull'helper di metriche precedenti
      helper.classList.remove('error');
      helper.innerText = "";
      app.btnCompositeMetricSave.disabled = (inputName.value.length !== 0 && alias.length !== 0 && formula.childElementCount !== 0) ? false : true;
    }
  }

  // hide hierarchy drawer
  app.btnToggleHierarchyDrawer.onclick = (e) => {
    // console.log(e.target);
    const drawer = document.getElementById('drawer-hierarchies');
    drawer.toggleAttribute('data-open');
    e.target.innerText = (drawer.hasAttribute('data-open')) ? 'arrow_circle_left' : 'arrow_circle_right';
  }

  // hide cubes drawer
  app.btnToggleCubesDrawer.onclick = (e) => {
    // console.log(e.target);
    const drawer = document.getElementById('drawer-cubes');
    drawer.toggleAttribute('data-open');
    e.target.innerText = (drawer.hasAttribute('data-open')) ? 'arrow_circle_left' : 'arrow_circle_right';
  }

  app.btnToggleDimensionsDrawer.onclick = (e) => {
    // console.log(e.target);
    const drawer = document.getElementById('drawer-dimensions');
    drawer.toggleAttribute('data-open');
    e.target.innerText = (drawer.hasAttribute('data-open')) ? 'arrow_circle_left' : 'arrow_circle_right';
  }
  document.getElementById('alias-metric').oninput = (e) => {
    // TODO: verifico se un nome e un alias sono già presenti nell'elenco delle metriche
    app.checkDialogMetric();
  }

  document.getElementById('metric-name').oninput = () => {
    app.checkDialogMetric();
  }

  document.getElementById('composite-metric-name').oninput = (e) => {
    app.checkFormulaMetric(e.target);
  }

  document.getElementById('composite-alias-metric').oninput = () => app.checkFormulaMetric();

  document.getElementById('filterName').oninput = (e) => {
    // verifico se il nome inserito è presente nello storage
    // console.log(window.localStorage);
    const check = StorageFilter.checkNames(e.target.value);
    if (check) {
      // nome già presente nello storage
      // console.log(e.target.querySelector(':scope'));
      e.target.parentElement.querySelector('.helper').classList.add('warning');
      e.target.parentElement.querySelector('.helper').innerText = "Il nome inserito è già presente";
    } else {
      e.target.parentElement.querySelector('.helper').classList.remove('warning');
      e.target.parentElement.querySelector('.helper').innerText = "";
    }
    app.checkFormulaFilter(check);
  }

  // selezione di una funzione di aggregazione (dialog-metric)
  app.aggregationFunction.querySelectorAll('.selectable').forEach(fn => {
    fn.onclick = e => {
      // deseleziono altre funzioni di aggregazione precedentemente selezionate e seleziono quella e.target
      document.querySelector('#ul-aggregation-functions .selectable[data-selected]').toggleAttribute('data-selected');
      // console.log('e.currentTarget : ', e.currentTarget);
      e.currentTarget.toggleAttribute('data-selected');
      app.checkDialogMetric();
    }
  });

  app.saveColumn = () => {
    const alias = document.getElementById('columnAlias');
    const textarea = (document.getElementById('columnSQL').value.length === 0) ? null : document.getElementById('columnSQL').value;
    // le colonne di una Fact non hanno data-hier-token
    if (app.dialogColumns.querySelector('section').hasAttribute('data-hier-token')) {
      StorageDimension.selected = app.dialogColumns.querySelector('section').dataset.dimensionToken;
      const hierToken = app.dialogColumns.querySelector('section').dataset.hierToken;
      // document.querySelector("#ul-columns .selectable[data-token-column='" + Query.columnToken + "'] span[column]").innerText += ` (${alias.value})`;
      // in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
      Query.select = {
        token: Query.columnToken,
        dimensionToken: StorageDimension.selected.token,
        hier: hierToken,
        tableId: Query.tableId,
        table: Query.table,
        tableAlias: Query.tableAlias,
        field: Query.field,
        SQLReport: textarea,
        alias: alias.value
      };
      // NOTE: Oggetto Map
      const hierarchiesObject = new Map([[hierToken, Query.tableId]]);
      Query.objects = {
        token: Query.columnToken,
        hierarchies: Object.fromEntries(hierarchiesObject),
        dimensions: [StorageDimension.selected.token]
      };
    } else {
      // document.querySelector("#ul-columns .selectable[data-token-column='" + Query.columnToken + "'] span[column]").innerText += ` (${alias.value})`;
      Query.select = { token: Query.columnToken, table: Query.table, tableAlias: Query.tableAlias, field: Query.field, SQLReport: textarea, alias: alias.value, cubeToken: StorageCube.selected.token };
      Query.objects = { token: Query.columnToken, cubeToken: StorageCube.selected.token };
    }
    console.log('columnToken : ', Query.columnToken);
    // evidenzio come 'selezionata' la colonna che ha aperto la dialog dopo averla salvata qui. Vado a verificare sia le colonne della fact che quelle delle dimensioni
    // document.querySelector("#ul-columns .selectable[data-token-column='" + Query.columnToken + "']").toggleAttribute('data-selected');
    // in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
    // aggiungo la colonna inserita nella ul-defined-columns
    app.addDefinedColumn(alias.value, Query.columnToken);
    // abilito il tasto "Fatto" della dialog
    app.btnColumnDone.disabled = false;
    app.btnColumnSave.disabled = true;
    app.columnAlias.value = '';
    app.ulColumns.querySelectorAll('.selectable').forEach(item => delete item.dataset.selected);
    app.checkObjectSelected();
  }

  app.checkColumnForm = () => {
    const inputAlias = document.getElementById('columnAlias');
    const helper = document.querySelector('#columnAlias ~ .helper');
    // controllo che non sia stato già inserito il nome di questa colonna nel report
    const check = Query.checkColumnAlias(inputAlias.value);
    if (check) {
      // nome già presente nello storage
      helper.classList.add('error');
      helper.innerText = "Il nome della colonna è stato già aggiunto al report";
    } else {
      helper.classList.remove('error');
      helper.innerText = "";
    }
    const column = app.ulColumns.querySelectorAll('.selectable[data-selected]').length;
    app.btnColumnSave.disabled = (!check && inputAlias.value.length !== 0 && column !== 0) ? false : true;
  }
  // save column : salvataggio di una colonna del report
  app.btnColumnDone.onclick = () => app.dialogColumns.close();

  app.btnColumnSave.onclick = () => app.saveColumn();

  app.btnMapping.onclick = () => location.href = '/mapping';

  app.btnBackPage.onclick = () => window.location.href = '/';

  document.getElementById('columnAlias').onkeydown = (e) => {
    if (e.defaultPrevented) {
      console.log('è stato premuto 2 volte');
      return; // Do nothing if the event was already processed
    }
    // console.log(e);
    // console.log(e.key);
    if (e.key === 'Enter' && !app.btnColumnSave.disabled) app.saveColumn();
    // e.preventDefault();
  }

  app.showAbsoluteWindow = (e) => {
    const pos = () => {
      let x, y;
      const left = e.target.getBoundingClientRect().left;
      const right = e.target.getBoundingClientRect().right;
      const top = e.target.getBoundingClientRect().top;
      const bottom = e.target.getBoundingClientRect().bottom;
      let centerElementW = left + ((right - left) / 2);
      const elementWidth = app.absoluteWindow.offsetWidth / 2;

      y = bottom + 5;
      x = centerElementW - elementWidth;
      return { x, y };
    }

    app.absoluteWindow.style.setProperty('--left', pos().x + "px");
    // app.tooltip.style.setProperty('--left', xPosition + "px");
    app.absoluteWindow.style.setProperty('--top', pos().y + "px");
    // app.tooltip.style.setProperty('--top', yPosition + "px");
    /*app.popup.animate([
    {transform: 'scale(.2)'},
    {transform: 'scale(1.2)'},
    {transform: 'scale(1)'}
    ], { duration: 50, easing: 'ease-in-out', delay: 1000 });*/

    // console.log(e.target.getBoundingClientRect().bottom);
    // console.log(e.target.getBoundingClientRect().left);
    // console.log(' : ', rect);
  }

  app.showInfoObject = (e) => {
    console.log(e.target);
    const storage = new Storages();
    storage.selected = e.target.dataset.infoObjectToken;
    app.absoluteWindow.dataset.open = 'true';
    app.absoluteWindow.querySelector('*[data-object-name]').innerText = storage.selected.name;
    //debugger;
    switch (storage.selected.type) {
      case 'METRIC':
        app.absoluteWindow.querySelector('*[data-object-alias]').innerText = storage.selected.formula.alias;
        storage.selected.formula.filters.forEach(token => {
          StorageFilter.selected = token;
          app.absoluteWindow.querySelector('span[data-filter]').innerText = StorageFilter.selected.formula;
        });
        break;
      default:
        break;
    }
    app.showAbsoluteWindow(e);
  }

  const body = document.getElementById('body');
  const inputs = document.querySelectorAll("input[type='text']");
  // create a new instance of `MutationObserver` named `observer`,
  // passing it a callback function
  const observer = new MutationObserver(function() {
    console.log('callback that runs when observer is triggered');
    body.querySelectorAll('*[data-info-object-token]').forEach(element => element.addEventListener('click', app.showInfoObject));
    inputs.forEach(input => {
      // console.log(input);
      // l'elemento successivo alla input è la label
      (input.value.length !== 0) ? input.nextElementSibling.classList.add('has-content') : input.nextElementSibling.classList.remove('has-content');
    });

    // selectable con attributo data-fn
    document.querySelectorAll('ul .selectable[data-fn]').forEach(item => item.addEventListener('click', app[item.dataset.fn]));
    // button[data-edit]
    document.querySelectorAll('ul button[data-edit]').forEach(item => item.addEventListener('click', app[item.dataset.fn]));
    // data-copy
    document.querySelectorAll('ul button[data-copy]').forEach(item => item.addEventListener('click', app[item.dataset.fn]));
    // data-schedule
    document.querySelectorAll('ul button[data-schedule]').forEach(item => item.addEventListener('click', app[item.dataset.fn]));
  });
  // call `observe()` on that MutationObserver instance,
  // passing it the element to observe, and the options object
  observer.observe(body, { subtree: true, childList: true, attributes: true });
  inputs.forEach(input => observer.observe(input, { subtree: true, childList: true, attributes: true }));

  document.querySelectorAll('ul .selectable[data-fn]').forEach(item => observer.observe(item, { subtree: true, childList: true, attributes: true }));

  // dialog event close

  app.dialogFilter.addEventListener('close', () => {
    // ripulisco la input filterName e tutti gli oggetti presenti nella textarea
    document.getElementById('filterName').value = '';
    document.querySelectorAll('#composite-filter-formula *').forEach(element => element.remove());
  });

  // dialog metric
  app.dialogMetric.addEventListener('close', () => {
    // resetto le input, i filtri aggiunti alla metrica (#ul-metric-filters) e la metrica selezionata da #ul-available-metrics
    document.getElementById('metric-name').value = "";
    document.getElementById('alias-metric').value = "";
    document.querySelectorAll('#ul-metric-filters .selectable[data-selected]').forEach(filter => delete filter.dataset.selected);
    document.querySelectorAll('#ul-available-metrics .selectable[data-selected]').forEach(metric => delete metric.dataset.selected);
  });

  // dialog composite-metric
  app.dialogCompositeMetric.addEventListener('close', () => {
    // resetto le input ela formula
    document.getElementById('composite-metric-name').value = "";
    document.getElementById('composite-alias-metric').value = "";
    // ripulisco la textarea dalle precedenti selezioni
    document.querySelectorAll('#composite-metric-formula *').forEach(item => item.remove());
  });

  app.dialogMetricFilter.addEventListener('open', () => {
    document.getElementById('dialog-metric-filter-search').value = "";
  });
})();
