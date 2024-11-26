// TODO: le funzioni che non utilizzano la classe WorkBook possono essere spostate in supportFn.js
var App = new Application();
var SheetStorage = new SheetStorages();
var WorkBookStorage = new Storages();
var Dashboard = new Dashboards();
var Resource;
var WorkBook, Sheet, Process; // instanze della Classe WorkBooks e Sheets
// Textarea
var textareaFilter = document.getElementById('textarea-filter');
var textareaCustomMetric = document.getElementById('textarea-custom-metric');
var textarea__custom_column = document.getElementById('textarea__custom_column');
var textarea__composite_metric = document.getElementById('textarea__composite-metric');
// Buttons
const btnFilterSave = document.getElementById('btn-filter-save');
const btnCustomMetricSave = document.getElementById('btn-custom-metric-save');
const btnCompositeMetricSave = document.getElementById('btn-composite-metric-save');
const btnAdvancedMetricSave = document.getElementById('btn-metric-save');
const btnOpenDialogFilter = document.getElementById('btnOpenDialogFilter');
const btnNewCompositeMeasure = document.getElementById('btnNewCompositeMeasure');
const btnOptions = document.getElementById('btnOptions');
const btn__save_column = document.getElementById('btn__save_column');
// Dialogs
const dlg__filters = document.getElementById('dlg__filters');
const dlgCustomMetric = document.getElementById('dlg-custom-metric');
const dlg__composite_metric = document.getElementById('dlg__composite_metric');
const dlg__advancedMetric = document.getElementById('dlg-advanced-metric');
const dlg__chart_options = document.getElementById('dlg__chart_options');
const dlg__custom_columns = document.getElementById('dlg__custom_column');
// templates
const template_li = document.getElementById('tmpl-li');
const tmplContextMenu = document.getElementById('tmpl-context-menu-content');
const contextMenuRef = document.getElementById('context-menu');
const tmplDetails = document.getElementById('tmpl-details-element');
const template__columnDefined = document.getElementById('tmpl-columns-defined');
const template__metricDefined = document.getElementById('tmpl-metrics-defined');
const template__filterDropped = document.getElementById('tmpl-filter-dropped-adv-metric');
const template__createElement = document.getElementById('tmpl__createElement');

const btnToggle_table__content = document.getElementById('btnToggle_table__content');
// dropzone
const rowsDropzone = document.getElementById('dropzone-rows');
const columnsDropzone = document.getElementById('dropzone-columns');

const export__datatable_xls = document.getElementById('export__datatable_xls');

(() => {
  var app = {
    // templates
    tmplContextMenu: document.getElementById('tmpl-context-menu-content'),
    // contextMenuRef: document.getElementById('context-menu'),
    contextMenuColumnRef: document.getElementById('context-menu-column'),
    tmplDetails: document.getElementById('tmpl-details-element'),
    tmplColumnsDefined: document.getElementById('tmpl-columns-defined'),
    tmplAdvMetricsDefined: document.getElementById('tmpl-adv-metric'),
    tmplFiltersDefined: document.getElementById('tmpl-filters-defined'),
    tmplFormula: document.getElementById('tmpl-formula'),
    tmplCompositeFormula: document.getElementById('tmpl-composite-formula'),
    // dialogs
    dialogWorkBook: document.getElementById('dialog-workbook-open'),
    dialogSQL: document.getElementById('dlg-sql-info'),
    dialogSheet: document.getElementById('dialog-sheet-open'),
    dialogTables: document.getElementById('dlg-tables'),
    dialogFilters: document.getElementById('dlg-filters'),
    dialogCustomMetric: document.getElementById('dlg-custom-metric'),
    dialogCompositeMetric: document.getElementById('dlg-composite-metric'),
    dialogRename: document.getElementById('dialog-rename'),
    dialogJoin: document.getElementById('dlg-join'),
    dialogTime: document.getElementById('dialog-time'),
    // dialogInfo: document.getElementById('dlg-info'),
    dialogSchema: document.getElementById('dlg-schema'),
    dialogNewWorkBook: document.getElementById('dialog-new-workbook'),
    dialogNewSheet: document.getElementById('dialog-new-sheet'),
    // buttons
    btnSelectSchema: document.getElementById('btn-select-schema'),
    btnSaveSheet: document.getElementById('btn-sheet-save'),
    btnWorkBookNew: document.getElementById('btn-workbook-new'),
    btnVersioning: document.getElementById('btn-versioning'),
    btnAdvancedMetricSave: document.getElementById("btn-metric-save"),
    btnWorkBook: document.getElementById('workbook'),
    btnSheet: document.getElementById('sheet'),
    btnShowInfo: document.getElementById('btnShowInfo'),
    btnCopyText: document.getElementById('btnCopyText'),
    // drawer
    drawer: document.getElementById('drawer'),
    // body
    body: document.getElementById('body'),
    translate: document.getElementById('translate'),
    wjTitle: document.querySelector('#window-join .wj-title'),
    workbookTablesStruct: document.querySelector('#workbook-objects'),
    // columns and rows dropzone (step 2)
    columnsDropzone: document.getElementById('dropzone-columns'),
    // filtersDropzone: document.getElementById('dropzone-filters'),
    txtAreaIdColumn: document.getElementById('textarea-column-id'),
    txtAreaDsColumn: document.getElementById('textarea-column-ds'),
    // popup
    tablePopup: document.getElementById("table-popup"),
    // INPUTS
    inputAdvMetricName: document.getElementById("input-advanced-metric-name"),
    sheetName: document.getElementById('sheet-name'),
    workbookName: document.getElementById('workbook-name')
  }
  const userId = 2;
  console.info('workspace-init');

  document.body.addEventListener('mousemove', (e) => {
    // console.log({ clientX: e.clientX, clientY: e.clientY, offsetX: e.offsetX, offsetY: e.offsetY, pageX: e.pageX, pageY: e.pageY, x: e.x, y: e.y });
  }, false);

  const rand = () => Math.random(0).toString(36).substring(2);
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };

  App.init();

  // google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });
  // google.charts.load('upcoming', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });

  // Chiudo qualsiasi context-menu aperto
  app.body.addEventListener('click', () => {
    document.querySelectorAll('.context-menu[open]').forEach(menu => menu.toggleAttribute('open'));
  });
  // la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
  // var Step = new Steps('stepTranslate');

  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        // console.info('A child node has been added or removed.');
        Array.from(mutation.addedNodes).forEach(node => {
          // console.log(node.nodeName);
          if (node.nodeName !== '#text') {
            if (node.hasAttribute('data-fn')) node.addEventListener('click', app[node.dataset.fn]);
            if (node.hasAttribute('data-context-fn')) node.addEventListener('contextmenu', app[node.dataset.contextFn]);

            if (node.hasChildNodes()) {
              node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
              // node.querySelectorAll('*[data-over-fn]').forEach(element => element.addEventListener('mouseover', app[element.dataset.overFn]));
              // node.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
              // node.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
              node.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
            }
          }
        });
      } else if (mutation.type === 'attributes') {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        // console.log(mutation.target);
        if (mutation.target.hasChildNodes()) {
          mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
          // mutation.target.querySelectorAll('*[data-over-fn]').forEach(element => element.addEventListener('mouseover', app[element.dataset.overFn]));
          // mutation.target.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
          // mutation.target.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
          mutation.target.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
        }
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observerList = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  // observerList.observe(targetNode, config);
  observerList.observe(document.getElementById('body'), config);
  observerList.observe(app.drawer, config);

  app.handlerSVGDragEnd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('svgDragEnd');
    if (e.dataTransfer.dropEffect === 'copy') {
      // se la tabella non è presente in sessionStorage la scarico
      if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) WorkBookStorage.saveSession(await app.getTable());
      // se sono presenti almeno due tabelle visualizzo la dialog per la join
      // se è presente almeno una tabella dimensionale oppure la tabella droppata è una fact NON eseguo la join
      if (Draw.countJoins !== 0 && !Draw.table.classList.contains('fact')) {
        WorkBook.tableJoins = {
          from: Draw.currentLineRef.dataset.from,
          to: Draw.currentLineRef.dataset.to
        }
        Draw.openJoinWindow();
        Draw.createWindowJoinContent();
      }
    }
    // creo/aggiorno la mappatura di tutte le tabelle del Canvas
    WorkBook.createDataModel();
    // creo una mappatura per popolare il WorkBook nello step successivo
    app.hierTables();
    app.checkSessionStorage();
  }

  // imposto un alias per tabella aggiunta al canvas
  app.setAliasTable = () => app.dialogRename.showModal();

  app.saveAliasTable = () => {
    // recupero lo struct all'interno del <defs>
    const struct = Draw.svg.querySelector(`#struct-${WorkBook.activeTable.id}`);
    const input = document.getElementById('table-alias');
    struct.querySelector('text').innerHTML = input.value;
    Draw.svg.querySelector(`#${WorkBook.activeTable.id}`).dataset.name = input.value;
    // modifico la prop 'name' di WorkBook.hierTables. Questa viene letta da
    WorkBook.hierTables.get(WorkBook.activeTable.id).name = input.value;
    // WorkBook.svg
    Draw.tables.get(WorkBook.activeTable.id).name = input.value;
    app.dialogRename.close();
    WorkBook.checkChanges(`alias-${input.value}`);
  }

  /* NOTE: DRAG&DROP EVENTS */

  // FIX: aggiunta in ini-map-loaded
  app.elementDragStart = (e) => {
    // console.log('column drag start');
    // console.log('e.target : ', e.target.id);
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
    console.log(e.dataTransfer);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.elementDragEnter = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      const data = e.dataTransfer.getData('text/plain');
      // console.log(e.currentTarget, e.target);
      e.dataTransfer.dropEffect = "copy";
    } else {
      console.warn('non in dropzone');
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.elementDragOver = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget, e.target);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
      e.currentTarget.classList.add('dropping');
    } else {
      e.currentTarget.classList.remove('dropping');
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.elementDragLeave = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  // FIX: aggiunta in ini-map-loaded
  app.elementDragEnd = (e) => {
    e.preventDefault();
    // if (e.dataTransfer.dropEffect === 'copy') {}
    e.currentTarget.classList.remove('dropping');
  }
  /* NOTE: END DRAG&DROP EVENTS */


  app.editMetricAlias = (e) => {
    const dropzone = document.getElementById("dropzone-columns");
    dropzone.dataset.error = (Sheet.checkMetricNames(e.target.dataset.token, e.target.innerText)) ? true : false;
    if (dropzone.dataset.error === "true") {
      App.showConsole("Sono presenti metriche con nomi uguali, rinominare la metrica", "error", 2500);
    } else {
      // imposto l'attributo [data-modified] in modo da aggiornare lo Sheet in localStorage
      // e, alla successiva apertura dello Sheet, ritrovarmi con le stesse modifiche fatte qui
      // (come per l'edit della funzione di aggregazione)
      if (Sheet.edit) {
        if (Sheet.metrics.get(e.target.dataset.token).alias.toLowerCase() !== e.target.innerText.toLowerCase()) e.target.dataset.modified = true;
      }
      Sheet.metrics.get(e.target.dataset.token).alias = e.target.innerText;
    }
  }

  /* app.columnDrop = (e) => {
    e.preventDefault();
    debugger;
    // e.currentTarget.classList.replace('dropping', 'dropped');
    e.currentTarget.classList.remove('dropping');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    // elementRef : è l'elemento nella lista di sinistra che ho draggato
    let tmpl = app.tmplColumnsDefined.content.cloneNode(true);
    let field = tmpl.querySelector('.column-defined');
    let span = field.querySelector('span');
    // field.dataset.type = elementRef.dataset.type;
    field.dataset.id = elementRef.id;
    const metric = { ...WorkBook.metrics.get(elementRef.id) };
    switch (metric.metric_type) {
      case 'basic':
      case 'advanced':
        // aggiungo a Sheet.metrics solo gli elementi che possono essere modificati, le proprieta di sola lettura le prenderò sempre da WorkBook.metrics
        Sheet.metrics = { token: metric.token, factId: metric.factId, alias: metric.alias, type: metric.metric_type, aggregateFn: metric.aggregateFn, dependencies: false };
        app.addMetric(e.currentTarget, elementRef.id);
        // 26.07.2024 verifico, se nello Sheet, è presente una metrica con lo stesso nome
        // In caso positivo devo mostrare una dialog per poter modificare il nome della metrica, il nome
        // verrà modificato SOLO per questo Sheet e non nel WorkBook
        // Questo controllo è aggiunto dopo addMetric in modo da poter impostare il focus sull'elemento
        // già presente nel DOM.
        if (Sheet.checkMetricNames(metric.token, metric.alias)) {
          App.showConsole("Sono presenti Metriche con nomi uguali, rinominare la metrica", "error", 2500);
          // imposto il cursore nel <code> da modificare
          document.querySelector(`.metric-defined > code[data-token='${elementRef.id}']`).focus({ focusVisible: true });
          e.currentTarget.dataset.error = true;
        }
        break;
      case 'composite':
        if (Sheet.checkMetricNames(metric.token, metric.alias)) {
          App.showConsole("Sono presenti Metriche con nomi uguali, rinominare la metrica", "error", 2500);
          // imposto il cursore nel <code> da modificare
          document.querySelector(`.metric-defined > code[data-token='${elementRef.id}']`).focus({ focusVisible: true });
          e.currentTarget.dataset.error = true;
        }
        Sheet.metrics = { token: metric.token, alias: metric.alias, type: metric.metric_type, metrics: metric.metrics, dependencies: false };
        app.addMetric(e.currentTarget, elementRef.id);
        // dopo aver aggiunto una metrica composta allo Sheet, bisogna aggiungere anche le metriche
        // ...al suo interno per consentirne l'elaborazione
        for (const token of Object.keys(Sheet.metrics.get(elementRef.id).metrics)) {
          // nell'oggetto Sheet.metrics aggiungo una prop 'dependencies' per specificare
          // ... che questa metrica è stata aggiunta perchè è all'interno di una metrica composta
          // verifico se la metrica all'interno di quella composta è stata già aggiunta allo Sheet
          if (!Sheet.metrics.has(token)) {
            // la metrica in ciclo non è stata aggiunta allo Sheet, la aggiungo con la prop 'dependencies'
            //... per specificare che è stata aggiunta indirettamente, essa si trova in una metrica composta
            // NOTE: clonazione di un object con syntax ES6.
            const nestedMetric = { ...WorkBook.metrics.get(token) };
            Sheet.metrics = { token: nestedMetric.token, factId: nestedMetric.factId, alias: nestedMetric.alias, type: nestedMetric.metric_type, aggregateFn: nestedMetric.aggregateFn, dependencies: true };
            // nestedMetric.dependencies = true;
            // Sheet.metrics = nestedMetric;
          }
        }
        break;
      default:
        // column
        span.innerHTML = elementRef.dataset.field;
        Sheet.fields = elementRef.id;
        break;
    }
  } */

  // drop filtri nella creazione della metrica avanzata
  // WARN: 21.11.2024 utilizzata?
  app.handlerDropFilter = (e) => {
    e.preventDefault();
    // e.currentTarget.classList.replace('dropping', 'dropped');
    e.currentTarget.classList.remove('dropping');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    console.log(elementRef);
    const tmplFilter = template__filterDropped.content.cloneNode(true);
    const li = tmplFilter.querySelector('li');
    const span = li.querySelector('span');
    const btnRemove = li.querySelector('button');
    li.dataset.token = elementRef.id;
    span.innerText = WorkBook.filters.get(elementRef.id).name;
    btnRemove.dataset.token = elementRef.id;
    e.target.appendChild(li);
  }

  app.selectLine = (e) => {
    // console.log(e.target);
    Draw.currentLineRef = e.target.id;
    WorkBook.tableJoins = {
      from: Draw.currentLineRef.dataset.from,
      to: Draw.currentLineRef.dataset.to
    }
    Draw.openJoinWindow();
    Draw.createWindowJoinContent();
  }

  app.newFilterDrop = (e) => {
    e.preventDefault();
    console.log('target:', e.target);
    console.log('currentTarget:', e.currentTarget);
    // e.currentTarget.classList.replace('dropping', 'dropped');
    e.currentTarget.classList.remove('dropping');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    // elementRef : è l'elemento draggato
    WorkBook.activeTable = elementRef.dataset.tableId;
    // e.target.innerText += `${WorkBook.activeTable.dataset.name}.${elementRef.dataset.field}`;
  }

  app.addFilterToSheet = (token) => {
    // aggiungo, sulla <li> del filtro selezionato, la class 'added' per evidenziare che il filtro
    // è stato aggiunto al report, non può essere aggiunto di nuovo.
    const li__selected = document.querySelector(`li[data-id='${token}']`);
    li__selected.classList.add('added');
    addTemplateFilter(token);
  }

  // Modifica di una metrica composta di base
  app.editCustomMetric = (e) => {
    const metric = WorkBook.elements.get(e.currentTarget.dataset.token);
    // imposto la tabella corrente in Workbook.activeTable
    WorkBook.activeTable = metric.factId;
    // const metric = WorkBook.metrics.get(e.currentTarget.dataset.token);
    const textarea = document.getElementById('textarea-custom-metric');
    const btnSave = document.getElementById('btn-custom-metric-save');
    const input = document.getElementById('input-base-custom-metric-name');
    input.value = metric.alias;
    btnSave.dataset.token = e.currentTarget.dataset.token;
    const text = document.createTextNode(metric.formula.join(''));
    // aggiungo il testo della formula prima del tag <br>
    textarea.insertBefore(text, textarea.lastChild);
    dlgCustomMetric.showModal();
  }

  // TODO: 25.11.2024 da implementare
  app.removeWBMetric = (e) => {
    console.log(e.currentTarget.dataset.metricToken);
    const workbook_ref = WorkBook.workBook.token;
    // WorkBook.activeTable è già valorizzato, quando si seleziona la tabella dal canvas
    // WorkBook.metrics.delete(e.currentTarget.dataset.metricToken);
    // WorkBook.elemenets.delete(e.currentTarget.dataset.metricToken);
    // verifico che l'oggetto Map con l'alias della tabella contenga altri elementi, altrimenti
    // devo eliminare anche workBook.fields(tableAlias)
    // if (WorkBook.metrics.size === 0) WorkBook.metrics.clear();
    // if (WorkBook.elements.size === 0) WorkBook.metrics.clear();
    // delete document.querySelector(`#preview-table th[data-metric-token='${e.currentTarget.dataset.metricToken}']`).dataset.metricToken;
    // 1 - Cerco lo sheet, nello storage, con workbook_ref relativo a questo workbook
    // 2 - Elimino la colonna all'interno della prop 'fields'
    const sheets = SheetStorage.sheets(workbook_ref);
    // WARN: se sono presenti sheet, li aggiorno, però c'è da valutare se annullare la cache del datamart
    // altrimenti le colonne dello sheet non corrispondono a quelle impostate in righe/colonne (nella pagina)
    if (sheets) {
      for (const value of Object.values(sheets)) {
        console.log(value);
        if (value.metrics.hasOwnProperty(e.currentTarget.dataset.metricToken)) delete value.metrics[e.currentTarget.dataset.metricToken];
        value.updated_at = new Date().toLocaleDateString('it-IT', options);
        SheetStorage.save(value);
        // TODO: qui bisogna fare un controllo più approfondito anche sulle metriche avanzate a composte
        // eventualmente utilizzate da questa che si sta eliminado
      }
    }
    WorkBook.checkChanges(e.currentTarget.dataset.metricToken);
  }

  /* NOTE: END DRAG&DROP EVENTS */

  // TODO: da spostare in supportFn.js
  // selezione schema per la visualizzazione dell'elenco tabelle
  app.handlerSchema = async (e) => {
    e.preventDefault();
    e.currentTarget.toggleAttribute('data-selected');
    if (e.currentTarget.hasAttribute('data-selected')) {
      const schema = e.currentTarget.dataset.schema;
      // recupero le tabelle dello schema selezionato
      const data = await getDatabaseTable(schema);
      let ul = document.getElementById('ul-tables');
      for (const [key, value] of Object.entries(data)) {
        const content = template_li.content.cloneNode(true);
        const li = content.querySelector('li.drag-list.default');
        const i = li.querySelector('i');
        const span = li.querySelector('span');
        li.dataset.fn = "showTablePreview";
        li.dataset.label = value.TABLE_NAME;
        li.dataset.schema = schema;
        i.dataset.label = value.TABLE_NAME;
        i.dataset.schema = schema;
        li.dataset.elementSearch = 'tables';
        i.ondragstart = Draw.handlerDragStart.bind(Draw);
        // drag end event va posizionato sullo stesso elemento che ha il dragStart
        i.ondragend = app.handlerSVGDragEnd;
        i.id = 'table-' + key;
        span.innerText = value.TABLE_NAME;
        ul.appendChild(li);
      }
      app.dialogSchema.close();
    }
  }

  /* NOTE: ONCLICK EVENTS*/

  // edit di una funzione di aggregazione sulla metrica aggiunta allo Sheet
  app.editAggregate = (e) => {
    e.target.dataset.aggregate = e.target.innerText.toUpperCase();
    const token = e.target.dataset.metricId;
    // se l'aggregazione è stata modificata contrassegno la metrica come "modificata"
    if (Sheet.metrics.get(token).aggregateFn !== e.target.innerText.toUpperCase()) e.target.dataset.modified = true;
    Sheet.metrics.get(token).aggregateFn = e.target.innerText.toUpperCase();
    e.target.innerText = e.target.innerText.toUpperCase();
    console.log(Sheet.metrics.get(token).aggregateFn);
  }

  app.editFieldAlias = (e) => {
    const token = e.target.dataset.token;
    // console.log(Sheet.fields.get(token));
    if (Sheet.fields.get(token).name !== e.target.innerText) e.target.dataset.modified = true;
    Sheet.fields.get(token).name = e.target.innerText;
    // Sheet.fields = { token, name: e.target.innerText, datatype: Sheet.fields.get(token).datatype };
    console.log('nome colonna modificato :', Sheet.fields.get(token));
  }

  app.editMetricAlias = (e) => {
    const token = e.target.dataset.token;
    console.log(Sheet.metrics.get(token));
    if (Sheet.metrics.get(token).alias !== e.target.innerText) e.target.dataset.modified = true;
    Sheet.metrics.get(token).alias = e.target.innerText;
    console.log('alias metrica modificato :', Sheet.metrics.get(token));
  }

  // apertura dialog con lista WorkBooks
  document.querySelector('#btn-workbook-open').onclick = () => {
    // carico elenco dei workBook presenti
    const parent = document.getElementById("ul-workbooks");
    // reset list
    parent.querySelectorAll('li').forEach(workbook => workbook.remove());
    for (const [token, object] of Object.entries(WorkBookStorage.workBooks(+document.querySelector('main').dataset.databaseId))) {
      const tmpl = template_li.content.cloneNode(true);
      const li = tmpl.querySelector('li.select-list');
      const span = li.querySelector('span');
      li.dataset.fn = 'workBookSelected';
      li.dataset.elementSearch = "workbooks";
      li.dataset.token = token;
      li.dataset.label = object.name;
      li.dataset.name = object.name;
      span.innerHTML = object.name;
      parent.appendChild(li);
    }
    app.dialogWorkBook.showModal();
  }

  app.btnWorkBookNew.onclick = () => app.dialogNewWorkBook.showModal();

  app.newWorkBook = () => {
    const name = document.getElementById('input-workbook-name').value;
    WorkBook = new WorkBooks(name);
    debugger;
    WorkBook.databaseId = +document.querySelector('main').dataset.databaseId;
    Draw = new DrawSVG('svg');
    app.workbookName.dataset.value = name;
    app.workbookName.innerText = name;
    // abilito il tasto "carica Schema"
    document.querySelector('#btnSchemata').disabled = false;
    app.dialogNewWorkBook.close();
  }

  app.checkSessionStorage = async () => {
    // scarico in sessionStorage tutte le tabelle del canvas
    let urls = [];
    const tables = Draw.svg.querySelectorAll('use.table:not([data-shared_ref]), use.time');
    for (const objects of tables.values()) {
      WorkBook.activeTable = objects.id;
      // se la tabella è già presente in sessionStorage non rieseguo la query
      if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) {
        urls.push('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_info');
      }
    }
    if (urls.length !== 0) {
      App.showConsole('Recupero tabelle in corso...', '');
      WorkBookStorage.saveTables(await getTables(urls));
      App.closeConsole();
    }
  }

  // apertura del WorkBook
  app.workBookSelected = async (e) => {
    Draw = new DrawSVG('svg');
    WorkBook = new WorkBooks(e.currentTarget.dataset.name);
    WorkBook = WorkBook.open(e.currentTarget.dataset.token);
    WorkBook.workBook.token = e.currentTarget.dataset.token;
    WorkBook.name = e.currentTarget.dataset.name;
    // scarico le tabelle del canvas in sessionStorage, questo controllo va fatto dopo aver definito WorkBook.hierTables
    await app.checkSessionStorage();
    // Gli elementi del canvas sono stati disegnati, creo il workbookMap
    WorkBook.workbookMap = Draw.svg.querySelectorAll('use.table:not([data-shared_ref]), use.time');
    app.workBookInformations();
    // modifico il nome del WorkBook in #workbook-name
    document.getElementById('workbook-name').innerText = WorkBook.name;
    document.getElementById('workbook-name').dataset.value = WorkBook.name;
    document.getElementById('workbook-name').dataset.tempValue = WorkBook.name;
    // WARN: probabilmente, il DataModel, posso recuperarlo direttamente dallo storage, senza ricrearlo
    // WorkBook.createDataModel();
    app.hierTables();
    Draw.checkResizeSVG();
    document.querySelector('#btnSchemata').disabled = false;
    app.dialogWorkBook.close();
    // il WorkBook è già creato quindi da questo momento è in fase di edit
    WorkBook.edit = true;
  }

  app.openSheetDialog = () => {
    // console.log('Sheet open');
    /* popolo la dialog con gli Sheet presenti, gli Sheet hanno un workBook_ref : token, quindi
    * recupero solo gli Sheet appartenenti al WorkBook aperto
    */
    const parent = document.getElementById("ul-sheets");
    // reset list
    parent.querySelectorAll('li').forEach(sheet => sheet.remove());
    const sheets = SheetStorage.sheets(WorkBook.workBook.token);
    if (sheets) {
      for (const [token, object] of Object.entries(sheets)) {
        const tmpl = template_li.content.cloneNode(true);
        const li = tmpl.querySelector('li.select-list');
        const span = li.querySelector('span');
        li.dataset.fn = 'sheetSelected';
        li.dataset.elementSearch = "sheets";
        li.dataset.token = token;
        li.dataset.name = object.name;
        li.dataset.label = object.name;
        span.innerHTML = object.name;
        parent.appendChild(li);
      }
      app.dialogSheet.showModal();
    }
  }

  app.sheetPreview = async () => {
    // NOTE: Chiamata in post per poter passare tutte le colonne, incluso l'alias, alla query
    // TODO: Passo in param un object con le colonne da estrarre (tutte)
    /* const params = JSON.stringify({ sheet_id: sheet.id });
    const url = `/fetch_api/datamartpost`;
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
        debugger;
        Dashboard.data = data;
        app.createJsonTemplate();
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      }); */
    // end chiamta in POST

    Resource.specs = JSON.parse(window.localStorage.getItem(Sheet.sheet.token)).specs;

    const progressBar = document.getElementById('progress-bar');
    const progressTo = document.getElementById('progress-to');
    const progressTotal = document.getElementById('progress-total');
    const progressLabel = document.querySelector("label[for='progress-bar']");
    // App.loaderStart();
    App.showConsole('Recupero dati in corso...', null, null);
    await fetch(`/fetch_api/${Sheet.sheet.id}_${Sheet.userId}/preview`)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        let partialData = [];
        // TODO: rivedere come utilizzare la progressBar con i dati provenienti dal cursorPaginate.
        // La progress-bar veniva correttamente utilizzata con il paginate
        if (paginateData.total !== 0) {
          console.log(paginateData);
          progressBar.value = +((paginateData.to / paginateData.total) * 100);
          progressLabel.hidden = false;
          progressTo.innerText = paginateData.to;
          progressTotal.innerText = paginateData.total;
          // console.log(paginateData.data);
          // funzione ricorsiva fino a quando è presente next_page_url
          let recursivePaginate = async (url) => {
            await fetch(url).then(response => {
              // console.log(response);
              if (!response.ok) { throw Error(response.statusText); }
              return response;
            }).then(response => response.json()).then(paginate => {
              console.log(paginate);
              progressBar.value = +((paginate.to / paginate.total) * 100);
              progressTo.innerText = paginate.to;
              progressTotal.innerText = paginate.total;
              // console.log(progressBar.value);
              partialData = partialData.concat(paginate.data);
              if (paginate.next_page_url) {
                recursivePaginate(paginate.next_page_url);
              } else {
                // Non sono presenti altre pagine, visualizzo il dashboard
                console.log('tutte le paginate completate :', partialData);
                Resource.data = partialData;
                google.charts.setOnLoadCallback(drawDatamart());
                App.closeConsole();
                App.loaderStop();
                app.sheetInformations();
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
            // Non sono presenti altre pagine, visualizzo il dashboard
            Resource.data = partialData;
            google.charts.setOnLoadCallback(drawDatamart());
            App.loaderStop();
            App.closeConsole();
            app.sheetInformations();
          }
        } else {
          App.loaderStop();
          App.closeConsole();
          App.showConsole('Nessun dato presente', 'warning', 2000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // apertura nuovo Sheet, viene recuperato dal localStorage
  app.sheetSelected = async (e) => {
    // const sheetToken = e.currentTarget.dataset.token;
    document.querySelectorAll('#dropzone-columns > *, #dropzone-rows > *, #ul-filters-sheet > *, #ul-columns-handler > *, #preview-datamart > *').forEach(element => element.remove());
    document.querySelector('#btn-sheet-save').disabled = true;
    Sheet = new Sheets(e.currentTarget.dataset.name, e.currentTarget.dataset.token, WorkBook.workBook.token);
    // reimposto tutte le proprietà della Classe
    Sheet.open();
    app.sheetName.innerText = Sheet.name;
    app.sheetName.dataset.value = Sheet.name;
    app.sheetName.dataset.tempValue = Sheet.name;
    /* Re-inserisco, nello Sheet, tutti gli elementi (fileds, filters, metrics, ecc...)
    * della classe Sheet (come quando si aggiungono in fase di creazione Sheet)
    */
    for (const [token, field] of Sheet.fields) {
      const target = document.getElementById('dropzone-rows');
      target.appendChild(createColumnDefined(token));
    }

    for (const [token, metrics] of Sheet.metrics) {
      const target = document.getElementById('dropzone-columns');
      if (!metrics.dependencies) target.appendChild(createMetricDefined(token));
    }

    // filters
    Sheet.filters.forEach(token => {
      app.addFilterToSheet(token);
    });

    app.dialogSheet.close();
    // in fase di apertura della preview, le specifiche sono sicuramente già presenti.
    Resource = new Resources('preview-datamart');
    // verifico se il datamart, per lo Sheet selezionato, è già presente sul DB.
    // In caso positivo lo apro in preview-datamart.
    if (await Sheet.exist()) {
      App.closeConsole();
      app.sheetPreview();
    }
    // Imposto la prop 'edit' = true perchè andrò ad operare su uno Sheet aperto
    Sheet.edit = true;
    document.querySelector('#btn-sheet-save').disabled = false;
    document.querySelectorAll('#btn-sql-preview, #btn-sheet-preview').forEach(button => button.disabled = false);
  }

  app.saveSheet = async () => {
    Sheet.name = app.sheetName.dataset.value;
    Sheet.userId = userId;
    // verifico se ci sono elementi modificati andando a controllare gli elmeneti con [data-adding] e [data-removed]
    Sheet.changes = document.querySelectorAll('div[data-adding], div[data-removed], code[data-modified]');
    // se il report è in edit ed è stata fatta una modifica eseguo update()
    if (Sheet.edit === true) {
      // il report è già presente in local ed è stato aperto
      // se ci sono state delle modifiche eseguo update
      console.log(Sheet.changes);
      if (Sheet.changes.length !== 0) {
        Sheet.update();
        // elimino il datamart perchè è stato modificato il report e le colonne nel datamart e nel report potrebbero non corrispondere più
        const result = await Sheet.delete();
        // console.log('datamart eliminato : ', result);
        // il report è stato modificato per cui il datamart deve essere eliminato
        if (result) App.showConsole('Il datamart è stato eliminato', 'done', 1500);
        // se sono presenti elementi aggiunti (data-adding) oppure elementi rimossi (data-removed) ne aggiorno lo stato di visualizzazione
        document.querySelectorAll('div[data-removed]').forEach(el => el.remove());
        document.querySelectorAll('div[data-adding]').forEach(el => delete el.dataset.adding);
        if (Resource.tableRef) Resource.tableRef.clearChart();
      }
    } else {
      // il report è stato appena creato e faccio save()
      Sheet.create();
    }
    // da questo momento in poi le modifiche (aggiunta/rimozione) di elementi allo Sheet
    // verranno contrassegnate come edit:true
    Sheet.edit = true;
    // ricreo sempre le specifiche
    Resource.specs.token = Sheet.sheet.token;
    Resource.setSpecifications();
  }

  app.newSheetDialog = () => {
    delete app.sheetName.dataset.value;
    document.querySelectorAll('#dropzone-columns > *, #dropzone-rows > *, #ul-filters-sheet > *, #ul-columns-handler > *, #preview-datamart > *').forEach(element => element.remove());
    // document.querySelector('#btn-sheet-save').disabled = true;
    app.dialogNewSheet.showModal();
  }

  // dialog-new-sheet
  app.newSheet = () => {
    const name = document.getElementById('input-sheet-name').value;
    // Sheet non è definito (prima attivazione del tasto Sheet)
    Sheet = new Sheets(name, rand().substring(0, 7), WorkBook.workBook.token);
    SheetStorage.sheet = Sheet.sheet.token;
    app.sheetName.dataset.value = Sheet.name;
    app.sheetName.innerText = Sheet.name;
    // Imposto la prop 'edit' = false, verrà impostata a 'true' quando si apre uno Sheet
    // dal tasto 'Apri Sheet'
    Sheet.edit = false;
    Resource = new Resources('preview-datamart');
    app.dialogNewSheet.close();
  }

  app.removeDefinedColumn = (e) => {
    const token = e.target.dataset.columnToken;
    // Se la colonna che si sta per eliminare è stata aggiunta (non era inclusa nello Sheet)
    // elimino tutto il div anziché marcarlo come data-removed
    const field = document.querySelector(`.column-defined[data-id='${token}']`);
    // effettuo una copia dell'oggetto 'fields' altrimenti il delete successivo potrebbe eliminare l'oggetto 'fields' contenuto
    // in objectRemoved
    const obj = Sheet.fields.get(token);
    // In edit=true i campi aggiunti allo Sheet sono contrassegnati con dataset.adding
    // ed è già presente il dataset.added. Perr questo motivo elimino dal DOM gli elementi
    // 'adding', in edit:true, e added in edit:false
    if (Sheet.edit) {
      // edit mode
      // (field.dataset.adding) ? field.remove() : removeField();
      // Memorizzo l'elemento eliminato in un oggetto Set(), da qui posso ripristinarlo
      (field.dataset.adding) ? field.remove() : Sheet.objectRemoved.set(token, obj);
    } else {
      // FIX: da rivedere questa logica 05.12.2023
      (field.dataset.added) ? field.remove() : Sheet.objectRemoved.set(token, obj);
    }
    Sheet.fields.delete(token);
    field.dataset.removed = 'true';
    const index = Resource.specs.filters.findIndex(filter => filter.id === e.currentTarget.dataset.label);
    // se il filtro è presente in Resource.specs.filters, lo elimino
    if (index !== -1) Resource.specs.filters.splice(index, 1);
  }

  app.undoDefinedColumn = (e) => {
    const token = e.target.dataset.columnToken;
    // Recupero, da Sheet.objectRemoved, gli elementi rimossi per poterli ripristinare
    if (Sheet.objectRemoved.has(token)) {
      const obj = Sheet.objectRemoved.get(token);
      Sheet.fields = { token, name: obj.name, datatype: obj.datatype };
      Sheet.objectRemoved.delete(token);
      delete document.querySelector(`.column-defined[data-id='${token}']`).dataset.removed;
    }
  }

  // elimino la metrica dallo Sheet e controllo, per le composite, le sue dipendenze
  app.removeDefinedMetric = (e) => {
    const token = e.target.dataset.metricToken;
    // Se la metrica che si sta per eliminare è stata aggiunta (non era inclusa nello Sheet)
    // elimino tutto il div anziché marcarlo come data-removed
    const metricRef = document.querySelector(`.metric-defined[data-id='${token}']`);
    // clono la metrica perchè la prop "dependencies" può essere modificata e questa
    // modifica non deve riflettersi in Sheet.objectRemoved
    const metric = { ...Sheet.metrics.get(token) };
    ((Sheet.edit && metricRef.dataset.adding) || (!Sheet.edit && metricRef.dataset.added)) ?
      metricRef.remove() :
      Sheet.objectRemoved.set(token, metric);
    metricRef.dataset.removed = 'true';
    let check;
    if (metric.type === 'composite') {
      // è una metrica composta che si sta eliminando.
      // Se le metriche che la compongono sono utilizzate in altre metriche
      // non posso eliminarle
      Object.keys(metric.metrics).forEach(key => {
        // le metriche presenti nello Sheet, incluse esplicitamente (dependencies:false), non posso eliminarla
        if (Sheet.metrics.get(key).dependencies === true) {
          // la metrica inclusa nella composite (in ciclo) è presente nel report come dependencies:true, è stata
          // inclusa automaticamente perchè è presente in una metrica composite
          // Se la metrica in cui è inclusa è diversa da quella che sto eliminando, non
          // posso eliminare la metrica (fa parte di un'altra composite)
          // controllo tutte le metriche composite presenti in Sheet.metrics
          // check = checkCompositeMetrics(token, key);
          check = checkMetricsDeps(token, key);
          if (!check) Sheet.metrics.delete(key);
        }
      });
      // posso eliminare dallo Sheet la metrica composta "target"
      Sheet.metrics.delete(token);
    } else {
      // Se la metrica da eliminare (basic,advanced) è contenuta in una metrica composta deve comunque
      // essere pesente nel report ma la contrassegno come dependencies:true (non visibile su report ma presente su datamart)
      // cerco questa metrica all'interno delle metriche composte
      // check = checkRemoveMetrics(token);
      check = checkMetricsDeps(token);
      (check) ? Sheet.metrics.get(token).dependencies = true : Sheet.metrics.delete(token);
    }
    // if (Sheet.metrics.size === 0) Sheet.metrics.clear();
  }

  app.undoDefinedMetric = (e) => {
    const token = e.target.dataset.metricToken;
    const metricRef = document.querySelector(`.metric-defined[data-id='${token}']`);
    // verifico se la metrica è presente in Sheet.objectRemoved
    if (Sheet.objectRemoved.has(token)) {
      Sheet.metrics = Sheet.objectRemoved.get(token);
      // verifico se la metrica da ripristinare è una composite
      if (Sheet.metrics.get(token).type === 'composite') {
        // NOTE: codice commentato in handleColumnDrop()
        for (const metricToken of Object.keys(Sheet.metrics.get(token).metrics)) {
          if (!Sheet.metrics.has(metricToken)) {
            const nestedMetric = { ...WorkBook.elements.get(metricToken) };
            Sheet.metrics = {
              token: nestedMetric.token,
              factId: nestedMetric.factId,
              alias: nestedMetric.alias,
              SQL: nestedMetric.SQL,
              type: nestedMetric.metric_type,
              aggregateFn: nestedMetric.aggregateFn,
              distinct: nestedMetric.distinct,
              dependencies: true
            };
          }
        }
      }
      Sheet.objectRemoved.delete(token);
      delete metricRef.dataset.removed;
    }
  }

  // TODO: da spostare in supportFn.js
  app.sheetName.onblur = (e) => {
    if (e.target.dataset.tempValue) {
      e.target.dataset.value = e.target.textContent;
      Sheet.name = e.target.textContent;
      delete e.target.dataset.tempValue;
    } else {
      e.target.innerText = e.target.dataset.defaultValue;
    }
  }

  app.sheetName.oninput = (e) => App.checkTitle(e.target);

  app.workbookName.onblur = (e) => {
    if (e.target.dataset.tempValue) {
      e.target.dataset.value = e.target.textContent;
      if (WorkBook) {
        WorkBook.name = e.target.textContent;
        delete e.target.dataset.tempValue;
      }
    } else {
      e.target.innerText = e.target.dataset.defaultValue;
    }
  }

  app.workbookName.oninput = (e) => App.checkTitle(e.target);

  // tasto Workbook, creazione DataModel
  app.btnWorkBook.onclick = (e) => {
    const translateRef = document.getElementById('stepTranslate');
    const steps = document.getElementById('steps');
    steps.dataset.step = 1;
    translateRef.dataset.step = 1;
    app.body.dataset.step = 1;
    // carico le proprietà del Workbook nel boxInfo
    app.workBookInformations();
  }

  // tasto "Sheet" :
  // consente di passare alla visualizzazione Sheet e salvare il WorkBook
  app.btnSheet.onclick = () => {
    // popolo il dataModel e, con esso, anche il workbookMap
    WorkBook.createDataModel();
    // verifico se tutte le join sono ok
    const incorrectJoin = Draw.svg.querySelectorAll("path:not([data-join-id])").length;
    if (incorrectJoin !== 0) {
      App.showConsole(`Sono presenti ${incorrectJoin} join non impostate nel Data Model`, "error", 4000);
      return;
    }
    // verifico se ci sono dimensioni TIME su tutti i cubi
    // NOTE: every: controllo se TUTTI gli elementi dell'array passano il test implementato
    // dalla funzione fornita (in questo caso non fornisco una funzione), restituisce un boolean
    /* const checkTimeDim = [...Draw.svg.querySelectorAll("use.fact")].every(fact => Draw.svg.querySelector(`use.time[data-table-join='${fact.id}']`));
    if (!checkTimeDim) {
      App.showConsole("La dimensione TIME non è presente su tutte le tabelle dei fatti.", "error", 4000);
      return;
    } */

    if (WorkBook.dataModel.size !== 0) {
      const translateRef = document.getElementById('stepTranslate');
      const steps = document.getElementById('steps');
      steps.dataset.step = 2;
      translateRef.dataset.step = 2;
      app.body.dataset.step = 2;
      // gli elementi impostati nel workBook devono essere disponibili nello sheet.
      app.addTablesStruct();
      WorkBook.save();
      // 17.09.2024 imposto un nuovo Sheet, se non ne è presente uno già definito
      // Se l'oggetto della Classe Sheets non è inizializzato, apro un nuovo Sheet dal titolo 'New Sheet'
      // console.log(Sheet);
      if (!Sheet) {
        Sheet = new Sheets(app.sheetName.dataset.defaultValue, rand().substring(0, 7), WorkBook.workBook.token);
        SheetStorage.sheet = Sheet.sheet.token;
        app.sheetName.innerText = Sheet.name;
        // Imposto la prop 'edit' = false, verrà impostata a 'true' quando si apre uno Sheet
        // dal tasto 'Apri Sheet'
        Sheet.edit = false;
        Resource = new Resources('preview-datamart');
      }
      // carico le proprietà dello Sheet nel boxInfo
      app.sheetInformations();
    }
  }

  // tasto Elabora e SQL
  // Creazione della struttura necessaria per creare le query
  app.createProcess = async (e) => {
    // verifico se è stato inserito il titolo dello Sheet
    if (!app.sheetName.dataset.value) {
      App.showConsole('Inserire il titolo dello Sheet', 'warning', 2000);
      app.sheetName.focus();
      return false;
    }

    let process = {}, fields = {}, filters = {};
    process.hierarchiesTimeLevel = null;
    process.facts = [...Sheet.fact];
    for (const [token, field] of Sheet.fields) {
      // verifico le tabelle da includere in tables Sheet.tables
      if (Sheet.checkMultiFactFields(token)) {
        const obj = WorkBook.elements.get(token);
        Sheet.tables = obj.tableAlias;
        fields[token] = {
          token,
          field: obj.origin_field,
          SQL: obj.SQL,
          tableAlias: obj.tableAlias,
          name: field.name
        };
        // se è un livello della dimensione TIME, ne importo 'hierarchiesTimeLevel' per stabilire l'ultimo livello "TIME" presente nel report
        if (obj.time) process.hierarchiesTimeLevel = obj.table;
      } else {
        App.showConsole(`Il campo ${field} non è in comune con tutte le tabelle dei Fatti`, 'error', 4000);
        return false;
      }
    }
    process.fields = fields;
    // BUG: 28.08.2024 qui c'è da verificare se, in un report con una metrica "timingFunctions", sia stato messo un livello
    // della dimensione TIME, altrimenti, in setFiltersMetricTable_new, la variabile time_sql non viene valorizzata

    console.log(process.hierarchiesTimeLevel);

    process.advancedMeasures = {}, process.baseMeasures = {}, process.compositeMeasures = {};
    try {
      Sheet.fact.forEach(factId => {
        let advancedMeasures = new Map(), baseMeasures = new Map();
        // es. :
        // baseMeasures : {
        //  fact-1 : {object di metriche di base}
        //  fact-2 : {object di metriche di base}
        // }
        for (const [token, metric] of Sheet.metrics) {
          const wbMetrics = WorkBook.elements.get(token);
          switch (metric.type) {
            case 'composite':
              process.compositeMeasures[token] = {
                alias: metric.alias,
                sql: wbMetrics.SQL,
                metrics: wbMetrics.metrics
              };
              // la proprietà 'metrics', con i token delle metriche incluse nella composite, viene ricomposto in MapDatabaseController.php
              break;
            case 'advanced':
              if (wbMetrics.factId === factId) {
                let obj = {
                  token,
                  alias: metric.alias,
                  aggregateFn: metric.aggregateFn,
                  sql: wbMetrics.SQL,
                  distinct: wbMetrics.distinct,
                  filters: {}
                };
                if (wbMetrics.filters) {
                  wbMetrics.filters.forEach(filterToken => {
                    // se, nei filtri della metrica, sono presenti filtri di funzioni temporali,
                    // ...la definizione del filtro và recuperata da WorkBook.metrics.timingFn
                    // TODO: implementare le altre funzioni temporali
                    if (['last-year', 'last-month', 'year-to-month'].includes(filterToken)) {
                      // advancedMetrics.get(token).filters[filterToken] = wbMetrics.timingFn[filterToken];
                      obj.filters[filterToken] = wbMetrics.timingFn[filterToken];
                    } else {
                      obj.filters[filterToken] = WorkBook.filters.get(filterToken);
                    }
                  });
                }
                advancedMeasures.set(token, obj);
              }
              break;
            default:
              // basic
              if (metric.factId === factId) {
                baseMeasures.set(token, {
                  token,
                  alias: metric.alias,
                  aggregateFn: metric.aggregateFn,
                  sql: wbMetrics.SQL,
                  distinct: wbMetrics.distinct
                });
              }
              break;
          }
        }
        if (advancedMeasures.size !== 0) process.advancedMeasures[factId] = Object.fromEntries(advancedMeasures);
        if (baseMeasures.size !== 0) process.baseMeasures[factId] = Object.fromEntries(baseMeasures);
      });
    } catch (error) {
      App.showConsole('Errori nella creazione del processo', 'error');
      console.log(error);
      throw error;
    }
    // se non ci sono filtri nel Report bisogna far comparire un avviso
    // perchè l'elaborazione potrebbe essere troppo onerosa
    if (Sheet.filters.size === 0) {
      App.showConsole('Non sono presenti filtri nel report', 'error', 2000);
      return false;
    } else {
      Sheet.filters.forEach(token => {
        const filter = WorkBook.filters.get(token);
        filter.tables.forEach(table => Sheet.tables = table);
        filters[token] = filter;
      });
    }

    process.filters = filters;
    app.setSheet();
    process.from = Sheet.from;
    process.joins = Sheet.joins;

    (e.target.id === 'btn-sheet-preview') ? app.process(process) : app.generateSQL(process);
  }

  app.generateSQL = async (process) => {
    Sheet.userId = userId;
    // lo Sheet.id può essere già presente quando è stato aperto
    if (Sheet.edit === true) {
      /* Sheet.changes = document.querySelectorAll('div[data-adding], div[data-removed]');
      if (Sheet.changes.length !== 0) {
        Sheet.update();
        // elimino il datamart perchè è stato modificato
        let exist = await Sheet.exist();
        if (exist) {
          let result = await Sheet.delete();
          console.log('datamart eliminato : ', result);
          if (result && Resource.tableRef) Resource.tableRef.clearChart();
        }
      } */
    } else {
      Sheet.create();
    }
    process.id = Sheet.sheet.id;
    process.datamartId = Sheet.userId;
    process.sql_info = true;
    console.log(process);
    // app.saveSheet();
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(process);
    // console.log(params);
    App.showConsole('Elaborazione in corso...', 'info');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/cube/sql";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          // console.log('data : ', response);
          // app.dialogSQL.show();
          showSQLInfo(response);
        } else {
          App.showConsole("Errori nella generazione dell'SQL", 'error', 5000);
        }
        App.closeConsole();
      })
      .catch(err => {
        App.showConsole(err, 'error', 3000);
        console.error(err);
      });
  }

  /* app.loadPreview = async () => {
    let partialData = [];
    await fetch(`/fetch_api/${Sheet.sheet.id}_${Sheet.userId}/preview?page=1`)
      .then((response) => {
        // console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        // console.log(paginateData);
        console.log(paginateData.data);
        // funzione ricorsiva fino a quando è presente next_page_url
        let recursivePaginate = async (url) => {
          console.log(url);
          await fetch(url).then((response) => {
            // console.log(response);
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          }).then(response => response.json()).then((paginate) => {
            partialData = partialData.concat(paginate.data);
            if (paginate.next_page_url) {
              recursivePaginate(paginate.next_page_url);
              console.log(partialData);
            } else {
              // Non sono presenti altre pagine, visualizzo il dashboard
              console.log('tutte le paginate completate :', partialData);
              Resource.data = partialData;
              test();
              // google.charts.setOnLoadCallback(drawDtm);
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
          // Non sono presenti altre pagine, visualizzo il dashboard
          Resource.data = partialData;
          test();
          // google.charts.setOnLoadCallback(drawDtm);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  } */

  app.process = async (process) => {
    Sheet.userId = userId;
    if (Sheet.edit === true) {
      Sheet.changes = document.querySelectorAll('div[data-adding], div[data-removed], code[data-modified]');
      debugger;
      if (Sheet.changes.length !== 0) Sheet.update();
    } else {
      Sheet.create();
    }
    Resource.specs.token = Sheet.sheet.token;
    Resource.setSpecifications();

    process.id = Sheet.sheet.id;
    process.datamartId = Sheet.userId;
    console.log(process);
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(process);
    // App.showConsole('Elaborazione in corso...', 'info');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    App.loaderStart();
    App.showConsole('Elaborazione in corso...', null, null);
    if (Resource.tableRef) Resource.tableRef.clearChart();
    const url = "/fetch_api/cube/sheet_create";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        // TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.text())
      .then(response => {
        console.log(response);
        // elimino gli attributi data-added/removed sugli elementi del report modificati in base alla versione
        // precedente del report
        document.querySelectorAll('div[data-adding]').forEach(el => {
          el.dataset.added = 'true;'
          delete el.dataset.adding;
        });
        document.querySelectorAll('div[data-removed]').forEach(el => el.remove());
        // imposto Sheet.edit = true perchè da questo momento qualsiasi cosa aggiunta allo Sheet avrà
        // lo contrassegna come "modificato" e quindi verrà, alla prossima elaborazione, eliminata la tabella dal DB
        // per poterla ricreare
        Sheet.edit = true;
        App.closeConsole();
        app.sheetPreview();
        App.loaderStop();
      })
      .catch(err => {
        App.showConsole(err, 'error', 3000);
        console.error(err);
      });
  }

  // aggiungo il filtro selezionato allo Sheet
  // WARN: 21.11.2024 verifica utilizzo
  /* app.addFilter = (e) => {
    Sheet.filters = e.currentTarget.dataset.token;
    // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
    const li = document.getElementById(e.currentTarget.dataset.token);
    li.dataset.selected = 'true';
  } */

  app.removeWBFilter = (e) => {
    // recupero il workbook_ref dal filtro che sto per eliminare
    const workbook_ref = WorkBook.filters.get(e.currentTarget.dataset.token).workbook_ref;
    // cerco gli sheet creati su questo workbook_ref, dovrò eliminare il
    // filtro anche dagli sheet dove è stato utilizzato
    const sheets = SheetStorage.sheets(workbook_ref);
    if (sheets) {
      // TODO: visualizzare una dialog con l'elenco dei report dove verrà cancellato il filtro
      // Il tasto 'Conferma', nella dialog eliminerà il filtro da tutti i report
      for (const value of Object.values(sheets)) {
        const index = value.filters.indexOf(e.currentTarget.dataset.token);
        value.filters.splice(index, 1);
        value.updated_at = new Date().toLocaleDateString('it-IT', options);
        SheetStorage.save(value);
      }
    }
    WorkBook.filters.delete(e.currentTarget.dataset.token);
    window.localStorage.removeItem(e.currentTarget.dataset.token);
    document.querySelector(`li[id='${e.currentTarget.dataset.token}']`).remove();
  }

  /*
    * modifica di un filtro.
    * -inserisco il contenuto della formula nella #textarea-filter
    *  Questa Funzione non può essere messa dopo il DOMContentLoaded perchè
    *  si trova all'interno di un context-menu che viene aperte nelle fasi successive
  */
  app.editFilter = (e) => {
    // console.log(e.target.dataset.token);
    // il context-menu è sempre aperto in questo caso, lo chiudo
    contextMenuRef.toggleAttribute('open');
    const filter = WorkBook.filters.get(e.target.dataset.token);
    const inputName = document.getElementById('input-filter-name');
    inputName.value = filter.name;
    // imposto il token sul tasto btnFilterSave, in questo modo posso salvare/aggiornare il filtro in base alla presenza o meno di data-token
    btnFilterSave.dataset.token = e.target.dataset.token;
    // const text = document.createTextNode(filter.formula.join(''));
    const text = document.createTextNode(filter.formula);
    // aggiungo il testo della formula prima del tag <br>
    textareaFilter.insertBefore(text, textareaFilter.lastChild);
    openDialogFilter();
  }

  /*
    * modifica di un colonna personalizzata
    * -inserisco il contenuto della formula nella #textarea__custom_column
    *  Questa Funzione non può essere messa dopo il DOMContentLoaded perchè
    *  si trova all'interno di un context-menu che viene aperte nelle fasi successive
  */
  app.editCustomColumn = (e) => {
    // console.log(e.target.dataset.token);
    // il context-menu è sempre aperto in questo caso, lo chiudo
    contextMenuRef.toggleAttribute('open');
    const element = WorkBook.elements.get(e.target.dataset.token);
    const inputName = document.getElementById('input__column_name');
    inputName.value = element.name;
    // imposto il token sul tasto #btn__save_column, in questo modo posso salvare/aggiornare la colonna custom in base alla presenza o meno di data-token
    btn__save_column.dataset.token = e.target.dataset.token;
    // const text = document.createTextNode(filter.formula.join(''));
    const text = document.createTextNode(element.formula);
    // aggiungo il testo della formula prima del tag <br>
    textarea__custom_column.insertBefore(text, textarea__custom_column.lastChild);
    createTableStruct('wbColumns');
    WorkBook.activeTable = element.tableId;
    console.log(WorkBook.activeTable);
    debugger;
    dlg__custom_columns.showModal();
  }

  // sezione drop per i filtri nelle metriche avanzate
  app.openDialogMetric = () => {
    // const filterDrop = document.getElementById('filter-drop');
    // filterDrop.addEventListener('dragover', app.elementDragOver, false);
    // filterDrop.addEventListener('dragenter', app.elementDragEnter, false);
    // filterDrop.addEventListener('dragleave', app.elementDragLeave, false);
    // filterDrop.addEventListener('drop', app.handlerDropFilter, false);
    appendFilterToDialogAdvMetrics();
    dlg__advancedMetric.showModal();
  }

  // Invocata dal context menu per le metriche
  app.editAdvancedMetric = (e) => {
    contextMenuRef.toggleAttribute('open');
    // const metric = WorkBook.metrics.get(e.target.dataset.token);
    const metric = WorkBook.elements.get(e.target.dataset.token);
    const input = dlg__advancedMetric.querySelector('#input-metric');
    const tmpl = app.tmplAdvMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('#adv-metric-defined');
    const formula = field.querySelector('.formula');
    const btnSave = document.getElementById('btn-metric-save');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    const fieldName = formula.querySelector('span');
    document.getElementById('check-distinct').checked = metric.distinct;
    aggregateFn.innerText = metric.aggregateFn;
    fieldName.innerText = `( ${metric.alias} )`;
    input.appendChild(field);
    // Nella creazione di una metrica filtrata, alcune proprietà, vengono "riprese" dalla metrica di base da cui deriva.
    // Per questo motivo ho bisogno sempre del token della metrica di base, lo imposto sul btn-metric-save[data-origin-token]
    btnSave.dataset.originToken = e.target.dataset.token;
    // ...inoltre, siccome questo tasto entra in 'edit' della metrica, aggiungo anche il token
    // della metrica che si sta modificando. In questo modo, in saveMetric() posso usare la logica di
    // aggiornamento/creazione in base al data-token presente su btnSave
    btnSave.dataset.token = e.target.dataset.token;
    // reimposto le proprietà della metrica nella dialog
    app.inputAdvMetricName.value = metric.alias;
    // apro prima la dialog (qui viene popolata la lista filtri #id__ul_filters)
    // e successivamente, se sono presenti filtri su questa metrica, ne imposto la visualizzazione
    // sul corrispondente elemento in #id__ul_filters
    app.openDialogMetric();
    if (metric.hasOwnProperty('filters')) {
      metric.filters.forEach(token => {
        if (['last-year', 'last-month', 'ecc'].includes(token)) {
          // è un filtro con una funzione temporale, seleziono la funzione temporale nell'elemento
          // ... #dl-timing-functions
          document.querySelector(`#dl-timing-functions > dt[data-value='${token}']`).setAttribute('selected', 'true');
        } else {
          addFilterToMetric(token);
          // il filtro è incluso nella metrica, quindi deve essere disabilitato dalla lista #id__ul_filters
          document.querySelector(`#id__ul_filters>li[data-id='${token}']`).classList.toggle('added');
          document.querySelector(`#id__ul_filters>li>button[data-id='${token}']`).setAttribute('disabled', 'true');
        }
      });
    }
  }

  // la Fn deriva dal menù contestuale quindi, l'evento, viene attivato dal MutationObserver
  app.editCompositeMetric = (e) => {
    contextMenuRef.toggleAttribute('open');
    // const metric = WorkBook.metrics.get(e.target.dataset.token);
    const metric = WorkBook.elements.get(e.target.dataset.token);
    // ricostruisco la formula all'interno del div #textarea-composite-metric
    const inputName = document.getElementById('composite-metric-name');
    inputName.value = metric.alias;
    btnCompositeMetricSave.dataset.token = e.target.dataset.token;
    const text = document.createTextNode(metric.formula.join(''));
    textarea__composite_metric.insertBefore(text, textarea__composite_metric.lastChild);
    dlgCompositeMetricCheck();
    dlg__composite_metric.showModal();
  }

  /* NOTE: MOUSE EVENTS */
  // TODO: spostare in supportFn.js
  document.querySelectorAll('.translate').forEach(el => {
    el.onmousedown = (e) => {
      // e.stopPropagation();
      console.log('mousedown', e.currentTarget);
      // console.log(app.coords);
      if (e.button === 2) return;
      // chiudo gli eventuali contextmenu aperti
      if (document.querySelector('.context-menu[open]')) document.querySelector('.context-menu[open]').toggleAttribute('open');
      app.coords = { x: +e.currentTarget.dataset.translateX, y: +e.currentTarget.dataset.translateY };
      app.el = e.currentTarget;
    }

    el.onmousemove = (e) => {
      // console.log('mousemove', e.currentTarget);
      if (app.el) {
        app.coords.x += e.movementX;
        app.coords.y += e.movementY;
        // if (app.x > 30) return;
        e.currentTarget.style.transform = "translate(" + app.coords.x + "px, " + app.coords.y + "px)";
        e.currentTarget.dataset.translateX = app.coords.x;
        e.currentTarget.dataset.translateY = app.coords.y;
      }
    }

    el.onmouseup = (e) => {
      // console.log(e);
      // e.target.dataset.translateX = app.x;
      delete app.el;
    }

    el.onmouseover = (e) => {
      if (e.target.nodeName === 'svg') {
        // if (app.dialogInfo.hasAttribute('open')) app.dialogInfo.close();
        // chiudo il div table-popup se è aperto
        if (app.tablePopup.classList.contains("open")) app.tablePopup.classList.remove("open");
      }
    }
  });

  // TODO: spostare in supportFn.js
  app.dialogJoin.onmousedown = (e) => {
    app.coords = { x: +e.currentTarget.dataset.x, y: +e.currentTarget.dataset.y };
    if (e.target.classList.contains('title')) app.el = e.target;
  }

  // TODO: spostare in supportFn.js
  app.dialogJoin.onmousemove = (e) => {
    if (app.el) {
      app.coords.x += e.movementX;
      app.coords.y += e.movementY;
      e.currentTarget.style.transform = "translate(" + app.coords.x + "px, " + app.coords.y + "px)";
      e.currentTarget.dataset.x = app.coords.x;
      e.currentTarget.dataset.y = app.coords.y;
    }
  }

  // TODO: spostare in supportFn.js
  app.dialogJoin.onmouseup = () => delete app.el;

  /*  NOTE: END MOUSE EVENTS */

  // visualizzo l'icona delete utilizzando <use> in svg
  app.tableEnter = (e) => {
    // Imposto le coordinate per il posizionamneto della dialog sotto alla tabella
    // app.dialogInfo.style.setProperty('--top', `${+e.currentTarget.dataset.y + 30}px`);
    // app.dialogInfo.style.setProperty('--left', `${e.currentTarget.dataset.x}px`);

    // verifico i dati della tabella, se ha colonne/metriche definite
    // TODO: Per le metriche dovrei aggiungere, in WorkBook.metrics, una prop 'table_alias'
    // per riuscire a recuperare le metriche impostate per una determinata tabella (seguendo
    // la stessa logica delle colonne, come fatto qui)
    // (WorkBook.fields.has(e.target.dataset.alias)) ?
    //   app.dialogInfo.querySelector('button.columns').removeAttribute('disabled') :
    //   app.dialogInfo.querySelector('button.columns').setAttribute('disabled', 'true');
    // imposto un dataset.tableAlias nel tasto btn-multi-fact per poter recuperare l'id della tabella
    // dei fatti quando si droppa una tabella per analisi multifact
    /* if (!e.target.dataset.tableJoin) {
      // non ha il dataset tableJoin, quindi questa è la fact
      // visualizzo il tasto btn-multi-fact
      app.dialogInfo.querySelector('#btn-multi-fact').hidden = false;
      // imposto dataset.table-id
      app.dialogInfo.querySelector('#btn-multi-fact').dataset.tableId = e.target.id;
    } */
    // visualizzo #btn-multi-fact se e.target è la tabella dei fatti
    // app.dialogInfo.querySelector('#btn-multi-fact').hidden = (e.target.dataset.tableJoin) ? true : false;
    // app.dialogInfo.show();
  }

  app.tableLeave = () => { }

  /* NOTE: FETCH API */

  // richiamato da handlerSVGDragEnd quando viene aggiunta una nuova tabella al DataModel
  // (viene richiamata anche da handlerTimeDimension)
  app.getTable = async () => {
    return await fetch('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_info')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(response => response)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.getPreviewTable = async (table, schema) => {
    return await fetch('/fetch_api/' + schema + '/schema/' + table + '/table_preview')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(response => response)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  /* NOTE: END FETCH API */

  app.setSheet = () => {
    Sheet.fact.forEach(factId => {
      // WARN: 2024.02.08 questa logica è utilizzata anche in btnFilterSave(). Creare un metodo riutilizzabile.
      let from = {}, joins = {};
      Sheet.tables.forEach(tableAlias => {
        const tables = WorkBook.dataModel.get(factId);
        // se si tratta di una tabella 'time' la converto in WB_YEARS, questa sarà sempre presente
        // nella relazione con la tabella time
        if (tableAlias === 'time') tableAlias = 'WB_YEARS';
        if (tables.hasOwnProperty(tableAlias)) {
          tables[tableAlias].forEach(table => {
            const data = Draw.tables.get(table.id);
            from[data.alias] = { schema: data.schema, table: data.table };

            // aggiungo le joins
            if (WorkBook.joins.has(data.alias)) {
              // esiste una join per questa tabella
              for (const [token, join] of Object.entries(WorkBook.joins.get(data.alias))) {
                if (join.factId === factId) joins[token] = join;
              }
            }
          });
        }
      });
      Sheet.from[factId] = from;
      Sheet.joins[factId] = joins;
    });
    console.info('controllo from : ', Sheet.from);
    console.info('controllo joins : ', Sheet.joins);
  }

  app.showTablePreview = async (e) => {
    const table = e.currentTarget.dataset.label;
    const schema = e.currentTarget.dataset.schema;
    let DT = new Table(await app.getPreviewTable(table, schema), 'preview-table', false);
    DT.template = 'tmpl-preview-table';
    DT.addColumns();
    DT.addRows();
    DT.inputSearch.addEventListener('input', DT.columnSearch.bind(DT));
  }

  // viene invocata alla fine del drag&drop
  // WARN: 24.07.2024 probabilmente si può eliminare, viene utilizzato workbookMap al suo posto
  app.hierTables = () => {
    // creo hierTables : qui sono presenti tutte le tabelle del canvas. Questa mi serve per creare la struttura nello WorkBook
    /*{
     * {
          "key": "svg-data-10261",
          "value": {
            "schema": "automotive_bi_data",
            "table": "DocVenditaDettaglio",
            "alias": "DocVenditaDettaglio_261",
            "name": "DocVenditaDettaglio"
          }
        }
      }
    */
    WorkBook.hierTables.clear();
    // non visualizzo le tabelle condivise tra le fact, altrimenti vengono duplicate le voci
    Draw.svg.querySelectorAll('use.table:not([data-shared_ref]), use.time').forEach(table => {
      let object = {
        table: table.dataset.table,
        schema: table.dataset.schema,
        name: table.dataset.name,
        id: table.id,
        type: table.dataset.type
      };
      WorkBook.tablesModel.set(table.dataset.alias, object);

      WorkBook.hierTables = {
        id: table.id,
        table: {
          schema: table.dataset.schema,
          table: table.dataset.table,
          alias: table.dataset.alias,
          name: table.dataset.name
        }
      };
    });
    console.log("hierTables: ", WorkBook.hierTables);
    console.log("tablesModel: ", WorkBook.tablesModel);
  }

  // TODO: potrebbe essere spostata in supportFn.js
  app.handlerToggleDrawer = (e) => {
    console.log('toggleDrawer');
    document.querySelector('#' + e.currentTarget.dataset.drawerId).toggleAttribute('open');
  }

  // imposto la join selezionata come data-active
  // TODO: potrebbe essere spostata in supportFn.js
  app.handlerJoin = (e) => {
    const token = e.currentTarget.dataset.token;
    app.dialogJoin.querySelectorAll('.join-field[data-active]').forEach(joinField => delete joinField.dataset.active);
    // imposto il data-active sugli .join-field[data-token] = token;
    app.dialogJoin.querySelectorAll(`.join-field[data-token='${token}']`).forEach(field => field.dataset.active = 'true');
    // imposto il data-token della join attiva sul tasto "Elimina join"
    // In questo modo, la gestione della eliminazione della join è più semplice nella fn removeJoin
    document.querySelector('#btn-remove-join').dataset.token = token;
  }

  app.addJoin = () => Draw.addJoin()

  // elimino la join attiva (data-active)
  app.removeJoin = (e) => {
    [...app.dialogJoin.querySelectorAll('.join-field[data-active]')].filter(join => join.remove());
    // elimino la join anche da WorkBook.join
    // Prima di eliminarla recupero l'alias della tabella  'from', mi servirà per eliminare
    // la join anche da WorkBook.joins
    let aliasJoin;
    if (WorkBook.join.has(e.currentTarget.dataset.token)) {
      aliasJoin = WorkBook.join.get(e.currentTarget.dataset.token).alias;
      WorkBook.join.delete(e.currentTarget.dataset.token);
      delete WorkBook.joins.get(aliasJoin)[e.currentTarget.dataset.token];
      // Se WorkBook.joins.get(alias_tabella) contiene 0 elementi deve essere eliminata
      if (Object.keys(WorkBook.joins.get(aliasJoin)).length === 0) {
        WorkBook.joins.delete(aliasJoin);
        // Eliminare dataset.joinId dalla currentLineRef
        delete Draw.currentLineRef.dataset.joinId;
        delete Draw.joinLines.get(Draw.currentLineRef.id).name;
      }
    }
    // Imposto l'ultima join presente come data-active
    // console.log(document.querySelector('.join-field:last-child'));
    // document.querySelector('.join-field:last-child').dataset.active = 'true';
    [...app.dialogJoin.querySelectorAll('.join-field:last-child')].filter(join => {
      join.dataset.active = 'true';
      document.querySelector('#btn-remove-join').dataset.token = join.dataset.token;

    });
  }

  // apertura dialog TIME dimension dall'icona 'time' (modalità modifica)
  app.editTimeDimension = (e) => {
    // elimino le precedenti selezioni se ci sono
    if (document.querySelector(`#time-fields > li[data-selected]`)) delete document.querySelector("#time-fields > li[data-selected]").dataset.selected;
    if (document.querySelector("#ul-columns > li[data-selected]")) delete document.querySelector("#ul-columns > li[data-selected]").dataset.selected;
    //
    // valorizzo workbook.activeTable
    WorkBook.activeTable = e.target.dataset.tableJoin;
    // imposto un attributo data-current-id sul tasto "Aggiorna" per tenere memorizzato
    // l'id dell'oggetto Draw.tables che si sta per modificare
    const btnUpdate = document.getElementById("btn-time-dimension-update");
    const factId = WorkBook.activeTable.dataset.factId.substring(9); // ultime 5 cifre
    // imposto, sul tasto "Aggiorna" la tabella TIME attualmente impostata
    btnUpdate.dataset.timeTable = e.target.dataset.table;

    // le informazioni della join sono memorizzate in WorkBook.join
    const timeJoin = WorkBook.join.get(`${e.target.dataset.table}-${factId}`);
    // selezione delle colonne in base alla  WorkBook.join già presente
    document.querySelector(`#time-fields > li[data-field='${timeJoin.from.field}']`).dataset.selected = true;
    // recupero le colonne della tabella "to" in join con la TIME, quasi
    // sicuramente è già in sessionStorage
    app.addFields_test(document.getElementById('ul-columns'), WorkBookStorage.getTable(WorkBook.activeTable.dataset.table));
    // seleziono la colonna della tabella "to"
    document.querySelector(`#ul-columns > li[data-field='${timeJoin.to.field}']`).dataset.selected = true;

    // sto aggiornando la relazione con la TIME, nascondo "Salva" e visualizzo "Aggiorna"
    document.querySelector("#btn-time-dimension-save").hidden = true;
    btnUpdate.hidden = false;
    app.dialogTime.show();
  }

  app.handlerTimeDimension = async (e) => {
    console.log(e.target);
    Draw.contextMenu.toggleAttribute('open');
    /*
    * - recupero le colonne della tabella selezionata
    * - apro la dialog per poter associare una colonna della WEB_BI_TIME con una colonna della FACT
    */
    if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) WorkBookStorage.saveSession(await app.getTable());
    app.addFields_test(document.getElementById('ul-columns'), WorkBookStorage.getTable(WorkBook.activeTable.dataset.table));
    // const btnSave = document.getElementById("btn-time-dimension-save");
    // btnSave.hidden = false;
    // const btnUpdate = document.getElementById("btn-time-dimension-update");
    // btnUpdate.hidden = true;
    app.dialogTime.showModal();
  }

  // rimozione tabella dal draw SVG
  app.removeTable = (e) => {
    Draw.contextMenu.toggleAttribute('open');
    // Elimino la tabella corrente
    Draw.svg.querySelector(`use.table[id='${e.currentTarget.dataset.id}']`).remove();
    // decremento data-joins della tabella in relazione con questa che sto eliminando
    const tableJoin = Draw.tables.get(e.currentTarget.dataset.id).join;
    if (tableJoin) {
      const tableJoinRef = Draw.svg.querySelector(`#${tableJoin}`);
      tableJoinRef.dataset.joins--;
      Draw.tables.get(tableJoin).joins--;
    }
    Draw.tables.delete(e.currentTarget.dataset.id); // svg-data-x
    Draw.svg.querySelector(`g#struct-${e.currentTarget.dataset.id}`).remove();
    // Elimino la joinLine che contiene e.currentTarget.id
    const line = Draw.svg.querySelector(`path[data-from='${e.currentTarget.dataset.id}'], path[data-to='${e.currentTarget.dataset.id}']`);
    if (line) Draw.deleteJoinLine(line.id);

    let recursive = (key) => {
      // utilizzo la funzione filter per trovare tutte le tabelle che hanno
      // data-table-join = key per poterle eliminare
      [...Draw.svg.querySelectorAll(`use.table[data-table-join='${key}']`)].filter(table => {
        // rimuovo il <g> all'interno di <defs>
        Draw.svg.querySelector(`g#struct-${table.id}`).remove();
        table.remove();
        Draw.tables.delete(table.id);
        // Elimino anche le joinLine relative alla tabella eliminata
        let line = Draw.svg.querySelector(`path[data-from='${table.id}'], path[data-to='${table.id}']`);
        if (line) Draw.deleteJoinLine(line.id);
        // richiamo la Fn ricorsiva per poter utilizzare la stessa logica partendo
        // dalla tabella appena rimossa
        recursive(table.id);
      });
    }
    recursive(e.currentTarget.dataset.id);
    // Se è presente una sola tabella resetto Draw.tableJoin
    if (Draw.tables.size <= 1) delete Draw.tableJoin;
    // ricalcolo del levelId dopo l'eliminazione di una o più tabelle.
    // Il data-level è impostato sull'elemento <svg> Draw.svg
    // Ciclo Draw.tables per trovare il levelId più alto
    // WARN: il ricalcolo del levelId non serve più da quando è stato eliminato il levelId
    /* Draw.svg.dataset.level = 0;
    for (const values of Draw.tables.values()) {
      if (+Draw.svg.dataset.level < values.levelId) Draw.svg.dataset.level = values.levelId;
    } */
    // Draw.joinTablePositioning();
    // imposto un elemento 'canvas' per evidenziare che c'è una modifica nel canvas
    WorkBook.checkChanges('canvas');
  }

  // contrassegno con l'attributo [data-selected] il campo selezionato delle tabelle TIME
  app.handlerTimeField = (e) => {
    // WorkBook.web_bi_time = e.target.dataset.field;
    if (document.querySelector("#time-fields > li[data-selected]")) delete document.querySelector('#time-fields > li[data-selected]').dataset.selected;
    e.target.dataset.selected = true;
  }

  app.getFieldsFromTimeDimension = () => {
    // Recupero le due colonne selezionate per la relazione time->fact
    const timeRef = document.querySelector('#time-fields > li[data-selected]');
    // recupero l'elemento <g> con la propria tabella
    const descTable = Draw.svg.getElementById(timeRef.dataset.table);
    const timeTable = timeRef.dataset.table;
    const timeColumn = timeRef.dataset.field;
    const timeColumnType = timeRef.dataset.datatype;

    const factColumn = document.querySelector("#ul-columns > li[data-selected]");
    const column = factColumn.dataset.label;
    const columnType = factColumn.dataset.datatype;
    const tableAlias = factColumn.dataset.alias;
    const table = factColumn.dataset.table;

    return {
      // time field
      descTable, timeTable, timeColumn, timeColumnType,
      // fact field
      column, columnType, tableAlias, table
    }
  }

  app.setDataTimeDimension = (token_join, token_table, data) => {
    // la proprietà dateTime è il campo, della Fact, legato alla dimensione TIME
    WorkBook.dateTime[WorkBook.activeTable.dataset.factId] = {
      tableAlias: data.tableAlias, timeField: data.column, datatype: data.columnType
    };
    // WARN: solo per vertica in questo caso.
    // qui potrei applicare solo ${table.timeColumn} e poi, tramite laravel db grammar aggiungere la sintassi del db utilizzato

    // const field = (data.timeColumnType === 'date' && data.columnType === 'integer') ?
    //   `TO_CHAR(${data.tableAlias}.${data.column})::DATE` : `${data.tableAlias}.${data.column}`;

    // field della Fact
    WorkBook.join = {
      token: token_join,
      value: {
        alias: data.timeTable,
        type: 'TIME',
        datatype: data.columnType,
        // [DocVenditaDettaglio.DataDocumento, WEB_BI_TIME.date]
        // SQL: [`TO_CHAR(${tableAlias}.${tableColumn})::DATE`, `WEB_BI_TIME.${web_bi_timeField}`],
        SQL: [`${data.tableAlias}.${data.column}`, `${data.timeTable}.${data.timeColumn}`],
        factId: WorkBook.activeTable.dataset.factId,
        from: { table: data.timeTable, alias: data.timeTable, field: data.timeColumn },
        to: { table: data.table, alias: data.tableAlias, field: data.column }
      }
    };
    WorkBook.joins = token_join;
    Draw.tables = {
      id: token_table,
      // id: `${data.descTable.id}-${WorkBook.activeTable.dataset.factId}`,
      key: 'time',
      x: +WorkBook.activeTable.getAttribute('x'),
      y: +WorkBook.activeTable.getAttribute('y') + 30,
      table: data.descTable.dataset.table,
      alias: data.descTable.dataset.alias,
      name: data.descTable.dataset.table,
      schema: 'decisyon_cache',
      joins: +data.descTable.dataset.joins,
      factId: WorkBook.activeTable.dataset.factId,
      join: WorkBook.activeTable.id,
      joinField: data.descTable.dataset.joinField
    };
  }

  app.setPropertyTimeDimension = (data) => {
    WorkBook.createDataModel();
    // recupero tutti i campi delle TIME, li ciclo per aggiungerli alla proprietà 'fields' del WorkBook
    WorkBook.activeTable = `${data.descTable.id}-${WorkBook.activeTable.dataset.factId}`;
    // aggiungo i field delle tabelle time a WorkBook.fields
    /* Draw.svg.querySelectorAll(`use.time[data-fact-id='${WorkBook.activeTable.dataset.factId}']`).forEach(async (timeTable) => {
      WorkBook.activeTable = timeTable.id;
      WorkBook.field = {
        token: `tok_${timeTable.dataset.table}`,
        type: 'column',
        schema: WorkBook.activeTable.dataset.schema,
        tableAlias: WorkBook.activeTable.dataset.alias,
        table: WorkBook.activeTable.dataset.table,
        name: timeTable.dataset.table,
        field: WorkBook.timeFields[timeTable.dataset.table]
      };
      WorkBook.fields = `tok_${timeTable.dataset.table}`;
    }); */
  }

  // salvataggio dimensione TIME dalla dialog-time
  app.saveTimeDimension = async () => {
    const fieldsData = app.getFieldsFromTimeDimension();
    // concateno il nome della tabella time (WB_YEARS) con le ultime 5 cifre della svg-data-XXXXX (factId)
    const token_join = `${fieldsData.descTable.id}-${WorkBook.activeTable.dataset.factId.substring(9)}`;
    const token_table = `${fieldsData.descTable.id}-${WorkBook.activeTable.dataset.factId}`;
    app.setDataTimeDimension(token_join, token_table, fieldsData);

    Draw.currentTable = Draw.tables.get(token_table);
    WorkBook.activeTable.dataset.joins = ++WorkBook.activeTable.dataset.joins;
    Draw.tables.get(`${WorkBook.activeTable.id}`).joins = +WorkBook.activeTable.dataset.joins;
    Draw.drawTime();

    app.setPropertyTimeDimension(fieldsData);
    app.checkSessionStorage();
    app.hierTables();

    WorkBook.checkChanges('time');
    app.dialogTime.close();
  }

  // "Aggiorna" nella dialog time
  /* app.updateTimeDimension = (e) => {
    // TODO: 25.11.2024 Rivedere tutta la Fn
    const fieldsData = app.getFieldsFromTimeDimension();
    // elimino tutte le join appartenenti alla dimensione TIME (per la fact corrente)
    const factId = WorkBook.activeTable.dataset.factId.substring(9); // ultime 5 cifre
    const fact = WorkBook.activeTable.dataset.factId;
    let recursive = (table) => {
      const relatedTable = Draw.svg.querySelector(`g#time-dimension > desc#${table}`);
      WorkBook.join.delete(`${relatedTable.dataset.table}-${factId}`);
      delete WorkBook.joins.get(relatedTable.dataset.table)[`${relatedTable.dataset.table}-${factId}`];
      if (Object.keys(WorkBook.joins.get(relatedTable.dataset.table)).length === 0) WorkBook.joins.delete(relatedTable.dataset.table);
      Draw.tables.delete(`${relatedTable.dataset.table}-${fact}`);
      Draw.svg.querySelector(`use.time#${relatedTable.dataset.table}-${fact}`).remove();
      if (Draw.svg.querySelector(`use.time:not(#${relatedTable.dataset.table})`)) {
        WorkBook.field.delete(`tok_${relatedTable.dataset.table}`);
        WorkBook.fields.delete(relatedTable.dataset.table);
      }
      if (relatedTable.dataset.relatedJoin) recursive(relatedTable.dataset.relatedJoin);
    }
    // elimino, in modo ricorsivo, le proprietà dell'attuale join e gli elementi
    // <use> aggiunti al DOM
    const refTimeTable = Draw.svg.querySelector(`g#time-dimension > desc#${e.target.dataset.timeTable}`);
    WorkBook.join.delete(`${refTimeTable.id}-${factId}`);
    delete WorkBook.joins.get(refTimeTable.id)[`${refTimeTable.id}-${factId}`];
    if (Object.keys(WorkBook.joins.get(refTimeTable.id)).length === 0) WorkBook.joins.delete(refTimeTable.id);
    // console.log(WorkBook.join);
    // la key di Draw.tables è uguale all'id dell'elemento #use
    Draw.tables.delete(`${refTimeTable.id}-${fact}`);
    // console.log(Draw.tables);
    Draw.svg.querySelector(`use.time#${e.target.dataset.timeTable}-${fact}`).remove();
    // se non sono presenti altri cubi che utilizzano e.target.dataset.timeTable
    // elimino anche i relativi campi da WorkBook.field/s
    if (Draw.svg.querySelector(`use.time:not(#${e.target.dataset.timeTable})`)) {
      WorkBook.field.delete(`tok_${e.target.dataset.timeTable}`);
      WorkBook.fields.delete(e.target.dataset.timeTable);
    }
    if (refTimeTable.dataset.relatedJoin) recursive(refTimeTable.dataset.relatedJoin);

    // nuova join
    const token_join = `${fieldsData.descTable.id}-${factId}`;
    // token per il nuovo campo della tabella time selezionato
    const token_table = `${fieldsData.descTable.id}-${fact}`;

    app.setDataTimeDimension(token_join, token_table, fieldsData);
    Draw.currentTable = Draw.tables.get(token_table);
    WorkBook.activeTable.dataset.joins = ++WorkBook.activeTable.dataset.joins;
    Draw.tables.get(`${WorkBook.activeTable.id}`).joins = +WorkBook.activeTable.dataset.joins;
    Draw.drawTime();
    // sovrascrivo i campi della TIME precedentemente memorizzati in WorkBook.fields
    app.setPropertyTimeDimension(fieldsData);
    app.hierTables();
    app.dialogTime.close();
  } */

  // inserisco la colonna selezionata per la creazione della join
  app.addFieldToJoin = (e) => {
    const fieldRef = app.dialogJoin.querySelector(`section[data-table-id='${e.currentTarget.dataset.tableId}'] .join-field[data-active]`);
    fieldRef.dataset.field = e.currentTarget.dataset.label;
    fieldRef.dataset.table = e.currentTarget.dataset.table;
    fieldRef.dataset.alias = e.currentTarget.dataset.alias;
    fieldRef.innerHTML = e.currentTarget.dataset.label;
    const token = fieldRef.dataset.token;
    // verifico se i due fieldRef[data-active] hanno il data-field impostato. Se vero, posso creare la join tra le due tabelle
    // recupero, con la funzione filter, i due field da mettere in join
    let joins = [...app.dialogJoin.querySelectorAll(`.join-field[data-active][data-field][data-token='${token}']`)].filter(field => field.dataset.token === token);
    if (joins.length === 2) {
      WorkBook.join = {
        token: fieldRef.dataset.token,
        value: {
          alias: joins[0].dataset.alias,
          type: 'table',
          SQL: [`${joins[0].dataset.alias}.${joins[0].dataset.field}`, `${joins[1].dataset.alias}.${joins[1].dataset.field}`],
          from: { table: joins[0].dataset.table, alias: joins[0].dataset.alias, field: joins[0].dataset.field },
          to: { table: joins[1].dataset.table, alias: joins[1].dataset.alias, field: joins[1].dataset.field },
          factId: fieldRef.dataset.factId
        }
      };
      WorkBook.joins = fieldRef.dataset.token; // nome della tabella con le proprie join (WorkBook.nJoin) all'interno
      WorkBook.checkChanges(token);
      // dataset.join-id=nome_tabella_from indica che è presente una join tra le due tabelle
      Draw.joinLines.get(Draw.currentLineRef.id).name = joins[0].dataset.alias;
      // la join viene identificata con il nome della tabella 'from', come in WorkBook.joins
      Draw.currentLineRef.dataset.joinId = joins[0].dataset.alias;
    }
  }

  // TODO: potrebbe essere spostata in supportFn.js
  app.handlerTimingFunctions = (e) => {
    // reset di eventuali selezioni precedenti
    document.querySelectorAll('#dl-timing-functions > dt[selected]').forEach(element => element.toggleAttribute('selected'));
    e.target.toggleAttribute('selected');
  }

  // TODO: test fn
  app.addFields_test = (ul, response) => {
    ul.querySelectorAll('li').forEach(li => li.remove());
    for (const [key, value] of Object.entries(response)) {
      const content = template_li.content.cloneNode(true);
      const li = content.querySelector('li.select-list');
      const span = li.querySelector('span');
      li.dataset.label = value.column_name;
      li.dataset.elementSearch = 'time-column';
      li.dataset.tableId = WorkBook.activeTable.id;
      li.dataset.table = WorkBook.activeTable.dataset.table;
      li.dataset.alias = WorkBook.activeTable.dataset.alias;
      li.dataset.label = value.column_name;
      li.dataset.field = value.column_name;
      span.innerText = value.column_name;
      // li.dataset.key = value.CONSTRAINT_NAME;
      // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
      // let pos = value.DATA_TYPE.indexOf('(');
      // let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
      li.dataset.datatype = value.type_name.toLowerCase();
      // span.dataset.type = type;
      // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
      li.dataset.id = key;
      // span.id = key;
      // fn da associare all'evento in 'mutation observe'
      li.addEventListener('click', (e) => {
        // reset precedenti selezini
        ul.querySelectorAll('li[data-selected]').forEach(element => delete element.dataset.selected);
        (e.currentTarget.dataset.selected) ? delete e.currentTarget.dataset.selected : e.currentTarget.dataset.selected = 'true';
      });
      ul.appendChild(li);
    }
  }

  // apertura dialog per la creazione di una nuova metrica
  app.newAdvMeasure = (e) => {
    contextMenuRef.toggleAttribute('open');
    // TODO: aggiungo la formula della metrica (SUM(NettoRiga)) nella textarea ma, in questo caso la textarea è disabilitata.
    // nella metrica filtrata posso modificare solo la funzione di aggregazione
    console.log(e.target);
    // recupero la metrica da WorkBook.metric
    const metric = WorkBook.elements.get(e.currentTarget.dataset.token);
    const input = document.getElementById('input-metric');
    const tmpl = app.tmplAdvMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('#adv-metric-defined');
    const formula = field.querySelector('.formula');
    const btnSave = document.getElementById('btn-metric-save');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    const fieldName = formula.querySelector('span');
    document.getElementById('check-distinct').checked = false;
    aggregateFn.innerText = metric.aggregateFn;
    fieldName.innerText = `( ${metric.alias} )`;
    input.appendChild(field);
    // Nella creazione di una metrica filtrata, alcune proprietà, vengono "riprese" dalla metrica di base da cui deriva.
    // Per questo motivo ho bisogno sempre del token della metrica di base, lo imposto sul btn-metric-save[data-origin-token]
    btnSave.dataset.originToken = e.target.dataset.token;
    // TODO: valutare se spostarla in Application.js oppure in supportFn
    app.openDialogMetric();
  }

  // aggiungo SOLO le metriche composite alla struttura WorkBook, le metriche
  // basic/advanced vengono aggiungo "sotto" alla tabella di appartenenza (creata in workbookMap)
  app.addDefinedCompositeMetrics = () => {
    // const parent = app.workbookTablesStruct.querySelector('#ul-metrics');
    // if (WorkBook.metrics.size !== 0) {
    for (const [token, value] of WorkBook.elements) {
      // aggiungo qui solo le metriche composte
      // if (value.metric_type === "composite") app.appendMetric(parent, token, value);
      if (value.metric_type === "composite") appendCompositeMetric(token);
    }
    // }
  }

  // Apertura step Sheet, vengono caricati gli elementi del WorkBook
  // TODO: spostare in workspace-functions.js
  app.addTablesStruct = async () => {
    // reset degli elementi in #workbook-objects
    // app.workbookTablesStruct.querySelectorAll('details').forEach(detail => detail.remove());
    app.workbookTablesStruct.querySelectorAll('#ul-metrics > li, #ul-filters > li, details').forEach(element => element.remove());
    const parent = app.workbookTablesStruct.querySelector('#nav-fields');

    // workbookMap viene creato nel Metodo createDataModel() e contiene la mappatura di tutte le tabelle del canvas
    // console.log(WorkBook.workbookMap);
    for (const [alias, objects] of WorkBook.workbookMap) {
      // console.log(tableAlias);
      const tmpl = app.tmplDetails.content.cloneNode(true);
      const details = tmpl.querySelector("details");
      const summary = details.querySelector('summary');
      WorkBook.activeTable = objects.props.key;
      // INFO: 23.11.2024 l'attributo "name" riconosce il details aperto e chiude automaticamente
      // gli altri (compatibilità con chrome e non Firefox).
      // Al momento conviene non inserirlo perchè, nella ricerca, tutti i <details> vengono
      // chiusi e non vengono visualizzati gli elementi ricercati
      // details.setAttribute("name", "wbTables");
      details.dataset.alias = alias;
      details.dataset.factId = objects.props.key;
      details.dataset.schema = objects.props.schema;
      details.dataset.table = objects.props.name;
      summary.innerText = objects.props.name;
      parent.appendChild(details);
      addFields(details, objects.fields)
      // TODO: 21.11.2024 - utilizzare un metodo addMetrics() come fatto per addFields()
      for (const [token, metric] of Object.entries(objects.metrics)) {
        const template = template_li.content.cloneNode(true);
        // metrica di base custom (es. : przmedio * quantita)
        const li = (metric.cssClass)
          ? template.querySelector(`li.drag-list.metrics.${metric.metric_type}.${metric.cssClass}`)
          : template.querySelector(`li.drag-list.metrics.${metric.metric_type}`)
        // const li = tmpl.querySelector(`li.drag-list.metrics.${metric.metric_type}`);
        const span__content = li.querySelector('.span__content');
        const span = span__content.querySelector('span');
        const i = span__content.querySelector('i[draggable]');
        const btn__info = li.lastElementChild;
        const icon = span__content.querySelector('i:not([draggable])');
        if (metric.cssClass) {
          li.classList.add(metric.cssClass);
          icon.innerText = 'function';
          // li.dataset.contextmenu = `ul-context-menu-${metric.metric_type}`;
        }
        li.dataset.id = token;
        i.id = token;
        li.dataset.type = metric.metric_type;
        li.dataset.elementSearch = 'elements';
        if (metric.metric_type !== 'composite') li.dataset.factId = details.dataset.factId;
        li.dataset.label = metric.alias;
        // definisco quale context-menu-template apre questo elemento
        // li.dataset.contextmenu = `ul-context-menu-${metric.metric_type}`;
        i.addEventListener('dragstart', handleDragStart);
        i.addEventListener('dragend', handleDragEnd);
        // i.addEventListener('dragenter', handleDragEnter);
        // i.addEventListener('dragleave', handleDragLeave);
        li.addEventListener('contextmenu', openContextMenu);
        span.innerText = metric.alias;
        details.appendChild(li);
      }
      if (WorkBook.activeTable.dataset.type !== 'time') {
        // al termine della lista aggiungo il tasto "Nuova Metrica"
        const content = template__createElement.content.cloneNode(true);
        const li__createMetric = content.querySelector("li[data-id='li__new_metric']");
        li__createMetric.addEventListener('click', createCustomMetric);
        li__createMetric.id = `${objects.props.key}_new_metric`;
        li__createMetric.dataset.schema = objects.props.schema;
        li__createMetric.dataset.table = objects.props.name;
        li__createMetric.dataset.tableId = objects.props.key;
        li__createMetric.dataset.alias = alias;
        details.appendChild(li__createMetric);
        const li__createColumn = content.querySelector("li[data-id='li__new_column']");
        li__createColumn.addEventListener('click', createCustomColumn);
        li__createColumn.id = `${objects.props.key}_new_column`;
        li__createColumn.dataset.schema = objects.props.schema;
        li__createColumn.dataset.table = objects.props.name;
        li__createColumn.dataset.tableId = objects.props.key;
        li__createColumn.dataset.alias = alias;
        details.appendChild(li__createColumn);
      }
    }
    // TEST: verificare errori con un workbook senza nessun filtro
    for (const token of WorkBook.filters.keys()) { appendFilter(token); }
    app.addDefinedCompositeMetrics();
  }

  app.handlerAddJoin = () => Draw.addFactJoin();

  app.tablePopup.onmouseleave = (e) => {
    if (e.target.classList.contains("open")) e.target.classList.remove("open");
  }

  /* NOTE: END SUPPORT FUNCTIONS */

  document.querySelectorAll('#workbook-objects[data-section-active]').forEach(section => {
    section.querySelectorAll('*[data-section]').forEach(subSection => {
      subSection.addEventListener('mouseenter', (e) => {
        // console.log(section, e.target);
        section.dataset.sectionActive = e.target.dataset.section;
      }, false);
      /* subSection.addEventListener('mouseleave', () => {
        console.log('mouseLeave');
        // reimposto eventuali input utilizzate per la ricerca se è stato cancellato il testo al loro interno
        section.querySelectorAll("input[type='search']").forEach(input => {
          if (input.value.length === 0) input.setAttribute('readonly', 'true');
        });
      }, false); */
    });
  });

  // TODO: spostare in supportFn oppure Application.js
  app.dialogJoin.addEventListener('close', (e) => {
    // ripulisco gli elementi delle <ul> (I campi delle tabelle)
    app.dialogJoin.querySelectorAll('ul > li').forEach(li => li.remove());
    app.dialogJoin.querySelectorAll('.join-field').forEach(joinField => joinField.remove());
  });

  // input events
  app.inputAdvancedMetric = (e) => {
    // controllo duplicazione nomi metrica avanzata
    // sul tasto "Salva" è presente il token di origine della metrica, tramite questo
    // recupero il parent (la tabella) a cui appartiene questa metrica.
    // Successivamente effettuo il controllo su WorkBook.metrics, due metriche con
    // lo stesso non nome NON possono essere presenti sotto la stessa tabella
    // ma in tabelle diverse si, verrà gestita, il nome duplicato della metrica, quando
    // verranno aggiunte allo Sheet.
    const originToken = app.btnAdvancedMetricSave.dataset.originToken;
    const element = document.querySelector(`li.drag-list.metrics[data-id='${originToken}']`);
    console.log(element.dataset.factId, e.target.value);
    const check = WorkBook.checkMetricNames(element.dataset.factId, e.target.value);
    app.btnAdvancedMetricSave.disabled = check;
    console.log("check : ", check);

  }

  app.inputAdvMetricName.addEventListener("input", app.inputAdvancedMetric);

  app.dialogNewWorkBook.addEventListener('close', (e) => document.getElementById('input-workbook-name').value = '');

  document.querySelector("#btn-time-dimension").onclick = async () => {
    debugger;
    return;
    // let jsonDataParsed = JSON.parse(window.localStorage.getItem(processToken));
    // console.dir(jsonDataParsed.report);
    // const jsonData = { start: "2022-01-01", end: "2023-01-01" };
    // const params = JSON.stringify(jsonData);
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/dimension/time";
    // const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    // const req = new Request(url, init);
    App.showConsole('Elaborazione in corso...', 'info');
    await fetch(url)
      .then((response) => {
        // TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.text())
      .then((response) => {
        console.log(response);
        if (response) {
          App.closeConsole();
          App.showConsole('result', 'done', 5000);
        } else {
          // TODO: Da testare se il codice arriva qui o viene gestito sempre dal catch()
          debugger;
          App.showConsole('Errori....', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  window.addEventListener('resize', (e) => {
    const stepTranslate = document.getElementById('stepTranslate');
    // console.log(e);
    // console.log(stepTranslate.offsetWidth);
    // const translateValue = (stepTranslate.dataset.translateX < 0) ? -stepTranslate.offsetWidth : stepTranslate.offsetWidth;
    // stepTranslate.dataset.translateX = translateValue;
    // stepTranslate.dataset.translateX = (stepTranslate.dataset.translateX < 0) ? `-${stepTranslate.offsetWidth}` : stepTranslate.offsetWidth;
    // stepTranslate.style.transform = (stepTranslate.dataset.translateX < 0) ? `-${stepTranslate.offsetWidth}` : stepTranslate.offsetWidth;
    // stepTranslate.style.setProperty("--page-width", `${translateValue}px`);
    // stepTranslate.style.transform = `translateX(${stepTranslate.offsetWidth}px)`;
  });

  app.sheetInformations = () => {
    document.querySelectorAll('#info>.info').forEach(info => info.hidden = true);
    if (Sheet) {
      // sono presenti info, elimino la classe css 'none'
      document.querySelector('#info.informations').classList.remove('none');
      for (const [key, value] of Object.entries(Sheet.getInformations())) {
        const ref = document.getElementById(key);
        if (ref) {
          ref.hidden = false;
          const refContent = document.getElementById(`${key}_content`);
          refContent.textContent = value;
        }
      }
    }
  }

  app.workBookInformations = () => {
    document.querySelectorAll('#info>.info').forEach(info => info.hidden = true);
    if (WorkBook) {
      document.querySelector('#info.informations').classList.remove('none');
      for (const [key, value] of Object.entries(WorkBook.getInformations())) {
        const ref = document.getElementById(key);
        if (ref) {
          ref.hidden = false;
          const refContent = document.getElementById(`${key}_content`);
          refContent.textContent = value;
        }
      }
    }
  }

  app.btnShowInfo.onclick = () => {
    const boxInfo = document.getElementById('boxInfo');
    boxInfo.toggleAttribute('open');
  }

  // TODO: implementare e testare il copy in produzione (https)
  /* app.btnCopyText.onclick = (e) => {
    const sheetId = document.getElementById('infoReportId')
    writeClipboardText(sheetId.textContent);
    // TEST: da provare in HTTPS
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
    async function writeClipboardText(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error(error.message);
      }
    }
  } */

  // verifica esistenza dimensione time su DB
  app.timeDimensionExists = async () => {
    const url = 'fetch_api/time/exists';
    await fetch(url)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.text())
      .then(async (response) => {
        console.log(response);
        App.closeConsole();
        if (response) {
          // se le tabelle TIME non sono presenti in sessionStorage le recupero
          let urls = [];
          document.querySelectorAll('g#time-dimension>desc[data-table]').forEach(table => {
            if (!window.sessionStorage.getItem(table.id)) {
              urls.push(`/fetch_api/${table.dataset.schema}/schema/${table.id}/table_info`);
            }
          });
          if (urls.length !== 0) WorkBookStorage.saveTables(await getTables(urls));
          App.showConsole('Tabelle TIME presenti', 'done', 2000);
        } else {
          // debugger;
          App.showConsole('Tabelle TIME non presenti, da creare', 'warning', 3000);
          document.querySelector("#btn-time-dimension").disabled = false;
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.timeDimensionExists();
  console.info('end workspace-init');

})();
