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
    tmplFormula: document.getElementById('tmpl-formula'),
    absoluteWindow: document.getElementById('absolute-window'),
    info: document.getElementById('info'),
    body: document.getElementById('body'),

    processList: document.getElementById('reportProcessList'),

    // btn
    btnAddFilters: document.getElementById('btn-add-filters'),
    btnAddColumns: document.getElementById('btn-add-columns'),
    btnAddMetrics: document.getElementById('btn-add-metrics'),
    btnAddCompositeMetrics: document.getElementById('btn-add-composite-metrics'),
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
    btnBackPage: document.getElementById('mdcBack'), // da definire
    aggregationFunction: document.getElementById('ul-aggregation-functions'),
    btnToggleHierarchyDrawer: document.getElementById('toggle-hierarchy-drawer'),
    btnToggleCubesDrawer: document.getElementById('toggle-cubes-drawer'),
    btnToggleDimensionsDrawer: document.getElementById('toggle-dimensions-drawer')
  }

  // Callback function to execute when mutations are observed
  // const targetNode = document.querySelectorAll('ul');
  // console.log(targetNode);
  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        console.info('A child node has been added or removed.');
        Array.from(mutation.addedNodes).forEach(node => {
          if (node.hasChildNodes()) node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
        });
      } else if (mutation.type === 'attributes') {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observerList = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  // observerList.observe(targetNode, config);
  document.querySelectorAll('ul').forEach(ul => observerList.observe(ul, config));

  app.editReport = (token, name) => {
    const ul = document.getElementById('ul-processes');
    const section = ul.querySelector("section[data-report-token='" + token + "']");
    section.dataset.label = name;
    section.querySelector("span[data-process]").innerText = name;
  }

  // verifico se ci sono object selezionati per poter attivare/disattivare alcuni tasti
  app.checkObjectSelected = () => {
    if (Query.OB['COLUMNS'].size > 0 && Query.OB['FILTER'].size > 0) {
      app.btnSQLProcess.disabled = false;
      app.btnSaveReport.disabled = false;
    } else {
      app.btnSQLProcess.disabled = true;
      app.btnSaveReport.disabled = true;
    }
  }

  // visualizzo/nascondo oggetti ( metriche / filtri ) appartenenti al cubo
  app.toggleCubeObjects = () => {
    document.querySelectorAll("section[data-related-object*='cube'][data-cube-token='" + StorageCube.selected.token + "']").forEach(item => {
      item.toggleAttribute('hidden');
      item.toggleAttribute('data-searchable');
    });
  }

  app.toggleDimensionObjects = () => {
    document.querySelectorAll("section[data-related-object*='dimension'][data-dimension-token*='" + StorageDimension.selected.token + "']").forEach(hier => {
      hier.toggleAttribute('hidden');
      hier.toggleAttribute('data-searchable');
    });
  }

  app.toggleAllObjects = () => {
    // per ogni dimensione in #elementDimension...
    for (const [token, value] of Query.elementHierarchy) {
      document.querySelectorAll("ul > section.data-item[data-dimension-token='" + value.dimensionToken + "'][data-hier-token='" + token + "']").forEach((item) => {
        item.toggleAttribute('hidden');
        item.toggleAttribute('data-searchable');
      });
    }
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
    // app.info.dataset.edit = 'true';
    StorageProcess.selected = e.target.dataset.processToken;
    // app.info.innerText = StorageProcess.selected.name;
    Query.token = e.target.dataset.processToken;
    Query.processId = +e.target.dataset.id;
    document.querySelector('#toggle-hierarchy-drawer').toggleAttribute('disabled');
    // cubi
    StorageProcess.selected.edit.cubes.forEach(token => {
      StorageCube.selected = token;
      // selezione del cubo nella #ul-cubes
      document.querySelector("#ul-cubes section[data-cube-token='" + token + "'] .selectable").dataset.selected = 'true';
      Query.cubes = token;
      app.toggleCubeObjects();
      app.btnToggleDimensionsDrawer.disabled = false;
    });

    // dimensioni
    StorageProcess.selected.edit.dimensions.forEach(token => {
      StorageDimension.selected = token;
      document.querySelector("#ul-dimensions section[data-dimension-token='" + token + "'] .selectable").dataset.selected = 'true';
      Query.dimensions = token;
      app.toggleDimensionObjects();
    });

    // colonne
    for (const [token, column] of Object.entries(StorageProcess.selected.edit.columns)) {
      // reimposto la colonna come quando viene selezionata
      // ciclo la proprietà 'edit' della colonna, al suo interno ci sono le specifiche della colonna da aggiungere a Objects
      for (const [key, value] of Object.entries(column.edit)) {
        // debugger;
        value.forEach(item => {
          Query.add(item);
        });
      }
      Query.add(column);
      // aggiungo alla #ul-defined-columns
      List.addDefinedColumn(column);
    }

    // filtri
    StorageProcess.selected.edit.filters.forEach(token => {
      StorageFilter.selected = token;
      // seleziono i filtri impostati nel report
      document.querySelector("#ul-filters .selectable[data-filter-token='" + token + "']").dataset.selected = 'true';
      document.querySelector("#ul-filters .selectable[data-filter-token='" + token + "']").dataset.added = 'true';
      // non posso modificare i filtri aggiunti al report corrente
      document.querySelector("#ul-filters button[data-edit][data-object-token='" + token + "']").setAttribute('disabled', true);
      // reimposto il filtro come se fosse stato selezionato
      Query.add(StorageFilter.selected);
      List.addDefinedFilter();
    });

    // metriche composte
    StorageProcess.selected.edit.compositeMetrics.forEach(token => {
      // se è una metrica nidificata NON la invio a nestedCompositeMetrics
      // solo le metriche "main" devono essere inviate a nestedCompositeMetrics la quale andrà a recuperare le metriche contenute nella formula
      // if (StorageProcess.selected.report.compositeMetrics[token].nested) return;
      app.nestedCompositeMetrics(token);
      StorageMetric.selected = token;
      Query.add(StorageMetric.selected);
      List.selectCompositeMetric(StorageMetric.selected.token);
      List.addDefinedCompositeMetric();
    });

    // metriche
    // NOTE: il codice per le metriche composte và messo necessariamente prima di questo per aggiungere metriche già inserite nelle metriche composte
    StorageProcess.selected.edit.metrics.forEach(token => {
      StorageMetric.selected = token;
      Query.add(StorageMetric.selected);
      List.selectMetric(StorageMetric.selected.token);
      // aggiungo alla lista #ul-defined-metrics se questa metrica non è stata già aggiunta da qualche metrica composta
      if (!document.querySelector("#ul-defined-metrics section[data-metric-token='" + token + "']")) List.addDefinedMetric();
    });
    app.processList.toggleAttribute('hidden');
    app.body.dataset.mode = 'edit';
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
    // carico l'elenco delle colonne della tabella (da valutare per i filtri su più tabelle)
    // inserisco i dati del filtro nella dialog (formula, name, table)
    const filterName = document.getElementById('filterName');
    // imposto un attributo data-edit = true sul tasto app.btnFilterSave che verrà verificato in fase di salvataggio del filtro
    app.btnFilterSave.dataset.token = e.currentTarget.dataset.objectToken;
    const textarea = document.getElementById('composite-filter-formula');
    StorageFilter.selected = e.currentTarget.dataset.objectToken;
    // imposto il nome del filtro nella input.
    // Lo imposto in due modi perchè con setAttribute viene riconosciuto dal MutationObserve e gli viene applicata
    // ...la classe 'has-content' sulla label
    filterName.setAttribute('value', StorageFilter.selected.name);
    filterName.value = StorageFilter.selected.name;
    filterName.focus();

    StorageFilter.selected.editFormula.forEach(item => {
      if (item.hasOwnProperty('table')) {
        // recupero la formula inserita nel div contenteditable e la re-inserisco 
        // template utilizzato per il mark
        const templateContent = app.tmplFormula.content.cloneNode(true);
        const i = templateContent.querySelector('i');
        i.addEventListener('click', app.cancelFormulaObject);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        const small = templateContent.querySelector('small');
        // l'item contiene il nome dell'alias della tabella, il field selezionato per creare il filtro e il nome della tabella.
        // Riprendo il template che ho utilizzato per creare il filtro.
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
    // inserisco i dati della metrica nella dialog
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    Query.table = StorageMetric.selected.formula.table;
    Query.tableAlias = StorageMetric.selected.formula.tableAlias;
    // imposto il token sul tasto come fatto per l'edit di un filtro
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
    // imposto la aggregateFn selezionata per la metrica
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
      const templateContent = app.tmplFormula.content.cloneNode(true);
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
  }

  // edit di una colonna
  app.handlerColumnEdit = (e) => {
    // recupero le proprietà della colonna. Posso recuperarla dal metodo Query.OB['COLUMNS'].
    // imposto un data-token sul tasto btnColumnSave
    // qui devo impostare le stesse prop impostate in handlerSelectColumn
    app.btnColumnSave.dataset.token = e.currentTarget.dataset.objectToken;
    document.getElementById('columnName').setAttribute('value', Query.OB['COLUMNS'].get(e.currentTarget.dataset.objectToken).name);
    debugger;
    document.getElementById('columnName').value = Query.OB['COLUMNS'].get(e.currentTarget.dataset.objectToken).name;
    // recupero la formula dall'oggetto Query.select e la reimposto nella composite-column-formula
    // seleziono la colonna e aggiungo la stessa al composite-column-formula
    const column = document.querySelector("#ul-columns .selectable[data-token='" + e.currentTarget.dataset.objectToken + "']")
    column.dataset.selected = 'true';
    // imposto tutti gli altri "disabled"
    document.querySelectorAll('#ul-columns section:not([hidden]) .selectable:not([data-selected])').forEach(element => element.dataset.disabled = 'true');
    app.addColumnToSQL(column);
    // ora i tasti btn-sql-id/ds possono essere abilitati/disabilitati
    app.dialogColumns.showModal();
    document.getElementById('columnName').focus();
    document.getElementById('columnName').select();
  }

  // selezione di un cubo (step-1)
  app.handlerCubeSelected = (e) => {
    StorageCube.selected = e.currentTarget.dataset.cubeToken;
    // al momento non serve l'object con tableAlias e from, lo recupero direttamente dal nome del cubo in handlerEditReport, se così potrei anche utilizzare un oggetto Set anziche Map in Query.js
    if (e.currentTarget.hasAttribute('data-selected')) {
      // TODO: oltre a nascondere gli elementi del cubo deselezionato, devo anche rimuoverli dalla proprietà #objects della classe Query
    } else {
      // abilito il tasto #toggle-dimensions-drawer che consente di aprire il drawer con l'elenco delle dimensioni
      app.btnToggleDimensionsDrawer.disabled = false;
      // visualizzo la tabelle fact del cubo selezionato
      // document.querySelector("#ul-fact-tables > section[data-cube-token='" + StorageCube.selected.token + "']").hidden = false;
    }
    app.toggleCubeObjects();
    e.currentTarget.toggleAttribute('data-selected');
    Query.cubes = e.currentTarget.dataset.cubeToken;
  }

  // selezione delle dimensioni
  app.handlerDimensionSelected = (e) => {
    StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
    console.log('Dimensione selezionata : ', StorageDimension.selected.name);
    if (e.currentTarget.hasAttribute('data-selected')) {
      // TODO: oltre a nascondere gli elementi della dimensione deselezionata, devo anche eliminarli dalla proprietà #objects della classe Query.
    } else {
      app.btnToggleHierarchyDrawer.disabled = false;
    }
    app.toggleDimensionObjects();
    e.currentTarget.toggleAttribute('data-selected');
    Query.dimensions = e.currentTarget.dataset.dimensionToken;
  }
  // selezione di un filtro
  app.handlerFilterSelected = (e) => {
    // se il filtro è già stato aggiunto al report non si può deselezionare da qui ma bisogna rimuoverlo dal report
    if (!e.currentTarget.hasAttribute('data-added')) {
      e.currentTarget.toggleAttribute('data-selected');
      // aggiungo l'attr data-temporary perchè se viene cliccato "Annulla" nella dialog-filter, questi devono essere deselezionati e non aggiunti al report
      e.currentTarget.toggleAttribute('data-temporary');
    }
  }

  app.handlerMetricFilterSelected = e => e.currentTarget.toggleAttribute('data-selected');

  app.nestedCompositeMetrics = (token) => {
    // token : è il token della metrica composta "main" la quale include altre metriche all'interno della sua formula
    // imposto la metrica composta passata come argomento.
    StorageMetric.selected = token;
    // in questo modo posso ciclare la sua formula per analizzare le metriche al suo interno
    for (const [metricName, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
      // imposto, come selezionata, la metrica contenuta nella formula
      StorageMetric.selected = metric.token;
      if (StorageMetric.selected.metric_type !== 4) {
        // la metrica all'interno della formula NON è una composta, la aggiungo alla ul-defined-metrics
        // se è già stata aggiunta (da precedenti metriche selezionate) aggiungo solo lo small, con all'interno
        // ...la metrica "madre" passata come argomento della fn
        // console.log(document.querySelector("#ul-metrics .selectable[data-metric-token='" + metric.token + "']"));
        if (!document.querySelector("#ul-metrics .selectable[data-metric-token='" + metric.token + "']").hasAttribute('data-selected')) {
          Query.add(StorageMetric.selected);
          List.selectMetric(metric.token);
          // TODO: includo, con show-datamart = true, anche le metriche contenute nella formula all'interno del datamart finale
          // document.querySelector("#ul-metrics .selectable[data-metric-token='" + metric.token + "']").dataset.showDatamart = 'true';
          List.addDefinedMetric(app.body.dataset.mode);
        }
        // TODO: verifico se lo <small> per questa metrica è stato già inserito
        if (!document.querySelector("#ul-defined-metrics section[data-metric-token='" + metric.token + "']").hasAttribute("data-" + token)) List.addSmallMetric(token);
      } else {
        // la metrica in ciclo (contenuta nella formula di una composta) è metrica composta, quindi aggiungo l'attr 'nested'
        if (!document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + metric.token + "']").hasAttribute('data-selected')) {
          Query.add(StorageMetric.selected);
          List.selectCompositeMetric(metric.token);
          // document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + metric.token + "']").dataset.nested = 'true';
          // document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + metric.token + "']").dataset.showDatamart = 'false';
          List.addDefinedCompositeMetric(app.body.dataset.mode);
        }
        // la metrica da aggiungere nello <small> è sempre la metrica "main"
        List.addSmallCompositeMetric(token);
        // questa metrica ha, al suo interno, altre metriche
        app.nestedCompositeMetrics(metric.token);
      }
    }
  }

  // selezione di una metrica da aggiungere al report
  app.handlerMetricSelected = (e) => {
    // se la metrica è già stata aggiunta al report non posso deselezionarla qui, bisogna rimuoverla dalla ul-defined-metrics
    if (!e.currentTarget.hasAttribute('data-added')) {
      e.currentTarget.toggleAttribute('data-selected');
      e.currentTarget.toggleAttribute('data-temporary');
    }
  }

  // selezione di una metrica per la creazione di una metrica composta
  app.handlerMetricSelectedComposite = (e) => {
    // aggiungo la metrica alla textarea
    Query.table = e.currentTarget.dataset.tableName;
    const textarea = document.getElementById('composite-metric-formula');
    const templateContent = app.tmplFormula.content.cloneNode(true);
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
    // console.log('e : ', e);
    // console.log('e.target : ', e.target);
    // console.log('e.currentTarget : ', e.currentTarget);
    if (e.target.localName === 'div') {
      app.addSpan(e.target, null, 'metric');
    }
  }

  app.addSpan = (target, value, check, mode) => {
    /*
    * target : il div che contiene la formula
    * check : filter, metric (filter se sto creando una formula per il filtro, metric per le metriche composte)
    */
    const span = document.createElement('span');
    span.dataset.check = check;
    if (mode) span.dataset.mode = mode;
    span.setAttribute('contenteditable', 'true');
    span.setAttribute('tabindex', 0);
    // let evt = new KeyboardEvent("keydown", {
    //   shiftKey: true,
    //   key: "Tab"
    // });
    span.addEventListener('input', app.checkSpanFormula);
    // Do nothing if the event was already processed
    span.onkeydown = (e) => {
      if (e.defaultPrevented) return;
      /* verifico prima se questo span è l'ultimo elemento della formula.
      * In caso che lo span è l'ultimo elemento della formula ne aggiungo un'altro, altrimenti il Tab avrà il comportamento di default
      */
      const lastSpan = (e.target === target.querySelector('span[contenteditable]:last-child'));
      switch (e.key) {
        case 'Tab':
          // console.log(e.ctrlKey);
          // se il tasto shift non è premuto e mi trovo sull'ultimo span, aggiungo un altro span. In caso contrario, la combinazione shift+tab oppure tab su un qualsiasi altro
          // ...span che non sia l'ultimo, avrà il comportamento di default
          if (!e.shiftKey && lastSpan) {
            (mode) ? app.addSpan(target, null, check, mode) : app.addSpan(target, null, check);
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
    // elimino lo span che contiene il "placeholder"
    if (e.target.localName === 'div') app.addSpan(e.target, null, 'filter');
  }

  // elimino lo span che contiene il "placeholder"
  document.getElementById('composite-column-formula').onclick = (e) => {
    if (e.target.localName === 'div' && e.target.dataset.mode !== 'all') app.addSpan(e.target, null, 'column', e.target.dataset.mode);
  }

  app.addColumnToSQL = (column) => {
    const textarea = document.getElementById('composite-column-formula');
    // if (textarea.dataset.mode === 'all') { App.showConsole("Selezionare una colonna sulla sinistra", "warning", 4000); return false; }
    const templateContent = app.tmplFormula.content.cloneNode(true);
    const i = templateContent.querySelector('i');
    i.addEventListener('click', app.cancelFormulaObject);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');

    span.dataset.mode = textarea.dataset.mode;
    mark.dataset.mode = textarea.dataset.mode;
    mark.dataset.tableAlias = column.dataset.tableAlias;
    mark.dataset.tableName = column.dataset.tableName;
    mark.dataset.token = column.dataset.token;
    mark.dataset.label = column.dataset.label;
    // livello dimensionale o FACT
    if (column.dataset.tableId) {
      mark.dataset.hierToken = column.dataset.hierToken;
      mark.dataset.dimensionToken = column.dataset.dimensionToken;
      mark.dataset.tableId = column.dataset.tableId;
    } else {
      mark.dataset.cubeToken = column.dataset.cubeToken;
    }
    mark.innerText = column.dataset.label;
    // small.innerText = Query.table;
    textarea.appendChild(span);
    app.checkColumnForm();
  }

  // aggiungo la colonna alla SQL formula
  app.handlerColumnAdd = (e) => app.addColumnToSQL(e.currentTarget);

  // selezione delle colonne
  app.handlerSelectColumn = (e) => {
    if (e.currentTarget.dataset.disabled) return false;
    if (!e.currentTarget.hasAttribute('data-selected')) {
      e.currentTarget.toggleAttribute('data-selected');
      // imposto tutti gli altri "disabled"
      document.querySelectorAll('#ul-columns section:not([hidden]) .selectable:not([data-selected])').forEach(element => element.dataset.disabled = 'true');
      document.getElementById('columnName').value = '';
      document.getElementById('columnName').focus();
      app.addColumnToSQL(e.currentTarget);
    } else {
      // deseleziono la colonna e reimposto tutti gli altri "abilitati per la selezione"
      e.currentTarget.toggleAttribute('data-selected');
      document.querySelectorAll('#ul-columns section:not([hidden]) .selectable[data-disabled]').forEach(element => delete element.dataset.disabled);
      // rimuovo dalla textarea la colonna deselezionata
      document.querySelectorAll('#composite-column-formula *').forEach(item => item.remove());
    }
    // ora i tasti btn-sql-id/ds possono essere abilitati/disabilitati
    document.querySelectorAll('#btn-sql-id, #btn-sql-ds').forEach(button => button.toggleAttribute('disabled'));
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
      // pulisco la <ul> ul-fields contenente la lista dei campi recuperata dal db, della selezione precedente
      app.dialogFilter.querySelectorAll('#ul-fields > section').forEach(section => section.remove());
      //app.dialogFilter.querySelector('section').dataset.tableName = e.currentTarget.dataset.tableName;
      List.addFields(await List.getFields());
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

  // cancellazione di un oggetto inserito nelle textarea formula SQL
  app.cancelFormulaObject = e => e.currentTarget.parentElement.remove();

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
    const templateContent = app.tmplFormula.content.cloneNode(true);
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

  // tasto 'Fatto' nella dialogFilter
  app.btnFilterDone.onclick = () => {
    // verifico i filtri che hanno l'attr data-temporary, questi verranno aggiunti alla ul-defined-filters
    document.querySelectorAll('#ul-filters .selectable[data-temporary]').forEach(item => {
      StorageFilter.selected = item.dataset.filterToken;
      Query.add(StorageFilter.selected);
      List.addDefinedFilter(app.body.dataset.mode);
      // rimuovo l'attributo data-temporary perchè li sto aggiunngendo al report
      delete item.dataset.temporary;
      item.dataset.added = 'true';
      document.querySelector("#ul-filters button[data-edit][data-object-token='" + item.dataset.filterToken + "']").setAttribute('disabled', 'true');
      app.checkObjectSelected();
    });
    app.dialogFilter.close();
  }

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

  // tasto "Fatto" nella dialog-metrics
  app.btnMetricDone.onclick = () => {
    // stessa logica di utilizzo del btnFilterDone
    // recupero l'elenco delle metriche selezionate nella dialog
    document.querySelectorAll('#ul-metrics .selectable[data-temporary]').forEach(item => {
      StorageMetric.selected = item.dataset.metricToken;
      Query.add(StorageMetric.selected);
      List.addDefinedMetric(app.body.dataset.mode);
      // rimuovo l'attributo data-temporary perchè lo sto aggiungendo al report
      // ... per lo stesso motivo aggiungo data-added
      delete item.dataset.temporary;
      item.dataset.added = 'true';
      // disabilito il tasto Edit. La modifica di una metrica è consentita solo quando NON utilizzata nel report attuale
      document.querySelector("#ul-metrics button[data-edit][data-object-token='" + item.dataset.metricToken + "']").setAttribute('disabled', 'true');
      app.checkObjectSelected();
    });
    app.dialogMetric.close();
  }

  app.btnCompositeMetricDone.onclick = () => {
    document.querySelectorAll('#ul-composite-metrics .selectable[data-temporary]').forEach(item => {
      // passo a nestedCompositeMetrics anche il token perchè lo StorageMetric.selected viene modificato dalla funzione
      // TODO: creare qui una Fn ricorsiva come fatto in undoRecursion()
      /* const recursiveMetricsAdd = (token) => {
        // token : è il token della metrica composta "main" la quale include altre metriche all'interno della sua formula
        // imposto la metrica composta passata come argomento.
        StorageMetric.selected = token;
        for (const metric in StorageMetric.selected.formula.metrics_alias) {
          // console.log(StorageMetric.selected.formula.metrics_alias[metric]);
          const metricToken = StorageMetric.selected.formula.metrics_alias[metric].token;
          // imposto, come selezionata, la metrica contenuta nella formula
          StorageMetric.selected = metricToken;
          if (StorageMetric.selected.metric_type !== 4) {
            if (!document.querySelector("#ul-metrics .selectable[data-metric-token='" + metricToken + "']").hasAttribute('data-selected')) {
              Query.add(StorageMetric.selected);
              List.selectMetric(metricToken);
              // TODO: includo, con show-datamart = true, anche le metriche contenute nella formula all'interno del datamart finale
              // document.querySelector("#ul-metrics .selectable[data-metric-token='" + metric.token + "']").dataset.showDatamart = 'true';
              List.addDefinedMetric(app.body.dataset.mode);
            }
            // TODO: verifico se lo <small> per questa metrica è stato già inserito
            if (!document.querySelector("#ul-defined-metrics section[data-metric-token='" + metricToken + "']").hasAttribute("data-" + token)) List.addSmallMetric(token);
          } else {
            // la metrica in ciclo (contenuta nella formula di una composta) è metrica composta, quindi aggiungo l'attr 'nested'
            if (!document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + metricToken + "']").hasAttribute('data-selected')) {
              Query.add(StorageMetric.selected);
              List.selectCompositeMetric(metricToken);
              // document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + metric.token + "']").dataset.nested = 'true';
              // document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + metric.token + "']").dataset.showDatamart = 'false';
              List.addDefinedCompositeMetric(app.body.dataset.mode);
            }
            // la metrica da aggiungere nello <small> è sempre la metrica "main"
            List.addSmallCompositeMetric(token);
            // questa metrica ha, al suo interno, altre metriche
            recursiveMetricsAdd(metricToken);
          }
        }
      };
      recursiveMetricsAdd(item.dataset.metricToken); */

      app.nestedCompositeMetrics(item.dataset.metricToken);
      // imposto la metrica composta selezionata per poterla aggiungere alla definedList
      StorageMetric.selected = item.dataset.metricToken;
      item.dataset.selected = 'true';
      item.dataset.added = 'true';
      delete item.dataset.temporary;
      document.querySelector("#ul-composite-metrics button[data-edit][data-object-token='" + item.dataset.metricToken + "']").setAttribute('disabled', 'true');
      Query.add(StorageMetric.selected);
      // aggiungo alla ulDefinedCompositeMetric la metrica composta appena selezionata
      // debugger;
      List.addDefinedCompositeMetric(app.body.dataset.mode);
    });
    app.dialogCompositeMetric.close();
    app.checkObjectSelected();
  }

  // dialog-metric-filter, recupero i filtri selezionati per inserirli nella metrica filtrata
  app.btnMetricFilterDone.onclick = () => app.dialogMetricFilter.close();

  // save metric
  app.btnMetricSave.onclick = (e) => {
    const inputName = document.getElementById('metric-name');
    const inputAlias = document.getElementById('alias-metric');
    const aggregateFn = document.querySelector('#ul-aggregation-functions .selectable[data-selected]').dataset.label;
    let metric_type = +document.querySelector('#ul-available-metrics .selectable[data-selected]').dataset.metricType;
    const distinctOption = document.getElementById('checkbox-distinct').checked;
    const date = new Date();
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
      name: inputName.value,
      token,
      cube: StorageCube.selected.token,
      updated_at: date.toLocaleDateString('it-IT', options)
    };
    metricObj.created_at = (e.target.dataset.token) ? StorageMetric.selected.created_at : date.toLocaleDateString('it-IT', options);
    /* se sono presenti dei filtri per la metrica che si sta creando, il metric_type sarà :
    * 2 : metrica di base con filtri
    * 3 : metrica di base composta, con filtri
    */
    if (associatedFilters.size > 0) metric_type = (metric_type === 0) ? 2 : 3;
    metricObj.metric_type = metric_type;

    let formulaObj = { token, aggregateFn, field: Query.field, distinct: distinctOption, alias: inputAlias.value };

    switch (metric_type) {
      case 1:
        // base composta (legata al cubo) senza filtri es.: prezzo*quantita
        // aggiungo l'oggetto fieldName
        metricObj.fieldName = Query.fieldName;
        metricObj.formula = formulaObj;
        metricObj.type = 'METRIC';
        break;
      case 2:
        // base filtrata (es.: venduto con filtro manodopera)
        formulaObj.table = Query.table;
        formulaObj.tableAlias = Query.tableAlias
        formulaObj.filters = [...associatedFilters];
        metricObj.formula = formulaObj;
        metricObj.type = 'ADV_METRIC';
        break;
      case 3:
        // base composta filtrata (es.: prezzo * qta impostate sul cubo e con filtro)
        metricObj.fieldName = Query.fieldName;
        formulaObj.filters = [...associatedFilters];
        metricObj.formula = formulaObj;
        metricObj.type = 'ADV_METRIC';
        break;
      default:
        // base
        formulaObj.table = Query.table;
        formulaObj.tableAlias = Query.tableAlias;
        metricObj.formula = formulaObj;
        metricObj.type = 'METRIC';
        break;
    }
    StorageMetric.save(metricObj);
    // app.saveMetricDB(metricObj);
    // Imposto la metrica appena create come "selezionata" in modo da andare a creare il nuovo elemento nella #ul-metrics
    StorageMetric.selected = token;
    // aggiungo oppure aggiorno la metrica in #ul-metrics
    if (e.target.dataset.token) {
      // edit metrica
      document.querySelector("#ul-metrics section[data-metric-token='" + token + "']").dataset.label = inputName.value;
      document.querySelector("#ul-metrics .selectable[data-metric-token='" + token + "'] span[metric]").innerText = inputName.value;
      delete e.target.dataset.token;
    } else {
      List.addMetric();
    }
    app.resetDialogMetric();
    e.target.disabled = true;
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

  // remove filter from report
  app.handlerFilterRemove = (e) => {
    StorageFilter.selected = e.currentTarget.dataset.objectToken;
    // TODO: utilizzo, per la cancellazione, lo StorageFilter, anzichè il token presente nel currentTarget.dataset, perchè, in futuro mi potrebbe servire un nuovo type : 'ADV_FILTER' (con filtri "composti"), utilizzando la stessa logica di type : 'METRIC' e 'ADV_METRIC'
    Query.remove(StorageFilter.selected);
    const el = document.querySelector("#ul-defined-filters section[data-filter-token='" + e.currentTarget.dataset.objectToken + "']");
    if (app.body.dataset.mode === 'edit') {
      el.classList.add('removed');
    } else {
      el.classList.add('animation-remove');
      el.onanimationend = e => e.target.remove();
      List.deselectFilter(StorageFilter.selected.token);
    }
  }

  // filtro rimossa in fase di edit, la re-inserisco
  app.handlerFilterUndoRemove = (e) => {
    StorageFilter.selected = e.currentTarget.dataset.objectToken;
    document.querySelector(".data-item-defined.removed[data-filter-token='" + e.currentTarget.dataset.objectToken + "']").classList.remove('removed');
    Query.add(StorageFilter.selected);
  }

  // remove metrics from report
  app.handlerMetricRemove = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    Query.remove(StorageMetric.selected);
    const el = document.querySelector(".data-item-defined[data-metric-token='" + e.currentTarget.dataset.objectToken + "']");
    if (app.body.dataset.mode === 'edit') {
      el.classList.add('removed');
    } else {
      el.classList.add('animation-remove');
      el.onanimationend = e => e.target.remove();
      List.deselectMetric(StorageMetric.selected.token);
    }
  }

  // metrica rimossa in fase di edit, la re-inserisco
  app.handlerMetricUndoRemove = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    document.querySelector(".data-item-defined.removed[data-metric-token='" + e.currentTarget.dataset.objectToken + "']").classList.remove('removed');
    Query.add(StorageMetric.selected);
  }

  // metrica aggiunta in fase di edit. Il tasto Undo la rimuove dal DOM (con animation)
  app.handlerMetricUndoAdd = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    const el = document.querySelector(".data-item-defined.added[data-metric-token='" + e.currentTarget.dataset.objectToken + "']");
    Query.remove(StorageMetric.selected);
    el.classList.add('animation-remove');
    el.onanimationend = e => e.target.remove();
  }

  // filtro aggiunto in fase di edit. Il tasto Undo la rimuove dal DOM (con animation)
  app.handlerFilterUndoAdd = (e) => {
    StorageFilter.selected = e.currentTarget.dataset.objectToken;
    const el = document.querySelector(".data-item-defined.added[data-filter-token='" + e.currentTarget.dataset.objectToken + "']");
    Query.remove(StorageFilter.selected);
    el.classList.add('animation-remove');
    el.onanimationend = e => e.target.remove();
  }

  app.handlerColumnUndoRemove = (e) => {
    debugger;
    Query.add({ token: e.currentTarget.dataset.objectToken, type: 'COLUMNS' });
  }

  app.removeCompositeMetric = (token) => {
    // console.log(document.querySelectorAll("ul section[data-" + token + "]"));
    document.querySelectorAll("ul section[data-" + token + "]").forEach(metric => {
      metric.querySelector("small[data-composite-metric='" + token + "']").remove();
      StorageMetric.selected = metric.dataset.metricToken;
      if (metric.querySelectorAll("small[data-composite-metric]").length === 0) {
        if (StorageMetric.selected.metric_type !== 4) {
          Query.remove(StorageMetric.selected);
          document.querySelector("section.data-item-defined[data-metric-token='" + StorageMetric.selected.token + "']").classList.add('removed');
          // document.querySelector("ul section.data-item-defined[data-metric-token='" + StorageMetric.selected.token + "']").remove();
          List.deselectMetric(StorageMetric.selected.token);
        } else {
          // TODO: qui il codice dovrebbe arrivare con una metrica composta nidificata al secondo livello
          // metrica composta
          debugger;
          // in questo caso c'è una metrica composta all'interno della metrica composta selezionata
          document.querySelector("section.data-item-defined[data-metric-token='" + token + "']").classList.add('removed');
          // document.querySelector("ul section.data-item-defined[data-metric-token='" + token + "']").remove();
          List.deselectCompositeMetric(token);
          app.removeCompositeMetric(metric.dataset.metricToken);
        }
      }
    });
  }

  // annullo l'aggiunta della metrica composta
  app.handlerCompositeMetricUndoAdd = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    const el = document.querySelector(".data-item-defined[data-metric-token='" + e.currentTarget.dataset.objectToken + "']");
    el.classList.add('animation-remove');
    el.onanimationend = e => e.target.remove();
    Query.remove(StorageMetric.selected);
    const undoRecursion = () => {
      // StorageMetric è la metrica composta qui. All'interno della Fn StorageMetric può essere anche una metrica base/adv
      for (const [metricName, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
        // TODO: metricName non è utilizzata, utilizzare un altro tipo ti ciclo per recuperare solo il token (for...in)
        // imposto, come selezionata, la metrica contenuta nella formula
        StorageMetric.selected = metric.token;
        Query.remove(StorageMetric.selected);
        // elimino, con animation, le metriche aggiunte (in fase di edit)
        const el = document.querySelector(".data-item-defined[data-metric-token='" + metric.token + "']");
        el.classList.add('animation-remove');
        el.onanimationend = e => e.target.remove();
        if (StorageMetric.selected.metric_type === 4) undoRecursion(metric.token);
      }
    };
    undoRecursion();

  }

  // ripristino le metriche precedentemente rimosse in fase di edit
  app.handlerCompositeMetricUndoRemove = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    document.querySelector(".data-item-defined.removed[data-metric-token='" + e.currentTarget.dataset.objectToken + "']").classList.remove('removed');
    Query.add(StorageMetric.selected);
    const undoRecursion = () => {
      // StorageMetric è la metrica composta qui. All'interno della Fn StorageMetric può essere anche una metrica base/adv
      for (const [metricName, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
        // TODO: metricName non è utilizzata, utilizzare un altro tipo ti ciclo per recuperare solo il token (for...in)
        // imposto, come selezionata, la metrica contenuta nella formula
        StorageMetric.selected = metric.token;
        Query.add(StorageMetric.selected);
        document.querySelector(".data-item-defined[data-metric-token='" + metric.token + "']").classList.remove('removed');
        if (StorageMetric.selected.metric_type === 4) undoRecursion(metric.token);
      }
    };
    undoRecursion();
  }

  // remove composite metrics from report
  app.handlerCompositeMetricRemove = (e) => {
    StorageMetric.selected = e.currentTarget.dataset.objectToken;
    // elimino la metrica composta selezionata
    Query.remove(StorageMetric.selected);
    // recupero tutti gli <small> sotto le metriche dove è presente la metrica composta selezionata qui
    document.querySelectorAll("ul section[data-" + e.currentTarget.dataset.objectToken + "]").forEach(metric => {
      StorageMetric.selected = metric.dataset.metricToken;
      // metric : è la metrica presente nella ulDefinedMetrics, può essere 'METRIC', 'ADV_METRIC' e 'COMP_METRIC'
      // elimino lo <small>, su qualsiasi metrica corrispondente alla metrica selezionata (e.currentTarget) per la cancellazione
      metric.querySelector("small[data-composite-metric='" + e.currentTarget.dataset.objectToken + "']").classList.add('removed');
      // metric.querySelector("small[data-composite-metric='" + e.currentTarget.dataset.objectToken + "']").remove();
      // dopo aver eliminato lo <small> relativo alla metrica selezionata (e.currentTarget), se, la metrica in ciclo, non ha nessun altro <small>, elimino anche la metrica in ciclo
      if (metric.querySelectorAll("small[data-composite-metric]:not(.removed)").length === 0) {
        Query.remove(StorageMetric.selected);
        // la rimuovo dalla lista delle metriche già definite
        document.querySelector("section.data-item-defined[data-metric-token='" + metric.dataset.metricToken + "']").classList.add('removed');
        // document.querySelector("ul section.data-item-defined[data-metric-token='" + metric.dataset.metricToken + "']").remove();
        if (StorageMetric.selected.metric_type !== 4) {
          List.deselectMetric(metric.dataset.metricToken);
        } else {
          // metrica composta nidificata all'interno di quella selezionata (e.currentTarget)
          List.deselectCompositeMetric(metric.dataset.metricToken);
          // siccome è una metrica composta, può contenere, a sua volta, altre metriche composte, invoco una Fn ricorsiva con lo scopo di eliminare le metriche nidificate
          app.removeCompositeMetric(metric.dataset.metricToken);
        }
      }
    });
    // elimino anche la metrica composta selezionata per la cancellazione
    document.querySelector("section.data-item-defined[data-metric-token='" + e.currentTarget.dataset.objectToken + "']").classList.add('removed');
    // document.querySelector("#ul-defined-composite-metrics section[data-metric-token='" + e.currentTarget.dataset.objectToken + "']").remove();
    List.deselectCompositeMetric(e.currentTarget.dataset.objectToken);
  }

  // remove column from report
  app.handlerColumnRemove = (e) => {
    Query.remove({ token: e.currentTarget.dataset.objectToken, type: 'COLUMNS' });
    const el = document.querySelector(".data-item-defined[data-token-column='" + e.currentTarget.dataset.objectToken + "']");
    // document.querySelector("#ul-defined-columns section[data-token-column='" + e.currentTarget.dataset.objectToken + "']").remove();
    if (app.body.dataset.mode === 'edit') {
      el.classList.add('removed');
    } else {
      el.classList.add('animation-remove');
      el.onanimationend = e => e.target.remove();
    }
  }

  // save compositeMetric
  app.btnCompositeMetricSave.onclick = (e) => {
    const inputName = document.getElementById('composite-metric-name');
    const inputAlias = document.getElementById('composite-alias-metric');
    let arr_sql = [];
    const date = new Date();
    const token = (!e.target.dataset.token) ? rand().substr(0, 21) : e.target.dataset.token;
    let metricsAlias = {}; // contiene un'elenco di object con nome_metrica : alias che compongono la metrica composta
    let cubes = new Set(); // contiene i cubi relativi alle metriche all'interno della metrica composta
    if (e.target.dataset.token) StorageMetric.selected = token;
    document.querySelectorAll('#composite-metric-formula *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      // se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
      if (element.nodeName === 'MARK') {
        StorageMetric.selected = element.dataset.metricToken;
        // recupero il nome del cubo a cui appartiene la metrica. Questo lo visualizzerò nell'elenco delle metriche composte
        // ciclo i cubi, per le metriche_type =4
        if (StorageMetric.selected.metric_type === 4) {
          StorageMetric.selected.cubes.forEach(cubeToken => cubes.add(cubeToken));
        } else {
          cubes.add(StorageMetric.selected.cube);
        }
        // StorageCube.selected = StorageMetric.selected.cubes;
        // cubes.add(StorageCube.selected.token);
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
      type: 'COMP_METRIC', name: inputName.value, token, metric_type: 4,
      formula: { token, formula_sql: arr_sql, alias: inputAlias.value, metrics_alias: metricsAlias },
      cubes: [...cubes],
      updated_at: date.toLocaleDateString('it-IT', options),
    };
    // metricObj.nested = (metric.dataset.nested) ? true : false;
    metricObj.created_at = (e.target.dataset.token) ? StorageMetric.selected.created_at : date.toLocaleDateString('it-IT', options);
    console.log(metricObj);
    debugger;
    StorageMetric.save(metricObj);
    // salvo nel DB
    // app.saveMetricDB(metricObj);
    if (e.target.dataset.token) {
      // aggiornamento metrica
      document.querySelector("#ul-composite-metrics section[data-metric-token='" + token + "']").dataset.label = inputName.value;
      document.querySelector("#ul-composite-metrics .selectable[data-metric-token='" + token + "'] span[metric]").innerText = inputName.value;
    } else {
      // reimposto, come metrica selezionata, la metrica appena creata che è da aggiungere a #ul-composite-metrics
      StorageMetric.selected = token;
      // salvataggio nuova metrica, le aggiungo alle <ul>
      List.addCompositeMetric();
      List.addAllMetric();
    }
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
    // console.log(Query.table);
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
      // se, nell'elemento <mark> è presente il tableId allora posso recuperare anche hierToken, hierName e dimensionToken
      // ... altrimenti devo recuperare il cubeToken. Ci sono anche filtri che possono essere fatti su un livello dimensionale e su una FACT
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
    // non sono presenti, tra gli elementi che compongono il filtro, elementi che fanno riferimento a qualche livello dimensionale
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
      delete e.target.dataset.token;
    } else {
      // nuovo filtro, lo aggiungo alle #ul
      List.addFilter(false);
      // filtri presenti nella dialog-metrics (metriche avanzate)
      List.addMetricFilter(false);
    }
    // pulisco la textarea
    document.querySelectorAll('#composite-filter-formula *').forEach(element => element.remove());
    e.target.disabled = true;
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

  // selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
  app.handlerSelectValue = e => e.currentTarget.toggleAttribute('data-selected');

  List.init();

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

  document.getElementById('prev').onclick = () => Step.previous();

  document.getElementById('next').onclick = () => Step.next();

  // aggiungi filtri
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
      App.showConsole('Selezionare una dimensione per poter aggiungere colonne al report', 'warning', 3000);
    } else {
      // reset del tasto btnColumnSave
      delete app.btnColumnSave.dataset.token;
      document.getElementById('columnName').value = '';
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

  // aggiungi metrica composta
  app.btnAddCompositeMetrics.onclick = () => {
    // console.log(Query.elementCube);
    // TODO: questo controllo lo farò sul tasto next degli step
    if (Query.cubes.size === 0) {
      App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
    } else {
      // ripulisco la lista, prima di popolarla
      document.querySelectorAll('#ul-all-metrics > section').forEach(item => item.remove());
      List.initAllMetrics();
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

  // TODO: da spostare in Query.js
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

  app.setFilteredMetrics = () => {
    document.querySelectorAll("#ul-metrics .selectable[data-selected][data-metric-type='2'], #ul-metrics .selectable[data-selected][data-metric-type='3']").forEach(metricRef => {
      StorageMetric.selected = metricRef.dataset.metricToken;
      Query.setFilteredMetricReport(metricRef);
    });
  }

  app.setFactJoin = () => {
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
  }

  // save report
  app.btnSaveReportDone.onclick = () => {
    const name = document.getElementById('reportName').value;
    app.setFrom();
    app.setFactJoin();

    // imposto la FROM per gli elementi del cubo/i selezionati
    document.querySelectorAll("#ul-cubes section:not([hidden]) .selectable[data-include-query]").forEach(cubeRef => {
      Query.FROM = { tableAlias: cubeRef.dataset.tableAlias, SQL: `${cubeRef.dataset.schema}.${cubeRef.dataset.tableName} AS ${cubeRef.dataset.tableAlias}` };
    });

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
    debugger;
    app.setFrom();
    app.setFactJoin();
    // imposto la FROM per gli elementi del cubo/i selezionati
    document.querySelectorAll("#ul-cubes section:not([hidden]) .selectable[data-include-query]").forEach(cubeRef => {
      Query.FROM = { tableAlias: cubeRef.dataset.tableAlias, SQL: `${cubeRef.dataset.schema}.${cubeRef.dataset.tableName} AS ${cubeRef.dataset.tableAlias}` };
    });
    // metriche filtrate
    // Query.setAdvancedMetrics();
    // app.setFilteredMetrics();
    // metriche composte
    // app.setCompositeMetrics();

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
  app.btnProcessReport.onclick = () => app.processList.toggleAttribute('hidden');

  // apertura dialog-value per ricerca dei valori all'interno del database relativo alla colonna selezionata
  app.btnSearchValue.onclick = () => {
    List.getDistinctValues();
    app.dialogValue.showModal();
  }

  document.getElementById('columnName').oninput = () => app.checkColumnForm();

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

  document.getElementById('metric-name').oninput = () => app.checkDialogMetric();

  document.getElementById('composite-metric-name').oninput = (e) => app.checkFormulaMetric(e.target);

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

  // imposto i campi id/ds delle colonne
  app.setFormula = (obj) => {
    switch (obj.mode) {
      case 'id':
        (obj.innerText) ? Query.sql_id.push(obj.innerText) : Query.sql_id.push(`${obj.tableAlias}.${obj.label}`);
        Query.edit_id.push(obj);
        break;
      case 'ds':
        (obj.innerText) ? Query.sql_ds.push(obj.innerText) : Query.sql_ds.push(`${obj.tableAlias}.${obj.label}`);
        Query.edit_ds.push(obj);
        break;
      default:
        if (obj.innerText) {
          Query.sql_id.push(obj.innerText);
          Query.sql_ds.push(obj.innerText);
        } else {
          Query.sql_id.push(`${obj.tableAlias}.${obj.label}`);
          Query.sql_ds.push(`${obj.tableAlias}.${obj.label}`);
        }
        Query.edit_id.push(obj);
        Query.edit_ds.push(obj);
        break;
    }
  }

  app.saveColumn = () => {
    const name = document.getElementById('columnName');
    const textarea = document.getElementById('composite-column-formula');
    Query.sql_id = [], Query.sql_ds = []; Query.edit_id = [], Query.edit_ds = [];
    // recupero la colonna selezionata
    const column = document.querySelector('#ul-columns .selectable[data-selected]');
    // elimino l'oggetto Query.objects, se presente, in questo caso sto modificando una colonna già inserita.
    /* if (app.btnColumnSave.dataset.token) {
      Query.objects = {token : column.dataset.token};
      Query.select = {token : column.dataset.token};
    } */
    let object = { token: column.dataset.token, name: name.value, type: 'COLUMNS' };
    if (column.dataset.tableId) {
      object.hierarchies = Object.fromEntries(new Map([[column.dataset.hierToken, column.dataset.tableId]]));
      object.dimensions = [column.dataset.dimensionToken];
      object.tableId = column.dataset.tableId;
    } else {
      object.cubes = [column.dataset.cubeToken];
    }

    document.querySelectorAll('#composite-column-formula *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        let obj = { mode: element.dataset.mode, type: 'COLUMNS', token: element.dataset.token, table: element.dataset.tableName, tableAlias: element.dataset.tableAlias, label: element.dataset.label };
        if (element.dataset.tableId) {
          // tabella appartenente a un livello dimensionale
          obj.dimensionToken = element.dataset.dimensionToken;
          obj.hierToken = element.dataset.hierToken;
          obj.tableId = element.dataset.tableId;
          StorageDimension.selected = element.dataset.dimensionToken;
          obj.field = StorageDimension.selected.hierarchies[element.dataset.hierToken].columns[element.dataset.tableAlias][element.dataset.token];
          // NOTE: Oggetto Map
          // const hierarchiesObject = new Map([[element.dataset.hierToken, element.dataset.tableId]]);
          obj.hierarchies = Object.fromEntries(new Map([[element.dataset.hierToken, element.dataset.tableId]]));
          obj.dimensions = [element.dataset.dimensionToken];
          Query.add(obj);
          app.setFormula(obj);
        } else {
          // tabella appartenente alla FACT.
          StorageCube.selected = element.dataset.cubeToken;
          // Query.objects = { token: element.dataset.token, cubeToken: element.dataset.cubeToken };
          obj.field = StorageCube.selected.columns[element.dataset.tableAlias][element.dataset.token];
          obj.cubeToken = element.dataset.cubeToken;
          obj.cubes = [element.dataset.cubeToken];
          Query.add(obj);
          app.setFormula(obj);
        }
      } else {
        let obj = { mode: element.dataset.mode, innerText: element.innerText.trim() };
        app.setFormula(obj);
      }
    });
    object.edit = { id: Query.edit_id, ds: Query.edit_ds };
    object.sql = { id: Query.sql_id, ds: Query.sql_ds };
    Query.add(object);
    (app.btnColumnSave.hasAttribute('data-token')) ? List.editDefinedColumn(object) : List.addDefinedColumn(object);
    app.resetDialogColumn();
    app.checkObjectSelected();
  }

  app.btnColumnSave.onclick = () => app.saveColumn();

  app.checkColumnForm = () => {
    const input = document.getElementById('columnName');
    const helper = document.querySelector('#columnName ~ .helper');
    // controllo che non sia stato già inserito il nome di questa colonna nel report
    const check = Query.checkColumnName(app.btnColumnSave.dataset.token, input.value);
    if (check) {
      // nome già presente nello storage
      helper.classList.add('error');
      helper.innerText = "Il nome della colonna è stato già aggiunto al report";
    } else {
      helper.classList.remove('error');
      helper.innerText = "";
    }
    const column = document.querySelectorAll('#ul-columns .selectable[data-selected]').length;
    app.btnColumnSave.disabled = (!check && input.value.length !== 0 && column !== 0) ? false : true;
  }

  // tasto "key" per impostare il campo ID della colonna
  document.getElementById('btn-sql-id').onclick = () => {
    // se è stata selezionata una colonna attivo la sql-formula in modalità "ID"
    if (document.querySelectorAll('#ul-columns .selectable[data-selected]').length === 1) document.querySelector('#composite-column-formula').dataset.mode = 'id';
  }

  // tasto "description" per impostare il campo DS della colonna
  document.getElementById('btn-sql-ds').onclick = () => {
    if (document.querySelectorAll('#ul-columns .selectable[data-selected]').length === 1) document.querySelector('#composite-column-formula').dataset.mode = 'ds';
  }

  document.getElementById('mdcMapping').onclick = () => location.href = '/mapping';

  app.btnBackPage.onclick = () => window.location.href = '/';

  document.getElementById('columnName').onkeydown = (e) => {
    if (e.defaultPrevented) {
      console.log('è stato premuto 2 volte');
      return; // Do nothing if the event was already processed
    }
    // console.log(e);
    // console.log(e.key);
    if (e.key === 'Enter' && !app.btnColumnSave.disabled) app.saveColumn();
    // e.preventDefault();
  }

  // TODO: spostare in un file "Utils"
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
  });
  // call `observe()` on that MutationObserver instance,
  // passing it the element to observe, and the options object
  observer.observe(body, { subtree: true, childList: true, attributes: true });
  inputs.forEach(input => observer.observe(input, { subtree: true, childList: true, attributes: true }));

  // dialog event close
  app.dialogFilter.addEventListener('close', () => {
    // ripulisco la input filterName e tutti gli oggetti presenti nella textarea
    document.getElementById('filterName').value = '';
    document.querySelectorAll('#composite-filter-formula *').forEach(element => element.remove());
    // annullo i filtri che hanno .selectable[data-temporary], non verranno aggiunti al report
    document.querySelectorAll('#ul-filters .selectable[data-temporary]').forEach(filter => {
      // rimuovo la selezione di questi filtri non aggiunti
      delete filter.dataset.selected;
      // e rimuovo anche il data-temporary prima di chiudere la dialog
      delete filter.dataset.temporary;
    });
  });

  // dialog metric
  app.dialogMetric.addEventListener('close', () => {
    // resetto le input, i filtri aggiunti alla metrica (#ul-metric-filters) e la metrica selezionata da #ul-available-metrics
    document.getElementById('metric-name').value = "";
    document.getElementById('alias-metric').value = "";
    document.querySelectorAll('#ul-metric-filters .selectable[data-selected]').forEach(filter => delete filter.dataset.selected);
    document.querySelectorAll('#ul-available-metrics .selectable[data-selected]').forEach(metric => delete metric.dataset.selected);
    // annullo le metriche .selectable[data-temporary]. Non verranno aggiunte al report
    document.querySelectorAll('#ul-metrics .selectable[data-temporary]').forEach(item => {
      delete item.dataset.selected;
      delete item.dataset.temporary;
    });
  });

  // dialog composite-metric
  app.dialogCompositeMetric.addEventListener('close', () => {
    // resetto le input ela formula
    document.getElementById('composite-metric-name').value = "";
    document.getElementById('composite-alias-metric').value = "";
    // ripulisco la textarea dalle precedenti selezioni
    document.querySelectorAll('#composite-metric-formula *').forEach(item => item.remove());
    // annullo le metriche .selectable[data-temporary]. Non verranno aggiunte al report
    document.querySelectorAll('#ul-composite-metrics .selectable[data-temporary]').forEach(item => {
      delete item.dataset.selected;
      delete item.dataset.temporary;
    });
  });

  app.resetDialogColumn = () => {
    // ripulisco la textarea
    document.querySelectorAll('#composite-column-formula *').forEach(item => item.remove());
    app.btnColumnSave.disabled = true;
    name.value = '';
    document.querySelectorAll('#ul-columns .selectable').forEach(item => {
      delete item.dataset.selected;
      delete item.dataset.disabled;
    });
    document.querySelectorAll('#btn-sql-id, #btn-sql-ds').forEach(button => button.toggleAttribute('disabled'));
  }

  app.dialogColumns.addEventListener('close', () => app.resetDialogColumn());

  app.dialogMetricFilter.addEventListener('open', () => document.getElementById('dialog-metric-filter-search').value = "");
})();
