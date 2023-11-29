// TODO le funzioni che non utilizzano la classe WorkBook possono essere spostate in supportFn.js
var App = new Application();
var Draw = new DrawSVG('svg');
var SheetStorage = new SheetStorages();
var WorkBookStorage = new Storages();
var WorkBook = new WorkBooks('WorkBook 1');
var Dashboard = new Dashboards();
var Sheet;
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    tmplJoin: document.getElementById('tmpl-join-field'),
    tmplFilterDropped: document.getElementById('tmpl-filter-dropped-adv-metric'),
    tmplContextMenu: document.getElementById('tmpl-context-menu-content'),
    contextMenuRef: document.getElementById('context-menu'),
    contextMenuTableRef: document.getElementById('context-menu-table'),
    contextMenuColumnRef: document.getElementById('context-menu-column'),
    tmplDetails: document.getElementById('tmpl-details-element'),
    tmplColumnsDefined: document.getElementById('tmpl-columns-defined'),
    tmplMetricsDefined: document.getElementById('tmpl-metrics-defined'),
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
    dialogMetric: document.getElementById('dlg-metric'),
    dialogCustomMetric: document.getElementById('dlg-custom-metric'),
    dialogCompositeMetric: document.getElementById('dlg-composite-metric'),
    dialogRename: document.getElementById('dialog-rename'),
    dialogJoin: document.getElementById('dlg-join'),
    dialogColumns: document.getElementById('dlg-columns'),
    dialogTime: document.getElementById('dialog-time'),
    dialogInfo: document.getElementById('dlg-info'),
    dialogSchema: document.getElementById('dlg-schema'),
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
    filtersDropzone: document.getElementById('dropzone-filters'),
    textareaCompositeMetric: document.getElementById('textarea-composite-metric'),
    // buttons
    btnVersioning: document.getElementById('btn-versioning')
  }

  document.body.addEventListener('mousemove', (e) => {
    // console.log({ clientX: e.clientX, clientY: e.clientY, offsetX: e.offsetX, offsetY: e.offsetY, pageX: e.pageX, pageY: e.pageY, x: e.x, y: e.y });
  }, false);

  const rand = () => Math.random(0).toString(36).substring(2);
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };

  App.init();

  google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });

  // Chiudo qualsiasi context-menu aperto
  app.body.addEventListener('click', () => {
    document.querySelectorAll('.context-menu[open]').forEach(menu => menu.toggleAttribute('open'));
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
            if (node.hasAttribute('data-context-fn')) node.addEventListener('contextmenu', app[node.dataset.contextFn]);

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

  app.contextMenuTable = (e) => {
    e.preventDefault();
    // console.log(e.target.getBoundingClientRect());
    // const { clientX: mouseX, clientY: mouseY } = e;
    // const { left: mouseX, top: mouseY } = e.target.getBoundingClientRect();
    const { left: mouseX, bottom: mouseY } = e.currentTarget.getBoundingClientRect();
    app.contextMenuTableRef.style.top = `${mouseY + 8}px`;
    app.contextMenuTableRef.style.left = `${mouseX}px`;
    // Imposto la tabella attiva, su cui si è attivato il context-menu
    WorkBook.activeTable = e.currentTarget.id;
    // Chiudo eventuali dlg-info aperte sul mouseEnter della use.table
    if (document.querySelector('#dlg-info[open]')) app.dialogInfo.close();
    app.contextMenuTableRef.toggleAttribute('open');
    // Imposto, sugli elementi del context-menu, l'id della tabella selezionata
    document.querySelectorAll('#ul-context-menu-table button').forEach(item => item.dataset.id = WorkBook.activeTable.id);
  }

  app.openContextMenu = (e) => {
    e.preventDefault();
    // console.log(e.target.id);
    console.log(e.currentTarget.id);
    // reset #context-menu
    if (app.contextMenuRef.hasChildNodes()) app.contextMenuRef.querySelector('*').remove();
    const tmpl = app.tmplContextMenu.content.cloneNode(true);
    const content = tmpl.querySelector(`#${e.currentTarget.dataset.contextmenu}`);
    // aggiungo, a tutti gli elementi del context-menu, il token dell'elemento selezionato
    content.querySelectorAll('button').forEach(button => {
      button.dataset.token = e.currentTarget.id;
      if (button.dataset.button === 'delete' && Sheet.edit) button.disabled = 'true';
    });
    app.contextMenuRef.appendChild(content);

    const { clientX: mouseX, clientY: mouseY } = e;
    app.contextMenuRef.style.top = `${mouseY}px`;
    app.contextMenuRef.style.left = `${mouseX}px`;
    app.contextMenuRef.toggleAttribute('open');
  }

  // Aggiunta metrica composta di base
  app.addCustomMetric = () => {
    // carico elenco metrica composte di base
    const ul = document.getElementById('ul-custom-metrics');
    // ul.querySelectorAll('li').forEach(metric => metric.remove());
    // delete document.querySelector('#btn-custom-metric-save').dataset.token;
    for (const [key, value] of WorkBook.metrics) {
      // console.log(key, value);
      if (value.hasOwnProperty('fields')) {
        // è una metrica composta di base, quindi definita sul cubo (es. przmedio * quantita)
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li[data-li-icon]');
        const span = li.querySelector('span');
        const btnEdit = li.querySelector('button[data-edit]');
        const btnRemove = li.querySelector('button[data-delete]');
        li.dataset.token = value.token;
        li.dataset.label = value.alias;
        li.dataset.elementSearch = 'custom-metrics';
        btnEdit.dataset.token = value.token;
        btnRemove.dataset.metricToken = value.token;
        span.innerText = value.alias;
        ul.appendChild(li);
      }
    }
    app.dialogCustomMetric.show();
    app.contextMenuTableRef.toggleAttribute('open');
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
    // app.addTablesStruct() per popolare la ppagina 'Sheet'
    WorkBook.hierTables.get(WorkBook.activeTable.id).name = input.value;
    // WorkBook.svg
    Draw.tables.get(WorkBook.activeTable.id).name = input.value;
    app.dialogRename.close();
    WorkBook.checkChanges(`alias-${input.value}`);
  }

  /* NOTE: DRAG&DROP EVENTS */

  app.handlerDragStart = (e) => {
    // console.log('e.target : ', e.target.id);
    e.target.classList.add('dragging');
    app.dragElementPosition = { x: e.offsetX, y: e.offsetY };
    // console.log(app.dragElementPosition);
    e.dataTransfer.setData('text/plain', e.target.id);
    // creo la linea
    if (Draw.svg.querySelectorAll('.table').length > 0) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const token = rand().substring(0, 4);
      // line.id = `line-${Draw.svg.querySelectorAll('use.table').length}`;
      // line.dataset.id = Draw.svg.querySelectorAll('use.table').length;
      line.id = `line-${token}`;
      line.dataset.id = token;
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
        // TODO: da commentare (...viene utilizzato il calcolo dell'ipotenusa)
        let nearestTable = [...Draw.svg.querySelectorAll('use.table')].reduce((prev, current) => {
          return (Math.hypot(e.offsetX - (+current.dataset.x + 180), e.offsetY - (+current.dataset.y + 15)) < Math.hypot(e.offsetX - (+prev.dataset.x + 180), e.offsetY - (+prev.dataset.y + 15))) ? current : prev;
        });
        // console.log(nearestTable.id);
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
              to: Draw.tableJoin.table.id,
              from: { x: (e.offsetX - app.dragElementPosition.x - 10), y: (e.offsetY - app.dragElementPosition.y + 17.5) } // in questo caso non c'è l'id della tabella perchè questa deve essere ancora droppata, metto le coordinate e.offsetX, e.offsetY
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
      // se la tabella non è presente in sessionStorage la scarico
      if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) WorkBookStorage.saveSession(await app.getTable());
      // se sono presenti almeno due tabelle visualizzo la dialog per la join
      if (Draw.countTables > 1) {
        WorkBook.tableJoins = {
          from: app.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableId,
          to: app.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableId
        }
        // console.log(WorkBook.tableJoins);
        for (const [key, value] of Object.entries(WorkBook.tableJoins)) {
          WorkBook.activeTable = value.id;
          const data = WorkBookStorage.getTable(WorkBook.activeTable.dataset.table);
          app.addFields(key, data);
        }
      }
    }
    // creo una mappatura di tutte le tabelle del Canvas
    app.tablesMap();
    // creo una mappatura per popolare il WorkBook nello step successivo
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
    const time = Date.now().toString();
    const tableId = time.substring(time.length - 5);
    // const tableId = Draw.svg.querySelectorAll('use.table').length;
    let coords;
    // TODO: alias per la tabella appena aggiunta (in sospeso)
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
            to: { x: coords.x + 180, y: coords.y + 15 },
            from: { x: coords.x - 10, y: coords.y + 15 }
          },
          table: liElement.dataset.label,
          alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
          name: liElement.dataset.label,
          schema: liElement.dataset.schema,
          join: null,
          joins: 0,
          levelId: 0
        }
      };
    } else {
      // è presente una tableJoin
      // imposto data.joins anche sull'elemento SVG
      // OPTIMIZE: potrei creare un Metodo nella Classe Draw che imposta la prop 'join'
      // ...in Draw.tables e, allo stesso tempo, imposta anche 'dataset.joins'
      // ...sull'elemento 'use.table' come fatto sulle due righe successive
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
          // console.log(levelId);
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
      // imposto la proprietà 'tables' della Classe Draw
      Draw.tables = {
        id: `svg-data-${tableId}`, properties: {
          id: tableId,
          key: `svg-data-${tableId}`,
          x: coords.x,
          y: coords.y,
          line: {
            to: { x: coords.x + 180, y: coords.y + 15 },
            from: { x: coords.x - 10, y: coords.y + 15 }
          },
          table: liElement.dataset.label,
          alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
          name: liElement.dataset.label,
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
          to: Draw.tableJoin.table.id,
          from: `svg-data-${tableId}`
        }
      };
      // console.info('create JOIN');
      app.openJoinWindow();
    }
    Draw.currentTable = Draw.tables.get(`svg-data-${tableId}`);
    // creo nel DOM la tabella appena droppata
    Draw.drawTable();
    // imposto la tabella attiva per poter scaricare le colonne in sessionStorage (in handlerDragEnd())
    WorkBook.activeTable = `svg-data-${tableId}`;
    // imposto event contextmenu
    Draw.svg.querySelector(`#${Draw.currentTable.key}`).addEventListener('contextmenu', app.contextMenuTable);
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
    const btnRemove = tmpl.querySelector('button[data-remove]');
    const btnUndo = tmpl.querySelector('button[data-undo]');
    btnRemove.dataset.metricToken = token;
    btnUndo.dataset.metricToken = token;
    // const formula = field.querySelector('.formula');
    const aggregateFn = field.querySelector('code[data-aggregate]');
    const fieldName = field.querySelector('span[data-field]');
    const metric = Sheet.metrics.get(token);
    field.dataset.type = metric.type;
    field.dataset.id = metric.token;
    field.dataset.label = metric.alias;
    aggregateFn.dataset.metricId = metric.token;
    // Se lo Sheet è in modifica imposto il dataset 'added'
    (!Sheet.edit) ? field.dataset.added = 'true' : field.dataset.adding = 'true';
    // formula.dataset.id = metric.token;
    // formula.dataset.token = metric.token;
    fieldName.innerHTML = `(${metric.alias})`;
    if (metric.metric_type !== 'composite') {
      aggregateFn.innerText = metric.aggregateFn;
      // fieldName.dataset.field = metric.field;
    }
    target.appendChild(field);
  }

  app.columnDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
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
    // const metric = WorkBook.metrics.get(elementRef.id);
    switch (metric.metric_type) {
      case 'basic':
      case 'advanced':
        // aggiungo a Sheet.metrics solo gli elementi che possono essere modificati, le proprieta di sola lettura le prenderò sempre da WorkBook.metrics
        Sheet.metrics = { token: metric.token, alias: metric.alias, type: metric.metric_type, aggregateFn: metric.aggregateFn, dependencies: false };
        app.addMetric(e.currentTarget, elementRef.id);
        break;
      case 'composite':
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
            Sheet.metrics = { token: nestedMetric.token, alias: nestedMetric.alias, type: nestedMetric.metric_type, aggregateFn: nestedMetric.aggregateFn, dependencies: true };
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
    const tmplFilter = app.tmplFilterDropped.content.cloneNode(true);
    const li = tmplFilter.querySelector('li');
    const span = li.querySelector('span');
    const btnRemove = li.querySelector('button');
    li.dataset.token = elementRef.id;
    span.innerText = WorkBook.filters.get(elementRef.id).name;
    btnRemove.dataset.token = elementRef.id;
    e.target.appendChild(li);
  }

  app.removeFilterByAdvMetric = (e) => {

    debugger;
  }

  app.rowDragLeave = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  /* sezione #sheet-filters*/
  app.filterDragEnter = (e) => {
    e.preventDefault();
    console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
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

  app.filterDragOver = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.filterDragLeave = (e) => {
    e.preventDefault();
    // console.log(e.currentTarget);
    e.currentTarget.classList.remove('dropping');
  }

  app.addFilters = (target, elementRef) => {
    const tmpl = app.tmplFiltersDefined.content.cloneNode(true);
    const field = tmpl.querySelector('.filter-defined');
    const span = field.querySelector('span');
    const btnRemove = field.querySelector('button[data-remove]');
    const btnUndo = field.querySelector('button[data-undo]');
    field.dataset.type = 'filter';
    field.dataset.id = elementRef.id;
    (!Sheet.edit) ? field.dataset.added = 'true' : field.dataset.adding = 'true';
    btnRemove.dataset.filterToken = elementRef.id;
    btnUndo.dataset.filterToken = elementRef.id;
    span.dataset.token = elementRef.id;
    span.innerHTML = elementRef.dataset.label;
    target.appendChild(field);
  }

  app.filterDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    console.log(elementRef);
    Sheet.filters = elementId;
    app.addFilters(e.currentTarget, elementRef);
  }

  app.rowDragEnd = (e) => {
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'copy') {

    }
  }

  /* sezione #side-sheet-filters*/

  /* addField viene utilizzate sia quando si effettua il drag&drop sulla dropzone-rows che
  * quando si apre un nuovo Sheet per ripololare la dropzone-rows con gli elementi proveniente da Sheet.open()
  */
  app.addField = (target, token) => {
    // aggiunti allo sheet avranno un attributo (su .column-defined) data-added
    const tmpl = app.tmplColumnsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('.column-defined');
    const code = field.querySelector('code');
    const btnRemove = field.querySelector('button[data-remove]');
    const btnUndo = field.querySelector('button[data-undo]');
    field.dataset.type = 'column';
    field.dataset.label = Sheet.fields.get(token);
    field.dataset.id = token;
    // if (!Sheet.edit) field.dataset.added = 'true';
    // In edit:true imposto il dataset.adding altrimenti dataset.added
    (!Sheet.edit) ? field.dataset.added = 'true' : field.dataset.adding = 'true';
    btnRemove.dataset.columnToken = token;
    btnUndo.dataset.columnToken = token;
    // field.dataset.token = elementRef.id;
    code.dataset.token = token;
    code.innerHTML = Sheet.fields.get(token);
    // aggiungo la colonna al report (Sheet)
    // TODO aggiungere a Sheet.fields solo le proprietà utili alla creazione della query
    // Sheet.fields = { token: elementRef.id, value: WorkBook.field.get(elementRef.id) };
    // passo, a Sheet.fields, la colonna creata in WorkBook
    // Sheet.fields = WorkBook.field.get(elementRef.id);
    // TODO da aggiungere in fase di creazione del process
    Sheet.tables = WorkBook.field.get(token).tableAlias;
    target.appendChild(field);
    // TODO impostare qui gli eventi che mi potranno servire in futuro (per editare o spostare questo elemento droppato)
    // i.addEventListener('click', app.handlerSetMetric);
    // app.setSheet();
  }

  app.rowDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    // console.log(elementRef);
    // elementRef : è l'elemento nella lista di sinistra che ho draggato
    // TODO: rinominare elementRef.id in elementRef.dataset.token
    // salvo, in Sheet.fields, solo il token, mi riferirò a questo elemento dalla sua definizione in WorkBook.fields
    Sheet.fields = { token: elementRef.id, name: WorkBook.field.get(elementRef.id).name };
    app.addField(e.currentTarget, elementRef.id);
  }

  app.rowDragEnd = (e) => {
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'copy') {

    }
  }

  // click all'interno di una textarea
  // TODO: da spostare in supportFn.js
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

  // Modifica di una metrica composta di base
  app.editCustomMetric = (e) => {
    const metric = WorkBook.metrics.get(e.currentTarget.dataset.token);
    const textarea = document.getElementById('textarea-custom-metric');
    const btnMetricSave = document.getElementById('btn-custom-metric-save');
    const inputName = document.getElementById('custom-metric-name');
    inputName.value = metric.alias;
    btnMetricSave.dataset.token = e.currentTarget.dataset.token;
    metric.formula.forEach(element => {
      if (element.hasOwnProperty('tableAlias')) {
        const templateContent = app.tmplCompositeFormula.content.cloneNode(true);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        mark.dataset.tableAlias = element.tableAlias;
        mark.innerText = element.field;
        textarea.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('tabindex', 0);
        span.innerText = element;
        textarea.appendChild(span);
      }
    });
  }

  // salva metrica composta di base
  app.saveCustomMetric = (e) => {
    // se presente il dataset.token sul btn-custom-metric-save sto modificando la metrica, altrimenti
    // è una nuova metrica
    const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
    const alias = document.getElementById('custom-metric-name').value;
    let arr_sql = [];
    let fields = [], formula = [];
    document.querySelectorAll('#textarea-custom-metric *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'I' || element.innerText.length === 0) return;
      // se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
      if (element.nodeName === 'MARK') {
        arr_sql.push(`${element.dataset.tableAlias}.${element.innerText}`);
        fields.push(`${element.dataset.tableAlias}.${element.innerText}`);
        formula.push({ tableAlias: element.dataset.tableAlias, field: element.innerText });
      } else {
        arr_sql.push(element.innerText.trim());
        formula.push(element.innerText.trim());
      }
    });
    // console.log('arr_sql : ', arr_sql);
    WorkBook.metrics = {
      token,
      alias,
      fields, // es.:[przMedio, quantita]
      formula: formula,
      aggregateFn: 'SUM', // default
      SQL: `${arr_sql.join(' ')}`,
      distinct: false, // default
      type: 'metric',
      metric_type: 'basic'
    };
    WorkBook.checkChanges(token);
    app.dialogCustomMetric.close();
  }

  /* selezione di una colonna dalla table-preview, aggiungo la colonna alla dialog-custom-metric
  * per la creazione di una metrica composta di base (przmedio * quantita)
  TODO: questa funzionalità andrà sostituita con il drag&drop
  */
  app.handlerSelectColumn = (e) => {
    const field = e.target.dataset.field;
    // aggiungo la metrica alla textarea-metric
    const textarea = app.dialogCustomMetric.querySelector('#textarea-custom-metric');
    const templateContent = app.tmplCompositeFormula.content.cloneNode(true);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    // mark.dataset.metricToken = e.currentTarget.dataset.metricToken;
    mark.innerText = field;
    mark.dataset.tableAlias = WorkBook.activeTable.dataset.alias;
    textarea.appendChild(span);
    // aggiungo anche uno span per il proseguimento della scrittura della formula
    app.addSpan(textarea, null, 'metric');
  }

  // dialog-metric per definire le metriche di base del WorkBook (non custom metric di base, come (przmedio*quantita))
  app.setMetric = (e) => {
    // console.log(WorkBook.activeTable);
    // const table = WorkBook.activeTable.dataset.table;
    const tableAlias = WorkBook.activeTable.dataset.alias;
    const field = `${tableAlias}.${e.target.dataset.field}`;
    const alias = e.target.dataset.field;
    const token = rand().substring(0, 7);

    // metric Map Object
    WorkBook.metrics = {
      token,
      alias,
      field: e.target.dataset.field,
      aggregateFn: 'SUM', // default
      SQL: field,
      distinct: false, // default
      type: 'metric',
      metric_type: 'basic'
    };
    WorkBook.checkChanges(token);
  }

  // apro la dialog column per definire le colonne del WorkBook
  // TODO: da spostare in supportFn.js
  app.setColumn = (e) => {
    app.dialogColumns.dataset.field = e.currentTarget.dataset.field;
    document.getElementById('column-name').value = e.currentTarget.dataset.field;
    const table = WorkBook.activeTable.dataset.table;
    const alias = WorkBook.activeTable.dataset.alias;
    const field = e.currentTarget.dataset.field;
    const id = document.querySelector('#textarea-column-id');
    const ds = document.querySelector('#textarea-column-ds');
    app.addMark({ table, alias, field }, id);
    app.addMark({ table, alias, field }, ds);
    // carico elenco tabelle del canvas
    app.loadTableStruct();
    app.dialogColumns.show();
  }

  app.editColumn = (e) => {
    app.dialogColumns.dataset.field = e.currentTarget.dataset.field;
    // la colonna già definita avrà sicuramente un token, lo imposto sul tasto 'salva'
    // per poter aggiornare la colonna e non inserirne una nuova
    document.querySelector('#btn-columns-define').dataset.token = e.currentTarget.dataset.token;
    const textAreaId = document.querySelector('#textarea-column-id');
    const textAreaDs = document.querySelector('#textarea-column-ds');
    // token della colonna già definita
    // console.log(WorkBook.field.get(e.currentTarget.dataset.token));
    // Nella proprietà 'field.id[ds].formula' è presente l'oggetto che
    // consente di ricostruire la formula (come per i filtri o le metriche composte)
    const column = WorkBook.field.get(e.currentTarget.dataset.token);
    // TODO: Il codice che crea il mark, per le formule, è ripetuto, sia qui che
    // per quanto riguarda i filtri, scrivere una fn per non duplicare il codice
    column.field.id.formula.forEach(element => {
      if (element.hasOwnProperty('field')) {
        // determino il <mark>
        const templateContent = app.tmplFormula.content.cloneNode(true);
        const i = templateContent.querySelector('i');
        i.addEventListener('click', app.cancelFormulaObject);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        const small = templateContent.querySelector('small');
        mark.dataset.tableAlias = element.table_alias;
        mark.dataset.table = element.table;
        mark.dataset.field = element.field;
        mark.innerText = element.field;
        small.innerText = element.table;
        textAreaId.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.dataset.check = 'column';
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('tabindex', 0);
        span.innerText = element;
        textAreaId.appendChild(span);
      }
    });
    column.field.ds.formula.forEach(element => {
      if (element.hasOwnProperty('field')) {
        // determino il <mark>
        const templateContent = app.tmplFormula.content.cloneNode(true);
        const i = templateContent.querySelector('i');
        i.addEventListener('click', app.cancelFormulaObject);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        const small = templateContent.querySelector('small');
        mark.dataset.tableAlias = element.table_alias;
        mark.dataset.table = element.table;
        mark.dataset.field = element.field;
        mark.innerText = element.field;
        small.innerText = element.table;
        textAreaDs.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.dataset.check = 'column';
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('tabindex', 0);
        span.innerText = element;
        textAreaDs.appendChild(span);
      }
    });
    // imposto il nome della colonna assegnato in fase di creazione, prop name
    document.getElementById('column-name').value = column.name;
    app.loadTableStruct();
    WorkBook.checkChanges(e.currentTarget.dataset.token);
    app.dialogColumns.show();
  }

  // Cancellazione della colonna precedentemente definita in WorkBook.table[s]
  app.removeColumn = (e) => {
    // WARN: attenzione perchè la colonna potrebbe essere stata usata in qualche report
    // Stabilire se la colonna può essere eliminata, anche se utilizzata sugli Sheet (in questo caso
    // eliminerò a cascata su tutti gli Sheet questa colonna) oppure disabilitare 'Elimina colonna'
    // se questa è utilizzata sugli Sheet

    // console.log(WorkBook.workBook.token);
    const workbook_ref = WorkBook.workBook.token;

    // WorkBook.activeTable è già valorizzato, quando si seleziona la tabella dal canvas
    // Elimino l'oggetto all'interno del Map 'fields'
    delete WorkBook.fields.get(WorkBook.activeTable.dataset.alias)[e.currentTarget.dataset.token];
    WorkBook.field.delete(e.currentTarget.dataset.token);
    // verifico che l'oggetto Map con l'alias della tabella contenga altri elementi, altrimenti
    // devo eliminare anche workBook.fields(tableAlias)
    if (Object.keys(WorkBook.fields.get(WorkBook.activeTable.dataset.alias)).length === 0) {
      WorkBook.fields.delete(WorkBook.activeTable.dataset.alias);
    }
    delete document.querySelector(`#preview-table th[data-token='${e.currentTarget.dataset.token}']`).dataset.token;

    // TODO: Visualizzare un avviso che indica la cancellazione della colonna anche su tutti gli sheet dove è stato creato

    // 1 - Cerco lo sheet, nello storage, con workbook_ref relativo a questo workbook
    // 2 - Elimino la colonna all'interno della prop 'fields'
    const sheets = SheetStorage.sheets(workbook_ref);
    // WARN: se sono presenti sheet, li aggiorno, però c'è da valutare se annullare la cache del datamart
    // altrimenti le colonne dello sheet non corrispondono a quelle impostate in righe/colonne (nella pagina)
    if (sheets) {
      for (const value of Object.values(sheets)) {
        delete value.fields[e.currentTarget.dataset.token];
        value.updated_at = new Date().toLocaleDateString('it-IT', options);
        SheetStorage.save(value);
      }
    }
    WorkBook.checkChanges(e.currentTarget.dataset.token);
  }

  app.removeWBMetric = (e) => {
    console.log(e.currentTarget.dataset.metricToken);
    const workbook_ref = WorkBook.workBook.token;
    // WorkBook.activeTable è già valorizzato, quando si seleziona la tabella dal canvas
    WorkBook.metrics.delete(e.currentTarget.dataset.metricToken);
    // verifico che l'oggetto Map con l'alias della tabella contenga altri elementi, altrimenti
    // devo eliminare anche workBook.fields(tableAlias)
    if (WorkBook.metrics.size === 0) WorkBook.metrics.clear();
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

  app.contextMenuColumn = (e) => {
    e.preventDefault();
    if (!e.currentTarget.dataset.id) return false;
    // console.log(e.target.getBoundingClientRect());
    // const { clientX: mouseX, clientY: mouseY } = e;
    // const { right: mouseX, top: mouseY } = e.target.getBoundingClientRect();
    // const { left: mouseX, top: mouseY } = e.currentTarget.getBoundingClientRect();
    const { left: mouseX, bottom: mouseY } = e.currentTarget.getBoundingClientRect();
    // console.log(e.currentTarget.getBoundingClientRect());
    app.contextMenuColumnRef.style.top = `${mouseY + 4}px`;
    app.contextMenuColumnRef.style.left = `${mouseX + 4}px`;
    // Imposto la tabella attiva, su cui si è attivato il context-menu
    WorkBook.activeTable = e.currentTarget.dataset.id;
    // Imposto, sugli elementi del context-menu, l'id della tabella selezionata
    app.contextMenuColumnRef.toggleAttribute('open');
    document.querySelectorAll('#ul-context-menu-column button').forEach(item => {
      // imposto il data-token solo sui tasti 'Elimina' e 'Modifica' (colonna o metrica già definita)
      // console.log(item);
      item.removeAttribute('disabled');
      item.dataset.field = e.currentTarget.dataset.field;
      switch (item.id) {
        case 'btn-remove-wb-metric':
          (e.currentTarget.dataset.metricToken) ? item.dataset.metricToken = e.currentTarget.dataset.metricToken : item.disabled = 'true';
          break;
        case 'btn-edit-column':
        case 'btn-remove-column':
          // Disabilito le voci 'elimina/modifica' se non è presente il token (colonna non definita nel workbook)
          (e.currentTarget.dataset.token) ? item.dataset.token = e.currentTarget.dataset.token : item.disabled = 'true';
          break;
        default:
          break;
      }
    });
  }

  app.loadTableStruct = () => {
    // reset
    document.querySelectorAll('nav#table-field-list dl').forEach(element => element.remove());
    let parent = document.getElementById('table-field-list');
    for (const [tableId, value] of WorkBook.hierTables) {
      const tmpl = app.tmplDetails.content.cloneNode(true);
      const details = tmpl.querySelector("details");
      const summary = details.querySelector('summary');
      // recupero le tabelle dal sessionStorage
      const columns = WorkBookStorage.getTable(value.table);
      details.dataset.schema = value.schema;
      details.dataset.table = value.name;
      details.dataset.alias = value.alias;
      details.dataset.id = tableId;
      details.dataset.searchId = 'field-search';
      summary.innerHTML = value.name;
      summary.dataset.tableId = tableId;
      parent.appendChild(details);
      columns.forEach(column => {
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li[data-li]');
        const span = li.querySelector('span');
        li.dataset.label = column.COLUMN_NAME;
        li.dataset.fn = 'addToColumnFormula';
        li.dataset.elementSearch = 'fields';
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

  app.addMark = (data, ref) => {
    const templateContent = app.tmplFormula.content.cloneNode(true);
    const i = templateContent.querySelector('i');
    i.addEventListener('click', app.cancelFormulaObject);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    const small = templateContent.querySelector('small');
    // aggiungo il tableAlias e table come attributo.
    mark.dataset.tableAlias = data.alias;
    mark.dataset.table = data.table;
    mark.dataset.field = data.field;
    mark.innerText = data.field;
    small.innerText = data.table;
    ref.appendChild(span);
  }

  app.addToColumnFormula = (e) => {
    WorkBook.activeTable = e.currentTarget.dataset.tableId;
    console.log(WorkBook.activeTable.dataset.table);
    const field = e.currentTarget.dataset.field;
    const table = e.currentTarget.dataset.table;
    const alias = e.currentTarget.dataset.alias;
    console.log(field);
    // textarea
    const txtArea = document.querySelector('.textarea-content[data-active]');
    app.addMark({ table, alias, field }, txtArea);
    // app.addSpan(txtArea, null, 'column');
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
    debugger;
    const templateContent = app.tmplCompositeFormula.content.cloneNode(true);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    mark.dataset.token = elementRef.id;
    mark.innerText = WorkBook.metrics.get(elementRef.id).alias;
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

  // dropzone #side-sheet-filters
  app.filtersDropzone.addEventListener('dragenter', app.filterDragEnter, false);
  app.filtersDropzone.addEventListener('dragover', app.filterDragOver, false);
  app.filtersDropzone.addEventListener('dragleave', app.filterDragLeave, false);
  app.filtersDropzone.addEventListener('drop', app.filterDrop, false);
  app.filtersDropzone.addEventListener('drop', app.filterDragEnd, false);

  /* NOTE: END DRAG&DROP EVENTS */

  // selezione schema/i
  // TODO: da spostare in supportFn.js
  app.handlerSchema = async (e) => {
    e.preventDefault();
    e.currentTarget.toggleAttribute('data-selected');
    if (e.currentTarget.hasAttribute('data-selected')) {
      const schema = e.currentTarget.dataset.schema;
      // recupero le tabelle dello schema selezionato
      const data = await getDatabaseTable(schema);
      console.log(data);
      // TODO: attivo i tasti ("Crea dimensione", "Modifica dimensione", "Crea cubo", ecc...)
      let ul = document.getElementById('ul-tables');
      for (const [key, value] of Object.entries(data)) {
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li[data-li-drag]');
        const span = li.querySelector('span');
        li.dataset.fn = "showTablePreview";
        li.dataset.label = value.TABLE_NAME;
        li.dataset.schema = schema;
        li.dataset.elementSearch = 'tables';
        li.ondragstart = app.handlerDragStart;
        li.ondragend = app.handlerDragEnd;
        li.id = 'table-' + key;
        span.innerText = value.TABLE_NAME;
        ul.appendChild(li);
      }
      app.dialogSchema.close();
    }
  }

  /* NOTE: ONCLICK EVENTS*/

  // TODO: da spostare in supportFn.js
  app.handlerWorkSheetSearch = (e) => {
    // l'attributo data-id contiene l'id della input da attivare per la ricerca
    const input = document.getElementById(e.target.dataset.id);
    input.removeAttribute('readonly');
    input.focus();
  }

  // edit di una funzione di aggregazione sulla metrica aggiunta allo Sheet
  app.editAggregate = (e) => {
    e.target.dataset.aggregate = e.target.innerText;
    const token = e.target.dataset.metricId;
    // console.log(Sheet.metrics.get(token).aggregateFn);
    // console.log(Sheet.sheet.metrics[token].aggregateFn);
    Sheet.metrics.get(token).aggregateFn = e.target.innerText;
  }

  // edit di un alias della metrica dopo essere stata aggiunta allo Sheet
  app.editMetricAlias = (e) => {
    const token = e.target.parentElement.dataset.token;
    Sheet.metrics.get(token).alias = e.target.innerHTML;
  }

  app.editFieldAlias = (e) => {
    const token = e.target.dataset.token;
    Sheet.fields = { token, name: e.target.innerHTML };
    console.log(Sheet.fields.get(token));
  }

  // apertura dialog per creazione metrica composta
  // TODO: da spostare in supportFn.js
  app.btnCompositeMetric = () => {
    // recupero le coordinate di section[data-worksheet-object][data-section=3] (metriche)
    // per visualizzare la dialog vicino alla sezione metriche
    // const metricSection = document.querySelector("#workbook-objects section[data-section='3']");
    // const { right: mouseX, top: mouseY } = metricSection.getBoundingClientRect();
    // app.dialogCompositeMetric.style.top = `${mouseY - 64}px`;
    // app.dialogCompositeMetric.style.left = `${mouseX - 50}px`;
    app.dialogCompositeMetric.show();
  }

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

  app.checkSessionStorage = async () => {
    // TODO: scarico in sessionStorage tutte le tabelle del canvas
    let urls = [];
    for (const tableId of WorkBook.hierTables.keys()) {
      WorkBook.activeTable = tableId;
      // se la tabella è già presente in sessionStorage non rieseguo la query
      if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) {
        urls.push('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/tables_info');
      }
    }
    // in app.getTables() c'è il controllo se sono presenti urls da scaricare
    WorkBookStorage.saveTables(await getTables(urls));
  }

  // apertura del WorkBook
  app.workBookSelected = async (e) => {
    WorkBook = WorkBook.open(e.currentTarget.dataset.token);
    WorkBook.workBook.token = e.currentTarget.dataset.token;
    WorkBook.name = e.currentTarget.dataset.name;
    // modifico il nome del WorkBook in #workbook-name
    document.getElementById('workbook-name').innerText = WorkBook.name;
    app.tablesMap();
    app.hierTables();
    // scarico le tabelle del canvas in sessionStorage, questo controllo va fatto dopo aver definito WorkBook.hierTables
    app.checkSessionStorage();
    // reimposto l'evento contextmenu sugli elementi del canvas
    for (const tableId of Draw.tables.keys()) {
      // se la tabella è già presente in sessionStorage non rieseguo la query
      Draw.svg.querySelector(`#${tableId}`).addEventListener('contextmenu', app.contextMenuTable);
    }
    Draw.checkResizeSVG();
    app.dialogWorkBook.close();
    // il WorkBook è già creato quindi da questo momento è in fase di edit
    WorkBook.edit = true;
  }

  app.openSheetDialog = (e) => {
    console.log('Sheet open');
    /* popolo la dialog con gli Sheet presenti, gli Sheet hanno un workBook_ref : token, quindi
    * recupero solo gli Sheet appartenenti al WorkBook aperto
    */
    const parent = document.querySelector('nav[data-sheet-defined]');
    // reset list
    parent.querySelectorAll('li').forEach(sheet => sheet.remove());
    const sheets = SheetStorage.sheets(WorkBook.workBook.token);
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

  app.saveSheetSpecs = () => {
    let url = `/fetch_api/json/sheet_specs_store`;
    const params = JSON.stringify(Dashboard.json);
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        debugger;
        if (data) {
          console.log('elemento salvato con successo');
        } else {
        }
      })
      .catch((err) => console.error(err));
  }

  app.createSheetTemplate = () => {
    // Verifico se le specifiche per questo report già esistono.
    fetch(`/fetch_api/name/specs_${Sheet.sheet.token}/sheet_specs_show`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        (Object.keys(data).length !== 0) ? Dashboard.json = data.json_value : Dashboard.json.name = `specs_${Sheet.sheet.token}`;
        /* if (Object.keys(data).length !== 0) {
          // Dashboard.json = localStorage.getItem(`template-${Sheet.sheet.token}`) :
          Dashboard.json = JSON.parse(data.json_value);
        } else {
          // non trovato, lo creo
          Dashboard.json.name = `specs-${Sheet.sheet.token}`;
        } */
        Dashboard.json.wrapper.chartType = 'Table';
        // se, in json.data.view esiste già questa colonna, non la modifico
        // creo l'array di object che mi servirà per nascondere/visualizzare le colonne
        let columnProperties = [], metricProperties = [];
        Sheet.sheet.sheetColumns.forEach(col => {
          const column = Dashboard.json.data.view.find(columnName => columnName.id === col);
          const visible = (column) ? column.properties.visible : true;
          columnProperties.push({ id: col, properties: { visible } });
          // temporaneo, per reimpostare tutte le colonne visibili
          // columnProperties.push({ id: col, properties: { visible: true } });
        });
        // console.log(columnProperties);
        // debugger;
        Sheet.sheet.sheetMetrics.forEach(metric => {
          let metricFind = Dashboard.json.data.group.columns.find(name => name.alias === metric.alias);
          if (!metric.dependencies) {
            if (metricFind) {
              metric.properties = { visible: metricFind.properties.visible };
              metric.label = metricFind.label;
            } else {
              metric.properties = { visible: true };
              metric.label = metric.alias;
            }
          }
          metricProperties.push(metric);
        });
        // console.log(metricProperties);
        // debugger;

        let columnsSet = new Set();
        // se la colonna in ciclo è presente in 'Sheet.sheet.sheetMetrics' la imposto come type: 'number' altrimenti 'string'
        for (const field of Object.keys(Dashboard.data[0])) {
          const findMetricIndex = Sheet.sheet.sheetMetrics.findIndex(metric => metric.alias === field);
          // type = (findMetricIndex === -1) ? 'string' : 'number';
          // if (Dashboard.json.data.columns[field]) {
          //   type = Dashboard.json.data.columns[field].type;
          // } else {
          //   type = (findMetricIndex === -1) ? 'string' : 'number';
          // }
          const columnType = (findMetricIndex === -1) ? 'column' : 'metric';
          if (Dashboard.json.data.columns[field]) {
            // il data.columns già esiste, non sovrascrivo la prop 'label' e 'type'
            columnsSet.add({
              id: field,
              label: Dashboard.json.data.columns[field].label,
              type: Dashboard.json.data.columns[field].type,
              properties: { columnType }, other: 'altre proprietà...'
            });
          } else {
            type = (findMetricIndex === -1) ? 'string' : 'number';
            columnsSet.add({ id: field, label: field, type, properties: { columnType }, other: 'altre proprietà...' });
          }
        }
        // Salvataggio del json
        // converto il columnsSet (array) in Object
        columnsSet.forEach(col => Dashboard.json.data.columns[col.id] = col);
        // creo un array con le colonne da visualizzare in fase di inizializzazione del dashboard
        // Dashboard.json.data.view = columns;
        // la prop 'names' mi servirà per popolare la DataView dopo il group()
        // Dashboard.json.data.view = columnProperties;
        Dashboard.json.data.view = columnProperties;
        // nel data.group.columns vanno messe tutte le metriche, come array di object
        Dashboard.json.data.group.columns = metricProperties;
        // Dashboard.json.data.group.columns = Sheet.sheet.sheetMetrics;
        let keys = [];
        console.log(columnsSet);
        // salvo tutte le colonne (colonne dimensionali, non metriche) in
        // json.data.group.key.
        [...columnsSet].forEach((col, index) => {
          if (col.properties.columnType === 'column') {
            const columnFind = Dashboard.json.data.group.key.find(columnName => columnName.id === col.id);
            // se la colonna in ciclo è già presente in json.data.group.key non sovrascrivo la proprieta
            // 'grouped', questa proprietà viene impostata quando l'utente nasconde/visualizza una colonna
            if (columnFind) {
              col.properties.grouped = columnFind.properties.grouped;
            } else {
              col.properties.grouped = true;
              col.label = col.id;
            }
            // const grouped = (column) ? column.properties.grouped : true;
            // keys.push({ id: col.id, index, properties: { grouped } });
            keys.push(col);
          }
        });
        Dashboard.json.data.group.key = keys;
        console.log('save sheet_specs : ', Dashboard.json);
        debugger;
        // if (Object.keys(data).length !== 0) app.saveSheetSpecs() : app.updateSheetSpecs();
        // window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
      })
      .catch((err) => console.error(err));
  }

  // TODO da spostare in supportFn.js
  app.sheetPreview = async (token) => {
    // console.log(token);
    // recupero l'id dello Sheet
    const sheet = JSON.parse(window.localStorage.getItem(token));
    if (!sheet.id) return false;
    console.log(sheet);
    // debugger;
    // NOTE: Chiamata in post per poter passare tutte le colonne, incluso l'alias, alla query

    // TODO Passo in param un object con le colonne da estrarre (tutte)
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

    // chiamata in GET
    /* await fetch(`/fetch_api/${sheet.id}/preview`)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        // impostare la prop dashboard.json.data.columns con i rispettivi dataType
        Dashboard.data = data;
        // imposto il riferimento della tabella nel DOM
        Dashboard.ref = 'preview-datamart';
        app.createSheetTemplate();
        // Creazione preview del datamart
        // drawDatamart() impostata in init-sheet.js
        google.charts.setOnLoadCallback(drawDatamart());
      })
      .catch(err => {
        App.showConsole(err, 'error', 3000);
        console.error(err);
      }); */
    // end chiamata in GET

    let partialData = [];
    await fetch(`/fetch_api/${sheet.id}/preview?page=1`)
      .then((response) => {
        // console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        console.log(paginateData);
        console.log(paginateData.data);
        // debugger;
        // Dashboard.data = paginateData.data;
        // funzione ricorsiva fino a quando è presente next_page_url
        let recursivePaginate = async (url) => {
          // console.log(url);
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
              Dashboard.data = partialData;
              // imposto il riferimento della tabella nel DOM
              Dashboard.ref = 'preview-datamart';
              // app.createSheetTemplate();
              google.charts.setOnLoadCallback(drawDatamart());
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
          Dashboard.data = partialData;
          // imposto il riferimento della tabella nel DOM
          Dashboard.ref = 'preview-datamart';
          // app.createSheetTemplate();
          google.charts.setOnLoadCallback(drawDatamart());
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // apertura nuovo Sheet, viene recuperato dal localStorage
  app.sheetSelected = async (e) => {
    // chiamare il metodo open() dell'oggetto Sheet e seguire la stessa logica utilizzata per workBookSelected()
    Sheet = new Sheets(e.currentTarget.dataset.token, Sheet.sheet.workbook_ref);
    // reimposto tutte le proprietà della Classe
    Sheet.open();
    const name = document.getElementById('sheet-name');
    name.innerText = Sheet.name;
    name.dataset.value = Sheet.name;
    /* Re-inserisco, nello Sheet, tutti gli elementi (fileds, filters, metrics, ecc...)
    * della classe Sheet (come quando si aggiungono in fase di creazione Sheet)
    */
    for (const [token, field] of Sheet.fields) {
      // WARN: per il momento il target per i fields è sempre #dropzone-rows
      const target = document.getElementById('dropzone-rows');
      app.addField(target, token)
    }

    for (const [token, metrics] of Sheet.metrics) {
      const target = document.getElementById('dropzone-columns');
      if (!metrics.dependencies) app.addMetric(target, token);
    }

    // filters
    Sheet.filters.forEach(token => {
      const filterRef = document.getElementById('ul-filters');
      const target = document.getElementById('dropzone-filters');
      // imposto un data-selected sui filtri per rendere visibile il fatto che sono stati aggiunti al report
      const elementRef = filterRef.querySelector(`li[id='${token}']`);
      app.addFilters(target, elementRef, true);
    });
    Sheet.save();
    app.dialogSheet.close();
    // verifico se il datamart, per lo Sheet selezionato, è già presente sul DB.
    // In caso positivo lo apro in preview-datamart.
    await app.createSheetTemplate();
    // debugger;
    app.sheetPreview(e.currentTarget.dataset.token);
    // Imposto la prop 'edit' = true perchè andrò ad operare su uno Sheet aperto
    Sheet.edit = true;
    document.querySelectorAll('#btn-sql-preview, #btn-sheet-preview').forEach(button => button.removeAttribute('disabled'));
  }

  app.saveSheet = () => {
    // imposto il nome recuperandolo dallo #sheet-name
    const name = document.getElementById('sheet-name');
    Sheet.name = name.dataset.value;
    Sheet.save();
    // da questo momento in poi le modifiche (aggiunta/rimozione) di elementi allo Sheet
    // verranno contrassegnate come edit:true
    Sheet.edit = true;
  }

  app.removeDefinedColumn = (e) => {
    const token = e.target.dataset.columnToken;
    // Se la colonna che si sta per eliminare è stata aggiunta (non era inclusa nello Sheet)
    // elimino tutto il div anziché marcarlo come data-removed
    const field = document.querySelector(`.column-defined[data-id='${token}']`);
    const removeField = () => {
      // Aggiungo, al div .column-defined[data-id] un attributo data-removed per poterlo
      // contrassegnare come "cancellato" (ed impostarne anche il css con line-through)
      field.dataset.removed = 'true';
      // Memorizzo l'oggetto da eliminare in un 'magic method' della Classe Sheet.
      // Nel ripristino (undoDefinedColumn()) di questa colonna userò questo oggetto
      Sheet.removedFields = { token, value: Sheet.fields.get(token) };
    }
    // In edit=true i campi aggiunti allo Sheet sono contrassegnati con dataset.adding
    // ed è già presente il dataset.added. Perr questo motivo elimino dal DOM gli elementi
    // 'adding', in edit:true, e added in edit:false
    if (Sheet.edit) {
      // edit mode
      (field.dataset.adding) ? field.remove() : removeField();
    } else {
      (field.dataset.added) ? field.remove() : removeField();
    }
    Sheet.fields.delete(token);
  }

  app.undoDefinedColumn = (e) => {
    const token = e.target.dataset.columnToken;
    // Recupero, da Sheet.removedFields, gli elementi rimossi per poterli ripristinare
    Sheet.fields.set(Sheet.removedFields.token, Sheet.removedFields.value);
    delete document.querySelector(`.column-defined[data-id='${token}']`).dataset.removed;
  }

  app.removeDefinedMetric = (e) => {
    const token = e.target.dataset.metricToken;
    // Se la metrica che si sta per eliminare è stata aggiunta (non era inclusa nello Sheet)
    // elimino tutto il div anziché marcarlo come data-removed
    const metric = document.querySelector(`.metric-defined[data-id='${token}']`);
    const removeMetric = () => {
      // Aggiungo, al div .metric-defined[data-id] un attributo data-removed per poterlo
      // contrassegnare come "cancellato" (ed impostarne anche il css con line-through)
      metric.dataset.removed = 'true';
      // Memorizzo l'oggetto da eliminare in un 'magic method' della Classe Sheet.
      // Nel ripristino (undoDefinedMetric()) di questa metrica userò questo oggetto
      Sheet.removedMetrics = { token, value: Sheet.metrics.get(token) };
    }
    if (Sheet.edit) {
      (metric.dataset.adding) ? metric.remove() : removeMetric();
      // Le proprietà 'advMetrics', 'compositeMetrics' e 'metrics' all'interno di Sheet.sheet
      // sono presenti solo in caso di edit:true dello Sheet. Quindi non posso eliminarle
      // se lo Sheet NON è in fase di edit
      // elimino l'object in base al tipo di metrica
      /* switch (Sheet.metrics.get(token).type) {
        case 'advanced':
          delete Sheet.sheet.advMetrics[token];
          if (Object.keys(Sheet.sheet.advMetrics).length === 0) delete Sheet.sheet.advMetrics;
          break;
        case 'composite':
          delete Sheet.sheet.compositeMetrics[token];
          if (Object.keys(Sheet.sheet.compositeMetrics).length === 0) delete Sheet.sheet.compositeMetrics;
          break;
        default:
          delete Sheet.sheet.metrics[token];
          if (Object.keys(Sheet.sheet.metrics).length === 0) delete Sheet.sheet.metrics;
          break;
      } */
    } else {
      (metric.dataset.added) ? metric.remove() : removeMetric();
    }

    Sheet.metrics.delete(token);
    if (Sheet.metrics.size === 0) Sheet.metrics.clear();
  }

  app.undoDefinedMetric = (e) => {
    const token = e.target.dataset.metricToken;
    // Recupero, da Sheet.removedMetrics, gli elementi rimossi per poterli ripristinare
    Sheet.metrics.set(Sheet.removedMetrics.token, Sheet.removedMetrics.value);
    delete document.querySelector(`.metric-defined[data-id='${token}']`).dataset.removed;
  }

  // TODO: da spostare in supportFn.js
  app.handlerEditSheetName = (e) => e.target.dataset.value = e.target.innerText;

  app.editWorkBookName.onblur = (e) => WorkBook.name = e.target.innerText;

  document.getElementById('prev').onclick = () => {
    document.querySelector('#next').toggleAttribute('hidden');
    document.querySelector('#btn-sheet-preview').toggleAttribute('hidden');
    document.querySelector('#btn-sql-preview').toggleAttribute('hidden');
    Step.previous();
  }

  document.getElementById('next').onclick = async () => {
    /* recupero dal DB (promise.all) tutte le tabelle mappate nel WorkBook
    * - salvo i campi delle tabelle in sessionStorage in modo da poterci accedere più rapidamente
    * - creo la struttura delle tabelle->fields nella dialog filter
    */
    if (WorkBook.tablesMap.size !== 0) {
      app.checkSessionStorage();
      Step.next();
      // gli elementi impostati nel workBook devono essere disponibili nello sheet.
      app.addTablesStruct();
      // salvo il workbook creato
      // TODO: Se non ci sono state modifiche il WorkBook non deve essere salvato
      WorkBook.save();
      // se lo Sheet è già aperto non posso ricreare l'oggetto Sheet
      if (!Sheet) {
        // Sheet non è definito (prima attivazione del tasto Sheet)
        Sheet = new Sheets(rand().substring(0, 7), WorkBook.workBook.token);
        // Imposto la prop 'edit' = false, verrà impostata a 'true' quando si apre uno Sheet
        // dal tasto 'Apri Sheet'
        Sheet.edit = false;
      }
    }
    document.querySelector('#next').toggleAttribute('hidden');
    document.querySelector('#btn-sheet-preview').toggleAttribute('hidden');
    document.querySelector('#btn-sql-preview').toggleAttribute('hidden');
  }

  app.tableSelected = async (e) => {
    // console.log(`table selected ${e.currentTarget.dataset.table}`);
    // console.log(e.currentTarget);
    // deseleziono le altre tabelle con attributo active
    Draw.svg.querySelectorAll("use.table[data-active='true']").forEach(use => delete use.dataset.active);
    e.currentTarget.dataset.active = 'true';
    // recupero 50 record della tabella selezionata per visualizzare un anteprima
    WorkBook.activeTable = e.currentTarget.id;
    WorkBook.schema = e.currentTarget.dataset.schema;
    let DT = new Table(await app.getPreviewSVGTable(), 'preview-table', true);
    DT.template = 'tmpl-preview-table';
    DT.addColumns();
    DT.addRows();
    DT.inputSearch.addEventListener('input', DT.columnSearch.bind(DT));
    // imposto un colore diverso per le colonne già definite nel workbook
    DT.fields(WorkBook.fields.get(WorkBook.activeTable.dataset.alias));
    // imposto un colore diverso per le meriche già definite nel workbook
    DT.metrics(WorkBook.metrics);
  }

  app.createProcess = (e) => {
    let process = { from: {}, joins: {} };
    let fields = new Map();
    let metrics = new Map(), advancedMetrics = new Map(), compositeMetrics = new Map();
    let filters = new Map();
    // per ogni 'fields' aggiunto a Sheet.fields ne recupero le proprietà 'field', 'tableAlias' e 'name'
    for (const [token, field] of Sheet.fields) {
      // verifico le tabelle da includere in tables Sheet.tables
      Sheet.tables = WorkBook.field.get(token).tableAlias;
      fields.set(token, {
        field: WorkBook.field.get(token).field,
        tableAlias: WorkBook.field.get(token).tableAlias,
        name: field
      });
    }
    for (const [token, metric] of Sheet.metrics) {
      switch (metric.type) {
        case 'composite':
          compositeMetrics.set(token, {
            alias: metric.alias,
            SQL: WorkBook.metrics.get(token).sql,
            metrics: WorkBook.metrics.get(token).metrics
          });
          break;
        case 'advanced':
          advancedMetrics.set(token, {
            alias: metric.alias,
            aggregateFn: metric.aggregateFn,
            field: WorkBook.metrics.get(token).field,
            SQL: WorkBook.metrics.get(token).SQL,
            distinct: WorkBook.metrics.get(token).distinct,
            filters: {}
          });
          // aggiungo i filtri definiti all'interno della metrica avanzata
          WorkBook.metrics.get(token).filters.forEach(filterToken => {
            // se, nei filtri della metrica, sono presenti filtri di funzioni temporali,
            // ...la definizione del filtro và recuperata da WorkBook.metrics.timingFn
            if (['last-year', 'last-month', 'ecc...'].includes(filterToken)) {
              advancedMetrics.get(token).filters[filterToken] = WorkBook.metrics.get(token).timingFn[filterToken];
            } else {
              advancedMetrics.get(token).filters[filterToken] = WorkBook.filters.get(filterToken);
            }
          });
          // debugger;
          break;
        default:
          // basic
          metrics.set(token, {
            alias: metric.alias,
            aggregateFn: metric.aggregateFn,
            field: WorkBook.metrics.get(token).field,
            SQL: WorkBook.metrics.get(token).SQL,
            distinct: WorkBook.metrics.get(token).distinct
          });
          break;
      }
    }
    Sheet.filters.forEach(token => {
      WorkBook.filters.get(token).tables.forEach(table => Sheet.tables = table);
      // recupero l'object da inviare al process
      filters.set(token, WorkBook.filters.get(token));
    });
    // se non ci sono filtri nel Report bisogna far comparire un avviso
    // perchè l'elaborazione potrebbe essere troppo onerosa
    if (Sheet.filters.size === 0) {
      App.showConsole('Non sono presenti filtri nel report', 'error', 5000);
      return false;
    }

    process.fields = Object.fromEntries(fields);
    app.setSheet();
    process.from = Object.fromEntries(Sheet.from);
    process.joins = Object.fromEntries(Sheet.joins);
    process.filters = Object.fromEntries(filters);
    if (metrics.size !== 0) process.metrics = Object.fromEntries(metrics);
    if (advancedMetrics.size !== 0) process.advancedMeasures = Object.fromEntries(advancedMetrics);
    if (compositeMetrics.size !== 0) process.compositeMeasures = Object.fromEntries(compositeMetrics);
    // debugger;
    (e.target.id === 'btn-sheet-preview') ? app.process(process) : app.generateSQL(process);
  }

  app.generateSQL = async (process) => {
    // lo Sheet.id può essere già presente quando è stato aperto
    if (!Sheet.id) Sheet.id = Date.now();
    process.id = Sheet.id;
    // console.log(process);
    app.saveSheet();
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
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  /* app.process = async (process) => {
    // lo Sheet.id può essere già presente quando è stato aperto
    if (!Sheet.id) Sheet.id = Date.now();
    process.id = Sheet.id;
    // console.log(process);
    app.saveSheet();
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(process);
    // console.log(params);
    // App.showConsole('Elaborazione in corso...', 'info');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/cube/sheet";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        // TODO Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        if (data) {
          console.log('data : ', data);
          debugger;
          Dashboard.data = data;
          Dashboard.ref = 'preview-datamart';
          app.createSheetTemplate();
          google.charts.setOnLoadCallback(drawDatamart());
          // Al termine del process elimino dalle dropzones gli elementi che sono stati
          // eliminati dallo Sheet, quindi gli elementi con dataset.removed
          document.querySelectorAll('div[data-removed]').forEach(element => element.remove());
          // Allo stesso modo, elimino il dataset.adding per rendere "finali" gli elementi aggiunti
          // al report in fase di edit
          document.querySelectorAll('div[data-adding]').forEach(element => delete element.dataset.adding);
        } else {
          // TODO Da testare se il codice arriva qui o viene gestito sempre dal catch()
          console.debug('FX non è stata creata');
          App.showConsole('Errori nella creazione del datamart', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error', 3000);
        console.error(err);
      });
  } */

  app.process = async (process) => {
    // lo Sheet.id può essere già presente quando è stato aperto
    if (!Sheet.id) Sheet.id = Date.now();
    process.id = Sheet.id;
    // console.log(process);
    app.saveSheet();
    // invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
    const params = JSON.stringify(process);
    // console.log(params);
    // App.showConsole('Elaborazione in corso...', 'info');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/cube/sheet";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        // TODO Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        if (paginateData) {
          // console.log(paginateData);
          let recursivePaginate = async (url) => {
            // console.log(url);
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
                Dashboard.data = partialData;
                // imposto il riferimento della tabella nel DOM
                Dashboard.ref = 'preview-datamart';
                // app.createSheetTemplate();
                google.charts.setOnLoadCallback(drawDatamart());
                // google.charts.setOnLoadCallback(drawTest());
              }
            }).catch((err) => {
              App.showConsole(err, 'error');
              console.error(err);
            });
          }
          // TODO Nel partialData potrei scegliere di visualizzare già la tabella, i successivi
          // paginate aggiungeranno dati alla DataTable
          partialData = paginateData.data;
          if (paginateData.next_page_url) {
            recursivePaginate(paginateData.next_page_url);
          } else {
            // Non sono presenti altre pagine, visualizzo il dashboard
            Dashboard.data = partialData;
            // imposto il riferimento della tabella nel DOM
            Dashboard.ref = 'preview-datamart';
            // app.createSheetTemplate();
            google.charts.setOnLoadCallback(drawDatamart());
            // Al termine del process elimino dalle dropzones gli elementi che sono stati
            // eliminati dallo Sheet, quindi gli elementi con dataset.removed
            document.querySelectorAll('div[data-removed]').forEach(element => element.remove());
            // Allo stesso modo, elimino il dataset.adding per rendere "finali" gli elementi aggiunti
            // al report in fase di edit
            document.querySelectorAll('div[data-adding]').forEach(element => delete element.dataset.adding);
          }
        } else {
          // TODO Da testare se il codice arriva qui o viene gestito sempre dal catch()
          console.debug('FX non è stata creata');
          App.showConsole('Errori nella creazione del datamart', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error', 3000);
        console.error(err);
      });
  }

  app.openDialogFilter = async () => {
    // creo la struttura tabelle per poter creare nuovi filtri
    let urls = [];
    // TODO: in ciclo serve solo il tableId
    for (const [tableId, value] of WorkBook.hierTables) {
      WorkBook.activeTable = tableId;
      urls.push('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_info');
    }
    // promiseAll per recuperare tutte le tabelle del canvas, successivamente vado a popolare la dialogFilters con i dati ricevuti
    app.addWorkBookContent();
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

  // aggiungo il filtro selezionato allo Sheet
  app.addFilter = (e) => {
    Sheet.filters = e.currentTarget.dataset.token;
    // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
    const li = document.getElementById(e.currentTarget.dataset.token);
    li.dataset.selected = 'true';
  }

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

  // rimuovo il filtro aggiunto allo Sheet
  app.removeDefinedFilter = (e) => {
    const token = e.target.dataset.filterToken;
    const filter = document.querySelector(`.filter-defined[data-id='${token}']`);
    const removeFilter = () => {
      // Aggiungo, al div .column-defined[data-id] un attributo data-removed per poterlo
      // contrassegnare come "cancellato" (ed impostarne anche il css con line-through)
      filter.dataset.removed = 'true';
      // Memorizzo l'oggetto da eliminare in un 'magic method' della Classe Sheet.
      // Nel ripristino (undoDefinedColumn()) di questa colonna userò questo oggetto
      Sheet.removedFilters = { [token]: token };
    }
    if (Sheet.edit) {
      (filter.dataset.adding) ? filter.remove() : removeFilter();
    } else {
      (filter.dataset.added) ? filter.remove() : removeFilter();
    }
    Sheet.filters.delete(token);
    // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
  }

  // ripristino il filtro selezionato dallo Sheet
  app.undoDefinedFilter = (e) => {
    const token = e.target.dataset.filterToken;
    // Recupero, da Sheet.removedFilters, gli elementi rimossi per poterli ripristinare
    Sheet.filters.add(Sheet.removedFilters[token]);
    delete document.querySelector(`.filter-defined[data-id='${token}']`).dataset.removed;
  }

  /*
    * modifica di un filtro.
    * -inserisco il contenuto della formula nella #textarea-filter
    * -recupero la definizione dell'elemento per reimpostare, nella textarea, la formula del filtro
  */
  app.editFilter = (e) => {
    // console.log(e.target.dataset.token);
    // il context-menu è sempre aperto in questo caso, lo chiudo
    app.contextMenuRef.toggleAttribute('open');
    app.openDialogFilter();
    console.log(WorkBook.filters.get(e.target.dataset.token));
    let filter = WorkBook.filters.get(e.target.dataset.token);
    const txtArea = app.dialogFilters.querySelector('#textarea-filter');
    const btnFilterSave = document.getElementById('btn-filter-save');
    const inputName = document.getElementById('input-filter-name');
    inputName.value = filter.name;
    // app.dialogFilters.dataset.mode = 'edit'
    // imposto il token sul tasto btnFilterSave, in questo modo posso salvare/aggiornare il filtro in base alla presenza o meno di data-token
    btnFilterSave.dataset.token = e.target.dataset.token;
    /*
    *  metto in ciclo gli elementi della proprietà 'formula' del filtro.
    *  Qui possono esserci sia campi che definiscono il <mark> sia elementi, della formula, che definiscono lo <span>
    */
    filter.formula.forEach(element => {
      if (element.hasOwnProperty('field')) {
        // determino il <mark>
        const templateContent = app.tmplFormula.content.cloneNode(true);
        const i = templateContent.querySelector('i');
        i.addEventListener('click', app.cancelFormulaObject);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        const small = templateContent.querySelector('small');
        mark.dataset.tableAlias = element.table_alias;
        mark.dataset.table = element.table;
        mark.dataset.field = element.field;
        mark.innerText = element.field;
        small.innerText = element.table;
        txtArea.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.dataset.check = 'filter';
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('tabindex', 0);
        span.innerText = element;
        txtArea.appendChild(span);
      }
    });
  }

  app.openDialogMetric = () => {
    const filterDrop = document.getElementById('filter-drop');
    filterDrop.addEventListener('dragover', app.handlerDragOverFilter, false);
    filterDrop.addEventListener('dragenter', app.handlerDragEnterFilter, false);
    filterDrop.addEventListener('dragleave', app.handlerDragLeaveFilter, false);
    filterDrop.addEventListener('drop', app.handlerDropFilter, false);
    app.dialogMetric.show();
  }

  app.editAdvancedMetric = (e) => {
    app.contextMenuRef.toggleAttribute('open');
    const metric = WorkBook.metrics.get(e.target.dataset.token);
    const filterDrop = document.getElementById('filter-drop');
    const input = app.dialogMetric.querySelector('#input-metric');
    const tmpl = app.tmplAdvMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('#adv-metric-defined');
    const formula = field.querySelector('.formula');
    const btnSave = document.getElementById('btn-metric-save');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    const fieldName = formula.querySelector('span');
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
    const inputName = document.getElementById('adv-metric-name');
    // reimposto le proprietà della metrica nella dialog
    inputName.value = metric.alias;
    // aggiungo i filtri alla <nav> #filter-drop
    if (metric.hasOwnProperty('filters')) {
      metric.filters.forEach(token => {
        if (['last-year', 'last-month', 'ecc'].includes(token)) {
          // è un filtro con una funzione temporale, seleziono la funzione temporale nell'elemento
          // ... #dl-timing-functions
          document.querySelector(`#dl-timing-functions > dt[data-value='${token}']`).setAttribute('selected', 'true');
        } else {
          // TODO: questo codice è ripetuto in handlerDropFilter()
          const tmplFilter = app.tmplFilterDropped.content.cloneNode(true);
          const li = tmplFilter.querySelector('li');
          const span = li.querySelector('span');
          const btnRemove = li.querySelector('button');
          li.dataset.token = token;
          span.innerText = WorkBook.filters.get(token).name;
          btnRemove.dataset.token = token;
          filterDrop.appendChild(li);
        }
      });
    }
    app.openDialogMetric();
  }

  app.editCompositeMetric = (e) => {
    app.contextMenuRef.toggleAttribute('open');
    const metric = WorkBook.metrics.get(e.target.dataset.token);
    // ricostruisco la formula all'interno del div #textarea-composite-metric
    const textarea = document.getElementById('textarea-composite-metric');
    const btnMetricSave = document.getElementById('btn-composite-metric-save');
    const inputName = document.getElementById('composite-metric-name');
    inputName.value = metric.alias;
    btnMetricSave.dataset.token = e.target.dataset.token;
    // ciclo la proprietà 'formula' per inserire la formula
    metric.formula.forEach(element => {
      // se l'elemento contiene la proprietà token utilizzo il template <mark> altrimenti lo <span>
      if (element.hasOwnProperty('token')) {
        const templateContent = app.tmplCompositeFormula.content.cloneNode(true);
        const i = templateContent.querySelector('i');
        i.addEventListener('click', app.cancelFormulaObject);
        const span = templateContent.querySelector('span');
        const mark = templateContent.querySelector('mark');
        mark.dataset.token = element.token;
        mark.innerText = element.alias;
        textarea.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.dataset.check = 'metric';
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('tabindex', 0);
        span.innerText = element;
        textarea.appendChild(span);
      }
    });
    app.dialogCompositeMetric.show()
  }

  app.cancelFormulaObject = (e) => e.currentTarget.parentElement.remove();

  /* app.setFrom = (tableAlias) => {
    let from = {};
    if (WorkBook.tablesMap.has(tableAlias)) {
      WorkBook.tablesMap.get(tableAlias).forEach(tableId => {
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
    if (WorkBook.tablesMap.has(tableAlias)) {
      WorkBook.tablesMap.get(tableAlias).forEach(tableId => {
        if (WorkBook.joins.has(Draw.tables.get(tableId).alias)) {
          for (const [token, join] of Object.entries(WorkBook.joins.get(Draw.tables.get(tableId).alias))) {
            console.log(token, join);
            joins[token] = join;
          }
        }
      });
      return joins;
    }
  } */

  // salvataggio di un filtro in WorkBook
  app.saveFilter = (e) => {
    const input = document.getElementById('input-filter-name');
    const name = input.value;
    // in edit recupero il token da e.target.dataset.token
    const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
    const date = new Date().toLocaleDateString('it-IT', options);
    let object = { token, name, tables: new Set(), sql: [], from: new Map(), joins: {}, type: 'filter', formula: [], workbook_ref: WorkBook.workBook.token, updated_at: date };
    const textarea = document.getElementById('textarea-filter');
    document.querySelectorAll('#textarea-filter *').forEach(element => {
      // se, nell'elemento <mark> è presente il tableId allora posso recuperare anche hierToken, hierName e dimensionToken
      // ... altrimenti devo recuperare il cubeToken. Ci sono anche filtri che possono essere fatti su un livello dimensionale e su una FACT
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        // object.workBook = { table: element.dataset.table, tableAlias: element.dataset.tableAlias };
        object.tables.add(element.dataset.tableAlias);
        object.formula.push({ table_alias: element.dataset.tableAlias, table: element.dataset.table, field: element.dataset.field });
        object.sql.push(`${element.dataset.tableAlias}.${element.dataset.field}`); // Azienda_444.id
        object.field = element.dataset.field;
      } else {
        object.formula.push(element.innerText.trim());
        object.sql.push(element.innerText.trim());
      }
    });
    // imposto le proprietà from e joins in base a quello che si trova in object.tables
    // object.tables contiene l'elenco delle tabelle incluse nella formula del filtro
    object.tables.forEach(table => {
      /* per ogni tabella di tablesMap, recupero le tabelle gerarchicamente inferiori e le aggiungo a
      * object.from solo se non sono già state aggiunte da precedenti tabelle
      */
      if (WorkBook.tablesMap.has(table)) {
        WorkBook.tablesMap.get(table).forEach(tableId => {
          if (!object.from.has(Draw.tables.get(tableId).alias)) {
            object.from.set(Draw.tables.get(tableId).alias, {
              schema: Draw.tables.get(tableId).schema,
              table: Draw.tables.get(tableId).table
            });
          }
          // joins
          if (WorkBook.joins.has(Draw.tables.get(tableId).alias)) {
            for (const [token, join] of Object.entries(WorkBook.joins.get(Draw.tables.get(tableId).alias))) {
              object.joins[token] = join;
            }
          }
        });
      }
    });
    console.log(object.from);
    // TODO: ricontrollare il corretto funzionamento di questa logica utilizzando vari tipi di filtri
    debugger;
    // converto da Map() in object altrimenti non può essere salvato in localStorage e DB
    object.from = Object.fromEntries(object.from);
    object.tables = [...object.tables];
    // la prop 'created_at' va aggiunta solo in fase di nuovo filtro e non quando si aggiorna il filtro
    if (e.target.dataset.token) {
      // aggiornamento del filtro
      // recupero il filtro dallo storage per leggere 'created_at'
      const filter = JSON.parse(window.localStorage.getItem(e.target.dataset.token));
      object.created_at = filter.created_at;
    } else {
      object.created_at = date;
    }
    WorkBook.filters = {
      token,
      value: object
    };
    // salvo il nuovo filtro appena creato
    // completato il salvataggio rimuovo l'attributo data-token da e.target
    window.localStorage.setItem(token, JSON.stringify(WorkBook.filters.get(token)));
    if (!e.target.dataset.token) {
      app.appendFilter(document.getElementById('ul-filters'), token, object);
    } else {
      // filtro modificato, aggiorno solo il nome eventualmente modificato
      // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
      const liElement = document.getElementById(token);
      liElement.dataset.label = name;
      liElement.querySelector('span > span').innerHTML = name;
      app.dialogFilters.close();
    }
    input.value = '';
    document.querySelectorAll('#textarea-filter *').forEach(element => element.remove());
    delete e.target.dataset.token;
    document.getElementById('filter-note').value = '';
  }

  // TODO: spostare in supportFn.js
  app.addFiltersMetric = e => e.currentTarget.toggleAttribute('selected');

  /* NOTE: END ONCLICK EVENTS*/

  /* NOTE: MOUSE EVENTS */
  // TODO: spostare in supportFn.js
  document.querySelectorAll('.translate').forEach(el => {
    el.onmousedown = (e) => {
      // console.log(app.coords);
      if (e.button === 2) return;
      // chiudo gli eventuali contextmenu aperti
      if (document.querySelector('.context-menu[open]')) document.querySelector('.context-menu[open]').toggleAttribute('open');
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

    el.onmouseover = (e) => {
      if (e.target.nodeName === 'svg') {
        if (document.querySelector('#dlg-info[open]')) app.dialogInfo.close();
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
    // TODO: valutare la possibilità di utilizzare la funzione attr() di CSS
    app.dialogInfo.style.setProperty('--top', `${+e.currentTarget.dataset.y + 30}px`);
    app.dialogInfo.style.setProperty('--left', `${e.currentTarget.dataset.x}px`);

    // verifico i dati della tabella, se ha colonne/metriche definite
    // TODO: Per le metriche dovrei aggiungere, in WorkBook.metrics, una prop 'table_alias'
    // per riuscire a recuperare le metriche impostate per una determinata tabella (seguendo
    // la stessa logica delle colonne, come fatto qui)
    (WorkBook.fields.has(e.target.dataset.alias)) ?
      app.dialogInfo.querySelector('button.columns').removeAttribute('disabled') :
      app.dialogInfo.querySelector('button.columns').setAttribute('disabled', 'true');
    app.dialogInfo.show();
  }

  app.tableLeave = () => { }

  /* NOTE: FETCH API */

  // TODO: potrei creare un unica function (in supportFn.js) che esegue la FETCH API passandogli la url
  // recupero le tabelle del database in base allo schema selezionato
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

  app.getPreviewSVGTable = async () => {
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

  // creazione metrica composta
  app.saveCompositeMetric = (e) => {
    const alias = document.getElementById('composite-metric-name').value;
    const parent = document.getElementById('ul-metrics');
    const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
    const date = new Date().toLocaleDateString('it-IT', options);
    let object = { token, alias, sql: [], metrics: {}, type: 'metric', formula: [], metric_type: 'composite', workbook_ref: WorkBook.workBook.token, updated_at: date };
    document.querySelectorAll('#textarea-composite-metric *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        // verifico se sto droppando una metrica composta, in questo caso si utilizza una logica diversa
        const metricFormula = WorkBook.metrics.get(element.dataset.token);
        switch (metricFormula.metric_type) {
          case 'composite':
            object.sql.push(metricFormula.sql.join(' '));
            // la proprietà 'formula' mi servrà per ricreare la formula della metrica in fase di edit
            object.formula.push({ token: metricFormula.token, alias: metricFormula.alias });
            for (const [token, metric] of Object.entries(WorkBook.metrics.get(metricFormula.token).metrics)) {
              object.metrics[token] = metric;
            }
            break;
          default:
            // basic and advanced
            object.metrics[metricFormula.token] = element.innerText;
            // object.metrics[element.innerText] = { token: element.dataset.token, alias: element.innerText };
            // TODO: Creare una Classe JS che gestisce la sintassi dei vari db (come laravel MyVerticaGrammar.php)
            // .. in modo da poter inserire, ad es.: funzioni come NVL o IFNULL.
            // Un'altra soluzione è creare qui un array (da trasformare in associativo in PHP) per poi poter
            // ... utilizzare MyVerticaGrammar.php oppure altre grammatiche relative ad altri DB già predisposti in Laravel
            object.sql.push(`NVL(${metricFormula.aggregateFn}(${element.innerText}),0)`);
            object.formula.push({ token: metricFormula.token, alias: metricFormula.alias });
            break;
        }
      } else {
        object.sql.push(element.innerText.trim());
        object.formula.push(element.innerText.trim());
      }
    });
    // console.log(object);
    // aggiornamento/creazione della metrica imposta created_at
    object.created_at = (e.target.dataset.token) ? WorkBook.metrics.get(e.target.dataset.token).created_at : date;
    WorkBook.metrics = object;
    // salvo la nuova metrica nello storage
    window.localStorage.setItem(token, JSON.stringify(WorkBook.metrics.get(token)));
    if (!e.target.dataset.token) {
      app.appendMetric(parent, token, object);
    } else {
      // la metrica già esiste, aggiorno il nome
      // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
      const liElement = document.getElementById(token);
      liElement.dataset.label = alias;
      liElement.querySelector('span > span').innerHTML = alias;
    }
    app.dialogCompositeMetric.close();
  }

  app.setSheet = () => {
    /*
    * ogni tabella aggiunta al report comporta la ricostruzione di 'from' e 'joins'
    */
    Sheet.tables.forEach(alias => {
      // console.log('tablesMap : ', WorkBook.tablesMap);
      /* tablesMap contiene un oggetto Map() con {tableAlias : [svg-data-2, svg-data-1, svg-data-0, ecc...]}
      * e un'array di tabelle presenti nella gerarchia create nel canvas
      */
      if (WorkBook.tablesMap.has(alias)) {
        WorkBook.tablesMap.get(alias).forEach(tableId => {
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
          if (WorkBook.joins.has(Draw.tables.get(tableId).alias)) Sheet.joins = WorkBook.joins.get(Draw.tables.get(tableId).alias);
        });
      }
    });
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

  app.tablesMap = () => {
    // creo tablesMap : qui sono presenti tutte le tabelle del canvas, al suo interno le tabelle in join fino alla FACT
    const levelId = +Draw.svg.dataset.level;
    WorkBook.tablesMap.clear();
    let recursiveLevels = (levelId) => {
      // per ogni tabella creo un Map() con, al suo interno, le tabelle gerarchicamente inferiori (verso la FACT)
      // questa mi servirà per stabilire, nello sheet, quali tabelle includere nella FROM e le relative Join nella WHERE
      Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}'], use.time`).forEach(table => {
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

  app.hierTables = () => {
    // creo hierTables : qui sono presenti tutte le tabelle del canvas. Questa mi serve per creare la struttura nello WorkBook
    const levelId = +Draw.svg.dataset.level;
    WorkBook.hierTables.clear();
    let recursiveLevels = (levelId) => {
      // per ogni tabella creo un Map() con, al suo interno, le tabelle gerarchicamente inferiori (verso la FACT)
      // questa mi servirà per stabilire, nello sheet, quali tabelle includere nella FROM e le relative Join nella WHERE
      Draw.svg.querySelectorAll(`use.table[data-level-id='${levelId}'], use.time`).forEach(table => {
        // console.log(table.dataset.alias);
        // della tabella corrente recupero tutte le sue discendenze fino alla FACT
        WorkBook.hierTables = {
          id: table.id,
          table: {
            schema: table.dataset.schema,
            table: table.dataset.table,
            alias: table.dataset.alias,
            name: table.dataset.name
          }
        };
        if (levelId !== 0) {
          levelId--;
          recursiveLevels(levelId);
        }
      });
    }
    recursiveLevels(levelId);
  }

  /* app.createHierarchies = () => {
    // salvo le gerarchie / dimensioni create nel canvas
    // recupero gli elementi del level-id più alto, il data-level presente su <svg> identifica il livello più alto presente
    const levelId = +Draw.svg.dataset.level;
    WorkBook.hierarchies.clear();
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
        WorkBook.hierarchies = hier;
      });

      levelId--;
      if (levelId !== 0) recursiveLevels(levelId);
    }
    if (levelId > 0) recursiveLevels(levelId);
  } */

  // TODO: potrebbe essere spostata in supportFn.js
  app.handlerToggleDrawer = (e) => {
    console.log('toggleDrawer');
    document.querySelector('#' + e.currentTarget.dataset.drawerId).toggleAttribute('open');
  }

  app.lineSelected = async (e) => {
    // imposto la join line corrente
    Draw.currentLineRef = e.currentTarget.id;
    WorkBook.tableJoins = {
      from: e.currentTarget.dataset.from,
      to: e.currentTarget.dataset.to
    }
    for (const [key, value] of Object.entries(WorkBook.tableJoins)) {
      WorkBook.activeTable = value.id;
      const data = WorkBookStorage.getTable(WorkBook.activeTable.dataset.table);
      app.addFields(key, data);
    }
    app.openJoinWindow();
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

  // Questa funzione restituisce i due elementi da aggiungere al DOM
  // Può essere invocata sia per creare una nuova join che
  // per creare/popolare una join esistente (ad es.: click sulla join line)
  app.createJoinField = () => {
    const tmplJoinFrom = app.tmplJoin.content.cloneNode(true);
    const tmplJoinTo = app.tmplJoin.content.cloneNode(true);
    const joinFieldFrom = tmplJoinFrom.querySelector('.join-field');
    const joinFieldTo = tmplJoinTo.querySelector('.join-field');
    // rimuovo eventuali joinField che hanno l'attributo data-active prima di aggiungere quelli nuovi
    app.dialogJoin.querySelectorAll('.join-field[data-active]').forEach(joinField => delete joinField.dataset.active);
    app.dialogJoin.querySelector('.joins section[data-table-from] > .join').appendChild(joinFieldFrom);
    app.dialogJoin.querySelector('.joins section[data-table-to] > .join').appendChild(joinFieldTo);
    return { from: joinFieldFrom, to: joinFieldTo };
  }

  // TODO: potrebbe essere spostata in supportFn.js
  app.addJoin = () => {
    // recupero i riferimenti del template da aggiungere al DOM
    let joinFields = app.createJoinField();
    const token = rand().substring(0, 7);
    joinFields.from.dataset.token = token;
    joinFields.to.dataset.token = token;
    document.querySelector('#btn-remove-join').dataset.token = token;
  }

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

  app.openJoinWindow = () => {
    // app.dialogJoin.dataset.open = 'false';
    app.dialogJoin.show();
    app.dialogJoin.dataset.lineId = Draw.currentLineRef.id;
    // aggiungo i template per join-field se non ci sono ancora join create
    // verifico se è presente una join su questa line
    if (!Draw.currentLineRef.dataset.joinId) {
      // join non presente
      app.addJoin();
    } else {
      // join presente, popolo i join-field
      // Le join sono salvate in WorkBook.joins e la key corrisponde alla tabella 'from'
      // messa in relazione
      for (const [key, value] of Object.entries(WorkBook.joins.get(Draw.currentLineRef.dataset.joinId))) {
        // key : join token
        // per ogni join devo creare i due campi .join-field e popolarli
        // con i dati presenti in WorkBook.join (che corrisponde a value in questo caso)
        let joinFields = app.createJoinField();
        joinFields.from.dataset.token = key;
        joinFields.to.dataset.token = key;
        joinFields.from.dataset.field = value.from.field;
        joinFields.from.dataset.table = value.from.table;
        joinFields.from.dataset.alias = value.from.alias;
        joinFields.from.innerHTML = value.from.field;
        joinFields.to.dataset.field = value.to.field;
        joinFields.to.dataset.table = value.to.table;
        joinFields.to.dataset.alias = value.to.alias;
        joinFields.to.innerHTML = value.to.field;
        document.querySelector('#btn-remove-join').dataset.token = key;
      }
    }
    const from = Draw.tables.get(Draw.joinLines.get(Draw.currentLineRef.id).from);
    const to = Draw.tables.get(Draw.joinLines.get(Draw.currentLineRef.id).to);

    app.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableFrom = from.table;
    app.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableId = from.key;
    app.dialogJoin.querySelector('.joins section[data-table-from] .table').innerHTML = from.table;
    app.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableTo = to.table;
    app.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableId = to.key;
    app.dialogJoin.querySelector('.joins section[data-table-to] .table').innerHTML = to.table;
  }

  app.handlerTimeDimension = async (e) => {
    console.log(e.target);
    app.contextMenuTableRef.toggleAttribute('open');
    /*
    * - recupero le colonne della tabella selezionata
    * - apro la dialog per poter associare una colonna della WEB_BI_TIME con una colonna della FACT
    */
    if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) WorkBookStorage.saveSession(await app.getTable());
    app.addFields_test(document.getElementById('ul-columns'), WorkBookStorage.getTable(WorkBook.activeTable.dataset.table));
    app.dialogTime.show();
  }

  // rimozione tabella dal draw SVG
  app.removeTable = (e) => {
    app.contextMenuTableRef.toggleAttribute('open');
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
    Draw.svg.dataset.level = 0;
    for (const values of Draw.tables.values()) {
      if (+Draw.svg.dataset.level < values.levelId) Draw.svg.dataset.level = values.levelId;
    }
    Draw.joinTablePositioning();
    // imposto un elemento 'canvas' per evidenziare che c'è una modifica nel canvas
    WorkBook.checkChanges('canvas');
  }

  // salvataggio dimensione TIME
  app.saveTimeDimension = async () => {
    const timeField = document.querySelector('#time-fields > li[data-selected]').dataset.field;
    const timeColumn = document.querySelector('#ul-columns > li[data-selected]').dataset.label;
    const tableAlias = document.querySelector('#ul-columns > li[data-selected]').dataset.alias;
    const table = document.querySelector('#ul-columns > li[data-selected]').dataset.table;
    const token = rand().substring(0, 7);
    WorkBook.dateTime = { tableAlias, timeField: timeColumn };
    // WARN: solo per vertica in questo caso.
    // qui potrei applicare solo ${table.timeColumn} e poi, tramite laravel db grammar aggiungere la sintassi del db utilizzato
    WorkBook.join = {
      token,
      value: {
        alias: 'WEB_BI_TIME',
        SQL: [`TO_CHAR(${tableAlias}.${timeColumn})::DATE`, `WEB_BI_TIME.${timeField}`], // [DocVenditaDettaglio_xxx.DataDocumento, WEB_BI_TIME.date]
        from: { table: 'WEB_BI_TIME', alias: 'WEB_BI_TIME', field: timeField },
        to: { table, alias: tableAlias, field: timeColumn }
      }
    };
    WorkBook.joins = token; // nome della tabella con le proprie join (WorkBook.nJoin) all'interno
    console.log(WorkBook.activeTable);
    debugger;
    Draw.tables = {
      id: 'svg-data-web_bi_time', properties: {
        id: 'web_bi_time',
        key: 'svg-data-web_bi_time',
        x: 10,
        y: 10,
        table: 'WEB_BI_TIME',
        alias: 'WEB_BI_TIME',
        name: 'WEB_BI_TIME',
        schema: 'decisyon_cache',
        joins: 0,
        join: WorkBook.activeTable.id,
        levelId: 0
      }
    };
    Draw.currentTable = Draw.tables.get('svg-data-web_bi_time');
    Draw.drawTime();

    app.tablesMap();
    app.hierTables();
    // recupero tutti i campi della WEB_BI_TIME, li ciclo per aggiungerli alla proprietà 'fields' del WorkBook
    WorkBook.activeTable = 'svg-data-web_bi_time';
    if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) WorkBookStorage.saveSession(await app.getTable());
    const data = WorkBookStorage.getTable(WorkBook.activeTable.dataset.table);
    data.forEach(column => {
      const tokenField = rand().substring(0, 7);
      WorkBook.field = {
        token: tokenField,
        value: {
          token: tokenField,
          type: 'column',
          schema: WorkBook.activeTable.dataset.schema,
          tableAlias: WorkBook.activeTable.dataset.alias,
          table: WorkBook.activeTable.dataset.table,
          name: column.COLUMN_NAME,
          origin_field: column.COLUMN_NAME,
          field: {
            // id: { field: column.COLUMN_NAME, type: 'da implementare', origin_field: column.COLUMN_NAME },
            // ds: { field: column.COLUMN_NAME, type: 'da implementare', origin_field: column.COLUMN_NAME }
            id: { sql: [column.COLUMN_NAME], type: 'da implementare' },
            ds: { sql: [column.COLUMN_NAME], type: 'da implementare' }
          }
        }
      };
      WorkBook.fields = tokenField;
    });
    WorkBook.checkChanges('time');
  }

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
    // console.log(joins);
    if (joins.length === 2) {
      WorkBook.join = {
        token: fieldRef.dataset.token,
        value: {
          alias: joins[0].dataset.alias,
          SQL: [`${joins[0].dataset.alias}.${joins[0].dataset.field}`, `${joins[1].dataset.alias}.${joins[1].dataset.field}`],
          from: { table: joins[0].dataset.table, alias: joins[0].dataset.alias, field: joins[0].dataset.field },
          to: { table: joins[1].dataset.table, alias: joins[1].dataset.alias, field: joins[1].dataset.field }
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

  // aggiungo i campi di una tabella per creare la join
  app.addFields = (source, response) => {
    // source : from, to
    console.log(source, response);
    const ul = app.dialogJoin.querySelector(`section[data-table-${source}] ul`);
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
      // scrivo il tipo di dato senza specificare la lunghezza, int(8) voglio che mi scriva solo int
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

  // TODO: test fn
  app.addFields_test = (ul, response) => {
    for (const [key, value] of Object.entries(response)) {
      const content = app.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li]');
      const span = li.querySelector('span');
      li.dataset.label = value.COLUMN_NAME;
      li.dataset.elementSearch = 'time-column';
      li.dataset.tableId = WorkBook.activeTable.id;
      li.dataset.table = WorkBook.activeTable.dataset.table;
      li.dataset.alias = WorkBook.activeTable.dataset.alias;
      li.dataset.label = value.COLUMN_NAME;
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
      // fn da associare all'evento in 'mutation observe'
      li.addEventListener('click', (e) => {
        // reset precedenti selezini
        ul.querySelectorAll('li[data-selected]').forEach(element => delete element.dataset.selected);
        (e.currentTarget.dataset.selected) ? delete e.currentTarget.dataset.selected : e.currentTarget.dataset.selected = 'true';
      });
      ul.appendChild(li);
    }
  }

  app.saveColumn = (e) => {
    const field = app.dialogColumns.dataset.field;
    const fieldName = document.getElementById('column-name').value;
    const token = (e.currentTarget.dataset.token) ? e.currentTarget.dataset.token : rand().substring(0, 7);
    // const token = rand().substring(0, 7);
    let fieldId = { sql: [], formula: [], type: 'da_completare' };
    let fieldDs = { sql: [], formula: [], type: 'da_completare' };
    document.querySelectorAll('#textarea-column-id *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        // il campo potrebbe appartenere ad una tabella diversa da quella selezionata
        // quindi  aggiungo anche il table alias
        fieldId.sql.push(`${element.dataset.tableAlias}.${element.dataset.field}`); // Azienda_444.id
        fieldId.formula.push({ table_alias: element.dataset.tableAlias, table: element.dataset.table, field: element.dataset.field });
      } else {
        fieldId.sql.push(element.innerText.trim());
        fieldId.formula.push(element.innerText.trim());
      }
    });
    document.querySelectorAll('#textarea-column-ds *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I') return;
      if (element.nodeName === 'MARK') {
        fieldDs.sql.push(`${element.dataset.tableAlias}.${element.dataset.field}`); // Azienda_444.id
        fieldDs.formula.push({ table_alias: element.dataset.tableAlias, table: element.dataset.table, field: element.dataset.field });
      } else {
        fieldDs.sql.push(element.innerText.trim());
        fieldDs.formula.push(element.innerText.trim());
      }
    });

    WorkBook.field = {
      token,
      value: {
        token,
        type: 'column',
        schema: WorkBook.schema,
        tableAlias: WorkBook.activeTable.dataset.alias,
        table: WorkBook.activeTable.dataset.table,
        name: fieldName,
        origin_field: field,
        field: {
          id: fieldId,
          ds: fieldDs
        }
      }
    };
    WorkBook.fields = token;
    app.dialogColumns.close();
    WorkBook.checkChanges(token);
  }

  // apertura dialog per la creazione di una nuova metrica
  app.newAdvMeasure = (e) => {
    app.contextMenuRef.toggleAttribute('open');
    // TODO: aggiungo la formula della metrica (SUM(NettoRiga)) nella textarea ma, in questo caso la textarea è disabilitata.
    // nella metrica filtrata posso modificare solo la funzione di aggregazione
    console.log(e.target);
    // recupero la metrica da WorkBook.metric
    const metric = WorkBook.metrics.get(e.currentTarget.dataset.token);
    const input = document.getElementById('input-metric');
    const tmpl = app.tmplAdvMetricsDefined.content.cloneNode(true);
    const field = tmpl.querySelector('#adv-metric-defined');
    const formula = field.querySelector('.formula');
    const btnSave = document.getElementById('btn-metric-save');
    const aggregateFn = formula.querySelector('code[data-aggregate]');
    const fieldName = formula.querySelector('span');
    aggregateFn.innerText = metric.aggregateFn;
    fieldName.innerText = `( ${metric.alias} )`;
    input.appendChild(field);
    // Nella creazione di una metrica filtrata, alcune proprietà, vengono "riprese" dalla metrica di base da cui deriva.
    // Per questo motivo ho bisogno sempre del token della metrica di base, lo imposto sul btn-metric-save[data-origin-token]
    btnSave.dataset.originToken = e.target.dataset.token;
    // TODO: valutare se spostarla in Application.js oppure in supportFn
    app.openDialogMetric();
  }

  // salvataggio metrica avanzata
  app.saveMetric = (e) => {
    const alias = document.getElementById('adv-metric-name').value;
    const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
    const date = new Date().toLocaleDateString('it-IT', options);
    let filters = new Set();
    const metric = WorkBook.metrics.get(e.target.dataset.originToken);
    // WARN: per il momento recupero innerText anziché dataset.aggregate perchè l'evento onBlur non viene attivato
    const aggregateFn = app.dialogMetric.querySelector('.formula > code[data-aggregate]').innerText;
    // TODO: aggiungere opzione 'distinct'.

    // metric_type: se ci sono dei filtri (o timingFn) in questa metrica verrà sovrascritto in 'advanced'
    let object = { token, alias, field: metric.field, aggregateFn, SQL: metric.SQL, distinct: false, type: 'metric', metric_type: 'basic', workbook_ref: WorkBook.workBook.token, updated_at: date };
    // recupero tutti i filtri droppati in #filter-drop
    // salvo solo il riferimento al filtro e non tutta la definizione del filtro
    app.dialogMetric.querySelectorAll('#filter-drop li').forEach(filter => filters.add(filter.dataset.token));
    // se ci sono funzioni temporali selezionate le aggiungo all'object 'filters' con token = alla funzione scelta (es.: last-year)
    if (document.querySelector('#dl-timing-functions > dt[selected]')) {
      const timingFn = document.querySelector('#dl-timing-functions > dt[selected]');
      /* if (['last-year', 'last-month', 'ecc...'].includes(timingFn.dataset.value)) {
        filters[timingFn.dataset.value] = {
          alias: 'WEB_BI_TIME',
          SQL: [
            'WEB_BI_TIME.trans_ly',
            `TO_CHAR(${WorkBook.dateTime.tableAlias}.${WorkBook.dateTime.timeField})::DATE`
          ]
        };
      } */
      if (['last-year', 'last-month', 'ecc...'].includes(timingFn.dataset.value)) {
        const timeField = timingFn.dataset.timeField;
        // Per questa metrica è stata aggiunta una timingFn.
        // oltre ad aggiungere il token (es.: 'last-year') nel Set 'filters' devo aggiungere anche la definizione di
        // ... questa timingFn, questo perchè la timingFn non è un filtro che 'separato' che viene salvato in storage
        filters.add(timingFn.dataset.value);
        object.timingFn = {
          [timingFn.dataset.value]: {
            alias: 'WEB_BI_TIME',
            SQL: [
              `(MapJSONExtractor(WEB_BI_TIME.last))['${timeField}']::DATE`,
              `TO_CHAR(${WorkBook.dateTime.tableAlias}.${WorkBook.dateTime.timeField})::DATE`
            ]
          }
        };
        /* filters[timingFn.dataset.value] = {
          alias: 'WEB_BI_TIME',
          SQL: [
            `(MapJSONExtractor(WEB_BI_TIME.last))['${timeField}']::DATE`,
            `TO_CHAR(${WorkBook.dateTime.tableAlias}.${WorkBook.dateTime.timeField})::DATE`
          ]
        }; */
      }
    }
    if (filters.size !== 0) {
      object.filters = [...filters];
      object.metric_type = 'advanced';
    }
    // aggiornamento/creazione della metrica imposta created_at
    object.created_at = (e.target.dataset.token) ? metric.created_at : date;
    WorkBook.metrics = object;
    // salvo la nuova metrica nello storage
    window.localStorage.setItem(token, JSON.stringify(WorkBook.metrics.get(token)));
    if (!e.target.dataset.token) {
      app.appendMetric(document.getElementById('ul-metrics'), token, object);
    } else {
      // la metrica già esiste, aggiorno il nome
      // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
      const liElement = document.getElementById(token);
      liElement.dataset.label = alias;
      liElement.querySelector('span > span').innerHTML = alias;
    }
    app.dialogMetric.close();
  }

  app.addDefinedFields = (parent) => {
    if (WorkBook.fields.has(WorkBook.activeTable.dataset.alias)) {
      for (const [token, value] of Object.entries(WorkBook.fields.get(WorkBook.activeTable.dataset.alias))) {
        const tmpl = app.tmplList.content.cloneNode(true);
        const li = tmpl.querySelector('li[data-li-drag]');
        const i = li.querySelector('i');
        const span = li.querySelector('span');
        li.id = token;
        li.dataset.type = 'column';
        li.dataset.elementSearch = 'fields';
        // li.dataset.label = value.field.ds.field;
        // TODO: rivedere la descrizione da far comparire per le colonne e colonne custom
        // li.dataset.label = value.field.ds.sql.join('');
        li.dataset.label = value.name;
        // li.dataset.id = tableId;
        li.dataset.schema = value.schema;
        li.dataset.table = value.table;
        li.dataset.alias = value.tableAlias;
        li.dataset.field = value.name;
        li.addEventListener('dragstart', app.fieldDragStart);
        li.addEventListener('dragend', app.fieldDragEnd);
        // span.innerHTML = value.field.ds.sql.join('');
        span.innerHTML = value.name;
        parent.appendChild(li);
      }
    }
  }

  app.appendMetric = (parent, token, value) => {
    const tmpl = app.tmplList.content.cloneNode(true);
    const li = tmpl.querySelector(`li[data-li-drag][data-${value.metric_type}]`);
    const content = li.querySelector('.li-content');
    // const btnDrag = content.querySelector('i');
    // debugger;
    const span = content.querySelector('span');
    li.id = token;
    li.dataset.type = value.metric_type;
    // li.dataset.elementSearch = 'metrics';
    li.dataset.label = value.alias;
    // definisco quale context-menu-template apre questo elemento
    li.dataset.contextmenu = `ul-context-menu-${value.metric_type}`;
    li.addEventListener('dragstart', app.fieldDragStart);
    li.addEventListener('dragend', app.fieldDragEnd);
    li.addEventListener('contextmenu', app.openContextMenu);
    span.innerHTML = value.alias;
    parent.appendChild(li);
  }

  app.addDefinedMetrics = () => {
    // metriche mappate sul cubo
    const parent = app.workbookTablesStruct.querySelector('#ul-metrics');
    if (WorkBook.metrics.size !== 0) {
      for (const [token, value] of WorkBook.metrics) {
        app.appendMetric(parent, token, value);
      }
    }
  }

  app.appendFilter = (parent, token, filter) => {
    const tmpl = app.tmplList.content.cloneNode(true);
    const li = tmpl.querySelector('li[data-filter]');
    const content = li.querySelector('.li-content');
    const btnDrag = content.querySelector('i');
    const span = content.querySelector('span');
    li.id = token;
    li.dataset.label = filter.name;
    // definisco quale context-menu-template apre questo elemento
    li.dataset.contextmenu = 'ul-context-menu-filter';
    li.dataset.field = filter.field;
    // TODO: eventi drag sull'icona drag
    li.addEventListener('dragstart', app.fieldDragStart);
    li.addEventListener('dragend', app.fieldDragEnd);
    li.addEventListener('contextmenu', app.openContextMenu);
    span.innerHTML = filter.name;
    parent.appendChild(li);
  }

  app.addDefinedFilters = () => {
    const parent = document.getElementById('ul-filters');
    // filtri mappati sul WorkBook
    for (const [token, value] of WorkBook.filters) {
      app.appendFilter(parent, token, value);
    }
  }

  // Apertura step Sheet, vengono caricati gli elementi del WorkBook
  app.addTablesStruct = async () => {
    // reset degli elementi in #workbook-objects
    // app.workbookTablesStruct.querySelectorAll('details').forEach(detail => detail.remove());
    app.workbookTablesStruct.querySelectorAll('#ul-metrics > li, #ul-filters > li, details').forEach(element => element.remove());
    const parent = app.workbookTablesStruct.querySelector('#nav-fields');
    for (const [tableId, value] of WorkBook.hierTables) {
      const tmpl = app.tmplDetails.content.cloneNode(true);
      const details = tmpl.querySelector("details");
      const li = tmpl.querySelector("li");
      const summary = details.querySelector('summary');
      WorkBook.activeTable = tableId;
      details.dataset.alias = value.alias;
      details.dataset.table = value.name;
      summary.innerHTML = value.name;
      summary.dataset.tableId = tableId;
      parent.appendChild(details);
      app.addDefinedFields(details);
    }
    if (WorkBook.filters.size !== 0) app.addDefinedFilters();
    app.addDefinedMetrics();
  }

  // creo la struttura tabelle nella dialog-filters
  app.addWorkBookContent = () => {
    // reset
    app.dialogFilters.querySelectorAll('nav dl').forEach(element => element.remove());
    // parent
    let parent = app.dialogFilters.querySelector('nav');
    for (const [tableId, value] of WorkBook.hierTables) {
      const tmpl = app.tmplDetails.content.cloneNode(true);
      const details = tmpl.querySelector("details");
      const summary = details.querySelector('summary');
      WorkBook.activeTable = tableId;
      // recupero le tabelle dal sessionStorage
      const columns = WorkBookStorage.getTable(value.table);
      details.dataset.schema = WorkBook.activeTable.dataset.schema;
      details.dataset.table = value.name;
      details.dataset.alias = value.alias;
      details.dataset.id = tableId;
      details.dataset.searchId = 'column-search';
      summary.innerHTML = value.name;
      summary.dataset.tableId = tableId;
      parent.appendChild(details);
      columns.forEach(column => {
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li[data-li]');
        const span = li.querySelector('span');
        li.dataset.label = column.COLUMN_NAME;
        li.dataset.fn = 'handlerSelectField';
        li.dataset.elementSearch = 'columns';
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

  document.querySelectorAll('#workbook-objects[data-section-active]').forEach(section => {
    section.querySelectorAll('*[data-section]').forEach(subSection => {
      subSection.addEventListener('mouseenter', (e) => {
        // console.log(section, e.target);
        section.dataset.sectionActive = e.target.dataset.section;
      }, false);
      subSection.addEventListener('mouseleave', () => {
        console.log('mouseLeave');
        // reimposto eventuali input utilizzate per la ricerca se è stato cancellato il testo al loro interno
        section.querySelectorAll("input[type='search']").forEach(input => {
          if (input.value.length === 0) input.setAttribute('readonly', 'true');
        });
      }, false);
    });
  });

  // TODO: spostare in supportFn oppure Application.js
  app.dialogJoin.addEventListener('close', () => {
    // ripulisco gli elementi delle <ul> (I campi delle tabelle)
    app.dialogJoin.querySelectorAll('ul > li').forEach(li => li.remove());
    app.dialogJoin.querySelectorAll('.join-field').forEach(joinField => joinField.remove());
  });

  // TODO: spostare in supportFn oppure Application.js
  app.dialogColumns.addEventListener('close', (e) => {
    // ripulisco gli elementi delle <ul> (I campi delle tabelle)
    // reset della textarea
    const textAreaId = document.getElementById('textarea-column-id');
    const textAreaDs = document.getElementById('textarea-column-ds');
    textAreaId.querySelectorAll('*').forEach(element => element.remove());
    textAreaDs.querySelectorAll('*').forEach(element => element.remove());
    // reset <nav> laterale
    e.target.querySelectorAll('nav > details').forEach(element => element.remove());
  });
})();
