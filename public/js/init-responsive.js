var App = new Application();
var Draw = new DrawSVG('svg');
var Storage = new SheetStorages();
var WorkBook = new WorkBooks('workbook_kpi');
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    tmplJoin: document.getElementById('tmpl-join-field'),
    tmplDL: document.getElementById('tmpl-dl-element'),
    tmplDD: document.getElementById('tmpl-dd-element'),
    tmplColumnsDefined: document.getElementById('tmpl-columns-defined'),
    tmplMetricsDefined: document.getElementById('tmpl-metrics-defined'),
    tmplFormula: document.getElementById('tmpl-formula'),
    // dialogs
    dialogTables: document.getElementById('dlg-tables'),
    dialogFilters: document.getElementById('dlg-filters'),
    dialogMetric: document.getElementById('dlg-metric'),
    dialogMetricFilters: document.getElementById('dlg-metric-filters'),
    windowJoin: document.getElementById('window-join'),
    windowColumns: document.getElementById('window-columns'),
    // buttons
    btnSelectSchema: document.getElementById('btn-select-schema'),
    btnDataSourceName: document.getElementById('data-source-name'),
    btnWorkbookOpen: document.getElementById('btn-workbook-open'),
    // drawer
    drawer: document.getElementById('drawer'),
    // body
    body: document.getElementById('body'),
    translate: document.getElementById('translate'),
    coordsRef: document.getElementById('coords'),
    wjTitle: document.querySelector('#window-join .wj-title'),
    workbookProp: document.querySelector('#workbook-props'),
    sheetProp: document.querySelector('#sheeet-props'),
    // columns and rows dropzone (step 2)
    columns: document.getElementById('dropzone-columns'),
    rows: document.getElementById('dropzone-rows'),

    textAreaMetric: document.getElementById('textarea-metric')
  }

  App.init();

  // la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
  var Step = new Steps('stepTranslate');

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
            if (node.hasChildNodes()) {
              node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
              node.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
              node.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
            }
          }
        });
      } else if (mutation.type === 'attributes') {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        // console.log(mutation.target);
        if (mutation.target.hasChildNodes()) {
          mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
          mutation.target.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
          mutation.target.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
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
  // observerList.observe(Draw.svg, config);

  /* NOTE: DRAG&DROP EVENTS */

  app.handlerDragStart = (e) => {
    console.log('e.target : ', e.target.id);
    e.target.classList.add('dragging');
    app.dragElementPosition = { x: e.offsetX, y: e.offsetY };
    // console.log(app.dragElementPosition);
    e.dataTransfer.setData('text/plain', e.target.id);
    // creo la linea
    if (Draw.svg.querySelectorAll('.table').length > 0) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.id = `line-${Draw.svg.querySelectorAll('use.table').length}`;
      line.dataset.id = Draw.svg.querySelectorAll('use.table').length;
      Draw.svg.appendChild(line);
      Draw.currentLineRef = line.id;
    }
    // console.log(e.dataTransfer);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.handlerDragOver = (e) => {
    e.preventDefault();
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
      app.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
      if (Draw.svg.querySelectorAll('use.table').length > 0) {
        // TODO: da commentare
        let nearestTable = [...Draw.svg.querySelectorAll('use.table')].reduce((prev, current) => {
          return (Math.hypot(e.offsetX - (+current.dataset.x + 180), e.offsetY - (+current.dataset.y + 15)) < Math.hypot(e.offsetX - (+prev.dataset.x + 180), e.offsetY - (+prev.dataset.y + 15))) ? current : prev;
        });
        console.log(nearestTable.id);
        const rectBounding = nearestTable.getBoundingClientRect();
        Draw.tableJoin = {
          table: nearestTable,
          x: +nearestTable.dataset.x + rectBounding.width + 10,
          y: +nearestTable.dataset.y + (rectBounding.height / 2),
          joins: +nearestTable.dataset.joins,
          levelId: +nearestTable.dataset.levelId
        }
        // console.log('joinTable :', Draw.tableJoin);
        // console.log('tableJoin :', Draw.tableJoin.table.id);
        if (Draw.currentLineRef && Draw.tableJoin) {
          Draw.joinLines = {
            id: Draw.currentLineRef.id, properties: {
              id: Draw.currentLineRef.dataset.id,
              key: Draw.currentLineRef.id,
              from: Draw.tableJoin.table.id,
              to: { x: (e.offsetX - app.dragElementPosition.x - 10), y: (e.offsetY - app.dragElementPosition.y + 17.5) } // in questo caso non c'è l'id della tabella perchè questa deve essere ancora droppata, metto le coordinate e.offsetX, e.offsetY
            }
          };
          Draw.currentLine = Draw.joinLines.get(Draw.currentLineRef.id);
        }
        Draw.drawLine();
      }
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragEnter = (e) => {
    e.preventDefault();
    if (e.currentTarget.classList.contains('dropzone')) {
      console.info('DROPZONE');
      // console.log(e.currentTarget, e.target);
      if (e.target.nodeName === 'use') Draw.currentLevel = +e.target.dataset.levelId;
      // Draw.currentLevel = e.targe
      // e.dataTransfer.dropEffect = "copy";
      // coloro il border differente per la dropzone
      e.currentTarget.classList.add('dropping');
    } else {
      console.warn('non in dropzone');
      // TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dropping');
  }

  app.handlerDragEnd = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'copy') {
      console.log(Draw.svg.querySelectorAll('use.table').length);
      if (Draw.countTables > 1) {
        // tabella 'from'
        WorkBook.tableJoins = {
          from: app.windowJoin.querySelector('.wj-joins section[data-table-from]').dataset.tableId,
          to: app.windowJoin.querySelector('.wj-joins section[data-table-to]').dataset.tableId
        }
        console.log(WorkBook.tableJoins);
        for (const [key, value] of Object.entries(WorkBook.tableJoins)) {
          WorkBook.activeTable = value.id;
          // TODO: in questo caso, in cui vengono richiamate due tabelle, fare una promiseAll
          const data = await app.getTable();
          app.addFields(key, data);
          console.log(data);
        }
      }
    }
    // creo le gerarchie
    app.createHierarchies();
    app.tablesMap();

  }

  app.handlerDrop = (e) => {
    e.preventDefault();
    // console.clear();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    // const elementId = e.dataTransfer.getData('text/plain');
    const liElement = document.getElementById(e.dataTransfer.getData('text/plain'));
    liElement.classList.remove('dragging');
    const tableId = Draw.svg.querySelectorAll('use.table').length;
    // let coords = { x: e.offsetX - app.dragElementPosition.x, y: e.offsetY - app.dragElementPosition.y }
    let coords;
    // TODO: alias per la tabella appena aggiunta (in sospeso)
    const time = Date.now().toString();
    // card.dataset.alias = `${card.dataset.label}_${time.substring(time.length - 3)}`;

    // se non è presente una tableJoin significa che sto aggiungendo la prima tabella
    if (!Draw.tableJoin) {
      coords = { x: 40, y: 60 };
      Draw.tables = {
        id: `svg-data-${tableId}`, properties: {
          id: tableId,
          key: `svg-data-${tableId}`,
          x: coords.x,
          y: coords.y,
          line: {
            from: { x: coords.x + 180, y: coords.y + 15 },
            to: { x: coords.x - 10, y: coords.y + 15 }
          },
          table: liElement.dataset.label,
          alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
          schema: liElement.dataset.schema,
          join: null,
          joins: 0,
          levelId: 0
        }
      };
    } else {
      // è presente una tableJoin
      // imposto data.joins anche sull'elemento SVG
      Draw.svg.querySelector(`use.table[id="${Draw.tableJoin.table.id}"]`).dataset.joins = ++Draw.tableJoin.joins;
      // ... lo imposto anche nell'oggetto Map() tables
      Draw.tables.get(Draw.tableJoin.table.id).joins = Draw.tableJoin.joins;
      // livello che sto aggiungendo
      const levelId = Draw.tableJoin.levelId + 1;
      // creo un array dei livelli, ordinato in reverse per poter fare un ciclo dal penultimo livello fino al primo ed effettuare il posizionamento automatico
      if (!Draw.arrayLevels.includes(Draw.tableJoin.levelId)) Draw.arrayLevels.splice(0, 0, Draw.tableJoin.levelId);
      // if (!Draw.arrayLevels.includes(levelId)) Draw.arrayLevels.splice(0, 0, levelId);
      Draw.svg.dataset.level = (Draw.svg.dataset.level < levelId) ? levelId : Draw.svg.dataset.level;
      // quante tabelle ci sono per il livello corrente che appartengono alla stessa tableJoin
      const tableRelated = Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}'][data-table-join='${Draw.tableJoin.table.id}']`);
      const tableInLevel = tableRelated.length;
      let lastTableInLevel;
      // recupero la posizione dell'ultima tabella appartenete al livello corrente e legata alla stessa tableJoin
      tableRelated.forEach(table => {
        if (lastTableInLevel) {
          if (+lastTableInLevel.dataset.y < +table.dataset.y) lastTableInLevel = table;
        } else {
          lastTableInLevel = table;
        }
      });
      let coords = { x: +Draw.tableJoin.table.dataset.x + 275, y: +Draw.tableJoin.table.dataset.y };
      // tabella aggiunta per questo livello, la imposto nella stessa y di tableJoin
      if (lastTableInLevel) {
        // sono presenti altre tabelle per questo livello
        // recupero la posizione dell'ultima tabella relativa a questa join, aggiungo la tabella corrente a +60y dopo l'ultima tabella trovata
        // lastTableInLevel è ricavata da tableRelated (tabelle con tableJoin uguale a quella che sto droppando)
        coords.y = +lastTableInLevel.dataset.y + 60;
        // recupero altre tabelle presenti in questo livello > coords.y per spostarle 60 y più in basso
        Draw.arrayLevels.forEach(levelId => {
          // incremento il levelId perchè, in questo caso (a differenza di joinTablePositioning()) devo iniziare dall'ultimo levelId
          levelId++;
          // per ogni livello, partendo dall'ultimo
          console.log(levelId);
          // se sono presenti, in questo livello, tabelle con y > di quella che sto droppando le devo spostare y+60
          Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}']`).forEach(table => {
            // console.log(`Livello ${levelId}`);
            // console.log(`tabelle ${table.id}`);
            if (+table.dataset.y >= coords.y) {
              Draw.tables.get(table.id).y += 60;
              Draw.tables.get(table.id).line.from.y += 60;
              Draw.tables.get(table.id).line.to.y += 60;
              Draw.currentTable = Draw.tables.get(table.id);
              Draw.autoPosition();
            }
          });
        });
      }
      Draw.tables = {
        id: `svg-data-${tableId}`, properties: {
          id: tableId,
          key: `svg-data-${tableId}`,
          x: coords.x,
          y: coords.y,
          line: {
            from: { x: coords.x + 180, y: coords.y + 15 },
            to: { x: coords.x - 10, y: coords.y + 15 }
          },
          table: liElement.dataset.label,
          alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
          schema: liElement.dataset.schema,
          joins: 0,
          join: Draw.tableJoin.table.id,
          levelId
        }
      };
      // linea di join da tableJoin alla tabella droppata
      Draw.joinLines = {
        id: Draw.currentLineRef.id, properties: {
          id: Draw.currentLineRef.dataset.id,
          key: Draw.currentLineRef.id,
          from: Draw.tableJoin.table.id,
          to: `svg-data-${tableId}`
        }
      };
      console.info('create JOIN');
      app.openJoinWindow();
    }
    Draw.currentTable = Draw.tables.get(`svg-data-${tableId}`);
    // creo nel DOM la tabella appena droppata
    Draw.drawTable();
    // posizionamento delle joinTable (tabelle che hanno data-join > 1)
    Draw.joinTablePositioning();
  }

  Draw.svg.addEventListener('mousemove', (e) => {
    app.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
  }, true);

  Draw.svg.addEventListener('dragover', app.handlerDragOver, false);
  Draw.svg.addEventListener('dragenter', app.handlerDragEnter, false);
  Draw.svg.addEventListener('dragleave', app.handlerDragLeave, false);
  Draw.svg.addEventListener('drop', app.handlerDrop, false);
  // drag end event va posizionato sullo stesso elemento che ha il dragStart
  Draw.svg.addEventListener('dragend', app.handlerDragEnd, true);

  // drag su campo per la creazione del report
  app.fieldDragStart = (e) => {
    console.log('field drag start');
    console.log('e.target : ', e.target.id);
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
    console.log(e.dataTransfer);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.fieldDragEnter = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      console.info('dropzone columns');
      // console.log(e.currentTarget, e.target);
      // e.dataTransfer.dropEffect = "copy";
      // coloro il border differente per la dropzone
      e.currentTarget.classList.add('dropping');
    } else {
      console.warn('non in dropzone');
      // TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.fieldDragOver = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.fieldDragLeave = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  app.setColumn = (e) => {
    app.windowColumns.dataset.open = 'true';
    app.windowColumns.dataset.field = e.currentTarget.dataset.field;
    const id = app.windowColumns.querySelector('#textarea-column-id-formula');
    const ds = app.windowColumns.querySelector('#textarea-column-ds-formula');
    id.value = 'id';
    ds.value = e.currentTarget.dataset.field;
  }

  app.setMetric = (e) => {
    const aggregateFn = 'SUM';
    // console.log(WorkBook.activeTable);
    const table = WorkBook.activeTable.dataset.table;
    const tableAlias = WorkBook.activeTable.dataset.alias;
    const field = e.target.dataset.field;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);

    // metric Map Object
    WorkBook.mapMetric = {
      token,
      value: {
        alias: 'metric alias',
        workBook: { table, tableAlias },
        // workBook: { table: WorkBook.workBook.name, alias: 'alias tabella fact' },
        formula: {
          token,
          aggregateFn,
          field,
          distinct: false,
          alias: 'aliasmetric'
        }
      }
    };
    WorkBook.mapMetrics = token;
  }

  app.fieldDrop = (e) => {
    e.preventDefault();
    // console.log(e.target);
    // console.clear();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    e.currentTarget.classList.remove('dragging');
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    const parent = e.currentTarget.querySelector('.columns-area');
    console.log(elementRef);
    // elementRef : è l'elemento nella lista di sinistra
    let tmpl, field, span, i;
    if (elementRef.dataset.type === 'column') {
      tmpl = app.tmplColumnsDefined.content.cloneNode(true);
      field = tmpl.querySelector('.column-defined');
      span = field.querySelector('span');
      field.dataset.type = 'column';
      span.innerHTML = elementRef.dataset.field;
      WorkBook.columns = elementRef.id;
    } else {
      // metric
      tmpl = app.tmplMetricsDefined.content.cloneNode(true);
      field = tmpl.querySelector('.metric-defined');
      span = field.querySelector('span');
      i = field.querySelector("i[data-id='btn-set-filter']");
      field.dataset.type = 'metric';
      // recupero le proprietà della metrica per inserire la funzione di aggregazione nell'elemento appena droppato
      span.innerHTML = elementRef.dataset.field;
      debugger;
      // WorkBook.metrics = elementRef.id;
      // app.saveMetric(elementRef);
    }
    field.dataset.id = elementRef.id;
    // i.addEventListener('click', app.handlerSetMetric);
    // i.dataset.fn = 'handlerSetMetric';
    i.dataset.token = elementRef.id; // svg-data-x
    parent.appendChild(field);
    WorkBook.tables = elementRef.dataset.alias;
    app.setSheet();
  }

  app.textareaDragEnter = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      console.info('dropzone columns');
      // console.log(e.currentTarget, e.target);
      // e.dataTransfer.dropEffect = "copy";
      // coloro il border differente per la dropzone
      e.currentTarget.classList.add('dropping');
    } else {
      console.warn('non in dropzone');
      // TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.textareaDragOver = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.textareaDragLeave = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  app.textareaDrop = (e) => {
    e.preventDefault();
    console.log(e.target);
    // console.clear();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    e.currentTarget.classList.remove('dragging');
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    const field = document.createTextNode(elementRef.dataset.field);
    // const span = document.createElement('span');
    // span.innerText = elementRef.dataset.field;
    e.currentTarget.appendChild(field);
  }

  app.columns.addEventListener('dragover', app.fieldDragOver, false);
  app.columns.addEventListener('dragenter', app.fieldDragEnter, false);
  app.columns.addEventListener('dragleave', app.fieldDragLeave, false);
  app.columns.addEventListener('drop', app.fieldDrop, false);

  app.textAreaMetric.addEventListener('dragover', app.textareaDragOver, false);
  app.textAreaMetric.addEventListener('dragenter', app.textareaDragEnter, false);
  app.textAreaMetric.addEventListener('dragleave', app.textareaDragLeave, false);
  app.textAreaMetric.addEventListener('drop', app.textareaDrop, false);

  /* NOTE: END DRAG&DROP EVENTS */

  // selezione schema/i 
  app.handlerSchema = async (e) => {
    e.preventDefault();
    e.currentTarget.toggleAttribute('data-selected');
    if (e.currentTarget.hasAttribute('data-selected')) {
      const schema = e.currentTarget.dataset.schema;
      // recupero le tabelle dello schema selezionato
      const data = await app.getDatabaseTable(schema);
      console.log(data);
      // TODO: attivo i tasti ("Crea dimensione", "Modifica dimensione", "Crea cubo", ecc...)
      // TODO: popolo elenco tabelle
      let ul = document.getElementById('ul-tables');
      for (const [key, value] of Object.entries(data)) {
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li[data-li-drag]');
        const span = li.querySelector('span');
        li.dataset.fn = "handlerTable";
        li.dataset.label = value.TABLE_NAME;
        li.dataset.schema = schema;
        li.dataset.elementSearch = 'tables';
        li.ondragstart = app.handlerDragStart;
        li.ondragend = app.handlerDragEnd;
        li.id = 'table-' + key;
        span.innerText = value.TABLE_NAME;
        ul.appendChild(li);
      }
      drawer.toggleAttribute('open');
    }
  }

  /* NOTE: ONCLICK EVENTS*/

  app.btnMetricNew = () => {
    app.dialogMetric.show();
  }

  app.btnWorkbookOpen.onclick = () => {
    debugger;
    // TODO: recupero dallo storage il WorkBook 1
    Storage.workBook = 'WorkBook 1';
    console.log(Storage.workBook);
    Draw.svg.dataset.level = Storage.workBook.svg.levelId;
    // ciclo sulle tables presenti in svg.tables
    for (const [key, value] of Object.entries(Storage.workBook.svg.tables)) {
      Draw.tables = { id: key, properties: value };
      Draw.currentTable = Draw.tables.get(key);
      Draw.drawTable();
    }
    // joinLines
    for (const [key, value] of Object.entries(Storage.workBook.svg.lines)) {
      Draw.joinLines = { id: key, properties: value };
      // TODO: creare una funzione (qui o in DrawSVG) che crea la linea
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.id = key;
      line.dataset.id = value.id;
      Draw.svg.appendChild(line);
      Draw.currentLineRef = key;
      Draw.currentLine = value;
      Draw.drawLine();
      Draw.autoPositionLine();
    }

    for (const [tableAlias, values] of Object.entries(Storage.workBook.fields)) {
      // per ogni tabella
      for (const [token, column] of Object.entries(values)) {
        WorkBook.field = { token, value: column };
        WorkBook.fields = token;
      }
    }
    // console.log('columns : ', WorkBook.nColumns);

    // joins
    for (const [tableAlias, values] of Object.entries(Storage.workBook.joins)) {
      // per ogni tabella
      for (const [token, join] of Object.entries(values)) {
        WorkBook.nJoin = { token, value: join };
        WorkBook.nJoins = token;
      }
    }
    // console.log('joins : ', WorkBook.nJoins);
    for (const [tableAlias, values] of Object.entries(Storage.workBook.metrics)) {
      // per ogni tabella
      for (const [token, metric] of Object.entries(values)) {
        WorkBook.mapMetric = { token, value: metric };
        WorkBook.mapMetrics = token;
      }
    }

    app.createHierarchies();
    app.tablesMap();
  }

  app.btnDataSourceName.onclick = (e) => {
    //TODO: rendo editabile per modificare il nome del datasource
    e.target.setAttribute('contenteditable', 'true');
    e.target.focus();
  }

  document.getElementById('prev').onclick = () => Step.previous();

  document.getElementById('next').onclick = () => {
    // salvo il workbook creato
    Step.next();
    // gli elementi impostati nel workBook devono essere disponibili nello sheet.
    // app.addHierStruct();
    WorkBook.save();
    /* WorkSheet.workBook = WorkBook.workBook;
    console.log(WorkSheet.workBook); */
    debugger;
    // creo il nuovo oggetto Sheet, questo "lavorerà" sulla base del WorkBook passato nel Costruttore
    // le colonne e le metriche aggiunte allo sheet faranno parte....
    // Sheet = new Sheets(WorkBook.workBook);
    // console.log(Sheet.workBook);
    // WorkBook.sheet = 'sheet 1';
    // let Sheet = new Sheets('foglio 1');
    // console.log(Sheet);
  }

  // imposto attribute init sul <nav>, in questo modo verranno associati gli eventi data-fn sui child di <nav>
  app.drawer.querySelectorAll('nav').forEach(a => a.dataset.init = 'true');

  app.metricSelect = (e) => {

  }

  app.tableSelected = async (e) => {
    console.log(`table selected ${e.currentTarget.dataset.table}`);
    console.log(e.currentTarget);
    // deseleziono le altre tabelle con attributo active
    Draw.svg.querySelectorAll("use.table[data-active='true']").forEach(use => delete use.dataset.active);
    e.currentTarget.dataset.active = 'true';
    // recupero 50 record della tabella selezionata per visualizzare un anteprima
    WorkBook.activeTable = e.currentTarget.id;
    WorkBook.schema = e.currentTarget.dataset.schema;
    // debugger;
    let DT = new Table(await app.getPreviewTable(), 'preview-table');
    // DataTable.data = await app.getPreviewTable();
    // console.log(DT.data);
    DT.draw();
  }

  app.process = async () => {
    // TODO: creo 'from' e 'where' in base agli oggetti (colonne, filtri) aggiunti al report
    WorkBook.sheet = 'sheetname';
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(WorkBook.sheet.get('sheetname'));
    // console.log(params);
    // App.showConsole('Elaborazione in corso...', 'info');
    // chiudo la lista dei report da eseguire
    // app.processList.toggleAttribute('hidden');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/cube/sheet";
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
          console.log('data : ', response);
        } else {
          // TODO: Da testare se il codice arriva qui o viene gestito sempre dal catch()
          console.debug('FX non è stata creata');
          // debugger;
          App.showConsole('Errori nella creazione del datamart', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.handlerFilters = async () => {
    // popolo l'elenco delle tabelle presenti nel Canvas, il filtro può essere creatosu qualsiasi tabella
    let urls = [];
    for (const [hierName, tables] of WorkBook.nHier) {
      tables.forEach(tableId => {
        WorkBook.activeTable = tableId;
        urls.push('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_info');
      });
    }
    // promiseAll per recuperare tutte le tabelle del canvas, successivamente vado a popolare la dialogFilters con i dati ricevuti
    app.addWorkBookContent(await app.getTables(urls));
    app.dialogFilters.showModal();
  }

  // selezione della tabella dalla dialogFilters
  app.handlerSelectField = (e) => {
    WorkBook.activeTable = e.currentTarget.dataset.tableId;
    console.log(WorkBook.activeTable.dataset.table);
    const field = e.currentTarget.dataset.field;
    const table = e.currentTarget.dataset.table;
    const alias = e.currentTarget.dataset.alias;
    console.log(field);
    // textarea
    const txtArea = app.dialogFilters.querySelector('#textarea-filter');
    const templateContent = app.tmplFormula.content.cloneNode(true);
    const i = templateContent.querySelector('i');
    i.addEventListener('click', app.cancelFormulaObject);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    const small = templateContent.querySelector('small');

    // aggiungo il tableAlias e table come attributo.
    // ...in questo modo visualizzo solo il nome della colonna ma quando andrò a salvare la formula del filtro salverò table.field
    mark.dataset.tableAlias = alias;
    mark.dataset.table = table;
    mark.dataset.field = field;
    mark.innerText = field;
    small.innerText = table;
    txtArea.appendChild(span);

    app.addSpan(txtArea, null, 'filter');
  }

  app.saveFilter = (e) => {
    debugger;
    // l'oggetto filter lo salvo nella Classe Sheet (ex Query.js)
    let sql = [];
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    let object = {};
    document.querySelectorAll('#textarea-filter *').forEach(element => {
      // se, nell'elemento <mark> è presente il tableId allora posso recuperare anche hierToken, hierName e dimensionToken
      // ... altrimenti devo recuperare il cubeToken. Ci sono anche filtri che possono essere fatti su un livello dimensionale e su una FACT
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        object.workBook = { table: element.dataset.table, tableAlias: element.dataset.tableAlias };
        WorkBook.tables = element.dataset.tableAlias;
        object.field = element.dataset.field;
        object.name = 'filter test';

        /* if (element.dataset.tableId) {
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
        } */
      } else {
        sql.push(element.innerText.trim());
        // editFormula.push(element.innerText.trim());
      }
    });
    // TODO: la prop 'editFormula' va rinominata in 'edit'
    object.sql = sql;
    WorkBook.filter = {
      token,
      value: object
      /* editFormula,
      name: 'iperauto',
      formula: sql_formula.join(' '), // Azienda_444.id = 43 */
    };
    WorkBook.filters = token;
    // aggiungo il filtro alla nav[data-filters-defined]
    const parent = app.dialogFilters.querySelector('nav[data-filters-defined]');
    const tmpl = app.tmplList.content.cloneNode(true);
    const li = tmpl.querySelector('li[data-li]');
    const span = li.querySelector('li[data-li] span');
    li.dataset.name = object.name;
    li.dataset.token = token;
    li.dataset.fn = "handlerFilterSelected";
    span.innerHTML = object.name;
    parent.appendChild(li);
    app.setSheet();
  }

  app.addFiltersMetric = e => e.currentTarget.toggleAttribute('selected');

  app.setMetricFilter = (e) => {
    console.log(e.target);
    console.log(e.target.dataset);
    // metrica selezionata
    const metric = WorkBook.mapMetric.get(e.target.dataset.token);
    const parent = app.dialogMetricFilters.querySelector('nav[data-filters-defined]');
    for (const [tableAlias, filters] of WorkBook.filters) {
      for (const [token, filter] of Object.entries(filters)) {
        const tmpl = app.tmplList.content.cloneNode(true);
        const li = tmpl.querySelector('li[data-li]');
        const span = li.querySelector('li[data-li] span');
        li.dataset.name = filter.name;
        li.dataset.token = token;
        li.dataset.fn = "addFiltersMetric";
        span.innerHTML = filter.name;
        parent.appendChild(li);
      }
    }
    // devo aggiungere i filtri su questa metrica già presente in WorkBook.metric/s
    // TODO: apertura dialog per selezionare i filtri
    app.dialogMetricFilters.dataset.token = e.target.dataset.token;
    app.dialogMetricFilters.show();
  }

  app.addFiltersToMetric = (e) => {
    let filters = [];
    app.dialogMetricFilters.querySelectorAll('li[selected]').forEach(filter => filters.push(filter.dataset.token));
    // TODO: aggiungo la metrica alla proprietà 'advancedMetrics' e la elimino da WorkBook..metric/s
    let metric = WorkBook.metrics.get(app.dialogMetricFilters.dataset.token);
    metric.formula.filters = filters;
    WorkBook.advMetrics = { token: app.dialogMetricFilters.dataset.token, value: metric };
    // WorkBook.advMetrics = app.dialogMetricFilters.dataset.token;
    WorkBook.metrics.delete(app.dialogMetricFilters.dataset.token);
    // TODO:
    // if (Object.keys(WorkBook.mapMetrics.get(metric.workBook.tableAlias)).length === 0) WorkBook.mapMetrics.delete(metric.workBook.tableAlias);
  }

  /* NOTE: END ONCLICK EVENTS*/

  /* NOTE: MOUSE EVENTS */
  document.querySelectorAll('.translate').forEach(el => {
    el.onmousedown = (e) => {
      // console.log(app.coords);
      app.coords = { x: +e.currentTarget.dataset.translateX, y: +e.currentTarget.dataset.translateY };
      app.el = e.currentTarget;
    }

    el.onmousemove = (e) => {
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
  });

  app.windowJoin.onmousedown = (e) => {
    app.coords = { x: +e.currentTarget.dataset.x, y: +e.currentTarget.dataset.y };
    if (e.target.classList.contains('title')) app.el = e.target;
  }

  app.windowJoin.onmousemove = (e) => {
    if (app.el) {
      app.coords.x += e.movementX;
      app.coords.y += e.movementY;
      e.currentTarget.style.transform = "translate(" + app.coords.x + "px, " + app.coords.y + "px)";
      e.currentTarget.dataset.x = app.coords.x;
      e.currentTarget.dataset.y = app.coords.y;
    }
  }

  app.windowJoin.onmouseup = () => delete app.el;

  app.windowColumns.onmousedown = (e) => {
    app.coords = { x: +e.currentTarget.dataset.x, y: +e.currentTarget.dataset.y };
    if (e.target.classList.contains('title')) app.el = e.target;
  }

  app.windowColumns.onmousemove = (e) => {
    if (app.el) {
      app.coords.x += e.movementX;
      app.coords.y += e.movementY;
      e.currentTarget.style.transform = "translate(" + app.coords.x + "px, " + app.coords.y + "px)";
      e.currentTarget.dataset.x = app.coords.x;
      e.currentTarget.dataset.y = app.coords.y;
    }
  }

  app.windowColumns.onmouseup = () => delete app.el;

  // visualizzo l'icona delete utilizzando <use> in svg
  app.tableEnter = (e) => {
    // debugger;
    // const deleteIcon = Draw.svg.querySelector(`${e.currentTarget.href.baseVal} > image`);
    // deleteIcon.setAttribute('y', -18);
    // deleteIcon.dataset.fn = 'removeTable';
  }

  app.tableLeave = (e) => {
    // debugger;
    // e.currentTarget.remove();
    // TODO: rimuovo anche l'elemento <g> in <defs> relativo a questa tabella
  }

  /*  NOTE: END MOUSE EVENTS */

  /* NOTE: FETCH API */

  // recupero le tabelle del database in base allo schema selezionato
  app.getDatabaseTable = async (schema) => {
    const url = '/fetch_api/schema/' + schema + '/tables';
    return await fetch(url)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => data)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

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

  app.getTables = async (urls) => {
    return await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        }))
      })
      .then(data => data)
      .catch(err => console.error(err));
  }

  /* app.getColumns = async (urls) => {
    return await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        }))
      })
      .then(data => data)
      .catch(err => console.error(err));
  } */

  app.getPreviewTable = async () => {
    return await fetch('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_preview')
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

  /* NOTE: SUPPORT FUNCTIONS */

  // creazione nuova metrica dalla dialog-metric
  app.saveMetric = () => {
    const text = app.textAreaMetric.textContent;
    // cerco la metrica all'interno della textarea
    console.log(text.indexOf('NettoRiga'));


    debugger;
    /* const aggregateFn = 'SUM';
    // console.log(WorkBook.activeTable);
    const table = WorkBook.activeTable.dataset.table;
    const tableAlias = WorkBook.activeTable.dataset.alias;
    const field = e.target.dataset.field;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);

    // metric Map Object
    WorkBook.metric = {
      token,
      value: {
        alias: 'metric alias',
        workBook: { table, tableAlias },
        // workBook: { table: WorkBook.workBook.name, alias: 'alias tabella fact' },
        formula: {
          token,
          aggregateFn,
          field,
          distinct: false,
          alias: 'aliasmetric'
        }
      }
    };
    WorkBook.metrics = token; */

  }

  app.setSheet = () => {
    // TODO: questa logica va applicata anche quando si aggiunge un filtro
    // per ogni elemento aggiunto al report
    WorkBook.tables.forEach(alias => {
      if (WorkBook.tablesMap.has(alias)) {
        WorkBook.tablesMap.get(alias).forEach(tableId => {
          // nel tableId sono presenti le tabelle gerarchicamente inferiori a 'alias'
          WorkBook.from = Draw.tables.get(tableId);
          WorkBook.joins = Draw.tables.get(tableId);
        });
      }
    });
  }

  app.handlerTable = (e) => {
    console.log('select table');
    e.currentTarget.toggleAttribute('data-selected');
    // const cardStruct = document.querySelector('*[data-waiting="true"]');
    // cardStruct.querySelector('span').innerHTML = e.currentTarget.dataset.label;
    // delete cardStruct.dataset.waiting;
    // cardStruct.dataset.defined = e.currentTarget.dataset.label;
  }

  app.tablesMap = () => {
    // creo tablesMap : qui sono presenti tutte le tabelle del canvas, al suo interno le tabelle in join fino alla tabella dei fatti
    // debugger;
    const levelId = +Draw.svg.dataset.level;
    WorkBook.tablesMap.clear();
    let recursiveLevels = (levelId) => {
      // per ogni tabella creo un Map() con, al suo interno, le tabelle gerarchicamente inferiori (verso la FACT)
      // questa mi servirà per stabilire, nello sheet, quali tabelle includere nella FROM e le relative Join nella WHERE
      Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}']`).forEach(table => {
        // console.log(table.dataset.alias);
        joinTables = [table.id];
        // della tabella corrente recupero tutte le sue discendenze fino alla FACT
        let recursive = (tableId) => {
          joinTables.push(tableId);
          if (Draw.tables.get(tableId).join) recursive(Draw.tables.get(tableId).join);
        }
        if (Draw.tables.get(table.id).join) recursive(Draw.tables.get(table.id).join);
        WorkBook.tablesMap = { name: table.dataset.alias, joinTables };
      });
      levelId--;
      if (levelId !== 0) recursiveLevels(levelId);
    }
    if (levelId > 0) recursiveLevels(levelId);
  }

  app.createHierarchies = () => {
    // salvo le gerarchie / dimensioni create nel canvas
    // recupero gli elementi del level-id più alto, il data-level presente su <svg> identifica il livello più alto presente
    const levelId = +Draw.svg.dataset.level;
    WorkBook.nHier.clear();
    let recursiveLevels = (levelId) => {
      // per ogni level-id recupero le tabelle che hanno data-joins=0 (l'ultima tabella della gerarchia, che quindi non ha altre tabelle legate in join)
      Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}'][data-joins='0']`).forEach(table => {
        let hier = { name: table.dataset.alias, hierarchies: [] };
        // table : tabella nell'ultimo level-id
        // procedo da questa tabella, verso la fact, per ricostruire il percorso di questa gerarchia.
        // Per farlo ho bisogno del dataset.tableJoin perchè qui viene identificata la tabella messa in join con questa in ciclo
        let recursive = (tableId) => {
          hier.hierarchies.push(tableId);
          if (Draw.tables.get(tableId).join) recursive(Draw.tables.get(tableId).join);
        }
        recursive(table.id);
        // console.log(hier);
        WorkBook.nHier = hier;
      });

      levelId--;
      if (levelId !== 0) recursiveLevels(levelId);
    }
    if (levelId > 0) recursiveLevels(levelId);
  }

  app.handlerToggleDrawer = (e) => {
    console.log('toggleDrawer');
    document.querySelector('#' + e.currentTarget.dataset.drawerId).toggleAttribute('open');
  }

  app.lineSelected = async (e) => {
    console.log(`line selected ${e.currentTarget.dataset.from} -> ${e.currentTarget.dataset.to}`);
    Draw.currentLineRef = e.target.id;
    WorkBook.tableJoins = {
      from: Draw.currentLineRef.dataset.from,
      to: Draw.currentLineRef.dataset.to
    }
    console.log(WorkBook.tableJoins);
    for (const [key, value] of Object.entries(WorkBook.tableJoins)) {
      WorkBook.activeTable = value.id;
      // TODO: in questo caso, in cui vengono richiamate due tabelle, fare una promiseAll
      const data = await app.getTable();
      app.addFields(key, data);
      // console.log(data);
    }
    app.openJoinWindow();
  }

  // imposto questo field come data-active
  app.handlerJoin = (e) => {
    const joinId = +e.currentTarget.dataset.joinId;
    app.windowJoin.querySelectorAll('.join-field[data-active]').forEach(joinField => {
      delete joinField.dataset.active;
    });
    // imposto il data-active sugli .join-field[data-join-id] = joinId;
    app.windowJoin.querySelectorAll(`.join-field[data-join-id='${joinId}']`).forEach(field => {
      field.dataset.active = 'true';
    });
  }

  app.addJoin = () => {
    const tmplJoinFrom = app.tmplJoin.content.cloneNode(true);
    const tmplJoinTo = app.tmplJoin.content.cloneNode(true);
    const joinFieldFrom = tmplJoinFrom.querySelector('.join-field');
    const joinFieldTo = tmplJoinTo.querySelector('.join-field');
    joinFieldFrom.innerHTML = 'Campo';
    joinFieldFrom.dataset.fn = 'handlerJoin';
    joinFieldTo.dataset.fn = 'handlerJoin';
    joinFieldTo.innerHTML = 'Campo';
    const divJoins = app.windowJoin.querySelector('section[data-table-from] > .joins').childElementCount;
    joinFieldFrom.dataset.joinId = divJoins;
    joinFieldTo.dataset.joinId = divJoins;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    joinFieldFrom.dataset.token = token;
    joinFieldTo.dataset.token = token;
    // rimuovo eventuali joinField che hanno l'attributo data-active prima di aggiungere quelli nuovi
    app.windowJoin.querySelectorAll('.join-field[data-active]').forEach(joinField => delete joinField.dataset.active);
    app.windowJoin.querySelector('.wj-joins section[data-table-from] > .joins').appendChild(joinFieldFrom);
    app.windowJoin.querySelector('.wj-joins section[data-table-to] > .joins').appendChild(joinFieldTo);
  }

  app.openJoinWindow = () => {
    // visualizzo la windowJoin
    app.windowJoin.dataset.open = 'true';
    app.windowJoin.dataset.lineId = Draw.currentLineRef.id;
    // aggiungo i template per join-field
    app.addJoin();
    const from = Draw.tables.get(Draw.joinLines.get(Draw.currentLineRef.id).from);
    const to = Draw.tables.get(Draw.joinLines.get(Draw.currentLineRef.id).to);

    app.windowJoin.querySelector('.wj-joins section[data-table-from]').dataset.tableFrom = from.table;
    app.windowJoin.querySelector('.wj-joins section[data-table-from]').dataset.tableId = from.key;
    app.windowJoin.querySelector('.wj-joins section[data-table-from] .table').innerHTML = from.table;
    app.windowJoin.querySelector('.wj-joins section[data-table-to]').dataset.tableTo = to.table;
    app.windowJoin.querySelector('.wj-joins section[data-table-to]').dataset.tableId = to.key;
    app.windowJoin.querySelector('.wj-joins section[data-table-to] .table').innerHTML = to.table;
  }

  app.closeWindowJoin = () => {
    // ripulisco la window dalla precedente join creata
    app.windowJoin.querySelectorAll('.join-field').forEach(joinField => joinField.remove());
    app.windowJoin.querySelectorAll('ul > li').forEach(li => li.remove());
    app.windowJoin.dataset.open = 'false';
  }

  // rimozione tabella dal draw SVG
  /* app.removeTable = (e) => {
    // tabella in join con e.currentTarget
    const tableJoin = Draw.tables.get(e.currentTarget.dataset.id).join;
    const tableJoinRef = Draw.svg.querySelector(`#${tableJoin}`);
    // se è presente una tabella legata a currentTarget, in join, sto eliminando una tabella nella prop 'to' della joinLines
    const joinLineKey = () => {
      for (const [key, value] of Draw.joinLines) {
        if ((value.to === e.currentTarget.dataset.id && value.from === tableJoin) || (value.from === e.currentTarget.dataset.id && value.to === tableJoin)) {
          // console.log(`linea da eliminare ${key}`);
          return key;
        }
      }
    }
    Draw.deleteJoinLine(joinLineKey());
    if (tableJoin) {
      // decremento dataset.joins della tabella legata a questa
      tableJoinRef.dataset.joins--;
    }
    // lo rimuovo dal DOM
    Draw.svg.querySelector(`#${e.currentTarget.dataset.id}`).remove();
    Draw.tables.delete(e.currentTarget.dataset.id); // svg-data-x
    delete Draw.tableJoin;
    console.log(Draw.tables);
    // rimuovo anche il <g> all'interno di <defs>
    Draw.svg.querySelector(`g#struct-${e.currentTarget.dataset.id}`).remove();
  } */

  app.contextMenu = (e) => {
    console.log(e.currentTarget);
    // tabella selezionata
    const table = Draw.tables.get(e.currentTarget.dataset.id);
    const tablesvg = Draw.svg.querySelector(`#${e.currentTarget.dataset.id}`);
    console.log(table);
    console.log(tablesvg);
    // TODO: apro un context menu (con dialog.show()) con le voci : Rimuovi, Crea metrica, ecc...
  }

  // inserisco la colonna selezionata per la creazione della join
  app.addFieldToJoin = (e) => {
    const fieldRef = app.windowJoin.querySelector(`section[data-table-id='${e.currentTarget.dataset.tableId}'] .join-field[data-active]`);
    // console.log(fieldRef);
    fieldRef.dataset.field = e.currentTarget.dataset.label;
    fieldRef.dataset.table = e.currentTarget.dataset.table;
    fieldRef.dataset.alias = e.currentTarget.dataset.alias;
    fieldRef.innerHTML = e.currentTarget.dataset.label;
    const joinId = +fieldRef.dataset.joinId;
    // verifico se i due fieldRef[data-active] hanno il data-field impostato. Se vero, posso creare la join tra le due tabelle
    // recupero, con la funzione filter, i due field da mettere in join
    let joins = [...app.windowJoin.querySelectorAll(`.join-field[data-active][data-field][data-join-id='${joinId}']`)].filter(field => +field.dataset.joinId === joinId);
    // console.log(joins);
    if (joins.length === 2) {
      WorkBook.nJoin = {
        token: fieldRef.dataset.token,
        value: {
          // table: joins[0].dataset.table,
          alias: joins[1].dataset.alias,
          SQL: [`${joins[1].dataset.alias}.${joins[1].dataset.field}`, `${joins[0].dataset.alias}.${joins[0].dataset.field}`],
          from: { table: joins[1].dataset.table, alias: joins[1].dataset.alias, field: joins[1].dataset.field },
          to: { table: joins[0].dataset.table, alias: joins[0].dataset.alias, field: joins[0].dataset.field }
        }
      };
      WorkBook.nJoins = fieldRef.dataset.token; // nome della tabella con le proprie join (WorkBook.nJoin) all'interno
      // dopo aver completato la join coloro la linea in modo diverso
      Draw.currentLineRef.dataset.joined = 'true';
    }
  }

  // aggiungo i campi di una tabella per creare la join
  app.addFields = (source, response) => {
    // source : from, to
    const ul = app.windowJoin.querySelector(`section[data-table-${source}] ul`);
    for (const [key, value] of Object.entries(response)) {
      const content = app.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li]');
      const span = li.querySelector('span');
      li.dataset.label = value.COLUMN_NAME;
      li.dataset.elementSearch = `${source}-fields`;
      li.dataset.tableId = WorkBook.activeTable.id;
      li.dataset.table = WorkBook.activeTable.dataset.table;
      li.dataset.alias = WorkBook.activeTable.dataset.alias;
      li.dataset.label = value.COLUMN_NAME;
      li.dataset.key = value.CONSTRAINT_NAME;
      span.innerText = value.COLUMN_NAME;
      // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
      let pos = value.DATA_TYPE.indexOf('(');
      let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
      span.dataset.type = type;
      // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
      li.dataset.id = key;
      // span.id = key;
      // fn da associare all'evento in 'mutation observe'
      li.dataset.fn = 'addFieldToJoin';
      ul.appendChild(li);
    }
  }

  app.saveColumn = () => {
    const field = app.windowColumns.dataset.field;
    const id = app.windowColumns.querySelector('#textarea-column-id-formula');
    const ds = app.windowColumns.querySelector('#textarea-column-ds-formula');
    let fieldObjectId = { field: id.value, type: 'da_completare', origin_field: field };
    let fieldObjectDs = { field: ds.value, type: 'da_completare', origin_field: field };
    // WorkBook.field = { id: fieldObjectId, ds: fieldObjectDs };
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    // TODO: valutare se inserire anche qui (come sulle metriche) la prop 'workBook'
    WorkBook.field = {
      token,
      value: {
        type: 'column',
        schema: WorkBook.schema,
        tableAlias: WorkBook.activeTable.dataset.alias,
        table: WorkBook.activeTable.dataset.table,
        name: field,
        field: {
          id: fieldObjectId,
          ds: fieldObjectDs
        }
      }
    };
    WorkBook.fields = token;
    // Storages.save();
    // WorkBook.nTables = { table: WorkBook.activeTable.dataset.table, alias: WorkBook.activeTable.dataset.alias };
    app.windowColumns.dataset.open = 'false';
  }

  app.addHierStruct = async () => {
    // ciclo le hierarchies presenti per aggiungerle alla struttura dello step 2
    console.log(WorkBook.nHier);
    // ripulisco la struttura già presente.
    // TODO: in futuro dovrò aggiornare la struttura già presente (e non resettare). In questo modo, gli elementi aggiunti al report non verranno resettati
    app.workbookProp.querySelectorAll('dl').forEach(dl => dl.remove());
    for (const [hierName, tables] of WorkBook.nHier) {
      const dlElement = app.tmplDL.content.cloneNode(true);
      const dl = dlElement.querySelector("dl");
      const dt = dl.querySelector('dt');
      dt.innerHTML = `${hierName} (nome gerarchia)`;
      app.workbookProp.appendChild(dl);
      tables.forEach(tableId => {
        const ddElement = app.tmplDD.content.cloneNode(true);
        const dd = ddElement.querySelector("dd");
        const details = dd.querySelector("details");
        const summary = details.querySelector('summary');
        WorkBook.activeTable = tableId;
        dd.dataset.alias = WorkBook.activeTable.dataset.alias;
        dd.dataset.table = WorkBook.activeTable.dataset.table;
        summary.innerHTML = WorkBook.activeTable.dataset.table;
        summary.dataset.tableId = tableId;
        dt.appendChild(dd);
        if (WorkBook.fields.has(WorkBook.activeTable.dataset.alias)) {
          for (const [token, value] of Object.entries(WorkBook.fields.get(WorkBook.activeTable.dataset.alias))) {
            const tmpl = app.tmplList.content.cloneNode(true);
            const li = tmpl.querySelector('li[data-li-drag]');
            const i = li.querySelector('i');
            const span = li.querySelector('span');
            li.id = token;
            li.dataset.type = 'column';
            // li.dataset.id = tableId;
            li.dataset.schema = value.schema;
            li.dataset.table = value.table;
            li.dataset.alias = value.tableAlias;
            li.dataset.field = value.field.ds.field;
            li.addEventListener('dragstart', app.fieldDragStart);
            li.addEventListener('dragend', app.fieldDragEnd);
            span.innerHTML = value.field.ds.field;
            details.appendChild(li);
          }
        }
        // metrics
        /* if (WorkBook.mapMetrics.has(WorkBook.activeTable.dataset.alias)) {
          for (const [token, value] of Object.entries(WorkBook.mapMetrics.get(WorkBook.activeTable.dataset.alias))) {
            const tmpl = app.tmplList.content.cloneNode(true);
            const li = tmpl.querySelector('li[data-li-drag]');
            const i = li.querySelector('i');
            const span = li.querySelector('span');
            li.id = token;
            li.dataset.type = 'metric';
            // li.dataset.id = tableId;
            // li.dataset.schema = value.schema;
            li.dataset.table = value.workBook.table;
            li.dataset.alias = value.workBook.tableAlias;
            li.dataset.field = value.formula.field;
            li.addEventListener('dragstart', app.fieldDragStart);
            li.addEventListener('dragend', app.fieldDragEnd);
            span.innerHTML = value.formula.field;
            details.appendChild(li);
          }
        } */
      });
    }
  }

  // TODO: creo la struttura delle tabelle presenti nel canvas
  app.addWorkBookContent = (data) => {
    console.log(data);
    // FIX: Potrei ottimizzazre questa fn e popolare i field quando viene aggiunta la tabella al canvas. Insieme a questa potrei popolare anche la dialogJoin
    // reset
    app.dialogFilters.querySelectorAll('nav dl').forEach(element => element.remove());
    // parent
    let parent = app.dialogFilters.querySelector('nav');
    for (const [hierName, tables] of WorkBook.nHier) {
      const dlElement = app.tmplDL.content.cloneNode(true);
      const dl = dlElement.querySelector("dl");
      const dt = dl.querySelector('dt');
      dt.innerHTML = `${hierName} (nome gerarchia)`;
      parent.appendChild(dl);
      tables.forEach((tableId, index) => {
        const ddElement = app.tmplDD.content.cloneNode(true);
        const dd = ddElement.querySelector("dd");
        const details = dd.querySelector("details");
        const summary = details.querySelector('summary');
        WorkBook.activeTable = tableId;
        details.dataset.schema = WorkBook.activeTable.dataset.schema;
        details.dataset.table = WorkBook.activeTable.dataset.table;
        details.dataset.alias = WorkBook.activeTable.dataset.alias;
        details.dataset.id = tableId;
        summary.innerHTML = WorkBook.activeTable.dataset.table;
        summary.dataset.tableId = tableId;
        dt.appendChild(dd);
        for (const [key, value] of Object.entries(data[index])) {
          const content = app.tmplList.content.cloneNode(true);
          const li = content.querySelector('li[data-li]');
          const span = li.querySelector('span');
          li.dataset.label = value.COLUMN_NAME;
          li.dataset.fn = 'handlerSelectField';
          // li.dataset.elementSearch = `${source}-fields`;
          li.dataset.tableId = WorkBook.activeTable.id;
          li.dataset.table = WorkBook.activeTable.dataset.table;
          li.dataset.alias = WorkBook.activeTable.dataset.alias;
          li.dataset.field = value.COLUMN_NAME;
          li.dataset.key = value.CONSTRAINT_NAME;
          span.innerText = value.COLUMN_NAME;
          // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
          let pos = value.DATA_TYPE.indexOf('(');
          let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
          span.dataset.type = type;
          // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
          li.dataset.id = key;
          // span.id = key;
          // li.dataset.fn = 'addFieldToJoin';
          details.appendChild(li);
        }
      });
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

  /* NOTE: END SUPPORT FUNCTIONS */

})();