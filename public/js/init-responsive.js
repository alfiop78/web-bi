var App = new Application();
var Draw = new DrawSVG('svg');
var SheetStorage = new SheetStorages();
var WorkBookStorage = new Storages();
var WorkSheet = new WorkSheets('WorkBook 1');
var Sheet;
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    tmplJoin: document.getElementById('tmpl-join-field'),
    tmplDL: document.getElementById('tmpl-dl-element'),
    contextMenuRef: document.getElementById('context-menu'),
    // tmplDD: document.getElementById('tmpl-dd-element'),
    tmplDetails: document.getElementById('tmpl-details-element'),
    tmplColumnsDefined: document.getElementById('tmpl-columns-defined'),
    tmplMetricsDefined: document.getElementById('tmpl-metrics-defined'),
    tmplFormula: document.getElementById('tmpl-formula'),
    // dialogs
    dialogWorkBook: document.getElementById('dialog-workbook-open'),
    dialogSheet: document.getElementById('dialog-sheet-open'),
    dialogTables: document.getElementById('dlg-tables'),
    dialogFilters: document.getElementById('dlg-filters'),
    dialogMetric: document.getElementById('dlg-metric'),
    dialogCustomMetric: document.getElementById('dlg-custom-metric'),
    dialogCompositeMetric: document.getElementById('dlg-composite-metric'),
    windowJoin: document.getElementById('window-join'),
    dialogColumns: document.getElementById('dlg-columns'),
    // buttons
    btnSelectSchema: document.getElementById('btn-select-schema'),
    editWorkBookName: document.getElementById('workbook-name'),
    // drawer
    drawer: document.getElementById('drawer'),
    // body
    body: document.getElementById('body'),
    translate: document.getElementById('translate'),
    coordsRef: document.getElementById('coords'),
    wjTitle: document.querySelector('#window-join .wj-title'),
    workbookTablesStruct: document.querySelector('#workbook-objects'),
    // columns and rows dropzone (step 2)
    columnsDropzone: document.getElementById('dropzone-columns'),
    rowsDropzone: document.getElementById('dropzone-rows'),
    textareaCompositeMetric: document.getElementById('textarea-composite-metric'),

    textAreaMetric: document.getElementById('textarea-metric')
  }

  App.init();

  app.body.addEventListener('click', (e) => {
    if (app.contextMenuRef.hasAttribute('open')) app.contextMenuRef.toggleAttribute('open');
  });
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
              node.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
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
        WorkSheet.tableJoins = {
          from: app.windowJoin.querySelector('.wj-joins section[data-table-from]').dataset.tableId,
          to: app.windowJoin.querySelector('.wj-joins section[data-table-to]').dataset.tableId
        }
        console.log(WorkSheet.tableJoins);
        for (const [key, value] of Object.entries(WorkSheet.tableJoins)) {
          WorkSheet.activeTable = value.id;
          // TODO: in questo caso, in cui vengono richiamate due tabelle, fare una promiseAll
          const data = await app.getTable();
          app.addFields(key, data);
          console.log(data);
        }
      }
    }
    // creo le gerarchie
    // app.createHierarchies();
    app.tablesMap();
    app.hierTables();

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

  app.columnDragEnter = (e) => {
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

  app.columnDragOver = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.columnDragLeave = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  // stesso funzionamento di addField()
  app.addMetric = (target, token) => {
    const tmpl = app.tmplMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('.metric-defined');
    const formula = field.querySelector('.formula');
    const fieldName = formula.querySelector('code[data-field]');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    fieldName.dataset.field = Sheet.metrics.get(token).field;
    aggregateFn.innerText = Sheet.metrics.get(token).aggregateFn;
    formula.dataset.id = token;
    fieldName.innerHTML = Sheet.metrics.get(token).alias;
    // fieldName.dataset.tableAlias = Sheet.metrics.get(token).workBook.tableAlias;
    // Sheet.tables = Sheet.metrics.get(token).workBook.tableAlias;
    target.appendChild(field);
  }

  app.addAdvMetric = (target, token) => {
    const tmpl = app.tmplMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('.metric-defined');
    const formula = field.querySelector('.formula');
    const fieldName = formula.querySelector('code[data-field]');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    formula.dataset.token = token;
    fieldName.dataset.field = Sheet.advMetrics.get(token).field;
    aggregateFn.innerText = Sheet.advMetrics.get(token).aggregateFn;
    formula.dataset.id = token;
    fieldName.innerHTML = Sheet.advMetrics.get(token).alias;
    target.appendChild(field);
  }

  app.addCompositeMetric = (target, token) => {
    const tmpl = app.tmplMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('div[data-composite]');
    const formula = field.querySelector('.formula');
    const sql = formula.querySelector('code');
    // const aggregateFn = formula.querySelector('code[data-aggregate]');
    formula.dataset.token = token;
    // fieldName.dataset.field = Sheet.compositeMetrics.get(token).field;
    // aggregateFn.innerText = Sheet.advMetrics.get(token).aggregateFn;
    formula.dataset.id = token;
    sql.innerHTML = `${Sheet.compositeMetrics.get(token).alias} - ${Sheet.compositeMetrics.get(token).sql}`;
    target.appendChild(field);
  }

  app.columnDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    console.log(elementRef);
    // elementRef : è l'elemento nella lista di sinistra che ho draggato
    let tmpl = app.tmplColumnsDefined.content.cloneNode(true);
    let field = tmpl.querySelector('.column-defined');
    let span = field.querySelector('span');
    field.dataset.type = elementRef.dataset.type;
    field.dataset.id = elementRef.id;
    const rand = () => Math.random(0).toString(36).substring(2);
    // const token = rand().substring(0, 7);
    switch (field.dataset.type) {
      case 'basic':
        Sheet.metrics = WorkSheet.metrics.get(elementRef.id);
        app.addMetric(e.currentTarget, elementRef.id);
        break;
      case 'advanced':
        Sheet.advMetrics = WorkSheet.advMetrics.get(elementRef.id);
        app.addAdvMetric(e.currentTarget, elementRef.id);
        break;
      case 'composite':
        Sheet.compositeMetrics = WorkSheet.compositeMetrics.get(elementRef.id);
        app.addCompositeMetric(e.currentTarget, elementRef.id);
        // TODO: dopo aver aggiunto una metrica composta allo Sheet, è necessario aggiungere anche le metriche al suo interno per consentirne l'elaborazione
        debugger;
        for (const token of Object.keys(Sheet.compositeMetrics.get(elementRef.id).metrics)) {
          if (WorkSheet.metrics.has(token)) Sheet.metrics = WorkSheet.metrics.get(token);
          if (WorkSheet.advMetrics.has(token)) Sheet.advMetrics = WorkSheet.advMetrics.get(token);
        }
        break;
      default:
        // column
        span.innerHTML = elementRef.dataset.field;
        Sheet.fields = elementRef.id;
        break;
    }
  }

  app.columnDragEnd = (e) => {
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'copy') {

    }
  }

  app.rowDragEnter = (e) => {
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

  app.handlerDragEnterFilter = (e) => {
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

  app.rowDragOver = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragOverFilter = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragLeaveFilter = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  app.handlerDropFilter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    console.log(elementRef);
    const li = document.createElement('li');
    li.dataset.token = elementRef.id;
    li.innerText = WorkSheet.filters.get(elementRef.id).name;
    e.target.appendChild(li);
  }

  app.rowDragLeave = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  /* addField viene utilizzate sia quando si effettua il drag&drop sulla dropzone-rows che 
  * quando si apre un nuovo Sheet per ripololare la dropzone-rows con gli elementi proveniente da Sheet.open()
  */
  app.addField = (target, token) => {
    const tmpl = app.tmplColumnsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('.column-defined');
    const code = field.querySelector('code');
    field.dataset.type = 'column';
    field.dataset.id = token;
    // field.dataset.token = elementRef.id;
    code.dataset.token = token;
    code.innerHTML = Sheet.fields.get(token).name;
    // aggiungo la colonna al report (Sheet)
    // TODO: aggiungere a Sheet.fields solo le proprietà utili alla creazione della query
    // Sheet.fields = { token: elementRef.id, value: WorkSheet.field.get(elementRef.id) };
    // passo, a Sheet.fields, la colonna creata in WorkSheet
    // Sheet.fields = WorkSheet.field.get(elementRef.id);
    Sheet.tables = Sheet.fields.get(token).tableAlias;
    target.appendChild(field);
    // TODO: impostare qui gli eventi che mi potranno servire in futuro (per editare o spostare questo elemento droppato)
    // i.addEventListener('click', app.handlerSetMetric);
    app.setSheet();

  }

  app.rowDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    console.log(elementRef);
    // elementRef : è l'elemento nella lista di sinistra che ho draggato
    // TODO: rinominare elementRef.id in elementRef.dataset.token
    Sheet.fields = WorkSheet.field.get(elementRef.id);
    app.addField(e.currentTarget, elementRef.id);
  }

  app.rowDragEnd = (e) => {
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'copy') {

    }
  }

  // apro la dialog column per definire le colonne del WorkBook
  app.setColumn = (e) => {
    app.dialogColumns.show();
    app.dialogColumns.dataset.field = e.currentTarget.dataset.field;
    const id = app.dialogColumns.querySelector('#textarea-column-id-formula');
    const ds = app.dialogColumns.querySelector('#textarea-column-ds-formula');
    // id.value = 'id';
    id.value = e.currentTarget.dataset.field;
    ds.value = e.currentTarget.dataset.field;
    ds.focus();
    ds.select();
  }

  // click all'interno di una textarea
  app.addText = (e) => {
    console.log('e : ', e);
    console.log('e.target : ', e.target);
    console.log('e.currentTarget : ', e.currentTarget);
    if (e.target.localName === 'div') {
      const span = document.createElement('span');
      span.setAttribute('contenteditable', true);
      e.target.appendChild(span);
      span.focus();
    }
  }

  // save metrica composta di base
  app.saveCustomMetric = () => {
    const alias = document.getElementById('custom-metric-name').value;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    let arr_sql = [];
    let fields = [];
    document.querySelectorAll('#textarea-custom-metric *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I' || element.innerText.length === 0) return;
      // console.log('element : ', element);
      // console.log('element : ', element.nodeName);
      // se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
      if (element.nodeName === 'MARK') {
        arr_sql.push(`${element.dataset.tableAlias}.${element.innerText}`);
        fields.push(`${element.dataset.tableAlias}.${element.innerText}`);
      } else {
        arr_sql.push(element.innerText.trim());
      }
    });
    console.log('arr_sql : ', arr_sql);
    WorkSheet.metrics = {
      token,
      alias,
      fields, // es.:[przMedio, quantita]
      aggregateFn: 'SUM', // default
      SQL: `${arr_sql.join(' ')}`,
      distinct: false, // default
      type: 'basic'
    };
  }

  /* selezione di una colonna dalla table-preview, aggiungo la colonna alla dialog-custom-metric 
  * per la creazione di una metrica composta di base (przmedio * quantita)
  TODO: questa funzionalità andrà sostituita con il drag&drop
  */
  app.handlerSelectColumn = (e) => {
    const field = e.target.dataset.field;
    // aggiungo la metrica alla textarea-metric
    const textarea = app.dialogCustomMetric.querySelector('#textarea-custom-metric');
    const templateContent = app.tmplFormula.content.cloneNode(true);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    // mark.dataset.metricToken = e.currentTarget.dataset.metricToken;
    mark.innerText = field;
    mark.dataset.tableAlias = WorkSheet.activeTable.dataset.alias;
    textarea.appendChild(span);
    // aggiungo anche uno span per il proseguimento della scrittura della formula
    app.addSpan(textarea, null, 'metric');
  }

  // aggiunta di una nuova metrica
  app.setCustomField = (e) => {
    // TODO: apro la dialog 'dlg-custom-metric'
    app.dialogCustomMetric.show();
  }

  // dialog-metric per definire le metriche di base del WorkBook (non custom metric di base, come (przmedio*quantita))
  app.setMetric = (e) => {
    // console.log(WorkSheet.activeTable);
    const table = WorkSheet.activeTable.dataset.table;
    const tableAlias = WorkSheet.activeTable.dataset.alias;
    const field = `${tableAlias}.${e.target.dataset.field}`;
    const alias = e.target.dataset.field;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);

    // metric Map Object
    WorkSheet.metrics = {
      token,
      alias,
      field: e.target.dataset.field,
      // workBook: { table, tableAlias },
      aggregateFn: 'SUM', // default
      SQL: field,
      distinct: false, // default
      type: 'basic'
    };
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
    // const field = document.createTextNode(elementRef.dataset.field);
    // e.currentTarget.appendChild(field);
    const templateContent = app.tmplFormula.content.cloneNode(true);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    mark.dataset.token = elementRef.id;
    mark.innerText = elementRef.dataset.alias;
    app.textareaCompositeMetric.appendChild(span);
    // aggiungo anche uno span per il proseguimento della scrittura della formula
    app.addSpan(app.textareaCompositeMetric, null, 'metric');
  }

  app.columnsDropzone.addEventListener('dragenter', app.columnDragEnter, false);
  app.columnsDropzone.addEventListener('dragover', app.columnDragOver, false);
  app.columnsDropzone.addEventListener('dragleave', app.columnDragLeave, false);
  app.columnsDropzone.addEventListener('drop', app.columnDrop, false);
  app.columnsDropzone.addEventListener('drop', app.columnDragEnd, false);
  // dropzone sheet rows
  app.rowsDropzone.addEventListener('dragenter', app.rowDragEnter, false);
  app.rowsDropzone.addEventListener('dragover', app.rowDragOver, false);
  app.rowsDropzone.addEventListener('dragleave', app.rowDragLeave, false);
  app.rowsDropzone.addEventListener('drop', app.rowDrop, false);
  app.rowsDropzone.addEventListener('drop', app.rowDragEnd, false);

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

  // edit di una funzione di aggregazione sulla metrica aggiunta allo Shet
  app.editAggregate = (e) => {
    debugger;
    e.target.dataset.aggregate = e.target.innerText;
    // const id = e.target.parentElement.dataset.id;
    // Sheet.metric[id].aggregateFn = e.target.innerHTML;
  }

  // edit di un alias della metrica dopo essere stata aggiunta allo Sheet
  app.editMetricAlias = (e) => {
    const token = e.target.parentElement.dataset.token;
    Sheet.metrics.get(token).alias = e.target.innerHTML;
  }

  app.editFieldAlias = (e) => {
    const token = e.target.dataset.token;
    Sheet.fields.get(token).name = e.target.innerHTML;
  }

  // apertura dialog per creazione metrica composta
  app.btnCompositeMetric = () => app.dialogCompositeMetric.show();

  // apertura dialog con lista WorkBooks
  document.querySelector('#btn-workbook-open').onclick = () => {
    // carico elenco dei workBook presenti
    const parent = document.querySelector('nav[data-workbook-defined]');
    // reset list
    parent.querySelectorAll('li').forEach(workbook => workbook.remove());
    for (const [token, object] of Object.entries(WorkBookStorage.workBooks())) {
      const tmpl = app.tmplList.content.cloneNode(true);
      const li = tmpl.querySelector('li[data-li]');
      const span = li.querySelector('li[data-li] span');
      li.dataset.fn = 'workBookSelected';
      li.dataset.token = token;
      li.dataset.name = object.name;
      span.innerHTML = object.name;
      parent.appendChild(li);
    }
    app.dialogWorkBook.showModal();
  }

  // apertura del WorkBook
  app.workBookSelected = (e) => {
    WorkSheet = WorkSheet.open(e.currentTarget.dataset.token);
    WorkSheet.workBook.token = e.currentTarget.dataset.token;
    WorkSheet.workSheet.token = `workSheet_${e.currentTarget.dataset.token}`;
    WorkSheet.name = e.currentTarget.dataset.name;
    // modifico il nome del WorkBook in #workbook-name
    document.getElementById('workbook-name').innerText = WorkSheet.name;
    app.tablesMap();
    app.hierTables();
    app.dialogWorkBook.close();
  }

  app.openSheetDialog = (e) => {
    console.log('Sheet open');
    /* popolo la dialog con gli Sheet presenti, gli Sheet hanno un workBook_ref : token, quindi 
    * recupero solo gli Sheet appartenenti al WorkBook aperto 
    */
    const parent = document.querySelector('nav[data-sheet-defined]');
    // reset list
    parent.querySelectorAll('li').forEach(sheet => sheet.remove());
    const sheets = SheetStorage.sheets(WorkSheet.workBook.token);
    if (sheets) {
      for (const [token, object] of Object.entries(sheets)) {
        const tmpl = app.tmplList.content.cloneNode(true);
        const li = tmpl.querySelector('li[data-li]');
        const span = li.querySelector('li[data-li] span');
        li.dataset.fn = 'sheetSelected';
        li.dataset.token = token;
        span.innerHTML = object.name;
        parent.appendChild(li);
      }
      app.dialogSheet.showModal();
    }
  }

  // apertura nuovo Sheet, viene recuperato dal localStorage
  app.sheetSelected = (e) => {
    // TODO: chiamare il metodo open() dell'oggetto Sheet e seguire la stessa logica utilizzata per workBookSelected()
    Sheet = new Sheets(e.currentTarget.dataset.token, Sheet.sheet.workBook_ref);
    // reimposto tutte le proprietà della Classe
    Sheet.open();
    const name = document.getElementById('sheet-name');
    name.innerText = Sheet.name;
    name.dataset.value = Sheet.name;
    app.dialogSheet.close();
    /* TODO: Re-inserisco, nello Sheet, tutti gli elementi (fileds, filters, metrics, ecc...) 
    * della classe Sheet (come quando si aggiungono in fase di creazione Sheet)
    */
    for (const [token, field] of Sheet.fields) {
      // WARN: per il momento il target per i fields è sempre #dropzone-rows
      const target = document.getElementById('dropzone-rows');
      app.addField(target, token)
    }

    // imposto un data-selected sui filtri per rendere visibile il fatto che sono stati aggiunti al report
    for (const [token, metrics] of Sheet.metrics) {
      const target = document.getElementById('dropzone-columns');
      app.addMetric(target, token);
    }

    for (const [token, advMetrics] of Sheet.advMetrics) {
      const target = document.getElementById('dropzone-columns');
      app.addAdvMetric(target, token);
    }

    // filters
    for (const [token, filters] of Sheet.filters) {
      const filterRef = document.getElementById('ul-filters');
      filterRef.querySelector(`li[id='${token}']`).dataset.selected = 'true';
    }
    Sheet.save();
  }

  app.saveSheet = () => {
    // imposto il nome recuperandolo dallo #sheet-name
    const name = document.getElementById('sheet-name');
    Sheet.name = name.dataset.value;
    Sheet.save();
  }

  app.handlerEditSheetName = (e) => e.target.dataset.value = e.target.innerText;

  app.editWorkBookName.onblur = (e) => WorkSheet.name = e.target.innerText;

  document.getElementById('prev').onclick = () => Step.previous();

  document.getElementById('next').onclick = async () => {
    /* TODO: recupero dal DB (promise.all) tutte le tabelle mappate nel WorkBook
    * - salvo i campi delle tabelle in sessionStorage in modo da poterci accedere più rapidamente
    * - creo la struttura delle tabelle->fields nella dialog filter
    */
    if (WorkSheet.tablesMap.size !== 0) {
      let urls = [];
      for (const tableId of WorkSheet.hierTables.keys()) {
        WorkSheet.activeTable = tableId;
        // TODO: sela tabella è già presente in sessionStorage non rieseguo la query
        if (!window.sessionStorage.getItem(WorkSheet.activeTable.dataset.table)) {
          urls.push('/fetch_api/' + WorkSheet.activeTable.dataset.schema + '/schema/' + WorkSheet.activeTable.dataset.table + '/tables_info');
        }
      }
      WorkBookStorage.saveSession(await app.getTables(urls));
      Step.next();
      // gli elementi impostati nel workBook devono essere disponibili nello sheet.
      app.addTablesStruct();
      // salvo il workbook creato
      WorkSheet.save();
      const rand = () => Math.random(0).toString(36).substring(2);
      Sheet = new Sheets(rand().substring(0, 7), WorkSheet.workBook.token);
    }
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
    WorkSheet.activeTable = e.currentTarget.id;
    WorkSheet.schema = e.currentTarget.dataset.schema;
    // debugger;
    let DT = new Table(await app.getPreviewTable(), 'preview-table');
    // DataTable.data = await app.getPreviewTable();
    // console.log(DT.data);
    DT.draw();
  }

  app.process = async () => {
    // lo Sheet.id può essere già presente quando è stato aperto
    if (!Sheet.id) Sheet.id = Date.now();
    app.saveSheet();
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(Sheet.sheet);
    // console.log(params);
    // App.showConsole('Elaborazione in corso...', 'info');
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

  app.btnFilterNew = async () => {
    // creo la struttura tabelle per poter creare nuovi filtri
    let urls = [];
    for (const [tableId, value] of WorkSheet.hierTables) {
      WorkSheet.activeTable = tableId;
      urls.push('/fetch_api/' + WorkSheet.activeTable.dataset.schema + '/schema/' + WorkSheet.activeTable.dataset.table + '/table_info');
    }
    // promiseAll per recuperare tutte le tabelle del canvas, successivamente vado a popolare la dialogFilters con i dati ricevuti
    app.addWorkBookContent();
    app.dialogFilters.showModal();
  }

  // selezione della tabella dalla dialogFilters
  app.handlerSelectField = (e) => {
    WorkSheet.activeTable = e.currentTarget.dataset.tableId;
    console.log(WorkSheet.activeTable.dataset.table);
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

  // aggiungo il filtro selezionato, allo Sheet
  app.addFilter = (e) => {
    // TODO: Implementare anche qui il drag&drop per i filtri
    // Sheet.filters = e.currentTarget.id;
    Sheet.filters = WorkSheet.filters.get(e.currentTarget.id);
    e.currentTarget.dataset.selected = 'true';
    // aggiungo le tabelle all'interno del filtro a Sheet.tables
    WorkSheet.filters.get(e.currentTarget.id).tables.forEach(table => Sheet.tables = table);
    app.setSheet();
  }

  /* app.setFrom = (tableAlias) => {
    let from = {};
    if (WorkSheet.tablesMap.has(tableAlias)) {
      WorkSheet.tablesMap.get(tableAlias).forEach(tableId => {
        from[Draw.tables.get(tableId).alias] = {
          schema: Draw.tables.get(tableId).schema,
          table: Draw.tables.get(tableId).table
        }
      });
      return from;
    }
  }

  app.setJoins = (tableAlias) => {
    let joins = {};
    if (WorkSheet.tablesMap.has(tableAlias)) {
      WorkSheet.tablesMap.get(tableAlias).forEach(tableId => {
        if (WorkSheet.joins.has(Draw.tables.get(tableId).alias)) {
          for (const [token, join] of Object.entries(WorkSheet.joins.get(Draw.tables.get(tableId).alias))) {
            console.log(token, join);
            joins[token] = join;
          }
        }
      });
      return joins;
    }
  } */

  // salvataggio di un filtro in WorkSheet
  app.saveFilter = (e) => {
    // l'oggetto filter lo salvo nella Classe Sheet (ex Query.js)
    const name = document.getElementById('custom-filter-name').value;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    let object = { token, name, tables: new Set(), sql: [], from: new Map(), joins: {} };
    const textarea = document.getElementById('textarea-filter');
    document.querySelectorAll('#textarea-filter *').forEach(element => {
      // se, nell'elemento <mark> è presente il tableId allora posso recuperare anche hierToken, hierName e dimensionToken
      // ... altrimenti devo recuperare il cubeToken. Ci sono anche filtri che possono essere fatti su un livello dimensionale e su una FACT
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        // object.workBook = { table: element.dataset.table, tableAlias: element.dataset.tableAlias };
        object.tables.add(element.dataset.tableAlias);
        object.sql.push(`${element.dataset.tableAlias}.${element.dataset.field}`); // Azienda_444.id
        object.field = element.dataset.field;
      } else {
        object.sql.push(element.innerText.trim());
      }
    });
    // imposto le proprietà from e joins in base a quello che si trova in object.tables
    // object.tables contiene l'elenco delle tabelle incluse nella formula del filtro
    object.tables.forEach(table => {
      /* per ogni tabella di tablesMap, recupero le tabelle gerarchicamente inferiori e le aggiungo a 
      * object.from solo se non sono già state aggiunte da precedenti tabelle
      */
      if (WorkSheet.tablesMap.has(table)) {
        WorkSheet.tablesMap.get(table).forEach(tableId => {
          if (!object.from.has(Draw.tables.get(tableId).alias)) {
            object.from.set(Draw.tables.get(tableId).alias, {
              schema: Draw.tables.get(tableId).schema,
              table: Draw.tables.get(tableId).table
            });
          }
          // joins
          if (WorkSheet.joins.has(Draw.tables.get(tableId).alias)) {
            for (const [token, join] of Object.entries(WorkSheet.joins.get(Draw.tables.get(tableId).alias))) {
              object.joins[token] = join;
            }
          }
        });
      }
    });
    //converto from Map() in object altrimenti non può essere salvato in localStorage e DB
    object.from = Object.fromEntries(object.from);
    object.tables = [...object.tables];
    debugger;
    WorkSheet.filters = {
      token,
      value: object
    };
    // reset della textarea
    textarea.querySelectorAll('*').forEach(element => element.remove());
    // salvo il nuovo filtro appena creato
    WorkSheet.save();
    // aggiungo il filtro alla nav[data-filters-defined]
    // TODO: creare una fn "addFilter" in modo da utilizzarla sia qui che quanado apro il workbook (nel caricamento degli oggetti)
    const parent = document.getElementById('ul-filters');
    const tmpl = app.tmplList.content.cloneNode(true);
    const li = tmpl.querySelector('li[data-filter]');
    const content = li.querySelector('.li-content');
    const btnDrag = content.querySelector('i');
    const span = content.querySelector('span');
    const btnEdit = li.querySelector('i[data-id="filters-edit"]');
    // TODO: da valutare se usare id come token oppure il dataset.token
    li.id = token;
    li.dataset.type = 'filter';
    li.dataset.name = object.name;
    li.dataset.token = token;
    li.addEventListener('dragstart', app.fieldDragStart);
    li.addEventListener('dragend', app.fieldDragEnd);
    li.dataset.fn = "addFilter";
    // li.dataset.table = value.workBook.table;
    // li.dataset.alias = value.workBook.tableAlias;
    li.dataset.field = object.name;
    span.innerHTML = object.name;
    parent.appendChild(li);
  }

  app.addFiltersMetric = e => e.currentTarget.toggleAttribute('selected');

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

  app.dialogColumns.onmousedown = (e) => {
    app.coords = { x: +e.currentTarget.dataset.x, y: +e.currentTarget.dataset.y };
    if (e.target.classList.contains('title')) app.el = e.target;
  }

  app.dialogColumns.onmousemove = (e) => {
    if (app.el) {
      app.coords.x += e.movementX;
      app.coords.y += e.movementY;
      e.currentTarget.style.transform = "translate(" + app.coords.x + "px, " + app.coords.y + "px)";
      e.currentTarget.dataset.x = app.coords.x;
      e.currentTarget.dataset.y = app.coords.y;
    }
  }

  app.dialogColumns.onmouseup = () => delete app.el;

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
    return await fetch('/fetch_api/' + WorkSheet.activeTable.dataset.schema + '/schema/' + WorkSheet.activeTable.dataset.table + '/table_info')
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
    if (urls) {
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

      // ottengo le risposte separatamente
      /* return await Promise.all(urls.map(url => {
        fetch(url)
          .then(response => {
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          })
          .then(response => response.json())
          .then(data => data)
          .catch(err => {
            App.showConsole(err, 'error');
            console.error(err);
          })
      })); */

    }
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
    return await fetch('/fetch_api/' + WorkSheet.activeTable.dataset.schema + '/schema/' + WorkSheet.activeTable.dataset.table + '/table_preview')
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
  /* app.saveMetric = () => {
    const text = app.textAreaMetric.textContent;
    // cerco la metrica all'interno della textarea
    console.log(text.indexOf('NettoRiga'));
    const aggregateFn = 'AVG';
    // console.log(WorkSheet.activeTable);
    const table = WorkSheet.activeTable.dataset.table;
    const tableAlias = WorkSheet.activeTable.dataset.alias;
    debugger;
    const field = e.target.dataset.field;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    WorkSheet.metrics = {
      token,
      value: {
        alias,
        workBook: { table, tableAlias },
        formula: {
          token,
          aggregateFn,
          field,
          distinct: false,
          alias
        }
      }
    };
    WorkSheet.save();
  } */

  // creazione metrica composta
  app.saveCompositeMetric = () => {
    const alias = document.getElementById('composite-metric-name').value;
    const parent = document.getElementById('ul-metrics');
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    let object = { token, alias, sql: [], metrics: {}, type: 'composite' };
    document.querySelectorAll('#textarea-composite-metric *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        object.metrics[element.dataset.token] = element.innerText;
        // object.metrics[element.innerText] = { token: element.dataset.token, alias: element.innerText };
        object.sql.push(element.innerText);
      } else {
        object.sql.push(element.innerText.trim());
      }
    });
    console.log(object);
    WorkSheet.compositeMetrics = object;
    WorkSheet.save();
    debugger;
    // TODO: il codice che aggiunge una metrica al tablesStruct è codice ripetuto
    // aggiungo la nuova metrica nella struttura delle tabelle di sinistra
    const tmpl = app.tmplList.content.cloneNode(true);
    const li = tmpl.querySelector('li[data-li-drag][data-composite-metrics]');
    const content = li.querySelector('.li-content');
    const btnDrag = content.querySelector('i');
    const span = content.querySelector('span');
    li.id = token;
    // TODO: da impostare sull'icona drag
    li.addEventListener('dragstart', app.fieldDragStart);
    li.addEventListener('dragend', app.fieldDragEnd);
    li.addEventListener('contextmenu', app.contextMenuMetrics);
    li.dataset.type = WorkSheet.compositeMetrics.get(token).type;
    span.innerHTML = WorkSheet.compositeMetrics.get(token).alias;
    parent.appendChild(li);
  }

  app.setSheet = () => {
    // TODO: questa logica va applicata anche quando si aggiunge un filtro
    /* 
    * ogni tabella aggiunta al report comporta la ricostruzione di 'from' e 'joins'
    */
    Sheet.tables.forEach(alias => {
      console.log('tablesMap : ', WorkSheet.tablesMap);
      /* tablesMap contiene un oggetto Map() con {tableAlias : [svg-data-2, svg-data-1, svg-data-0, ecc...]}
      * e un'array di tabelle presenti nella gerarchia create nel canvas
      */
      if (WorkSheet.tablesMap.has(alias)) {
        WorkSheet.tablesMap.get(alias).forEach(tableId => {
          /* nel tableId sono presenti le tabelle gerarchicamente inferiori a 'alias', 
          * quindi tabelle da aggiungere alla 'from' e alla 'where'
          */
          Sheet.from = Draw.tables.get(tableId);
          /*
          * nel metodo joins() verifico se la tabella in ciclo ha una join 
          * (per il momento la Fact non ha altre Join però potrei utilizzare 
          * la funzionalitò di "entrare" nel livello fisico di una tabella per aggiungerci altre join)
          * ad es. : potrei aggiungere, al DocVenditaDettaglio (fact), la tabella dei TipiMovimento,
          * e quindi, in questo caso, avrei una join anche sulla Fact (e quindi nella proprietà WorkBook.joins)
          */
          // se ci sono joins per questa tableAlias la aggiungo allo Sheet
          if (WorkSheet.joins.has(Draw.tables.get(tableId).alias)) Sheet.joins = WorkSheet.joins.get(Draw.tables.get(tableId).alias);
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
    WorkSheet.tablesMap.clear();
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
        WorkSheet.tablesMap = { name: table.dataset.alias, joinTables };
      });
      levelId--;
      if (levelId !== 0) recursiveLevels(levelId);
    }
    if (levelId > 0) recursiveLevels(levelId);
  }

  app.hierTables = () => {
    // creo hierTables : qui sono presenti tutte le tabelle del canvas. Questa mi serve per creare la struttura nello WorkSheet
    // debugger;
    const levelId = +Draw.svg.dataset.level;
    WorkSheet.hierTables.clear();
    let tables = [];
    let recursiveLevels = (levelId) => {
      // per ogni tabella creo un Map() con, al suo interno, le tabelle gerarchicamente inferiori (verso la FACT)
      // questa mi servirà per stabilire, nello sheet, quali tabelle includere nella FROM e le relative Join nella WHERE
      Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}']`).forEach(table => {
        // console.log(table.dataset.alias);
        // tables = [table.id];
        // della tabella corrente recupero tutte le sue discendenze fino alla FACT
        /* let recursive = (tableId) => {
          joinTables.push(tableId);
          if (Draw.tables.get(tableId).join) recursive(Draw.tables.get(tableId).join);
        }
        if (Draw.tables.get(table.id).join) recursive(Draw.tables.get(table.id).join); */
        WorkSheet.hierTables = {
          id: table.id,
          table: {
            name: table.dataset.table,
            alias: table.dataset.alias
          }
        };
        levelId--;
        recursiveLevels(levelId);
      });
    }
    recursiveLevels(levelId);
    // console.log(WorkSheet.hierTables);
  }


  /* app.createHierarchies = () => {
    // salvo le gerarchie / dimensioni create nel canvas
    // recupero gli elementi del level-id più alto, il data-level presente su <svg> identifica il livello più alto presente
    const levelId = +Draw.svg.dataset.level;
    WorkSheet.hierarchies.clear();
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
        WorkSheet.hierarchies = hier;
      });

      levelId--;
      if (levelId !== 0) recursiveLevels(levelId);
    }
    if (levelId > 0) recursiveLevels(levelId);
  } */

  app.handlerToggleDrawer = (e) => {
    console.log('toggleDrawer');
    document.querySelector('#' + e.currentTarget.dataset.drawerId).toggleAttribute('open');
  }

  app.lineSelected = async (e) => {
    console.log(`line selected ${e.currentTarget.dataset.from} -> ${e.currentTarget.dataset.to}`);
    Draw.currentLineRef = e.target.id;
    WorkSheet.tableJoins = {
      from: Draw.currentLineRef.dataset.from,
      to: Draw.currentLineRef.dataset.to
    }
    console.log(WorkSheet.tableJoins);
    for (const [key, value] of Object.entries(WorkSheet.tableJoins)) {
      WorkSheet.activeTable = value.id;
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
      WorkSheet.join = {
        token: fieldRef.dataset.token,
        value: {
          // table: joins[0].dataset.table,
          alias: joins[1].dataset.alias,
          SQL: [`${joins[1].dataset.alias}.${joins[1].dataset.field}`, `${joins[0].dataset.alias}.${joins[0].dataset.field}`],
          from: { table: joins[1].dataset.table, alias: joins[1].dataset.alias, field: joins[1].dataset.field },
          to: { table: joins[0].dataset.table, alias: joins[0].dataset.alias, field: joins[0].dataset.field }
        }
      };
      WorkSheet.joins = fieldRef.dataset.token; // nome della tabella con le proprie join (WorkSheet.nJoin) all'interno
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
      li.dataset.tableId = WorkSheet.activeTable.id;
      li.dataset.table = WorkSheet.activeTable.dataset.table;
      li.dataset.alias = WorkSheet.activeTable.dataset.alias;
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
    const field = app.dialogColumns.dataset.field;
    const id = app.dialogColumns.querySelector('#textarea-column-id-formula');
    const ds = app.dialogColumns.querySelector('#textarea-column-ds-formula');
    let fieldObjectId = { field: id.value, type: 'da_completare', origin_field: field };
    let fieldObjectDs = { field: ds.value, type: 'da_completare', origin_field: field };
    // WorkSheet.field = { id: fieldObjectId, ds: fieldObjectDs };
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    WorkSheet.field = {
      token,
      value: {
        token,
        type: 'column',
        schema: WorkSheet.schema,
        tableAlias: WorkSheet.activeTable.dataset.alias,
        table: WorkSheet.activeTable.dataset.table,
        name: field,
        field: {
          id: fieldObjectId,
          ds: fieldObjectDs
        }
      }
    };
    WorkSheet.fields = token;
    // Storages.save();
    app.dialogColumns.close();
  }

  app.handlerMetric = (e) => {
    // TODO: aggiungo la formula della metrica (SUM(NettoRiga)) nella textarea ma, in questo caso la textarea è disabilitata.
    // nella metrica filtrata posso modificare solo la funzione di aggregazione
    console.clear();
    console.log(e.target);
    const token = e.currentTarget.dataset.token;
    // recupero la metrica da WorkSheet.metric
    console.log(WorkSheet.metrics.get(token));
    const metric = WorkSheet.metrics.get(token);
    const textarea = app.dialogMetric.querySelector('#textarea-metric');
    const tmpl = app.tmplMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('.metric-defined');
    const formula = field.querySelector('.formula');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    const fieldName = formula.querySelector('code[data-field]');
    // const span = document.createElement('span');
    aggregateFn.innerText = metric.aggregateFn;
    fieldName.innerText = metric.field;
    textarea.appendChild(field);
    // il token presente qui lo recupero in saveAdvMetric() in modo da duplicare la metrica di base ed aggiungerci l'array di filtri
    document.querySelector('#btn-metric-save').dataset.token = token;
    debugger;
    const filterDrop = document.getElementById('filter-drop');
    filterDrop.addEventListener('dragover', app.handlerDragOverFilter, false);
    filterDrop.addEventListener('dragenter', app.handlerDragEnterFilter, false);
    filterDrop.addEventListener('dragleave', app.handlerDragLeaveFilter, false);
    filterDrop.addEventListener('drop', app.handlerDropFilter, false);
    app.dialogMetric.show();
  }

  // salvataggio metrica avanzataa o di base
  app.saveMetric = (e) => {
    const alias = document.getElementById('adv-metric-name').value;
    // qui aggiungerà la metrica appena creata
    const parent = document.getElementById('ul-metrics');
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    let filters = {};
    const baseMetric = WorkSheet.metrics.get(e.target.dataset.token);
    // WARN: per il momento recupero innerText anziché dataset.aggregate perchè l'evento onBlur non viene attivato
    const aggregateFn = app.dialogMetric.querySelector('.formula > code[data-aggregate]').innerText;
    // const aggregateFn = app.dialogMetric.querySelector('.formula > code[data-aggregate]').dataset.aggregate;
    // recupero tutti i filtri droppati in #filter-drop
    app.dialogMetric.querySelectorAll('#filter-drop li').forEach(filter => {
      filters[filter.dataset.token] = WorkSheet.filters.get(filter.dataset.token);
      // TODO: ogni filtro aggiunto nella metrica deve controllare le tabelle da includere e le sue join (come fatto per setSheet)
    });
    console.log(Object.keys(filters).length);
    // TODO: se ci sono filtri la salvo in WorkSheet.advMetrics altrimenti in WorkSheet.metrics
    if (Object.keys(filters).length !== 0) {
      // TODO: aggiungere opzione 'distinct'.
      // TODO: probabilmente qui dovrò usare la stessa logica dei filtri, quindi non serve la tabelAlias
      // come key e non servono due metodi (metric e metrics)
      WorkSheet.advMetrics = {
        token,
        alias,
        field: baseMetric.field,
        aggregateFn,
        SQL: baseMetric.SQL,
        filters,
        distinct: false,
        type: 'advanced'
      };
    } else {
      debugger;
      WorkSheet.metrics = {
        token,
        alias,
        field: baseMetric.field,
        aggregateFn,
        SQL: baseMetric.SQL,
        distinct: false, // default
        type: 'basic'
      };
    }
    // salvo la nuova metrica nello WorkSheet
    WorkSheet.save();
    // TODO: il codice che aggiunge una metrica al tablesStruct è codice ripetuto
    // aggiungo la nuova metrica nella struttura delle tabelle di sinistra
    const tmpl = app.tmplList.content.cloneNode(true);
    const li = tmpl.querySelector('li[data-li-drag][data-advanced-metrics]');
    const content = li.querySelector('.li-content');
    const btnDrag = content.querySelector('i');
    const span = content.querySelector('span');
    // const btnEdit = li.querySelector('i[data-id="metric-edit"]');
    li.id = token;
    // TODO: da impostare sull'icona drag
    li.addEventListener('dragstart', app.fieldDragStart);
    li.addEventListener('dragend', app.fieldDragEnd);
    li.addEventListener('contextmenu', app.contextMenuMetrics);
    // btnEdit.dataset.table = baseMetric.workBook.table;
    // btnEdit.dataset.alias = baseMetric.workBook.tableAlias;
    // btnEdit.dataset.field = WorkSheet.metrics.get(token).field;
    // btnEdit.dataset.token = token;
    // btnEdit.addEventListener('click', app.editAdvancedMetric);
    // WARN : per il momento inserisco un IF ma sarebbe meglio usare una logica di memorizzare tutti gli elementi del report in un unico oggetto Map
    if (WorkSheet.metrics.has(token)) {
      li.dataset.type = WorkSheet.metrics.get(token).type;
      if (WorkSheet.metrics.get(token).hasOwnProperty('field')) li.dataset.field = WorkSheet.metrics.get(token).field;
      span.innerHTML = WorkSheet.metrics.get(token).alias;
    } else if (WorkSheet.advMetrics.has(token)) {
      li.dataset.type = WorkSheet.advMetrics.get(token).type;
      if (WorkSheet.advMetrics.get(token).hasOwnProperty('field')) li.dataset.field = WorkSheet.advMetrics.get(token).field;
      span.innerHTML = WorkSheet.advMetrics.get(token).alias;
    }
    // span.innerHTML = value.formula.field;
    parent.appendChild(li);
  }

  // salvataggio metrica composta
  // save compositeMetric
  app.btnCompositeMetricSave = (e) => {
    const alias = document.getElementById('composite-metric-name').value;
    const parent = document.getElementById('ul-metrics');
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    debugger;

  }


  app.addDefinedFields = (parent) => {
    if (WorkSheet.fields.has(WorkSheet.activeTable.dataset.alias)) {
      for (const [token, value] of Object.entries(WorkSheet.fields.get(WorkSheet.activeTable.dataset.alias))) {
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
        parent.appendChild(li);
      }
    }
  }

  app.addDefinedAdvMetrics = () => {
    // metriche mappate sul cubo
    const parent = app.workbookTablesStruct.querySelector('#ul-metrics');
    for (const [token, value] of WorkSheet.advMetrics) {
      const tmpl = app.tmplList.content.cloneNode(true);
      const li = tmpl.querySelector('li[data-li-drag][data-advanced-metrics]');
      const content = li.querySelector('.li-content');
      const btnDrag = content.querySelector('i');
      const span = content.querySelector('span');
      const btnEdit = li.querySelector('i[data-id="metric-edit"]');
      li.id = token;
      li.dataset.type = value.type;
      // li.dataset.id = tableId;
      // li.dataset.schema = value.schema;
      // li.dataset.table = value.workBook.table;
      li.dataset.alias = value.alias;
      if (value.field) li.dataset.field = value.field;
      // TODO: da impostare sull'icona drag
      li.addEventListener('dragstart', app.fieldDragStart);
      li.addEventListener('dragend', app.fieldDragEnd);
      // btnEdit.dataset.table = value.workBook.table;
      // btnEdit.dataset.alias = value.workBook.tableAlias;
      // btnEdit.dataset.field = value.field;
      // btnEdit.dataset.token = token;
      // btnEdit.addEventListener('click', app.editAdvancedMetric);
      span.innerHTML = value.alias;
      // span.innerHTML = value.formula.field;
      parent.appendChild(li);
    }
  }

  app.addDefinedCompositeMetrics = () => {
    // metriche mappate sul cubo
    const parent = app.workbookTablesStruct.querySelector('#ul-metrics');
    for (const [token, value] of WorkSheet.compositeMetrics) {
      const tmpl = app.tmplList.content.cloneNode(true);
      const li = tmpl.querySelector('li[data-li-drag][data-composite-metrics]');
      const content = li.querySelector('.li-content');
      const btnDrag = content.querySelector('i');
      const span = content.querySelector('span');
      const btnEdit = li.querySelector('i[data-id="metric-edit"]');
      li.id = token;
      li.dataset.type = value.type;
      li.dataset.alias = value.alias;
      // TODO: da impostare sull'icona drag
      li.addEventListener('dragstart', app.fieldDragStart);
      li.addEventListener('dragend', app.fieldDragEnd);
      // btnEdit.dataset.table = value.workBook.table;
      // btnEdit.dataset.alias = value.workBook.tableAlias;
      // btnEdit.dataset.field = value.field;
      // btnEdit.dataset.token = token;
      // btnEdit.addEventListener('click', app.editAdvancedMetric);
      span.innerHTML = value.alias;
      // span.innerHTML = value.formula.field;
      parent.appendChild(li);
    }
  }

  app.contextMenuMetrics = (e) => {
    e.preventDefault();
    console.log(e.target);
    const { clientX: mouseX, clientY: mouseY } = e;
    app.contextMenuRef.style.top = `${mouseY}px`;
    app.contextMenuRef.style.left = `${mouseX}px`;
    app.contextMenuRef.toggleAttribute('open');
  }

  app.addDefinedMetrics = () => {
    // metriche mappate sul cubo
    const parent = app.workbookTablesStruct.querySelector('#ul-metrics');
    if (WorkSheet.metrics.size !== 0) {
      for (const [token, value] of WorkSheet.metrics) {
        const tmpl = app.tmplList.content.cloneNode(true);
        const li = tmpl.querySelector('li[data-li-drag][data-base-metrics]');
        const content = li.querySelector('.li-content');
        const btnDrag = content.querySelector('i');
        const span = content.querySelector('span');
        const btnAdd = li.querySelector('i[data-id="filters-add"]');
        li.id = token;
        // TODO: questo potrei eliminarlo perchè questa lista avrà l'attributo data-base-metrics
        li.dataset.type = value.type;
        // li.dataset.id = tableId;
        // li.dataset.schema = value.schema;
        // li.dataset.table = value.workBook.table;
        // li.dataset.tableAlias = value.workBook.tableAlias;
        // la metrica przmedio*Quantita non ha la proprieta 'fields'
        if (value.field) li.dataset.field = value.field;
        li.dataset.alias = value.alias;
        // TODO: gli eventi drag dovranno essere posizionati sul btnDrag, quindi anche l'attributo id
        li.addEventListener('dragstart', app.fieldDragStart);
        li.addEventListener('dragend', app.fieldDragEnd);
        li.addEventListener('contextmenu', app.contextMenuMetrics);
        // btnAdd.dataset.table = value.workBook.table;
        // btnAdd.dataset.alias = value.workBook.tableAlias;
        btnAdd.dataset.field = value.field;
        btnAdd.dataset.token = token;
        btnAdd.addEventListener('click', app.handlerMetric);
        span.innerHTML = value.alias;
        // span.innerHTML = value.formula.field;
        parent.appendChild(li);
      }
    }
  }

  app.addDefinedFilters = () => {
    const parent = document.getElementById('ul-filters');
    // filtri mappati sul WorkBook
    for (const [token, value] of WorkSheet.filters) {
      const tmpl = app.tmplList.content.cloneNode(true);
      const li = tmpl.querySelector('li[data-filter]');
      const content = li.querySelector('.li-content');
      const btnDrag = content.querySelector('i');
      const span = content.querySelector('span');
      const btnEdit = li.querySelector('i[data-id="filters-edit"]');
      li.id = token;
      // li.dataset.type = 'filter';
      li.dataset.field = value.field;
      li.addEventListener('click', app.addFilter);
      // TODO: eventi drag sull'icona drag
      li.addEventListener('dragstart', app.fieldDragStart);
      li.addEventListener('dragend', app.fieldDragEnd);
      span.innerHTML = value.name;
      parent.appendChild(li);
    }
  }

  app.addTablesStruct = async () => {
    // ripulisco la struttura già presente.
    // TODO: in futuro dovrò aggiornare la struttura già presente (e non resettare). In questo modo, gli elementi aggiunti al report non verranno resettati
    app.workbookTablesStruct.querySelectorAll('details').forEach(detail => detail.remove());
    const parent = app.workbookTablesStruct.querySelector('#nav-fields');
    for (const [tableId, value] of WorkSheet.hierTables) {
      const tmpl = app.tmplDetails.content.cloneNode(true);
      const details = tmpl.querySelector("details");
      const li = tmpl.querySelector("li");
      const summary = details.querySelector('summary');
      WorkSheet.activeTable = tableId;
      details.dataset.alias = value.alias;
      details.dataset.table = value.name;
      summary.innerHTML = value.name;
      summary.dataset.tableId = tableId;
      parent.appendChild(details);
      app.addDefinedFields(details);
    }
    if (WorkSheet.filters.size !== 0) app.addDefinedFilters();
    app.addDefinedMetrics();
    app.addDefinedAdvMetrics();
    app.addDefinedCompositeMetrics();
  }

  // creo la struttura tabelle nelladialog-filters
  app.addWorkBookContent = () => {
    // reset
    app.dialogFilters.querySelectorAll('nav dl').forEach(element => element.remove());
    // parent
    let parent = app.dialogFilters.querySelector('nav');
    for (const [tableId, value] of WorkSheet.hierTables) {
      const tmpl = app.tmplDetails.content.cloneNode(true);
      const details = tmpl.querySelector("details");
      const summary = details.querySelector('summary');
      WorkSheet.activeTable = tableId;
      // recupero le tabelle dal sessionStorage
      const columns = WorkBookStorage.getTable(value.name);
      details.dataset.schema = WorkSheet.activeTable.dataset.schema;
      details.dataset.table = value.name;
      details.dataset.alias = value.alias;
      details.dataset.id = tableId;
      summary.innerHTML = value.name;
      summary.dataset.tableId = tableId;
      parent.appendChild(details);
      columns.forEach(column => {
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li[data-li]');
        const span = li.querySelector('span');
        li.dataset.label = column.COLUMN_NAME;
        li.dataset.fn = 'handlerSelectField';
        // li.dataset.elementSearch = `${source}-fields`;
        li.dataset.tableId = tableId;
        li.dataset.table = value.name;
        li.dataset.alias = value.alias;
        li.dataset.field = column.COLUMN_NAME;
        li.dataset.key = column.CONSTRAINT_NAME;
        span.innerText = column.COLUMN_NAME;
        // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
        let pos = column.DATA_TYPE.indexOf('(');
        let type = (pos !== -1) ? column.DATA_TYPE.substring(0, pos) : column.DATA_TYPE;
        span.dataset.type = type;
        // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
        // li.dataset.id = key;
        // span.id = key;
        // li.dataset.fn = 'addFieldToJoin';
        details.appendChild(li);
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

  app.textareaCompositeMetric.addEventListener('dragenter', app.textareaDragEnter, false);
  app.textareaCompositeMetric.addEventListener('dragover', app.textareaDragOver, false);
  app.textareaCompositeMetric.addEventListener('dragleave', app.textareaDragLeave, false);
  app.textareaCompositeMetric.addEventListener('drop', app.textareaDrop, false);

})();
